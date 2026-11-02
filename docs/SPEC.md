### 1. Resolved assumptions (binding; document them in docs/ALGORITHMS.md)

- **A1 Time model.** Settings define ordered working days (indices 0..D-1) and an ordered list of periods (indices 0..P-1), each with `label`, `start` ("HH:MM"), `end`, `isBreak`, `breakType` ("short"|"lunch"|null). Breaks occupy a position in the list but never host sessions. Working hours are derived from the first teaching-period start to the last teaching-period end. A slot is `(day, startPeriod)`.
- **A2 Sessions.** A Subject has `weeklySessions` (≥1) and `durationPeriods` (1 for lectures, normally 2 for labs). The backend expands each Subject into `weeklySessions` Session objects `{sessionId, subjectId, sectionId, teacherId, durationPeriods, roomType, studentCount, indexInWeek}`. A session at `(day, start)` occupies periods `start..start+durationPeriods-1`; all must be non-break periods with consecutive indices, so a multi-period session never straddles a break.
- **A3 Ownership.** Each Subject record belongs to exactly one section and has exactly one teacher. The same course for two sections = two Subject records with the same `code`. Combined classes, cross-section electives and multi-teacher sessions are out of scope (list under limitations).
- **A4 Teachable subjects.** `teacher.teachableSubjectCodes` lists subject codes. If non-empty, a subject's teacher must list the subject's code, else pre-flight error `E_TEACHER_NOT_QUALIFIED`. If empty, no restriction. The subject form only offers qualified teachers.
- **A5 Availability.** Teacher and room availability are D×P boolean matrices; a session may be placed only if every occupied period is available for its teacher AND its room.
- **A6 Workload.** `teacher.maxWeeklyPeriods` = max total occupied teaching periods per week (sum of `durationPeriods`). Hard constraint.
- **A7 Rooms.** `room.type` ∈ {"Classroom","Laboratory"}. Subject type Theory → Classroom; Practical or Lab → Laboratory, unless `requiredRoomType` overrides. A session needs a matching room with `capacity ≥ section.studentCount`.
- **A8 Scope of a run.** A generation schedules ALL sessions of the selected sections jointly (teachers and rooms are shared). A `timetable` stores the complete assignment set; section, teacher and room views are filters.
- **A9 Validity strings (use everywhere).** `VALID_COMPLETE` = zero hard violations and zero unscheduled sessions. `VALID_PARTIAL` = zero hard violations and at least one unscheduled session. `INVALID` = one or more hard violations (shown prominently, never as complete). Every required session must appear exactly once in `assignments` or `unscheduled`, otherwise violation H7.
- **A10 Determinism.** No randomness. Entities are sorted by id internally; tie-breaks are fully defined. The same input gives byte-identical assignments (timing fields excepted).
- **A11 Soft score.** Lower penalty is better. Raw penalties and weighted total are reported separately; no invented 0–100 normalization. Penalties cover scheduled sessions only; unscheduled sessions are reported separately. The UI must say that penalties are only comparable alongside scheduled counts.

### 2. Constraints

**Hard (always enforced, displayed read-only, cannot be disabled):**
H1 teacher clash; H2 section clash; H3 room clash (all on overlapping periods); H4 room capacity ≥ section size; H5 room type matches; H6 teacher and room available in every occupied period; H7 every required session exactly once in assignments or unscheduled; H8 multi-period sessions use consecutive periods in the same room on the same day; H9 no session overlaps a break; H10 sessions only in configured teaching periods; H11 teacher weekly load ≤ `maxWeeklyPeriods`.

**Soft (weights configurable in `settings.constraintConfig`; default weight 1):**
- S1 gaps: per section and day, with occupied teaching-period ordinals (breaks skipped) `o_first..o_last`: `(o_last − o_first + 1) − occupiedCount`.
- S2 workloadBalance: per teacher, `Σ_d |load_d − mean|`, mean = total load / number of working days.
- S3 consecutiveTeaching: per teacher/day, each run of consecutive teaching periods (a break splits runs) longer than `maxConsecutivePeriods` (default 3) adds `run − max`.
- S4 preferredSlots: if a teacher has preferred slots, each session starting at a non-preferred `(day, period)` adds 1.
- S5 distribution: per (subject, section, day) with k>1 sessions, add `k − 1`.
- S6 earlyLate: each session starting in the first teaching period or ending in the last adds 1.
`softPenaltyTotal = Σ weight_k × raw_k`, returned with a per-constraint breakdown.

### 3. MongoDB (database `smartsched`, Mongoose schemas with validation and indexes)

