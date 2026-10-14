## Bug 1 – bug1.py
**AI Diagnosis**: Two syntax errors. Line 10, `def letter_grade(avg)`, has no `:` at the end. Line 31, `print(f"{name}: {avg:.1f} ({letter_grade(avg)}"`, is missing the `)` inside the string and the `)` that closes `print(`.  
**Suggested Fix**: Change line 10 to `def letter_grade(avg):` and line 31 to `print(f"{name}: {avg:.1f} ({letter_grade(avg)})")`.  
**Alternative Fixes Tested**: None.  
**Result**: Expected output is `Alice: 91.7 (A)`, `Bob: 73.3 (C)`, `Chloe: 56.0 (F)`.

## Bug 2 – bug2.js
**AI Diagnosis**: Two logic errors. Line 8, `return subtotal * rate;`, returns the discount amount instead of the price after the discount, so tax is added to the discount and a cart with no code totals $0. Line 17, `if (subtotal > 100)`, leaves out carts of exactly $100, so the sample cart ($100) never gets `SAVE10` automatically.  
**Suggested Fix**: Change line 8 to `return subtotal * (1 - rate);` and line 17 to `if (subtotal >= 100) {`.  
**Alternative Fixes Tested**: None.  
**Result**: Output changes from `$21.6`, `$0`, `$0` to `$86.4`, `$97.2`, `$10.8`, which matches the intended behavior.

## Bug 3 – bug3.py
**AI Diagnosis**: Two runtime exceptions. Line 14, `return sum(sales) / len(sales)`, raises `ZeroDivisionError` for `screws`, which has an empty `sales` list. Line 22, `record["stock"]`, raises `KeyError` for `washers`, which has no `stock` field.  
**Suggested Fix**: Change line 14 to `return sum(sales) / len(sales) if sales else 0.0` and line 22 to `totals[name] = totals.get(name, 0) + record.get("stock", 0)`.  
**Alternative Fixes Tested**: None.  
**Result**: The program no longer crashes. It prints `screws: avg price 0.00` and `washers: avg price 0.11`, then `North: 420 units`, `South: 0 units`, `East: 0 units`.

## Bug 4 – bug4.ts
**AI Diagnosis**: Three off-by-one errors. Line 5, `start < items.length - 1`, stops the loop before the last page starts, so `gus` is dropped. Line 13, `i <= values.length - windowSize + 1`, runs two windows too many. Line 15, `j <= i + windowSize`, adds `windowSize + 1` values per window, so the averages are too high and the last windows read past the end of the array (`NaN`).  
**Suggested Fix**: Change line 5 to `start < items.length`, line 13 to `i <= values.length - windowSize`, and line 15 to `j < i + windowSize`.  
**Alternative Fixes Tested**: None.  
**Result**: `paginate` returns `[["ana","ben","cal"],["dee","eli","fay"],["gus"]]`. `movingAverage` changes from `[29.33, 30.67, 31, NaN, NaN]` to `[21, 22.67, 23.33, 24]`, which gives the expected 4 results.

## Bug 5 – bug5.py
**AI Diagnosis**: Three type and library misuses. Line 5, `orders=[]`, is a mutable default argument, so every customer shares one list and `bob` shows `[30, 45, 10]`. Line 13, `order_log["orders"].sort(reverse=True)`, sorts in place and returns `None`, so `ranked[:n]` raises `TypeError`. Line 21, `total += part`, adds a string to an int and raises `TypeError`.  
**Suggested Fix**: Change line 5 to `orders=None` and add `if orders is None: orders = []` before the `append`. Pass Alice's list on line 26: `add_order("alice", 45, alice["orders"])`. Change line 13 to `ranked = sorted(order_log["orders"], reverse=True)`. Change line 21 to `total += float(part)` and line 22 to `return round(total, 2)`.  
**Alternative Fixes Tested**: Fixing only the default argument gives `alice` the list `[45]`, because the second call creates a new list. Line 26 also has to pass the existing list. Without `round`, the sum prints as `37.489999999999995`.  
**Result**: Output is `{'customer': 'bob', 'orders': [10]}`, `[45, 30]`, `37.49`.

## Bug 6 – bug6.js
**AI Diagnosis**: Four type and library misuses. Line 6, `values.map(parseInt)`, passes the array index as the radix, which gives `[10, NaN, 1, NaN]`. Line 12, `total += v`, joins the strings, which gives `"0107123"`. Line 18, `values.sort()`, compares numbers as text, which gives `[10, 100, 12, 3, 7]`. Line 22, `qty == '' || qty < 5`, is `true` for `''` because `''` is coerced to `0`.  
**Suggested Fix**: Change line 6 to `return values.map(Number);`, line 12 to `total += Number(v);`, line 18 to `return values.sort((a, b) => a - b);`, and line 22 to `return qty !== '' && Number(qty) < 5;`.  
**Alternative Fixes Tested**: None.  
**Result**: Output is `Parsed: [10, 7, 12, 3]`, `Total: 32`, `Sorted: [3, 7, 10, 12, 100]`, low stock `0` → `true`, `8` → `false`, `''` → `false`.
