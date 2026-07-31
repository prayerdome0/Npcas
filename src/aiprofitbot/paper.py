from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class PaperOrder:
    side: str
    price: float
    quantity: float
    fee: float


@dataclass
class PaperBroker:
    """Tiny paper-trading account simulator.

    It is intentionally exchange-agnostic. Connect a real broker only after long paper testing,
    with withdrawal-disabled API keys and strict risk limits.
    """

    cash: float = 10_000.0
    fee_rate: float = 0.001
    quantity: float = 0.0
    orders: list[PaperOrder] = field(default_factory=list)

    def buy_with_fraction(self, price: float, fraction: float) -> PaperOrder | None:
        if not 0 < fraction <= 1:
            raise ValueError("fraction must be between 0 and 1")
        spend = self.cash * fraction
        fee = spend * self.fee_rate
        net = spend - fee
        if net <= 0 or price <= 0:
            return None
        quantity = net / price
        self.cash -= spend
        self.quantity += quantity
        order = PaperOrder("BUY", price, quantity, fee)
        self.orders.append(order)
        return order

    def sell_all(self, price: float) -> PaperOrder | None:
        if self.quantity <= 0 or price <= 0:
            return None
        proceeds = self.quantity * price
        fee = proceeds * self.fee_rate
        order = PaperOrder("SELL", price, self.quantity, fee)
        self.cash += proceeds - fee
        self.quantity = 0.0
        self.orders.append(order)
        return order

    def equity(self, mark_price: float) -> float:
        return self.cash + self.quantity * mark_price