- `subjects`: name, code, type (Theory|Practical|Lab), teacherId, sectionId, weeklySessions, durationPeriods, requiredRoomType, notes. Unique index (code, sectionId).
- `teachers`: name, teacherCode (unique), teachableSubjectCodes[], availability (D×P), maxWeeklyPeriods, preferredSlots[{day,period}].
- `rooms`: name, roomNumber (unique), type, capacity, availability (D×P).
- `sections`: name (unique), department, studentCount.
- `settings` (single document): workingDays[], periods[], constraintConfig {weights, maxConsecutivePeriods}, engineDefaults {backtrackingTimeLimitMs: 10000, backtrackingNodeLimit: 5000000}.
- `timetables`: name, sectionIds[], algorithm, algorithmRunId, comparisonId, assignments[{sessionId, subjectId, sectionId, teacherId, roomId, day, startPeriod, durationPeriods}], unscheduled[{sessionId, reasonCode, detail}], validationStatus (A9), createdAt.
- `algorithm_runs`: algorithm, parameters, inputHash (SHA-256 of canonical engine-input JSON), inputSnapshotSummary, engineStatus (`searchStatus`), metrics, hardViolations[], validationStatus, comparisonId, createdAt.
Deleting a record referenced elsewhere returns HTTP 409 with an explanation.

### 4. C++17 engine (`engine/`)

Files: `src/main.cpp`, `src/common.hpp/.cpp` (data model, option enumeration, occupancy tables, soft-penalty calculator), `src/greedy_scheduler.cpp`, `src/backtracking_scheduler.cpp`, `src/graph_coloring.cpp`, `src/validator_main.cpp` + `src/constraint_validator.cpp`, `tests/`, `third_party/json.hpp` (vendor the single-header nlohmann/json; do not hand-roll a JSON parser).

**Two binaries.** `scheduler` runs the algorithms. `validator` is the **independent validator**: it must not include scheduler headers or reuse scheduler logic or occupancy code. It recomputes every constraint from raw input plus assignments with its own simple (even slower, O(n²)) code, so a scheduler bug cannot hide itself.

**CLI contract.** Read ONE JSON document from stdin; write ONE JSON document to stdout; nothing else on stdout; debug logs on stderr only. Exit 0 for any well-formed run (even with unscheduled sessions). On malformed or invalid input print `{"ok":false,"error":{"code":"...","message":"..."}}` and exit non-zero.

**Input:**
```
{
  "mode": "schedule", "algorithm": "greedy" | "backtracking" | "graph_coloring", "params": {},
  "settings": { "days": ["Mon"], "periods": [{"index":0,"label":"P1","start":"09:00","end":"09:50","isBreak":false}],
                "constraintConfig": {"weights": {"gaps":1,"workloadBalance":1,"consecutiveTeaching":1,"preferredSlots":1,"distribution":1,"earlyLate":1}, "maxConsecutivePeriods":3} },
  "sections": [{"id":"..","name":"..","studentCount":60}],
  "teachers": [{"id":"..","name":"..","maxWeeklyPeriods":18,"availability":[[true]],"preferredSlots":[{"day":0,"period":1}]}],
  "rooms": [{"id":"..","name":"..","type":"Classroom","capacity":70,"availability":[[true]]}],
  "sessions": [{"sessionId":"..","subjectId":"..","subjectCode":"..","sectionId":"..","teacherId":"..","durationPeriods":2,"roomType":"Laboratory"}]
}
```
For `"mode":"validate"` (validator binary) add `"assignments":[{"sessionId","roomId","day","startPeriod"}]` and `"unscheduled":[{"sessionId"}]`.

**Schedule output:**
```
{ "ok": true, "algorithm": "...", "searchStatus": "...",
  "assignments": [{"sessionId":"..","roomId":"..","day":0,"startPeriod":2}],
  "unscheduled": [{"sessionId":"..","reasonCode":"..","detail":".."}],
  "metrics": { "algorithmTimeMs":0, "totalEngineTimeMs":0, "totalSessions":0, "scheduledCount":0, "unscheduledCount":0,
    "softPenalty": {"total":0,"breakdown":{"gaps":0,"workloadBalance":0,"consecutiveTeaching":0,"preferredSlots":0,"distribution":0,"earlyLate":0}},
    "roomUtilizationPct":0, "searchNodes":null, "backtrackCount":null, "domainWipeouts":null,
    "graphVertices":null, "graphEdges":null, "colorsUsed":null },
  "graph": null }
```
(The zeros only show field types; real values come from execution.)

