from __future__ import annotations

from math import isfinite
from statistics import mean, pstdev
from typing import List, Optional


def pct_change(values: list[float], period: int = 1) -> list[Optional[float]]:
    output: list[Optional[float]] = [None] * len(values)
    for i in range(period, len(values)):
        previous = values[i - period]
        output[i] = 0.0 if previous == 0 else (values[i] - previous) / previous
    return output


def sma(values: list[float], period: int) -> list[Optional[float]]:
    output: list[Optional[float]] = [None] * len(values)
    if period <= 0:
        raise ValueError("period must be positive")
    rolling_sum = 0.0
    for i, value in enumerate(values):
        rolling_sum += value
        if i >= period:
            rolling_sum -= values[i - period]
        if i >= period - 1:
            output[i] = rolling_sum / period
    return output


def ema(values: list[float], period: int) -> list[Optional[float]]:
    output: list[Optional[float]] = [None] * len(values)
    if period <= 0:
        raise ValueError("period must be positive")
    multiplier = 2 / (period + 1)
    current: Optional[float] = None
    for i, value in enumerate(values):
        if i == period - 1:
            current = mean(values[:period])
        elif i >= period and current is not None:
            current = (value - current) * multiplier + current
        if i >= period - 1 and current is not None:
            output[i] = current
    return output


def rolling_std(values: list[float], period: int) -> list[Optional[float]]:
    output: list[Optional[float]] = [None] * len(values)
    for i in range(period - 1, len(values)):
        output[i] = pstdev(values[i - period + 1 : i + 1])
    return output


def rsi(values: list[float], period: int = 14) -> list[Optional[float]]:
    output: list[Optional[float]] = [None] * len(values)
    if len(values) <= period:
        return output

    gains = [0.0]
    losses = [0.0]
    for i in range(1, len(values)):
        change = values[i] - values[i - 1]
        gains.append(max(change, 0.0))
        losses.append(abs(min(change, 0.0)))

    avg_gain = mean(gains[1 : period + 1])
    avg_loss = mean(losses[1 : period + 1])
    output[period] = 100.0 if avg_loss == 0 else 100 - (100 / (1 + avg_gain / avg_loss))

    for i in range(period + 1, len(values)):
        avg_gain = ((avg_gain * (period - 1)) + gains[i]) / period
        avg_loss = ((avg_loss * (period - 1)) + losses[i]) / period
        output[i] = 100.0 if avg_loss == 0 else 100 - (100 / (1 + avg_gain / avg_loss))
    return output


def build_feature_rows(close: list[float], volume: list[float]) -> tuple[list[int], list[list[float]]]:
    """Return (indexes, features) for candles that have all required indicators.

    Features are intentionally simple and explainable. They should be extended and validated
    before any real-world use.
    """

    ret1 = pct_change(close, 1)
    ret3 = pct_change(close, 3)
    ret10 = pct_change(close, 10)
    sma10 = sma(close, 10)
    sma30 = sma(close, 30)
    ema12 = ema(close, 12)
    ema26 = ema(close, 26)
    rsi14 = rsi(close, 14)
    vol20 = rolling_std([x or 0.0 for x in ret1], 20)
    vol_sma20 = sma(volume, 20)

    indexes: list[int] = []
    rows: list[list[float]] = []
    for i in range(len(close)):
        values = [ret1[i], ret3[i], ret10[i], sma10[i], sma30[i], ema12[i], ema26[i], rsi14[i], vol20[i], vol_sma20[i]]
        if any(v is None or not isfinite(float(v)) for v in values):
            continue
        price = close[i] or 1.0
        vol_base = vol_sma20[i] or 1.0
        rows.append(
            [
                float(ret1[i]),
                float(ret3[i]),
                float(ret10[i]),
                (float(sma10[i]) - float(sma30[i])) / price,
                (float(ema12[i]) - float(ema26[i])) / price,
                (float(rsi14[i]) - 50.0) / 50.0,
                float(vol20[i]),
                (volume[i] - float(vol_sma20[i])) / vol_base,
            ]
        )
        indexes.append(i)
    return indexes, rows


def make_labels(close: list[float], indexes: list[int], horizon: int = 1, min_return: float = 0.0) -> tuple[list[int], list[int]]:
    usable_indexes: list[int] = []
    labels: list[int] = []
    for i in indexes:
        future_i = i + horizon
        if future_i >= len(close):
            continue
        future_return = (close[future_i] - close[i]) / close[i]
        usable_indexes.append(i)
        labels.append(1 if future_return > min_return else 0)
    return usable_indexes, labels
