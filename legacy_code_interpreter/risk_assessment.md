# Risk Assessment - osCommerce Online Merchant v2.3.4.1

| Risk | Severity | Notes |
|------|----------|-------|
| Deprecated / removed PHP features | High | 166 calls to `each()` (removed in PHP 8), 2,900+ uses of PHP 4 `$HTTP_*_VARS` kept alive by a shim; the bundled Braintree SDK uses `create_function()` (also removed in PHP 8). The store fatals on any supported PHP version. |
| SQL injection surface | High | All SQL is built by string concatenation (~685 `tep_db_input()` calls, almost no prepared statements). `tep_db_perform()` does not escape column names or its WHERE clause. |
| Outdated front-end libraries with known CVEs | High | jQuery 1.11.1 (CVE-2015-9251, CVE-2019-11358, CVE-2020-11022) and jQuery UI 1.10.4 (CVE-2016-7103, CVE-2021-41182) are copied into `ext/` with no dependency manager to update them. |
| Abandoned upstream | High | The last 2.3 release was August 2017 and the 2.4 rewrite stopped in 2016. There will be no security patches; every fix must be made in-house. |
| Session ID exposed in URLs | High | `tep_href_link()` appends the session ID when switching between HTTP and HTTPS domains, which leaks it through logs, bookmarks and `Referer` headers and enables session hijacking/fixation. |
| No automated tests | Medium | No test suite or CI. Checkout, payment and the database layer can't be refactored or upgraded safely. |
| Overselling stock / no transactions | Medium | `checkout_process.php` reads stock, subtracts and writes it back with no locking or transaction. Concurrent orders oversell, and a failure mid-checkout leaves partial order data. |
| Deprecation warnings suppressed | Medium | `application_top.php` turns off `E_DEPRECATED`, so upcoming breakages are hidden instead of fixed. |
| Tight coupling through globals | Medium | 500+ `global` statements and logic spread across procedural `tep_*` functions and page scripts that mix HTML, SQL and PHP. Changes ripple unpredictably. |
| Payment code complexity | Medium | ~50 payment module files plus a bundled gateway SDK, each with its own integration path and callbacks in `ext/modules`. Gateway API changes can break checkout silently. |
| Duplicated code between storefront and admin | Low | Each side has its own copy of the database layer and helpers (e.g. two diverged `database.php` files), so fixes must be applied twice. |
| Outdated card validation rules | Low | `cc_validation` rejects Mastercard 2-series numbers and uses magic error codes. Most stores use hosted gateway forms, which limits the impact. |
| Legacy MD5 password hashes | Low | Old salted-MD5 hashes are upgraded to phpass only when a user logs in, so inactive accounts keep weak hashes in the database. |