**Validator output:** `{"ok":true,"validationStatus":"VALID_COMPLETE|VALID_PARTIAL|INVALID","violations":[{"code":"H1","type":"TEACHER_CLASH","sessionIds":[".."],"entityType":"teacher","entityId":"..","day":1,"period":3,"explanation":"..","suggestion":".."}],"summary":{"H1":0}}`. Report every violation of H1–H11 with an explanation and, where possible, a concrete suggestion.

**Timing.** `algorithmTimeMs` is measured with `std::chrono::steady_clock` around the algorithm only (not JSON parsing); also report `totalEngineTimeMs`.

**Shared preprocessing.** Enumerate every candidate option `(day, startPeriod, roomId)` per session that satisfies the session-local constraints H4, H5, H6, H8, H9, H10. Use flat bool tables `teacherBusy[t][d][p]`, `sectionBusy[s][d][p]`, `roomBusy[r][d][p]` for O(duration) clash checks. Canonical slot order: day-major, then start period ascending. Canonical room order: capacity ascending (best fit), then room id. If a session has no static options, report a reason code: `NO_ROOM_OF_TYPE`, `NO_ROOM_CAPACITY`, `NO_TEACHER_AVAILABILITY`, `NO_ROOM_AVAILABILITY`, `NO_CONSECUTIVE_PERIODS`, or `NO_FEASIBLE_OPTION`. Dynamic failures: `NO_FREE_OPTION_AFTER_CONFLICTS`, `TEACHER_WORKLOAD_EXCEEDED`, `SEARCH_LIMIT_REACHED`.

**4.1 Greedy (baseline; parameter-free).** Order sessions most-constrained-first: ascending static option count; ties by descending `durationPeriods`, then ascending teacher availability count, then descending section size, then session id. For each session take the first option in canonical order that has no dynamic conflict (H1–H3) and respects H11. If none, mark unscheduled with the best-known reason. No backtracking; never place an invalid assignment. `searchStatus` = `COMPLETED`. Document complexity O(S log S + S·O) with O(duration) per check, and that early local choices can block later sessions.

**4.2 Backtracking with MRV + forward checking.** `params`: `timeLimitMs` (default 10000), `nodeLimit` (default 5,000,000), `valueOrdering` ("static" default | "softAware", which orders values by incremental soft penalty).
- Variables = sessions; domains = remaining options (bitset or vector<bool> per session).
- Variable choice: MRV (smallest current domain); ties: most unassigned neighbors sharing a teacher or section; then session id.
- Assign, recording every domain change on a **trail** for exact undo.
- Forward checking after each assignment: remove from unassigned sessions of the same teacher or section every time-overlapping option; remove same-room overlapping options; if the teacher's remaining workload is less than a session's duration, empty that session's domain. If any domain empties, undo the trail, count a `domainWipeout`, try the next value. Count every assignment attempt as a `searchNode`; count each backtrack in `backtrackCount`.
- Sessions with empty initial domains are excluded from the search and reported unscheduled with reasons.
- Keep the best partial assignment (most sessions scheduled) seen during search and return it if no full solution is found.
- `searchStatus`: `SOLVED` (all sessions scheduled); `SOLVED_EXCLUDING_STATICALLY_INFEASIBLE`; `INFEASIBLE_PROVEN` (space exhausted with no full assignment of the searched set; best partial returned); `TIMEOUT_INCOMPLETE` (time or node limit hit; best partial returned; never claim success or optimality).
- Document that worst-case time is exponential, about O(O^S), and that MRV and forward checking prune but do not change that bound.

**4.3 Graph coloring.** `params`: `ordering` ("dsatur" default | "welsh_powell").
- Vertex per session; edge between sessions sharing a teacher or a section (build in O(S+E) by grouping).
- Colors = start slots in canonical order. Because labs span several periods, the neighbor rule is **"time intervals must not overlap"**, not just "different color". Document this extension of classic coloring.
- For each vertex in order choose the lowest color such that: no overlap with colored neighbors; H6, H8, H9, H10, H11 hold; and a feasible free room exists (type, capacity, availability, no overlap, best-fit order). Assign color and room together; otherwise mark unscheduled.
- Return `graph: {"vertices":[{"sessionId":"..","color":3}],"edges":[[i,j]]}` and metrics `graphVertices`, `graphEdges`, `colorsUsed` (distinct start slots used; a heuristic upper bound, not a minimum). Document why plain coloring is insufficient and how rooms, durations and availability are integrated.

