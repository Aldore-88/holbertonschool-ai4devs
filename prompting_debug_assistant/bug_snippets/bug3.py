#!/usr/bin/env python3
"""Summarise stock levels and average sale price per warehouse."""

inventory = [
    {"warehouse": "North", "item": "bolts", "stock": 120, "sales": [0.5, 0.45]},
    {"warehouse": "North", "item": "nuts", "stock": 300, "sales": [0.2]},
    {"warehouse": "South", "item": "screws", "stock": 0, "sales": []},
    {"warehouse": "East", "item": "washers", "sales": [0.1, 0.12, 0.11]},
]


def average_price(sales):
    """Return the average sale price."""
    return sum(sales) / len(sales)


def summarise(records):
    """Return {warehouse: total_stock} and print each item's average price."""
    totals = {}
    for record in records:
        name = record["warehouse"]
        totals[name] = totals.get(name, 0) + record["stock"]
        avg = average_price(record["sales"])
        print(f"{record['item']}: avg price {avg:.2f}")
    return totals


if __name__ == "__main__":
    for warehouse, stock in summarise(inventory).items():
        print(f"{warehouse}: {stock} units")
