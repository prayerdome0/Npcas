from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional

from .data import Candle
from .strategy import Signal, TradingConfig, generate_signals


@dataclass(frozen=True)
class Trade:
    entry_time: str
    exit_time: str
    entry_price: float
    exit_price: float
    quantity: float
    pnl: float
    pnl_pct: float
    reason: str


@dataclass
class BacktestResult:
    initial_cash: float
    final_equity: float
    total_return_pct: float
    cagr_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    win_rate_pct: float
    trade_count: int
    signals: list[Signal] = field(default_factory=list)
    trades: list[Trade] = field(default_factory=list)
    equity_curve: list[float] = field(default_factory=list)


def _safe_div(numerator: float, denominator: float) -> float:
    return 0.0 if denominator == 0 else numerator / denominator


def _max_drawdown(equity_curve: list[float]) -> float:
    peak = -math.inf
    max_dd = 0.0
    for value in equity_curve:
        peak = max(peak, value)
        if peak > 0:
            max_dd = min(max_dd, (value - peak) / peak)
    return abs(max_dd)


def _cagr(initial: float, final: float, periods: int, periods_per_year: int = 365) -> float:
    if initial <= 0 or final <= 0 or periods <= 0:
        return 0.0
    years = periods / periods_per_year
    if years <= 0:
        return 0.0
    return (final / initial) ** (1 / years) - 1


def _sharpe(equity_curve: list[float], periods_per_year: int = 365) -> float:
    if len(equity_curve) < 3:
        return 0.0
    returns = []
    for previous, current in zip(equity_curve, equity_curve[1:]):
        if previous:
            returns.append((current - previous) / previous)
    if len(returns) < 2:
        return 0.0
    avg = sum(returns) / len(returns)
    variance = sum((value - avg) ** 2 for value in returns) / (len(returns) - 1)
    std = math.sqrt(variance)
    return 0.0 if std == 0 else (avg / std) * math.sqrt(periods_per_year)


def _execution_price(close: float, side: str, slippage_rate: float) -> float:
    if side == "BUY":
        return close * (1 + slippage_rate)
    return close * (1 - slippage_rate)


def run_backtest(candles: list[Candle], config: TradingConfig) -> BacktestResult:
    """Run a long-only backtest with simple but explicit execution assumptions."""

    config.validate()
    signals = generate_signals(candles, config)
    signal_by_index = {signal.index: signal for signal in signals}

    cash = config.initial_cash
    quantity = 0.0
    entry_price: Optional[float] = None
    entry_time: Optional[str] = None
    trades: list[Trade] = []
    equity_curve: list[float] = []

    start_index = signals[0].index if signals else 0
    for i in range(start_index, len(candles)):
        candle = candles[i]
        close = candle.close
        equity = cash + quantity * close

        # Risk exits are checked before model exits so losses/profits are bounded in the simulation.
        if quantity > 0 and entry_price is not None and entry_time is not None:
            stop_price = entry_price * (1 - config.stop_loss_pct)
            take_price = entry_price * (1 + config.take_profit_pct)
            exit_reason = None
            raw_exit_price = None
            if candle.low <= stop_price:
                raw_exit_price = stop_price
                exit_reason = "STOP_LOSS"
            elif candle.high >= take_price:
                raw_exit_price = take_price
                exit_reason = "TAKE_PROFIT"

            if exit_reason and raw_exit_price is not None:
                exit_price = _execution_price(raw_exit_price, "SELL", config.slippage_rate)
                proceeds = quantity * exit_price
                fee = proceeds * config.fee_rate
                cash += proceeds - fee
                pnl = (exit_price - entry_price) * quantity - fee
                trades.append(Trade(entry_time, candle.timestamp, entry_price, exit_price, quantity, pnl, _safe_div(exit_price - entry_price, entry_price), exit_reason))
                quantity = 0.0
                entry_price = None
                entry_time = None

        signal = signal_by_index.get(i)
        if signal and signal.action == "BUY" and quantity == 0:
            equity = cash
            risk_notional = (equity * config.risk_per_trade) / config.stop_loss_pct
            cap_notional = equity * config.max_position_fraction
            spend = max(0.0, min(risk_notional, cap_notional, cash))
            buy_price = _execution_price(close, "BUY", config.slippage_rate)
            fee = spend * config.fee_rate
            net_spend = max(0.0, spend - fee)
            if net_spend > 0:
                quantity = net_spend / buy_price
                cash -= spend
                entry_price = buy_price
                entry_time = candle.timestamp
        elif signal and signal.action == "SELL" and quantity > 0 and entry_price is not None and entry_time is not None:
            sell_price = _execution_price(close, "SELL", config.slippage_rate)
            proceeds = quantity * sell_price
            fee = proceeds * config.fee_rate
            cash += proceeds - fee
            pnl = (sell_price - entry_price) * quantity - fee
            trades.append(Trade(entry_time, candle.timestamp, entry_price, sell_price, quantity, pnl, _safe_div(sell_price - entry_price, entry_price), "MODEL_SELL"))
            quantity = 0.0
            entry_price = None
            entry_time = None

        equity_curve.append(cash + quantity * close)

    # Liquidate at final close for an honest final equity.
    if quantity > 0 and entry_price is not None and entry_time is not None:
        final = candles[-1]
        sell_price = _execution_price(final.close, "SELL", config.slippage_rate)
        proceeds = quantity * sell_price
        fee = proceeds * config.fee_rate
        cash += proceeds - fee
        pnl = (sell_price - entry_price) * quantity - fee
        trades.append(Trade(entry_time, final.timestamp, entry_price, sell_price, quantity, pnl, _safe_div(sell_price - entry_price, entry_price), "FINAL_LIQUIDATION"))
        quantity = 0.0
        equity_curve.append(cash)

    final_equity = cash
    winners = [trade for trade in trades if trade.pnl > 0]
    return BacktestResult(
        initial_cash=config.initial_cash,
        final_equity=final_equity,
        total_return_pct=(final_equity - config.initial_cash) / config.initial_cash * 100,
        cagr_pct=_cagr(config.initial_cash, final_equity, len(equity_curve)) * 100,
        max_drawdown_pct=_max_drawdown(equity_curve) * 100,
        sharpe_ratio=_sharpe(equity_curve),
        win_rate_pct=_safe_div(len(winners), len(trades)) * 100,
        trade_count=len(trades),
        signals=signals,
        trades=trades,
        equity_curve=equity_curve,
    )
