# Master Project Dossier & Claude Primer: SmartSched Automated Timetable Generator

> **Instructions for Claude**:
> You are acting as an expert Computer Science professor, Systems Architect, and Lead AI Engineer. The user has built **SmartSched**, an enterprise-grade automated university timetable generation and multi-algorithm comparison platform.
> Use this document to understand every detail of the project: the 4 core scheduling algorithms (Greedy, Backtracking, Graph Coloring DSATUR, Combined Hybrid), the architectural constraints, the dual-engine design (C++17 native binaries + universal Serverless JavaScript engine), the real-world college scheduling rules (designated lecture halls, sub-section interleaving, cross-branch locks), and the full-stack MERN + Vercel deployment.
> When the user asks you questions, explain the concepts clearly, deeply, and intuitively with math, code logic, real-world examples, and algorithm comparisons.

---

## 1. Project Executive Summary

- **Project Name**: SmartSched
- **Core Problem**: University timetable scheduling is an **NP-complete Constraint Satisfaction Problem (CSP)**. A typical college with 60+ sections, 300+ subjects, 90+ faculty members, and limited lecture halls has a search space exceeding \(10^{150}\) possible slot combinations. Manual scheduling takes weeks and frequently results in room clashes, faculty double-booking, or student fatigue.
- **Solution**: A dual-engine scheduling platform that implements, benchmarks, and visualizes **4 distinct combinatorial optimization algorithms**.
- **Key Real-World Innovation**: Strict **Branch-Locked Designated Lecture Halls** (e.g., `LH-CSE-101` for 1st Year CSE, `LH-ECE-201` for 2nd Year ECE) with **sub-section interleaving** (e.g., CS1 and CS2 share and alternate periods in the same room without collision), zero cross-branch classroom usage, shared multidisciplinary labs, and 100% schedule completion.
- **Tech Stack**:
  - **Core Scheduling Engine**: Dual-engine architecture:
    1. Native **C++17** compiled binaries (`scheduler`, `backtracking`, `graph-coloring`, `combined`, `validator`).
    2. Pure **JavaScript** serverless engine (`server/services/jsEngine.js`) for cloud/Vercel zero-binary execution.
  - **Backend**: Node.js, Express, MongoDB Atlas, Mongoose.
  - **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons, HTML5 canvas/grid views.
  - **Deployment**: Live on Vercel (`smartschd-server.vercel.app`) with MongoDB Atlas cloud clustering.

---

## 2. The 4 Scheduling Algorithms in Depth

### Algorithm 1: Priority-Ordered Greedy Heuristic (`scheduler`)
- **Category**: Constructive greedy heuristic with multi-pass relaxation.
- **How It Works**:
  1. **Pre-sorting**: Sessions are sorted with higher priority given to harder constraints:
     - Multi-period sessions first (2-hour laboratories, 2-hour sports).
     - Regular 1-hour lectures.
     - Tie-breaking by section identifier.
  2. **Candidate Room Filtering**:
     - If `roomType == 'Classroom'`, restricts candidate rooms strictly to that branch and academic year (e.g., `LH-CSE-101` for CSE 1st Year).
     - Validates capacity: \( \text{capacity} \ge \text{studentCount} \).
  3. **Load Balancing via Day Ordering**:
     - Evaluates current daily workload per section: \([ \text{load}_{\text{Mon}}, \text{load}_{\text{Tue}}, \dots ]\).
     - Orders days dynamically in ascending order of load (least-loaded day first) to prevent student fatigue.
  4. **Placement Passes**:
     - *Pass 0 (Strict)*: Prohibits scheduling two sessions of the same subject on the same day for a section.
     - *Pass 1 (Relaxed)*: If strict placement fails, allows placement on an existing day provided no teacher, section, or room clash occurs.
- **Time Complexity**: \(\mathcal{O}(N \cdot R \cdot D \cdot P)\) where \(N\) is sessions, \(R\) is rooms, \(D\) is days, \(P\) is periods.
- **Performance**: Ultra-fast (~9 ms to 40 ms for 719 sessions).
- **Pros & Cons**: Extremely fast; can occasionally leave slots unscheduled on heavily congested graphs without backtracking.

---

