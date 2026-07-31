from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from .data import Candle
from .indicators import build_feature_rows, make_labels
from .model import LogisticRegressionModel


@dataclass(frozen=True)
class TradingConfig:
    initial_cash: float = 10_000.0
    buy_threshold: float = 0.62
    sell_threshold: float = 0.48
    risk_per_trade: float = 0.01
    max_position_fraction: float = 0.25
    stop_loss_pct: float = 0.03
    take_profit_pct: float = 0.06
    fee_rate: float = 0.001
    slippage_rate: float = 0.0005
    train_ratio: float = 0.70
    horizon: int = 1
    min_target_return: float = 0.0

    def validate(self) -> None:
        if self.initial_cash <= 0:
            raise ValueError("initial_cash must be positive")
        for name in ("buy_threshold", "sell_threshold"):
            value = getattr(self, name)
            if not 0 <= value <= 1:
                raise ValueError(f"{name} must be between 0 and 1")
        if self.sell_threshold > self.buy_threshold:
            raise ValueError("sell_threshold should be <= buy_threshold")
        for name in ("risk_per_trade", "max_position_fraction", "stop_loss_pct", "take_profit_pct"):
            value = getattr(self, name)
            if not 0 < value <= 1:
                raise ValueError(f"{name} must be between 0 and 1")
        if not 0.2 <= self.train_ratio <= 0.9:
            raise ValueError("train_ratio must be between 0.2 and 0.9")


@dataclass(frozen=True)
class Signal:
    index: int
    timestamp: str
    close: float
    probability_up: float
    action: str


def train_model(candles: list[Candle], config: TradingConfig) -> tuple[LogisticRegressionModel, Dict[int, list[float]], int]:
    config.validate()
    close = [c.close for c in candles]
    volume = [c.volume for c in candles]
    indexes, rows = build_feature_rows(close, volume)
    usable_indexes, labels = make_labels(close, indexes, config.horizon, config.min_target_return)
    feature_by_index = {index: row for index, row in zip(indexes, rows) if index in set(usable_indexes)}

    split_candle_index = int(len(candles) * config.train_ratio)
    train_rows = [feature_by_index[i] for i in usable_indexes if i < split_candle_index]
    train_labels = [label for i, label in zip(usable_indexes, labels) if i < split_candle_index]

    model = LogisticRegressionModel().fit(train_rows, train_labels)
    return model, feature_by_index, split_candle_index


def generate_signals(candles: list[Candle], config: TradingConfig) -> list[Signal]:
    model, feature_by_index, split_candle_index = train_model(candles, config)
    test_indexes = [i for i in sorted(feature_by_index) if i >= split_candle_index]
    probabilities = model.predict_proba([feature_by_index[i] for i in test_indexes])

    in_position = False
    signals: list[Signal] = []
    for index, probability in zip(test_indexes, probabilities):
        action = "HOLD"
        if not in_position and probability >= config.buy_threshold:
            action = "BUY"
            in_position = True
        elif in_position and probability <= config.sell_threshold:
            action = "SELL"
            in_position = False
        candle = candles[index]
        signals.append(Signal(index=index, timestamp=candle.timestamp, close=candle.close, probability_up=probability, action=action))
    return signals
