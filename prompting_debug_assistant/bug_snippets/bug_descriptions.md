# Bug Snippets — Intended Behavior

Each snippet below contains one or more deliberate bugs. This file describes what
each program is **supposed** to do, so a debugging assistant (or a human) can
compare the intended behavior against what actually happens.

| File | Language | Bug category |
|------|----------|--------------|
| `bug1.py` | Python | Syntax error |
| `bug2.js` | JavaScript | Logical error |
| `bug3.py` | Python | Runtime exception |
| `bug4.ts` | TypeScript | Off-by-one / loop logic |
| `bug5.py` | Python | Misuse of data types / library |
| `bug6.js` | JavaScript | Misuse of data types / library |

---

## bug1.py — Student letter grades

**Run:** `python3 bug1.py`

**Intended behavior:**
Compute the average of each student's scores and convert it to a letter grade
(A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F). Print one line per student showing
the average to one decimal place and the letter grade.

**Expected output:**
```
Alice: 91.7 (A)
Bob: 73.3 (C)
Chloe: 56.0 (F)
```

---

## bug2.js — Shopping cart total

**Run:** `node bug2.js`

**Intended behavior:**
Calculate a cart's subtotal (`price × qty` for each item), apply a discount code
(`SAVE10` = 10% off, `SAVE20` = 20% off, unknown or missing code = no discount),
then add 8% sales tax to the discounted amount and round to cents. Orders of
$100 **or more** with no code should automatically get `SAVE10`.

**Expected output:**
```
Total: $86.4
Total: $97.2
Total: $10.8
```
(Line 1: subtotal $100 with `SAVE20` → $80 → +8% tax = $86.40.
Line 2: the same $100 cart with no code → auto `SAVE10` → $90 → +8% tax = $97.20.
Line 3: subtotal $10, no discount → +8% tax = $10.80.)

---

## bug3.py — Warehouse inventory summary

**Run:** `python3 bug3.py`

**Intended behavior:**
Go through every inventory record and print each item's average sale price. Items
with no sales should show an average of `0.00`. Total the stock for each warehouse
and print it. A record with no `stock` field counts as 0 units. The program should
finish without crashing.

**Expected output:**
```
bolts: avg price 0.47
nuts: avg price 0.20
screws: avg price 0.00
washers: avg price 0.11
North: 420 units
South: 0 units
East: 0 units
```

---

## bug4.ts — Pagination and moving average

**Run:** `npx tsx bug4.ts` (or compile with `tsc bug4.ts && node bug4.js`)

**Intended behavior:**
- `paginate(items, pageSize)` splits an array into consecutive pages of at most
  `pageSize` items. Every item must appear exactly once, and the last page may be
  shorter.
- `movingAverage(values, windowSize)` returns the average of each consecutive
  window of exactly `windowSize` values. For `n` values there should be
  `n - windowSize + 1` results, and none of them should be `NaN`.

**Expected output:**
```
[ [ 'ana', 'ben', 'cal' ], [ 'dee', 'eli', 'fay' ], [ 'gus' ] ]
[ 21, 22.666666666666668, 23.333333333333332, 24 ]
```

---

## bug5.py — Customer order log

**Run:** `python3 bug5.py`

**Intended behavior:**
- `add_order(customer, amount)` records an order and returns that customer's
  orders. Each customer must have their **own** independent list.
- `top_orders(order_log, n)` returns the `n` largest order amounts, largest first,
  without crashing.
- `parse_amounts(csv_line)` takes a comma-separated string of prices and returns
  their numeric total.

**Expected output:**
```
{'customer': 'bob', 'orders': [10]}
[45, 30]
37.49
```
(The total may print as `37.489999999999995` because of normal floating-point
rounding. That is not one of the intended bugs.)

---

## bug6.js — Stock quantities from form input

**Run:** `node bug6.js`

**Intended behavior:**
Form inputs arrive as strings.
- `toNumbers` should convert each string to an integer.
- `totalStock` should add the quantities as numbers.
- `sortQuantities` should sort them in ascending **numeric** order.
- `isLowStock` should return `true` only when the quantity is below 5. A quantity
  of `0` counts as low stock, but an empty form value `''` is "no data" and must
  **not** count as low stock.

**Expected output:**
```
Parsed: [ 10, 7, 12, 3 ]
Total: 32
Sorted: [ 3, 7, 10, 12, 100 ]
Low stock (0)? true  Low stock (8)? false
Low stock ('')? false
```
