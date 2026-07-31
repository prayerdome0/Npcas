# AI Profit Bot

This repository has been replaced with a **backtest-first AI trading bot framework**.

> ⚠️ **Important:** No trading bot can honestly guarantee 95%–100% profit. Markets are risky, losses are possible, and past performance does not guarantee future results. This project is built to help you research, backtest, and paper-trade strategies safely before risking real money.

## What it does

- Loads OHLCV candle CSV data.
- Builds technical-analysis features using only Python standard library.
- Trains a lightweight logistic-regression model from scratch.
- Uses probability thresholds for long/flat trading decisions.
- Includes risk controls: max position size, stop loss, take profit, fees, and slippage.
- Produces backtest metrics: total return, CAGR, Sharpe ratio, max drawdown, win rate, and trade count.
- Includes a paper-trading simulator so you can test logic without real money.

## Quick start

```bash
python -m aiprofitbot.cli backtest --csv examples/sample_ohlcv.csv
```

If running from a fresh clone without installing the package:

```bash
PYTHONPATH=src python -m aiprofitbot.cli backtest --csv examples/sample_ohlcv.csv
```

Run the tests:

```bash
PYTHONPATH=src python -m unittest discover -s tests
```

## CSV format

Required columns:

```csv
timestamp,open,high,low,close,volume
```

Example:

```csv
2026-01-01T00:00:00Z,100,102,99,101,1200
```

## Example commands

Conservative backtest:

```bash
PYTHONPATH=src python -m aiprofitbot.cli backtest \
  --csv examples/sample_ohlcv.csv \
  --initial-cash 10000 \
  --buy-threshold 0.62 \
  --sell-threshold 0.48 \
  --risk-per-trade 0.01 \
  --max-position 0.25
```

High-confidence mode, inspired by your 95% request:

```bash
PYTHONPATH=src python -m aiprofitbot.cli backtest \
  --csv examples/sample_ohlcv.csv \
  --buy-threshold 0.95 \
  --sell-threshold 0.50
```

A 0.95 threshold means the model only buys when it estimates at least 95% probability of an upward next move. It may make very few or zero trades, and it still cannot guarantee profit.

## Project layout

```text
src/aiprofitbot/
  backtest.py     Backtesting engine and metrics
  cli.py          Command-line interface
  data.py         CSV candle loader
  indicators.py   Technical indicators and feature building
  model.py        Pure-Python logistic regression
  paper.py        Paper-trading account simulator
  strategy.py     AI signal generation and risk config
examples/
  sample_ohlcv.csv
config.example.toml
tests/
```

## Safety checklist before live trading

1. Backtest across multiple market regimes.
2. Paper trade for weeks or months.
3. Start with tiny size if you ever go live.
4. Use exchange API keys with withdrawal permissions disabled.
5. Log every order and error.
6. Never risk money you cannot afford to lose.

## Disclaimer

This software is for educational and research use only. It is not financial advice. You are responsible for all trading decisions and losses.
