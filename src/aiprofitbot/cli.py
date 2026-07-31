from __future__ import annotations

import argparse
import json
from dataclasses import asdict

from .backtest import run_backtest
from .data import load_candles
from .strategy import TradingConfig, generate_signals


def _config_from_args(args: argparse.Namespace) -> TradingConfig:
    return TradingConfig(
        initial_cash=args.initial_cash,
        buy_threshold=args.buy_threshold,
        sell_threshold=args.sell_threshold,
        risk_per_trade=args.risk_per_trade,
        max_position_fraction=args.max_position,
        stop_loss_pct=args.stop_loss,
        take_profit_pct=args.take_profit,
        fee_rate=args.fee,
        slippage_rate=args.slippage,
        train_ratio=args.train_ratio,
    )


def add_common_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--csv", required=True, help="Path to OHLCV CSV data")
    parser.add_argument("--initial-cash", type=float, default=10_000.0)
    parser.add_argument("--buy-threshold", type=float, default=0.62, help="Model probability required to open a long")
    parser.add_argument("--sell-threshold", type=float, default=0.48, help="Model probability at/below which to close a long")
    parser.add_argument("--risk-per-trade", type=float, default=0.01)
    parser.add_argument("--max-position", type=float, default=0.25, help="Maximum fraction of equity in one position")
    parser.add_argument("--stop-loss", type=float, default=0.03)
    parser.add_argument("--take-profit", type=float, default=0.06)
    parser.add_argument("--fee", type=float, default=0.001)
    parser.add_argument("--slippage", type=float, default=0.0005)
    parser.add_argument("--train-ratio", type=float, default=0.70)


def cmd_backtest(args: argparse.Namespace) -> int:
    candles = load_candles(args.csv)
    result = run_backtest(candles, _config_from_args(args))
    payload = asdict(result)
    payload["signals"] = payload["signals"][-10:]
    payload["trades"] = payload["trades"][-10:]
    payload["equity_curve"] = payload["equity_curve"][-10:]
    print(json.dumps(payload, indent=2))
    print("\nReminder: this is research software. It cannot guarantee profit.")
    return 0


def cmd_signals(args: argparse.Namespace) -> int:
    candles = load_candles(args.csv)
    signals = generate_signals(candles, _config_from_args(args))
    for signal in signals[-args.limit :]:
        print(f"{signal.timestamp} close={signal.close:.4f} p_up={signal.probability_up:.3f} action={signal.action}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="AI-assisted trading bot research framework. No profit guarantees.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    backtest = subparsers.add_parser("backtest", help="Train and backtest on CSV candles")
    add_common_arguments(backtest)
    backtest.set_defaults(func=cmd_backtest)

    signals = subparsers.add_parser("signals", help="Print latest model signals from CSV candles")
    add_common_arguments(signals)
    signals.add_argument("--limit", type=int, default=20)
    signals.set_defaults(func=cmd_signals)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
