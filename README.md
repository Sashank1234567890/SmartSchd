# SmartSched

**College Timetable Generator & Algorithm Comparison System**  
*DAA Semester Project &bull; National Institute of Technology Delhi &bull; Course CSBB 202*

SmartSched is an academic scheduling and algorithmic benchmarking system designed to solve the college course timetable problem. It couples a native C++17 optimization and constraint-satisfaction engine with a Node.js/Express backend, MongoDB persistence, and a React frontend.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       React 18 + Vite Frontend        |
                      |  (Tailwind v3, React Router, Recharts)|
                      +-------------------+-------------------+
                                          | HTTP /api proxy
                                          v
                      +---------------------------------------+
                      |       Node.js + Express Server        |
                      |         (MongoDB / Mongoose)          |
                      +-------------------+-------------------+
                                          | child_process.spawn
                                          | (stdin/stdout JSON, no shell)
                                          v
                      +---------------------------------------+
                      |              C++17 Engine             |
                      |  +----------------+ +---------------+ |
                      |  |   scheduler    | |   validator   | |
                      |  | (Greedy, MRV,  | | (Independent  | |
                      |  | Graph Color)   | |  H1-H11 audit)| |
                      |  +----------------+ +---------------+ |
                      +---------------------------------------+
```

---

## Prerequisites

1. **Node.js**: v18+ (verified on v24.12.0)
2. **npm**: v9+ (verified on 11.6.2) — *npm only; do not use pnpm, yarn, or bun*
3. **C++ Compiler**: `g++` or `clang++` with `-std=c++17` support
4. **MongoDB**: Local MongoDB instance (`mongod`) or MongoDB Atlas cluster

---

## Setup & Installation

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your settings:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/smartsched
PORT=3001
ENGINE_TIMEOUT_MS=30000
```

> **MongoDB Atlas Notes:**
> If using MongoDB Atlas:
> 1. Ensure your IP address (or `0.0.0.0/0`) is added to the Atlas Network Access IP Access List.
> 2. Ensure Database User credentials are correct (URL-encode special characters like `@` as `%40`).
> 3. Ensure the database name in the connection string is `smartsched`.

### 2. Install Dependencies
```bash
npm install
npm --prefix client install
```

### 3. Build C++ Engine Binaries
Compiles `engine/bin/scheduler` and `engine/bin/validator` with `-std=c++17 -O2`:
```bash
npm run build:engine
```

### 4. Build Complete Application
Builds the engine binaries and the React frontend:
```bash
npm run build
```

---

## Running the Application

### Development Mode (Concurrent Server & Client)
```bash
npm run dev
```
- Client runs on `http://localhost:5173` (proxies `/api` requests to Express on port 3001)
- Backend runs on `http://localhost:3001`

### Production Mode
```bash
npm start
```
Express runs on `http://localhost:3001` and serves both the API and the pre-built React frontend.

---

## Testing & Verification

- **Engine Tests (C++ Contract & Round Trip):**
  ```bash
  npm run test:engine
  ```
- **Server Tests (MongoDB & Subsystems):**
  ```bash
  npm run test:server
  ```
- **Algorithm Benchmark Suite (Whole-College Comparison):**
  ```bash
  npm run benchmark
  ```
- **Health Check Endpoint:**
  ```bash
  curl http://localhost:3001/api/health
  ```

---

## Algorithms Implemented

1. **Greedy Heuristic (`engine/bin/scheduler`)**:
   - Best-fit slot allocation with lookahead.
   - Schedules entire university (~301 sessions) in ~18 ms with 100% completion.
2. **Backtracking with MRV + Forward Checking (`engine/bin/backtracking`)**:
   - Minimum Remaining Values (MRV) dynamic variable ordering.
   - Forward checking domain filtering with non-hectic same-subject-same-day guards.
   - Solves whole-college schedule in ~3.6 s with 100% completion.
3. **Graph Coloring via DSATUR (`engine/bin/graph-coloring`)**:
   - Dynamic degree-of-saturation heuristic on the conflict adjacency graph.
   - Colors highest-saturation nodes first in ~27 ms with 100% completion.
4. **Independent Validator (`engine/bin/validator`)**:
   - Independent verification binary evaluating all H1–H11 hard constraints.

---

## Known Assumptions & Limitations
- **One Teacher per Session:** Multi-teacher sessions and co-teaching are out of scope.
- **Section Ownership:** Each Subject belongs strictly to one section; combined classes and cross-section electives are out of scope.
- **Heuristics:** Heuristic algorithms (Greedy, DSATUR) provide near-optimal schedules quickly, while Backtracking guarantees complete exploration subject to time/node bounds.
