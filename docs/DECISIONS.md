# Architectural Decisions & Deviations Log

## Decision 1: C++ Single-Header JSON Library Vendor
- **Date:** 2026-11-01
- **Context:** The C++ engine requires robust JSON parsing on standard input and JSON generation on standard output per PART B Section 4 ("third_party/json.hpp: vendor the single-header nlohmann/json; do not hand-roll a JSON parser").
- **Decision:** Vendored official `nlohmann/json.hpp` (v3.11.3) directly into `engine/third_party/json.hpp` via `scripts/fetch-json-hpp.js`.
- **Status:** Verified.

## Decision 2: MongoDB Dual-Mode Support (Atlas & Local Daemon)
- **Date:** 2026-11-01
- **Context:** Testing against remote MongoDB Atlas cluster returned an authentication error (`bad auth : authentication failed`). Local system has `mongod` v7.0.32 installed via Homebrew.
- **Decision:** Started a local `mongod` instance storing data in `data/db/` (gitignored), set `.env` default to `mongodb://127.0.0.1:27017/smartsched`, while fully supporting MongoDB Atlas if valid credentials and network access lists are configured.
- **Status:** Verified with real MongoDB connection.

## Decision 3: Cross-Platform Process Spawning
- **Date:** 2026-11-01
- **Context:** Must work seamlessly across macOS, Linux, and Windows without relying on `make` or platform-specific shells.
- **Decision:** Implemented `scripts/build-engine.js` using Node's `child_process.spawnSync` invoking `g++` directly with executable extension detection (`.exe` on Windows). Implemented `server/services/engineRunner.js` using `child_process.spawn` with `shell: false`, buffer caps (50 MB), and hard timeouts.
- **Status:** Verified.
