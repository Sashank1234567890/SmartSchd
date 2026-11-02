# SmartSched Implementation Progress

| Phase | Description | Status |
|---|---|---|
| Phase 0 | Environment Verification | Completed & Verified |
| Phase 1 | Foundation & C++ Engine Runner | Completed & Verified |
| Phase 2 | Data Management & Preflight Validation | Completed & Verified |
| Phase 3 | Independent C++ H1-H11 Constraint Validator | Completed & Verified |
| Phase 4 | Greedy Scheduler End-to-End | Completed & Verified |
| Phase 5 | Backtracking (MRV + Forward Checking) | Completed & Verified |
| Phase 6 | Graph Coloring (DSATUR Conflict Adjacency) | Completed & Verified |
| Phase 7 | Timetable Viewer & CSV/PDF Exporters | Completed & Verified |
| Phase 8 | Algorithm Comparison & Analytics Dashboard | Completed & Verified |
| Phase 9 | Interactive Timetable Studio & Live Slot Swapping | Completed & Verified |
| Phase 10 | University Verification, Benchmarks & Polish | Completed & Verified |

---

## Technical Architecture & University Scale
- **Backend**: Node.js + Express + Mongoose on port 3001, persisting to MongoDB Atlas (`smartsched`).
- **Engine Binaries** (C++17, compiled with `-O2` via `scripts/build-engine.js`):
  1. `engine/bin/scheduler`: Fast greedy best-fit heuristic.
  2. `engine/bin/backtracking`: Exhaustive tree search with MRV heuristic, forward checking, and same-subject day guard.
  3. `engine/bin/graph-coloring`: DSATUR dynamic degree-of-saturation coloring on conflict adjacency graph.
  4. `engine/bin/validator`: Independent validator evaluating all H1–H11 hard constraints.
- **Frontend**: React 18 + Tailwind CSS + Vite + Recharts + jsPDF + Lucide icons.

---

## University Scheduling Constraints Satisfied

### 1. Whole-College Co-Scheduling
- All 25 batches/sections across 7 departments (CSE CS1/CS2 all 4 years, IT, AI/DS, ECE, EE, ME, CE) are scheduled simultaneously.
- Shared professors and specialized rooms are harmonized globally to eliminate inter-departmental collisions.

### 2. Batch & Group Hierarchy
- Large batches (~70 students) attend common Theory classes together in Lecture Halls (`LH-*`, capacity 75).
- Batches split into **G1 and G2 groups** (~35 students each) for Labs due to specialized laboratory capacities (~38 students).

### 3. Strict Room Discipline
- Sessions strictly match specialized facilities:
  - Computer/IT labs -> `ComputerLab`
  - Electronics/VLSI labs -> `ElectronicsLab`
  - Electrical labs -> `ElectricalLab`
  - Mechanical workshops -> `MechanicalWorkshop`
  - Civil/Surveying labs -> `CivilLab`
  - Sports/Physical Education -> `SportsGround`
  - Theory classes -> `Classroom` (Lecture Halls)

### 4. Non-Hectic Weekly Distribution
- **Zero Same-Subject-Same-Day Collisions**: Batches never receive duplicate theory classes of the same subject on the same day.
- Classes are evenly distributed across all 5 working days (Monday–Friday) with 0 unassigned idle gaps between lectures.

---

## Empirical Benchmark Matrix (`npm run benchmark`)

Empirical results executed on the 301-session University dataset:

| Dataset | Algorithm | Runtime | Placed / Total | Completion Rate | Hard Violations | Validator Status |
|---|---|---|---|---|---|---|
| **Live College (25 Batches)** | **Greedy** | **18.9 ms** | 301 / 301 | **100.0%** | **0** | **VALID_COMPLETE** |
| **Live College (25 Batches)** | **Graph Coloring (DSATUR)** | **27.4 ms** | 301 / 301 | **100.0%** | **0** | **VALID_COMPLETE** |
| **Live College (25 Batches)** | **Backtracking (MRV+FC)** | **3605.9 ms** | 301 / 301 | **100.0%** | **0** | **VALID_COMPLETE** |
| Small Template | Greedy | 0.8 ms | 12 / 13 | 92.3% | 0 | VALID_PARTIAL |
| Small Template | Graph Coloring | 0.9 ms | 12 / 13 | 92.3% | 0 | VALID_PARTIAL |

---

## Log of Key Milestones
1. **Engine Binaries**: Built 4 standalone C++17 binaries (`scheduler`, `backtracking`, `graph-coloring`, `validator`) executing via stdio pipes without JS fallbacks.
2. **Database & Models**: Extended schemas with specialized room categories, half-batch lab sizing logic, and saved timetable runs.
3. **Seed Generator**: Built `scripts/generate_college_seed.py` generating 25 sections, 40 rooms, 36 faculty, 159 subjects, and 301 weekly sessions.
4. **Generation Lab & Timetable Viewer**: Filterable by Branch, Teacher, and Room; equipped with 2-hour lab/sports continuation blocks, CSV export, and PDF export with `jspdf-autotable`.
5. **Interactive Studio**: Click-to-swap timetable slot editor connected to live C++ validator endpoint (`/api/validate/schedule`).
6. **Analytics Dashboard**: Recharts visualization rendering runtime, soft penalty metrics, search space exploration, and winner badges.
