# Issue 245 local deployment receipt

Applied on LAPTOP-AM at 2026-11-15 03:36 PST to the actual files in `C:\Users\nehap\redline-conductor`, not just this application checkout. Originals are preserved at `state\issue245-backup-20261115-033234`. Existing work folders, A1/agent processes and scheduled Fable were untouched. No resets, worktree deletion, server, browser or persistent replacement process was used.

Installed-file SHA256 values are recorded below. Tracked snapshots have identical text after CRLF/LF normalization; git checkout line endings can give their raw files different hashes:

| File | SHA256 |
| --- | --- |
| conductor.ps1 | E46F92A3039CCAC6A7D944FFCFD16E064B9FC178AF63B2543C935C8272AB9676 |
| test-conductor.ps1 | 73BD570AB5F00ADB5508761CC5F7B604C7FA23FD6EA4A0906E6B71FA429AAEA4 |
| test-merger.ps1 | 5E9B1960008E9EFBFDB8AF9F2201FECE8AE98FC568C69DB54DEBF25020F961BD |

Windows PowerShell parsing passed. The actual source available here contained 61 original offline checks (rather than the reported 63); all passed. Ten added checks pass, including real git HANDOFF add/add preservation, source-conflict rejection, exclusive ownership, UTC backoff, command argument quoting, log isolation and real `node --test` bad-PR isolation. The wrapper reports 62/62 because the new checks run as one child suite.

Application branch full `node --test`: 1133 tests, 1048 pass, 0 fail, 85 pre-existing TODO. Actual queue integration full `node --test`: 1142 tests, 1057 pass, 0 fail, 85 pre-existing TODO. All generated integration commits use `akarshsharma2012 <219518258+AkarshSharma2012@users.noreply.github.com>`, without AI trailers.

## Actual queue verification

Bounded command, executed from this PC and exited 0:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\nehap\redline-conductor\conductor.ps1 -Agent codex -MergeOnly -Once -MergeVerifyOnly
```

Base: `7570c040a2b5ba550016c005a23c52413073def8`

Tested integrated SHA: `df917b7939304c7cdd4ca94e728ab336231757a4`

| PR | Head before and after verification |
| --- | --- |
| 228 | fa15242111ea53b4455de3fd77af091994046a32 |
| 229 | 1231f7e3eedad953937369473e1696d6a1ae3efb |
| 236 | e4881a0ae9bb302f7e43dd02c67ced0d21251842 |
| 237 | a20ffea7d50ec07fb4ce88c85be74b39e7c79653 |
| 238 | a620f7541e452a8e4e805cb723a5b0e2eadbb903 |
| 239 | e100ec5b7e2770cd7955e6057151afd142d0a73f |
| 244 | 9a3b9810172e423c92fb555901ee8caa4b1a8552 |

Queue before = queue after: seven PRs. Verify-only publishes nothing and posts no GitHub comments. `task/ui-polish` is excluded. Scratch is preserved at `merger-scratch\run-18232-537d596e2aaf40b0985c793aa8e0901b\batch`. Test log: `state\merger-test-df917b7939304c7cdd4ca94e728ab336231757a4.log`. Regression and application logs: `state\issue245-evidence\`.

Two earlier integration runs exposed logging contention and an unquoted GitHub JSON field list after tests passed. Both were repaired and covered by regressions before the final successful run.

## A1 activation handoff

No known `-MergeOnly` process existed before or after verification, so none was stopped or restarted. Local deployment is complete; continuous throughput is not activated. The task's hard prohibition on leaving processes running prevents this agent from starting a persistent replacement. An operator/coordinator must activate it under their own process ownership if continuous merging is desired:

```powershell
Set-Location C:\Users\nehap\redline-conductor
powershell -NoProfile -ExecutionPolicy Bypass -File .\conductor.ps1 -Agent codex -MergeOnly
```

That command is provided, not executed. It will re-read current heads/base and rerun tests before publishing; the recorded integration SHA is historical verification, not authorization to skip fresh checks. Merger logs are now `state\merger-<PID>.log`; failures persist in `state\merger-AkarshSharma2012_REDLINE-failures.json`. Verify-only uses a separate failure-state file. Never launch an old script copy alongside this one, since legacy versions do not honor the new lock.

## Fresh verification, 2026-11-15 04:06 PST

Re-read actual local conductor/test sources. All three installed files equal the tracked snapshots after CRLF/LF normalization. Actual local `test-conductor.ps1` exited 0: 62 wrapper checks, including ten merger regressions. No implementation changes were needed in this continuation.

A second bounded `-MergeOnly -Once -MergeVerifyOnly` run exited 0. Base `0f4b2e2c88e1e408ba94d6de8101711a857329c6`; tested integrated SHA `41afd316fa5095b0260f6ed8895170d56c7dd2ce`. Full `node --test`: 1149 tests, 1066 passed, 0 failed, 83 TODO. Integrated scratch remained clean. Log: `state/merger-test-41afd316fa5095b0260f6ed8895170d56c7dd2ce.log`; scan receipt: `state/merger-31548.log`.

Queue before = queue after: 228,229,236,237,238,239,244,246,248. Heads for the original seven remain exactly as recorded above. New heads: PR246 `69b7e260fe66d2bee44fe692d619bdc27321597a`; PR248 `4da4548a25e5f668f97cc3ccc2c6bd0bc9fd5775`. All nine were included in the tested tree; no main push or comments were made. Known agent conductors were preserved; no known persistent merger existed to restart. Verification PID31548 exited. Activation handoff above remains necessary under the hard no-persistent-process rule.