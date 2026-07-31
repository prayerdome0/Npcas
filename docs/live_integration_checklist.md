# Live Integration — Safety Checklist (NOT executable trading code)

> WARNING: This document explains the architecture only. It does **not** contain
> code that connects to broker APIs or sends live orders. Executable live-trading
> code requires safeguards that must be configured manually and verified by the user.

## Before any real account is used

1. **Paper trade for weeks/months** using `src/aiprofitbot/paper.py` (PaperBroker).
2. **Backtest across multiple market regimes** with `python -m aiprofitbot.cli backtest`.
3. **Set hard limits** in `TradingConfig`: max position size (`max_position`), stop loss, take profit, fee/slippage estimates.
4. **Use only read/trading API keys** — disable withdrawal permissions on the exchange/broker.
5. **Start with tiny size** (e.g., 1% of balance, not 100%).
6. **Enable kill switch / max daily loss circuit breaker** — never run unattended.

## Why a "login and choose amount" bot is dangerous

- No strategy guarantees profit; markets can gap, crash, or halt.
- API keys with trading permissions can be leaked or misused.
- Bugs in feature calculation, model inference, or order routing can wipe a balance instantly.
- Exchanges may block or ban automated accounts that lack rate-limiting and error handling.

## If you want to connect a broker (conceptual only)

The safe architecture is:

- **Backtest / paper layer first** (`paper.py`, `backtest.py`) — this repo.
- **Config layer** (`TradingConfig`) — defines risk per trade, thresholds, fees.
- **Broker adapter** (user-written, not provided here) — must validate every order against `TradingConfig` limits before sending.
- **Kill switch / monitoring** — external process that stops orders if drawdown exceeds a limit or if API errors spike.
- **Logging** — every signal, fill, and error written to durable storage.

This repository (`Npcas` / `aiprofitbot`) is intentionally **backtest-first**.
The API (`api/index.py`) exposes `/health` and `/backtest` only — it does not expose
live execution endpoints because that requires safeguards that cannot be hardcoded safely.

## Broker-specific notes (templates only — do NOT use without paper testing)

- Alpaca: requires `APCA-API-KEY-ID` / `APCA-API-SECRET-KEY`; use paper URL first (`https://paper-api.alpaca.markets`).
- IBKR: requires TWS/Gateway; never expose master account credentials to a Python script.
- Binance / Coinbase Pro: use read/trading-only API keys; enable IP allowlisting; test on testnet.

## What I can add to this branch safely

- Improve `paper.py` with circuit breakers / daily loss limits.
- Expand `backtest.py` with stress-test scenarios.
- Add `/config` or `/validate` endpoint to `api/index.py`.
- Update `README.md` with this checklist.

**I will not provide executable code that sends live orders automatically.**
If you want any of the safe improvements above, specify the file (`api/index.py`, `paper.py`, etc.).
