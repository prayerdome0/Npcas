from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List


@dataclass(frozen=True)
class Candle:
    """Single OHLCV market candle."""

    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float


def load_candles(path: str | Path) -> List[Candle]:
    """Load candles from a CSV file with timestamp, open, high, low, close, volume columns."""

    candles: List[Candle] = []
    with Path(path).open("r", newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        required = {"timestamp", "open", "high", "low", "close", "volume"}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"CSV missing required columns: {', '.join(sorted(missing))}")

        for row_number, row in enumerate(reader, start=2):
            try:
                candles.append(
                    Candle(
                        timestamp=row["timestamp"],
                        open=float(row["open"]),
                        high=float(row["high"]),
                        low=float(row["low"]),
                        close=float(row["close"]),
                        volume=float(row["volume"]),
                    )
                )
            except (TypeError, ValueError) as exc:
                raise ValueError(f"Invalid numeric value on CSV row {row_number}: {row}") from exc

    if len(candles) < 80:
        raise ValueError("Need at least 80 candles to build indicators and train a model")
    return candles


def closes(candles: Iterable[Candle]) -> list[float]:
    return [c.close for c in candles]


def highs(candles: Iterable[Candle]) -> list[float]:
    return [c.high for c in candles]


def lows(candles: Iterable[Candle]) -> list[float]:
    return [c.low for c in candles]


def volumes(candles: Iterable[Candle]) -> list[float]:
    return [c.volume for c in candles]
