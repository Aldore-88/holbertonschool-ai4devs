# Bug Descriptions

## Bug 1 – bug1.py
**Intended Behavior**: Calculate each student's average score and print it to one decimal place with a letter grade (A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F), e.g. `Alice: 91.7 (A)`.  
**Issue Type**: Syntax error.  
**Notes**: The script fails to parse, so no code runs at all.

## Bug 2 – bug2.js
**Intended Behavior**: Return a cart's final price: the subtotal, minus the discount for the code (`SAVE10` = 10% off, `SAVE20` = 20% off, no code = no discount, but carts of $100 or more get `SAVE10` automatically), plus 8% tax on the discounted amount, rounded to cents.  
**Issue Type**: Logical error.  
**Notes**: The script runs without errors but prints wrong totals, and a cart of exactly $100 does not get the automatic discount.

## Bug 3 – bug3.py
**Intended Behavior**: Print every item's average sale price, showing 0.00 for items with no sales, then print each warehouse's total stock, counting a record with no `stock` field as 0 units.  
**Issue Type**: Runtime exception.  
**Notes**: The program crashes on an item with an empty sales list or a record with no `stock` field.

## Bug 4 – bug4.ts
**Intended Behavior**: `paginate` splits a list into pages of at most `pageSize` items, and every item appears exactly once. `movingAverage` returns the average of each consecutive window of `windowSize` values, giving `n - windowSize + 1` results.  
**Issue Type**: Off-by-one / loop logic error.  
**Notes**: The last item is dropped when it starts a new page, and each averaging window reads one value too many, so the results are wrong and the final one is `NaN`.

## Bug 5 – bug5.py
**Intended Behavior**: `add_order` adds an amount to that customer's own order list. `top_orders` returns the n largest amounts, largest first. `parse_amounts` returns the numeric sum of a comma-separated price string such as `"19.99,5.50,12"`.  
**Issue Type**: Misuse of data types / library.  
**Notes**: Different customers end up sharing one order list, `top_orders` raises a `TypeError`, and `parse_amounts` fails when it adds text to a number.

## Bug 6 – bug6.js
**Intended Behavior**: Convert form input strings to integers, return their numeric total, sort the quantities from smallest to largest, and report a quantity as low stock only if it is below 5. An empty value `''` means no data and is not low stock.  
**Issue Type**: Misuse of data types / library.  
**Notes**: Parsing returns `NaN` values, the total joins the strings together instead of adding them, the sort orders numbers like text, and `''` is reported as low stock.
