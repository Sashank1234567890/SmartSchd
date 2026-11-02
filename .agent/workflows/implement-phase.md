**Right now: do Phase 0 + Phase 1 only.**

Phase 0: verify the local environment per PART A (node, npm, g++ with C++17, MongoDB Atlas connectivity from `.env`). Report real output. If anything fails, stop and tell me what to install or fix.

Phase 1: build the foundation per PART B section 9, item 1.

First produce an implementation plan (files to create, tests to run, any assumptions) and wait for my approval before writing code. After approval, implement, run `npm run build:engine`, start the app, call `/api/health`, and show the real outputs. Update `docs/PROGRESS.md`. Do NOT start Phase 2.

**For every later phase** (workflow `/implement-phase`): read `.agent/rules/smartsched.md`, `docs/SPEC.md` and `docs/PROGRESS.md`; implement the next unfinished phase (or the one I name); produce an implementation plan and wait for approval; implement only that phase; run its tests with real commands; update `docs/PROGRESS.md`; finish with a walkthrough containing actual command output and a clear statement of what is verified and what is not; stop and do not begin the next phase.
