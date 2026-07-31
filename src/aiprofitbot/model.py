from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Iterable, List


def _dot(a: list[float], b: list[float]) -> float:
    return sum(x * y for x, y in zip(a, b))


def _sigmoid(x: float) -> float:
    if x < -709:
        return 0.0
    if x > 709:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))


@dataclass
class StandardScaler:
    means: list[float] = field(default_factory=list)
    scales: list[float] = field(default_factory=list)

    def fit(self, rows: list[list[float]]) -> "StandardScaler":
        if not rows:
            raise ValueError("cannot fit scaler on empty data")
        columns = len(rows[0])
        self.means = []
        self.scales = []
        for column in range(columns):
            values = [row[column] for row in rows]
            avg = sum(values) / len(values)
            variance = sum((v - avg) ** 2 for v in values) / len(values)
            self.means.append(avg)
            self.scales.append(math.sqrt(variance) or 1.0)
        return self

    def transform(self, rows: Iterable[list[float]]) -> list[list[float]]:
        if not self.means:
            raise ValueError("scaler must be fitted before transform")
        return [[(value - self.means[i]) / self.scales[i] for i, value in enumerate(row)] for row in rows]


@dataclass
class LogisticRegressionModel:
    """Small pure-Python binary logistic regression model.

    This avoids heavyweight dependencies while still providing a real trainable model.
    """

    learning_rate: float = 0.05
    epochs: int = 700
    l2: float = 0.001
    weights: list[float] = field(default_factory=list)
    bias: float = 0.0
    scaler: StandardScaler = field(default_factory=StandardScaler)

    def fit(self, rows: list[list[float]], labels: list[int]) -> "LogisticRegressionModel":
        if len(rows) != len(labels):
            raise ValueError("rows and labels length mismatch")
        if not rows:
            raise ValueError("cannot train on empty data")
        if len(set(labels)) < 2:
            raise ValueError("training labels need both classes; try more data or a different symbol/timeframe")

        scaled = self.scaler.fit(rows).transform(rows)
        feature_count = len(scaled[0])
        self.weights = [0.0] * feature_count
        self.bias = 0.0

        n = len(scaled)
        for _ in range(self.epochs):
            grad_w = [0.0] * feature_count
            grad_b = 0.0
            for row, label in zip(scaled, labels):
                prediction = _sigmoid(_dot(self.weights, row) + self.bias)
                error = prediction - label
                grad_b += error
                for i, value in enumerate(row):
                    grad_w[i] += error * value

            for i in range(feature_count):
                grad_w[i] = (grad_w[i] / n) + self.l2 * self.weights[i]
                self.weights[i] -= self.learning_rate * grad_w[i]
            self.bias -= self.learning_rate * (grad_b / n)
        return self

    def predict_proba(self, rows: Iterable[list[float]]) -> list[float]:
        if not self.weights:
            raise ValueError("model must be fitted before prediction")
        scaled = self.scaler.transform(rows)
        return [_sigmoid(_dot(self.weights, row) + self.bias) for row in scaled]

    def predict(self, rows: Iterable[list[float]], threshold: float = 0.5) -> list[int]:
        return [1 if probability >= threshold else 0 for probability in self.predict_proba(rows)]
