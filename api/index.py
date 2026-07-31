"""Vercel serverless entrypoint for the backtest API.

The handler deliberately uses only the Python standard library so it can run on
Vercel without requiring a web framework.
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict, fields
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

# Vercel executes this file directly. Add the src-layout package directory when
# the project has not been installed as a package by the build environment.
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from aiprofitbot.backtest import run_backtest
from aiprofitbot.data import Candle
from aiprofitbot.strategy import TradingConfig


CONFIG_FIELDS = {field.name for field in fields(TradingConfig)}
CANDLE_FIELDS = {"timestamp", "open", "high", "low", "close", "volume"}


def run_backtest_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Validate an API request and return a JSON-serializable backtest result.

    Requests must provide a ``candles`` array of OHLCV objects. Optional
    ``config`` values correspond to :class:`TradingConfig` fields.
    """
    raw_candles = payload.get("candles")
    if not isinstance(raw_candles, list):
        raise ValueError("'candles' must be an array of OHLCV objects")

    candles: list[Candle] = []
    for index, raw_candle in enumerate(raw_candles):
        if not isinstance(raw_candle, dict):
            raise ValueError(f"candle at index {index} must be an object")
        missing = CANDLE_FIELDS.difference(raw_candle)
        if missing:
            raise ValueError(f"candle at index {index} is missing: {', '.join(sorted(missing))}")
        try:
            candles.append(
                Candle(
                    timestamp=str(raw_candle["timestamp"]),
                    open=float(raw_candle["open"]),
                    high=float(raw_candle["high"]),
                    low=float(raw_candle["low"]),
                    close=float(raw_candle["close"]),
                    volume=float(raw_candle["volume"]),
                )
            )
        except (TypeError, ValueError) as exc:
            raise ValueError(f"candle at index {index} has invalid numeric values") from exc

    raw_config = payload.get("config", {})
    if not isinstance(raw_config, dict):
        raise ValueError("'config' must be an object")
    unknown_fields = set(raw_config).difference(CONFIG_FIELDS)
    if unknown_fields:
        raise ValueError(f"unknown config fields: {', '.join(sorted(unknown_fields))}")

    result = run_backtest(candles, TradingConfig(**raw_config))
    return asdict(result)


class handler(BaseHTTPRequestHandler):
    """Vercel-compatible HTTP handler."""

    def _send_json(self, status: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        path = urlparse(self.path).path
        if path == "/health":
            self._send_json(200, {"status": "ok"})
        elif path == "/":
            self._send_json(
                200,
                {
                    "service": "aiprofitbot",
                    "message": "Backtest-first trading research API. No profit guarantees.",
                    "endpoints": {"health": "/health", "backtest": "/backtest"},
                },
            )
        elif path in {"/backtest", "/api/backtest"}:
            self._send_json(405, {"error": "Use POST with a JSON body containing candles and optional config."})
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        path = urlparse(self.path).path
        if path not in {"/backtest", "/api/backtest"}:
            self._send_json(404, {"error": "Not found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0:
                raise ValueError("request body is required")
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
            if not isinstance(payload, dict):
                raise ValueError("request body must be a JSON object")
            self._send_json(200, run_backtest_payload(payload))
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            self._send_json(400, {"error": str(exc)})
        except Exception:
            # Avoid exposing internal details while returning a valid API error.
            self._send_json(500, {"error": "Unable to run backtest"})

    def do_OPTIONS(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        self._send_json(204, {})
