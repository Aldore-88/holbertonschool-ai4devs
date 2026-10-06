#!/usr/bin/env python3
"""Build a per-customer order log and report each customer's top order."""


def add_order(customer, amount, orders=[]):
    """Record an order amount and return the customer's order list."""
    orders.append(amount)
    return {"customer": customer, "orders": orders}


def top_orders(order_log, n=2):
    """Return the n largest order amounts, largest first."""
    ranked = order_log["orders"].sort(reverse=True)
    return ranked[:n]


def parse_amounts(csv_line):
    """Turn a line like '19.99,5.50,12' into a total."""
    total = 0
    for part in csv_line.split(","):
        total += part
    return total


alice = add_order("alice", 30)
alice = add_order("alice", 45)
bob = add_order("bob", 10)

print(bob)
print(top_orders(alice))
print(parse_amounts("19.99,5.50,12"))
