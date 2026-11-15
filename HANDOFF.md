# Issue #240

- Repaired and pushed original PRs #237/#236/#229/#228; exact SHAs and merge/test evidence: docs/handoffs/issue-240.md.
- Preserved original intent and byte-identical task handoffs; existing main handoffs retained. No application/data changes.
- Tested combined candidate 9435a05: node --test exit 0, 1,049 pass / 87 TODO; syntax 91/91. Seven failed TODO assertions explicitly documented, including #234/#235 regressions; this is not science/release clearance.
- Orchestrator: scientific fixes #234/#235/#230 first; then final diff/check review and explicit merge of auto-merge-skipped originals. Retest when base changes.
- No server/browser/persistent process. No evidence marked verified.
STATUS: DONE
