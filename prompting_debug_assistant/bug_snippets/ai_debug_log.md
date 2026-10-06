## Bug 1 – bug1.py
**AI Diagnosis**: Two syntax errors. Line 10, `def letter_grade(avg)`, has no `:` at the end. Line 31, `print(f"{name}: {avg:.1f} ({letter_grade(avg)}"`, is missing the `)` inside the string and the `)` that closes `print(`.  
**Suggested Fix**: Change line 10 to `def letter_grade(avg):` and line 31 to `print(f"{name}: {avg:.1f} ({letter_grade(avg)})")`.  
**Alternative Fixes Tested**: None.  
**Result**: Expected output is `Alice: 91.7 (A)`, `Bob: 73.3 (C)`, `Chloe: 56.0 (F)`.