**4.4 Branch and Bound (OPTIONAL, only after everything else passes).** Minimize `softPenaltyTotal` over complete schedules with a documented admissible lower bound and a time limit.

### 5. Backend (Node + Express + Mongoose)

**engineRunner service** (`server/services/engineRunner.js`): `child_process.spawn` without a shell; write JSON to stdin; collect stdout (cap ~50 MB) and stderr; enforce a hard timeout (`ENGINE_TIMEOUT_MS`, or the algorithm's time limit + 5000 ms) and kill on expiry. Handle: missing binary (tell the user to run `npm run build:engine`), non-zero exit, empty stdout, invalid JSON, timeout. Never put user strings into a shell command.

**Generation pipeline:**
1. Load data; run **pre-flight validation** (errors block with HTTP 422; warnings are returned): missing references, unqualified teacher (A4), weekly sessions × duration exceeding available periods, lab duration longer than the longest run of consecutive teaching periods, section size ≤ 0, teacher's required periods above `maxWeeklyPeriods` (warning), no room of required type or capacity (warning).
2. Expand sessions (A2), build engine input, compute `inputHash`.
3. Spawn `scheduler`; parse output.
4. Spawn `validator` on the same input plus the engine's assignments. This is the authoritative `validationStatus`.
5. Save `algorithm_runs` and `timetables`; return structured JSON.

**"Generate using all algorithms":** build ONE engine input; run all three algorithms on it sequentially (not in parallel, so timings are comparable); validate each; save under one shared `comparisonId`.

**REST** (responses `{success, data, error:{code,message,details}}`; codes 200/201/400/404/409/422/500/504):
CRUD `/api/subjects|teachers|rooms|sections` with search and filters; `/api/settings` (GET, PUT); `POST /api/generate/greedy|backtracking|graph-coloring` (body `{sectionIds, params, name}`) and `POST /api/generate/all`; `GET /api/timetables`, `/:id`, `/:id/section/:sectionId`, `/:id/teacher/:teacherId`, `/:id/room/:roomId`, `DELETE /:id`; `POST /api/validate/:timetableId`, `GET /api/validate/:timetableId/report`, `GET /api/timetables/:id/unscheduled`; `GET /api/analytics/comparisons`, `/comparisons/:comparisonId`, `/room-utilization`, `/teacher-workload`, `/stats`; `POST /api/dev/seed/:datasetName`, `DELETE /api/dev/seed` (clearly labeled as loading INPUT test data, with a UI confirmation); `GET /api/health` (mongodbConnected, schedulerBinaryFound, validatorBinaryFound).

### 6. Frontend (React + Vite + Tailwind + React Router)

Clean, responsive, academic-planning look with a sidebar; the weekly timetable grid is the visual centerpiece. Required: loading, empty and error states; delete confirmations; form validation; accessible labels; tooltips for technical metrics. No placeholder buttons; nothing unimplemented shown as working.
1. **Dashboard:** cards for sections, subjects, teachers, rooms, required weekly sessions, scheduled and unscheduled sessions, latest status; teacher workload, room utilization, per-section completion, comparison summary. All real data; empty state before the first run.
2. **Data Management:** tabs for Subjects, Teachers (availability grid editor), Rooms (availability grid), Sections, with search and filters.
3. **Calendar and Settings:** working days, periods with times, break marking (short/lunch), live preview of derived teaching periods and hours.
4. **Constraint Configuration:** H1–H11 read-only with explanations; S1–S6 weight inputs, `maxConsecutivePeriods`, engine time/node limits.
5. **Generation Laboratory:** section selector; three algorithm cards (description, complexity note, parameters, Run button, status, runtime, scheduled, unscheduled, hard violations, soft penalty; search nodes, backtracks and search status for backtracking; colors, vertices and edges for coloring); a prominent **GENERATE USING ALL ALGORITHMS** button; a conflict-graph visualization for coloring (cap rendering at 150 vertices, otherwise show a summary); static explanatory text on trade-offs.
6. **Timetable Viewer:** Section view (rows = periods including visible break rows, columns = days; cell = subject code, teacher, room; labs highlighted and spanning rows; per-subject colors), Teacher view (teaching/free periods, daily load, load vs max), Room view (occupied/available periods, utilization %), filters (day, teacher, section, room), unscheduled panel, validation badge using A9 strings. Export CSV and PDF (client-side with `jspdf` + `jspdf-autotable` via npm).
7. **Validation Inspector:** choose a timetable, run the C++ validator, list each violation (type, session, entity, day/period, explanation, suggestion); red `INVALID` badge whenever any hard violation exists.
8. **Algorithm Comparison:** table plus bar and line charts (Recharts) for execution time, scheduled, unscheduled, hard violations, search nodes, backtracks, soft penalty and breakdown, room utilization. Group by `comparisonId`; compare only runs with equal `inputHash` and say so; include run history. Explain trade-offs without assuming any algorithm always wins.
Optional (Phase 9): manual drag-to-move editing where every move is checked by the validator binary.

### 7. Testing and benchmarks

- **C++ unit tests** (`npm run test:engine`): hand-built tiny cases with known correct answers: two sessions sharing a teacher never share a slot; a lab never spans a break; a too-small room is never used; an impossible instance yields unscheduled sessions and backtracking `INFEASIBLE_PROVEN`; hand-crafted bad timetables trigger each of H1–H11 in the validator; determinism (two runs give identical assignments).
- **Property check:** every engine run in tests is verified by the independent validator with zero hard violations on whatever the engine claims is valid.
- **Seed datasets** (`server/seeds/*.json`, INPUT data only, built by a fixed-seed generator script): 1 small, 2 medium, 3 large, 4 teacher unavailable, 5 full room capacity, 6 shared-teacher conflicts, 7 shared-section conflicts, 8 labs needing consecutive periods, 9 insufficient rooms, 10 impossible timetable.
- **Benchmark script** (`npm run benchmark`): load each dataset, run all three algorithms on identical input, validate, store runs in MongoDB, write `benchmarks/results/<timestamp>.csv` and `.json` containing ONLY measured values. Repeat each run 5 times; report median runtime plus min/max. Backtracking uses the documented limits and reports `TIMEOUT_INCOMPLETE` rather than claiming a result. Never write expected or sample numbers anywhere.
- **API tests:** CRUD, pre-flight rejection, 409 on referenced deletes, engine timeout handling, malformed engine output handling.

### 8. Structure and documentation

```
smartsched/
  client/  server/  engine/  scripts/  benchmarks/  docs/
  README.md  .env.example  package.json  package-lock.json
```
Root scripts: `dev` (client + server via the `concurrently` npm package), `build`, `start` (Express serves the built client), `build:engine`, `test:engine`, `test:server`, `benchmark`. Docs: `README.md` (setup, MongoDB Atlas steps including the network access list, run, test and benchmark commands), `docs/ALGORITHMS.md` (pseudocode, A1–A11, time and space complexity for each algorithm, limitations), `docs/API.md` (request and response examples), `docs/DECISIONS.md`, `docs/PROGRESS.md`. State limitations honestly: no combined classes, one teacher per session, heuristics do not guarantee the best possible timetable, results depend on supplied data.

### 9. Implementation phases (test each before continuing)

1. **Foundation:** structure, Vite React + Tailwind, Express, Mongoose connection with a visible failure mode, `build:engine` script, a minimal engine round trip through `engineRunner`, `/api/health`.
2. **Data management:** schemas, CRUD, pre-flight validation, the four management screens, settings/calendar page.
3. **Constraint engine:** C++ data model, option enumeration, occupancy tables, soft-penalty calculator, the independent validator with unit tests for H1–H11.
4. **Greedy** end to end (API → engine → validator → MongoDB → UI card).
5. **Backtracking:** MRV, forward checking, trail undo, limits, best partial, statuses; test on hard and impossible instances.
6. **Graph coloring:** conflict graph, DSATUR/Welsh–Powell with the overlap rule, room integration, graph payload and visualization.
7. **Timetable viewer:** section, teacher, room views, filters, unscheduled panel, status badge.
8. **Comparison:** "Generate using all algorithms", `comparisonId` grouping, charts, dashboard analytics.
9. **Advanced:** CSV/PDF export first (required), then manual editing with validator checks, then optional Branch and Bound.
10. **Final testing:** seed datasets, benchmark script, integration/DB/API tests, UI polish, documentation, remove any stray lock files.

### 10. Acceptance criteria (all must pass)

Frontend, backend and MongoDB work and data persists across restarts; all four entities and settings are manageable; H1–H11 enforced and S1–S6 measured with configurable weights; Greedy, Backtracking (MRV + forward checking) and Graph Coloring all run as C++17 binaries on identical input; the independent C++ validator checks every result and A9 strings are used everywhere; unscheduled sessions are reported with reasons; section, teacher and room timetables work; comparison charts show only measured values; saved timetables are retrievable; CSV and PDF export work; the benchmark script runs and writes real results; no fake results or placeholder buttons; npm is the only JavaScript package manager; MongoDB is the only persistent database.
