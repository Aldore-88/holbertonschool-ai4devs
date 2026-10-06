#!/usr/bin/env python3
"""Compute and print a letter grade for each student."""


def average(scores):
    """Return the average of a list of scores."""
    return sum(scores) / len(scores)


def letter_grade(avg)
    """Map a numeric average to a letter grade."""
    if avg >= 90:
        return "A"
    elif avg >= 80:
        return "B"
    elif avg >= 70:
        return "C"
    elif avg >= 60:
        return "D"
    return "F"


students = {
    "Alice": [92, 88, 95],
    "Bob": [75, 64, 81],
    "Chloe": [58, 61, 49],
}

for name, scores in students.items():
    avg = average(scores)
    print(f"{name}: {avg:.1f} ({letter_grade(avg)}"