### Algorithm 2: Depth-First Search with Backtracking & Forward Checking (`backtracking`)
- **Category**: Exact Constraint Satisfaction Problem (CSP) Solver.
- **How It Works**:
  1. **State Space Tree**: Every node represents an assignment of a session \(s_i\) to a tuple \((r, d, p)\).
  2. **MRV (Minimum Remaining Values) & Degree Heuristic**:
     - Chooses the most constrained session next (fewest valid remaining time-slots/rooms).
  3. **Forward Checking**:
     - As soon as session \(s_i\) is placed at \((d, p)\), future domains of conflicting sessions (same teacher, section, or room) are pruned immediately. If any session's domain becomes empty, the engine immediately backtracks without exploring dead ends.
  4. **Symmetry Breaking**:
     - Identical weekly sessions of the same subject are ordered: session index \(k\) must precede or match constraints of session \(k+1\).
  5. **Time & Node Bounds**: Configured with a node limit (e.g. \(2,000,000\) nodes) and timeout (e.g. 25,000 ms) with fallback to the best partial solution found.
- **Time Complexity**: Worst-case \(\mathcal{O}(M^N)\) (exponential), average-case heavily pruned by forward checking.
- **Performance**: Highest completion rate (achieves 100.0% completion across all 719 sessions).
- **Pros & Cons**: Finds global optima and complete schedules where greedy heuristics might fail; higher CPU runtime.

---

### Algorithm 3: Graph Coloring via DSATUR (`graph-coloring`)
- **Category**: Graph Theory / Combinatorial Optimization.
- **How It Works**:
  1. **Conflict Graph Construction**:
     - Each session \(s_i\) is a vertex \(V_i\).
     - An undirected edge \(E(u, v)\) exists between two sessions if they cannot share a time slot:
       - Same teacher: \(\text{teacher}(u) == \text{teacher}(v)\)
       - Same section: \(\text{section}(u) == \text{section}(v)\)
       - Potential room competition.
  2. **Colors as Time-Room Slots**:
     - Each "color" represents a unique valid combination of `(Room, Day, Period)`.
  3. **DSATUR (Degree of Saturation) Algorithm**:
     - *Saturation Degree*: Number of distinctly colored neighbors already adjacent to vertex \(v\).
     - In each iteration, select the uncolored vertex with the **maximum saturation degree**.
     - Tie-breaker: Vertex with the highest uncolored degree (most remaining conflicts).
     - Assign the lowest-index valid color that does not clash with any neighbor.
  4. **Smooth Distribution & Break Enforcement**:
     - Slots are scored to ensure sessions are distributed evenly across Monday to Friday, avoiding clustered teaching blocks.
- **Time Complexity**: \(\mathcal{O}(V^2)\) or \(\mathcal{O}(V \log V + E)\) using priority sets.
- **Performance**: Fast runtime (~80 ms to 120 ms).
- **Pros & Cons**: Excellent load distribution; guarantees conflict-free graph coloring by mathematical construction.

---

### Algorithm 4: Combined Hybrid Scheduler (`combined`)
- **Category**: Hybrid Meta-Heuristic (DSATUR Topological Ordering + Backtracking Assignment).
- **How It Works**:
  1. Uses **DSATUR graph coloring** to analyze the global conflict graph and compute the optimal topological difficulty sequence (`coloringOrder`).
  2. Uses **constrained backtracking allotment** with forward checking along that sorted order.
  3. Integrates section load balancing, teacher maximum daily hours, lunch break preservation, and branch-locking.
- **Performance**: High completion rate (100.0% on balanced datasets) with blazing sub-50ms execution speed.
- **Pros & Cons**: Combines the structural foresight of graph theory with the speed of greedy forward checking.

---

## 3. Real-World Constraints Implemented

### Hard Constraints (Never Violated - Enforced by Independent Validator)
- **H1: Teacher Clash**: No teacher scheduled in more than one session at the same \((day, period)\).
- **H2: Section Clash**: No student section scheduled in more than one session at the same \((day, period)\).
- **H3: Room Clash**: No room assigned to more than one session at the same \((day, period)\).
- **H4: Room Capacity**: Room capacity must be \(\ge\) section student count.
- **H5: Room Type Match**: Theory requires `Classroom`; Practical requires `Laboratory` (or specific `ElectricalLab`, `AIDSLab`, `MechanicalWorkshop`, etc.).
- **H6: Availability**: Teacher and room must be marked available in the \(D \times P\) boolean availability matrix.
- **H7: Session Completeness**: Every required session appears exactly once in either `assignments` or `unscheduled`.
- **H8: Multi-Period Continuity**: 2-hour labs or sports must occupy consecutive periods in the same room on the same day without interruption.
- **H9: Break Protection**: No session can start or overlap during lunch or configured break periods.
- **H10: Working Period Bounds**: Sessions only scheduled within configured daily teaching periods (e.g. Wednesday cutoff at Period 6 / 3:30 PM).
- **H11: Teacher Weekly Max**: Total teaching periods for a teacher cannot exceed `maxWeeklyPeriods`.

