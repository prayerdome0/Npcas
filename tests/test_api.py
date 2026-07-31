from __future__ import annotations

import unittest

from api.index import run_backtest_payload
from aiprofitbot.data import load_candles


class ApiPayloadTests(unittest.TestCase):
    def test_backtest_payload_returns_serializable_result(self) -> None:
        candles = load_candles("examples/sample_ohlcv.csv")
        payload = {
            "candles": [
                {
                    "timestamp": candle.timestamp,
                    "open": candle.open,
                    "high": candle.high,
                    "low": candle.low,
                    "close": candle.close,
                    "volume": candle.volume,
                }
                for candle in candles
            ],
            "config": {"buy_threshold": 0.55, "sell_threshold": 0.45},
        }

        result = run_backtest_payload(payload)

        self.assertGreater(result["final_equity"], 0)
        self.assertIn("trades", result)
        self.assertIn("signals", result)

    def test_backtest_payload_requires_candles(self) -> None:
        with self.assertRaisesRegex(ValueError, "candles"):
            run_backtest_payload({})


if __name__ == "__main__":
    unittest.main()
