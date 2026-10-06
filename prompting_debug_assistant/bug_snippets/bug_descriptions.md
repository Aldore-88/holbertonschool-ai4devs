# Bug Descriptions

## Bug 1 – bug1.py
**Intended Behavior**: Compute each student's average score and print it to one decimal place with a letter grade (A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F).  
**Issue Type**: Syntax error.  
**Notes**: The script does not run at all; Python raises a `SyntaxError` before executing any code.

## Bug 2 – bug2.js
**Intended Behavior**: Return a cart's total after applying a discount code (`SAVE10` = 10% off, `SAVE20` = 20% off) and then 8% tax, rounded to cents. Carts of $100 or more with no code get `SAVE10` automatically.  
**Issue Type**: Logical error.  
**Notes**: The program runs without errors but prints wrong totals ($21.6, $0, $0 instead of $86.4, $97.2, $10.8). A $100 cart with no code does not receive the automatic discount.

## Bug 3 – bug3.py
**Intended Behavior**: Print each inventory item's average sale price (0.00 if it has no sales), then print the total stock per warehouse. Records missing a `stock` field count as 0 units.  
**Issue Type**: Runtime exception.  
**Notes**: Crashes partway through the inventory on an item with no sales, and again on a record that has no `stock` field.

## Bug 4 – bug4.ts
**Intended Behavior**: `paginate` splits a list into pages of at most `pageSize` items, keeping every item. `movingAverage` returns the average of each consecutive window of `windowSize` values (`n - windowSize + 1` results).  
**Issue Type**: Off-by-one / loop logic error.  
**Notes**: The last user ("gus") is missing from the pages. The moving averages are too high, there is one result too many, and the last one is `NaN`.

## Bug 5 – bug5.py
**Intended Behavior**: `add_order` records an order in that customer's own list. `top_orders` returns the n largest amounts, largest first. `parse_amounts` returns the numeric total of a comma-separated price string.  
**Issue Type**: Misuse of data types / library.  
**Notes**: Bob's order list also contains Alice's orders. `top_orders` raises `TypeError: 'NoneType' object is not subscriptable`. `parse_amounts` fails because it tries to add strings to an integer.

## Bug 6 – bug6.js
**Intended Behavior**: Convert form input strings to integers, total them, sort them in ascending numeric order, and flag quantities below 5 as low stock (an empty value `''` is "no data", not low stock).  
**Issue Type**: Misuse of data types / library.  
**Notes**: Parsing gives `[10, NaN, 1, NaN]`, the total becomes the string `"0107123"`, the sort gives `[10, 100, 12, 3, 7]`, and `isLowStock('')` returns `true`.
