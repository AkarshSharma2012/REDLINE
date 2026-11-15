# Issue #90 — Space Apps submission checklist

Done: `docs/submission-checklist.md` with the seven-item **Submission package** section (slides, 2-minute pitch video, demo video, public app link, repo link, AI-use disclosure, credits) plus project, NASA data, AI use, links, team/consent and deadline sections. Each line is one checkbox and a `status: done / todo / unknown`; checked means a repo artifact exists. Anything unverifiable is `unknown`.

15 Nov update: merged `origin/main` (`5094334`). Public app link is now done (README Pages URL, anonymous HTTP 200). Credits are done (`docs/credits.md`). **Repo link is todo:** `https://github.com/AkarshSharma2012/REDLINE` returned HTTP 404 signed-out, so judges may not see it. A human admin must make it public. Slides are still unknown, and both videos are still todo.

Merge note: main's root HANDOFF.md (issue #267) conflicted; kept this task's version. #267 notes are in `docs/handoffs/issue-267.md` on main.

Testing: a Node script checked that every checkbox matches its status. Full `node --test`: exit 0, 1176 tests, 1132 pass, 0 fail, 44 todo (the assertion output comes from tests marked TODO). No server or browser was started.

STATUS: DONE
