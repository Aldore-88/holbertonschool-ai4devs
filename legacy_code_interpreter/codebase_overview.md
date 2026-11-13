# Codebase Overview - osCommerce Online Merchant v2.3.4.1

Open-source PHP e-commerce platform (storefront + admin panel).
Source: https://github.com/osCommerce/oscommerce2 (tag `v2.3.4.1`)

## Age
Project started in 2000. The 2.3 line was first released in November 2010, and its last major update was v2.3.4 in June 2014. A final maintenance patch (v2.3.4.1, August 2017) only adjusted PHP/MySQL compatibility. A planned 2.4 rewrite stopped in late 2016.

## Size
~64,000 LOC of first-party PHP across ~620 files (~71,000 counting the bundled Braintree SDK).
- Storefront: ~38,000
- Admin panel: ~22,000
- Payment callbacks (`ext/modules`): ~3,000
- Installer: ~1,200

Also ~1,500 lines of SQL (schema + seed data) and ~900 lines of CSS. Counts are non-blank lines.

## Dependencies
- PHP 5 (code written for PHP 4/5)
- MySQL through `mysqli`, with a fallback shim to the old `mysql_*` functions
- jQuery 1.11.1 and jQuery UI 1.10.4
- Flot (charts), Colorbox (lightbox), 960 Grid System (CSS layout)
- phpass (`PasswordHash`) for password hashing
- Braintree PHP SDK and payment gateway modules (6 PayPal variants, among others)

## Issues
- No automated tests and no dependency manager: third-party libraries are copied into the source tree
- Built for PHP 4: 2,900+ references to `$HTTP_GET_VARS` / `$HTTP_POST_VARS`, kept alive by a compatibility shim
- 166 calls to `each()`, which PHP 8 removed, and `E_DEPRECATED` notices are switched off, which hides the problem
- Procedural core: logic lives in global `tep_*` functions, with 500+ uses of the `global` keyword
- HTML, SQL and PHP mixed in the same files (40 of 46 top-level page scripts output markup directly)
- SQL built as strings and escaped with `tep_db_input()` (~685 calls) rather than prepared statements
- Storefront and admin each keep their own copy of the database layer and helper functions
- Old MD5-salted passwords stay in the database until each user logs in again