### Real-College Innovation Constraints
- **Designated Lecture Halls (Branch & Year Locking)**:
  - Every academic department has 6 designated halls:
    - 1st Year: `LH-{BRANCH}-101`
    - 2nd Year: `LH-{BRANCH}-201`
    - 3rd Year: `LH-{BRANCH}-301`
    - 4th Year: `LH-{BRANCH}-401`
    - M.Tech: `PG-{BRANCH}-101`
    - Ph.D: `SEM-{BRANCH}-PHD`
  - **Zero Cross-Rooming**: CSE students never attend lectures in ECE or ME classrooms.
- **Sub-Section Interleaving**:
  - Sub-sections of the same branch and year (e.g. `CSE-1st-CS1` and `CSE-1st-CS2`) share `LH-CSE-101`.
  - When CS1 is in the lab or sports ground, CS2 occupies `LH-CSE-101` for theory, maximizing facility utilization.
- **Shared Multidisciplinary Labs**:
  - While classrooms are strictly branch-locked, specialised labs (e.g. `AIDSLAB-1`, `SPORTS-1` to `SPORTS-4`) are shared across branches based on curriculum requirements.
- **Faculty Continuity**:
  - Teachers are permitted to conduct both theory lectures and lab sessions for the same batch on the same day.

---

## 4. Dual-Engine Architecture (C++17 + Serverless JavaScript)

### Why Two Engines?
1. **Native C++17 Engine (`engine/src/`)**:
   - Compiled with `-O2` using `g++`.
   - Uses `nlohmann/json` for zero-overhead JSON serialization.
   - Separate binary architecture: `scheduler` generates; independent `validator` verifies with an isolated \(O(n^2)\) engine to prevent shared-bug blind spots.
2. **Universal Serverless JS Engine (`server/services/jsEngine.js`)**:
   - Built to solve Vercel/AWS Lambda execution constraints where C++ binaries compiled on macOS/Windows cannot execute inside Linux serverless containers.
   - Pure JavaScript, zero external binary dependency, identical algorithm math and constraint enforcement.
   - `server/services/engineRunner.js` automatically detects binary availability: if native binaries exist, runs C++; otherwise seamlessly routes to JS engine with zero downtime.

---

## 5. Summary of What Was Implemented

1. **Algorithm Suite**:
   - Built Greedy, Backtracking, Graph Coloring (DSATUR), and Hybrid algorithms.
   - Built an independent validator that audits any generated timetable against all H1-H11 rules.
2. **Multi-Algorithm Comparison Lab**:
   - Created `/api/generate/compare` endpoint running all 4 solvers sequentially on the same dataset.
   - Reports execution runtime (ms), completion rate (%), search nodes explored, and soft metrics.
3. **Data Management & 7 University Presets**:
   - Built 7 rich university datasets (NIT Delhi Engineering, IIT Advanced Tech, Delhi University Multidisciplinary, AIIMS Medical Sciences, NLU National Law, NID Design & Architecture, IIM Business Analytics).
   - Built fast bulk seeder with `insertMany` (<300 ms seeding time).
   - Added 3 Clear Data options (Timetables only, Academic data only, Complete factory reset).
4. **Vercel Cloud Deployment & Cold-Start Resilience**:
   - Deployed at `https://smartschd-server.vercel.app`.
   - Configured middleware auto-connect to MongoDB Atlas on serverless cold starts.
   - Fixed health-check endpoint (`/api/health`) to report system operational status under serverless conditions.
5. **Full Test & Benchmark Suite**:
   - Verified 100% schedule completion (719/719 sessions scheduled, 0 unscheduled, 0 hard violations) across all 4 algorithms.

---

## 6. Sample Questions You Can Ask Claude About This Project

- *"Can you explain the mathematical difference between how DSATUR and Backtracking find conflict-free slots?"*
- *"Why is timetable generation NP-complete, and how does forward checking reduce the search space?"*
- *"How does sub-section interleaving work in SmartSched to double room utilization?"*
- *"Explain the C++ vs JavaScript dual-engine architecture and why it's optimal for Vercel serverless deployment."*
- *"Walk me through the H1 to H11 hard constraints and how the independent validator checks them."*
