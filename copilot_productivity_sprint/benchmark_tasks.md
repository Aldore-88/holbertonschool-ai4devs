# Benchmark Tasks

Each task should take 15–30 minutes.

## Task 1 - CRUD Endpoint
**Requirements**: Implement POST /users with validation.  
**Inputs**: JSON {name, email}  
**Outputs**: Stored user with ID, returned as JSON {id, name, email}  
**Acceptance Criteria**:  
- Returns 201 on success  
- Returns 400 on invalid email  
- Returns 400 when name is missing or empty  
- Returns 409 when the email already exists  

## Task 2 - CSV Sales Report
**Requirements**: Write a function that reads a sales CSV and returns total revenue per product.  
**Inputs**: CSV file with columns `date, product, quantity, unit_price`  
**Outputs**: JSON object {product: total_revenue}, sorted by revenue (highest first)  
**Acceptance Criteria**:  
- Totals are correct and rounded to 2 decimals  
- Rows with missing or non-numeric values are skipped and counted  
- An empty file (headers only) returns {}  

## Task 3 - Bug Fix: Pagination
**Requirements**: Fix the off-by-one bug below (pages are 1-based) and add unit tests.  
```python
def paginate(items, page, page_size):
    start = page * page_size
    end = start + page_size
    return items[start:end]
```
**Inputs**: list of items, page (1-based), page_size  
**Outputs**: List of items on the requested page  
**Acceptance Criteria**:  
- `paginate(list(range(10)), 1, 3)` returns `[0, 1, 2]`  
- `paginate(list(range(10)), 4, 3)` returns `[9]`  
- A page past the end returns `[]`  
- `page < 1` or `page_size < 1` raises `ValueError`  

## Task 4 - Signup Form Validation
**Requirements**: Build an HTML/JS signup form with client-side validation.  
**Inputs**: Name, email, and password fields  
**Outputs**: Inline error messages and a success message on submit  
**Acceptance Criteria**:  
- Errors show when a field loses focus  
- Password needs at least 8 characters and 1 number  
- Submit button stays disabled until all fields are valid  
- Submitting shows a success message without reloading the page  

## Task 5 - Slugify Utility
**Requirements**: Implement `slugify(title)` and write unit tests for it.  
**Inputs**: String, e.g. `"Hello, World!  2026"`  
**Outputs**: URL-safe slug, e.g. `"hello-world-2026"`  
**Acceptance Criteria**:  
- Output is lowercase  
- Punctuation is removed  
- Spaces and repeated hyphens collapse into a single hyphen  
- No leading or trailing hyphens  
- Empty input returns `""`  
- At least 5 unit tests pass  
