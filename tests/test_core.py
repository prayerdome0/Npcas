from __future__ import annotations

import unittest

from aiprofitbot.backtest import run_backtest
from aiprofitbot.data import load_candles
from aiprofitbot.indicators import build_feature_rows, rsi, sma
from aiprofitbot.model import LogisticRegressionModel
from aiprofitbot.paper import PaperBroker
from aiprofitbot.strategy import TradingConfig, generate_signals


class IndicatorTests(unittest.TestCase):
    def test_sma(self) -> None:
        self.assertEqual(sma([1, 2, 3, 4], 2), [None, 1.5, 2.5, 3.5])

    def test_rsi_bounds(self) -> None:
        values = [float(i) for i in range(1, 40)]
        result = [x for x in rsi(values) if x is not None]
        self.assertTrue(result)
        self.assertTrue(all(0 <= x <= 100 for x in result))


class ModelTests(unittest.TestCase):
    def test_model_learns_simple_boundary(self) -> None:
        rows = [[-2], [-1], [1], [2], [3], [-3]]
        labels = [0, 0, 1, 1, 1, 0]
        model = LogisticRegressionModel(epochs=500).fit(rows, labels)
        self.assertLess(model.predict_proba([[-2]])[0], 0.5)
        self.assertGreater(model.predict_proba([[2]])[0], 0.5)


class TradingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.candles = load_candles("examples/sample_ohlcv.csv")

    def test_features_exist(self) -> None:
        indexes, rows = build_feature_rows([c.close for c in self.candles], [c.volume for c in self.candles])
        self.assertGreater(len(indexes), 100)
        self.assertEqual(len(rows[0]), 8)

    def test_backtest_runs(self) -> None:
        result = run_backtest(self.candles, TradingConfig(buy_threshold=0.55, sell_threshold=0.45))
        self.assertGreater(result.final_equity, 0)
        self.assertGreaterEqual(result.trade_count, 0)

    def test_signals_run(self) -> None:
        signals = generate_signals(self.candles, TradingConfig(buy_threshold=0.55, sell_threshold=0.45))
        self.assertTrue(signals)

    def test_paper_broker(self) -> None:
        broker = PaperBroker(cash=1000)
        broker.buy_with_fraction(price=100, fraction=0.5)
        self.assertLess(broker.cash, 1000)
        broker.sell_all(price=110)
        self.assertGreater(broker.cash, 1000)


if __name__ == "__main__":
    unittest.main()
