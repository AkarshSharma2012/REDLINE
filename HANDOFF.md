# Issue #235
- Promoted both V2 U2 pressure regressions to enforced tests. Focused node --test run reproduces both failures: NE-no-burn instead of NE-incompatible.
- Root cause: coversNoBurn ignores compareRow pressure grade. Next: require P OK for no-burning coverage; preserve flagged burning evidence; verify full suite once.
