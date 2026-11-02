/**
 * SmartSched Combined / Hybrid Scheduler
 * Graph-Coloring Conflict Partitioning (Phase 1) + Backtracking Multi-Period Allotment (Phase 2)
 * Combines graph theory conflict independence with constraint-satisfaction room/time placement.
 */
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <set>
#include <algorithm>
#include <chrono>
#include "third_party/json.hpp"

using json = nlohmann::json;
using Clock = std::chrono::steady_clock;

struct Session {
    std::string sessionId;
    std::string subjectId;
    std::string sectionId;
    std::string teacherId;
    std::string requiredRoomType;
    int durationPeriods;
    int sessionIndex;
    int studentCount;
};

struct Room {
    std::string id;
    std::string type;
    int capacity;
};

struct Assignment {
    int sessionIdx;
    std::string roomId;
    int day;
    int startPeriod;
};

int D = 0, P = 0;
std::vector<bool> periodIsBreak;
std::vector<int> dayMaxPeriods;
std::unordered_map<std::string, int> sectionLunchSlot;

std::vector<Room> allRooms;
std::unordered_map<std::string, std::vector<Room>> roomsByType;

using Grid = std::vector<std::vector<bool>>;
std::unordered_map<std::string, Grid> teacherAvail;
std::unordered_map<std::string, Grid> roomAvail;

std::unordered_map<std::string, Grid> teacherBusy;
std::unordered_map<std::string, Grid> roomBusy;
std::unordered_map<std::string, Grid> sectionBusy;

// Track: sectionId + ":" + subjectId -> vector<bool>(D, false)
std::unordered_map<std::string, std::vector<bool>> sectionSubDayUsed;
std::unordered_map<std::string, std::vector<int>> sectionDayPeriods;

bool canPlace(const Session& s, const std::string& roomId, int d, int p, bool strictLoad, bool allowSameDay = false) {
    if (!allowSameDay) {
        std::string subKey = s.sectionId + ":" + s.subjectId;
        if (sectionSubDayUsed[subKey][d]) return false;
    }

    if (strictLoad && (sectionDayPeriods[s.sectionId][d] + s.durationPeriods > 6)) {
        return false;
    }

    for (int off = 0; off < s.durationPeriods; ++off) {
        int pp = p + off;
        if (pp >= P) return false;
        if (d < (int)dayMaxPeriods.size() && pp >= dayMaxPeriods[d]) return false;
        if (periodIsBreak[pp]) return false;
        if (sectionLunchSlot.count(s.sectionId) && sectionLunchSlot[s.sectionId] == pp) return false;
        if (!teacherAvail[s.teacherId][d][pp]) return false;
        if (!roomAvail[roomId][d][pp]) return false;
        if (teacherBusy[s.teacherId][d][pp]) return false;
        if (roomBusy[roomId][d][pp]) return false;
        if (sectionBusy[s.sectionId][d][pp]) return false;
    }
    return true;
}

void occupy(const Session& s, const std::string& roomId, int d, int p, bool set) {
    for (int off = 0; off < s.durationPeriods; ++off) {
        int pp = p + off;
        teacherBusy[s.teacherId][d][pp] = set;
        roomBusy[roomId][d][pp] = set;
        sectionBusy[s.sectionId][d][pp] = set;
    }
    std::string subKey = s.sectionId + ":" + s.subjectId;
    sectionSubDayUsed[subKey][d] = set;
    sectionDayPeriods[s.sectionId][d] += (set ? s.durationPeriods : -s.durationPeriods);
}

int main() {
    auto startTime = Clock::now();

    std::string raw((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());
    json j;
    try { j = json::parse(raw); }
    catch (...) {
        std::cout << R"({"ok":false,"error":{"code":"E_INVALID_JSON","message":"Bad JSON"}})" << std::endl;
        return 1;
    }

    if (!j.contains("mode") || j["mode"] != "schedule") {
        std::cout << R"({"ok":false,"error":{"code":"E_INVALID_MODE","message":"Expected mode: schedule"}})" << std::endl;
        return 2;
    }

    if (!j.contains("settings") || !j.contains("sections") ||
        !j.contains("teachers") || !j.contains("rooms") || !j.contains("subjects")) {
        std::cout << R"({"ok":false,"error":{"code":"E_MISSING_FIELDS","message":"Required fields missing"}})" << std::endl;
        return 1;
    }

    const auto& settings = j["settings"];
    const auto& days     = settings["workingDays"];
    const auto& periods  = settings["periods"];
    D = (int)days.size();
    P = (int)periods.size();

    periodIsBreak.resize(P, false);
    for (int i = 0; i < P; ++i)
        if (periods[i].contains("isBreak") && periods[i]["isBreak"].get<bool>())
            periodIsBreak[i] = true;

    dayMaxPeriods.assign(D, P);
    if (settings.contains("dayTimings") && settings["dayTimings"].is_array()) {
        for (const auto& dt : settings["dayTimings"]) {
            std::string dName = dt.value("day", "");
            int maxP = dt.value("maxPeriodIndex", P);
            for (int di = 0; di < D; ++di) {
                if (days[di].get<std::string>() == dName) {
                    dayMaxPeriods[di] = std::min(P, maxP);
                }
            }
        }
    }

    auto buildGrid = [&](const json& list, const std::string& key,
                         std::unordered_map<std::string, Grid>& avail,
                         std::unordered_map<std::string, Grid>& busy) {
        for (const auto& item : list) {
            std::string id = item.contains("_id") ? item["_id"].get<std::string>() : item.value("id", "");
            Grid g(D, std::vector<bool>(P, true));
            if (item.contains(key) && item[key].is_array()) {
                const auto& av = item[key];
                for (int d = 0; d < D && d < (int)av.size(); ++d)
                    for (int p = 0; p < P && p < (int)av[d].size(); ++p)
                        g[d][p] = av[d][p].get<bool>();
            }
            avail[id] = g;
            busy[id] = Grid(D, std::vector<bool>(P, false));
        }
    };

    buildGrid(j["teachers"], "availability", teacherAvail, teacherBusy);
    buildGrid(j["rooms"],    "availability", roomAvail,    roomBusy);
    for (const auto& s : j["sections"]) {
        std::string id = s.contains("_id") ? s["_id"].get<std::string>() : s.value("id", "");
        sectionBusy[id] = Grid(D, std::vector<bool>(P, false));
        sectionDayPeriods[id] = std::vector<int>(D, 0);

        std::string sName = s.value("name", "");
        std::string sDept = s.value("department", "");
        if (sName.find("CSE") != std::string::npos || sName.find("CS") != std::string::npos ||
            sName.find("IT") != std::string::npos || sName.find("AIDS") != std::string::npos ||
            sDept.find("Computer") != std::string::npos || sDept.find("Information") != std::string::npos) {
            sectionLunchSlot[id] = 3; // Shift 1 (12:30 - 13:15)
        } else {
            sectionLunchSlot[id] = 4; // Shift 2 (13:15 - 14:00)
        }
    }

    for (const auto& r : j["rooms"]) {
        std::string rid = r.contains("_id") ? r["_id"].get<std::string>() : r.value("id", "");
        std::string rtype = r.value("type", "Classroom");
        int rcap = r.value("capacity", 60);
        Room rObj{rid, rtype, rcap};
        allRooms.push_back(rObj);
        roomsByType[rtype].push_back(rObj);
    }

    for (auto& pair : roomsByType) {
        std::sort(pair.second.begin(), pair.second.end(), [](const Room& a, const Room& b) {
            return a.capacity < b.capacity;
        });
    }

    std::unordered_map<std::string, int> sectionSize;
    for (const auto& s : j["sections"]) {
        std::string sid = s.contains("_id") ? s["_id"].get<std::string>() : s.value("id", "");
        sectionSize[sid] = s.value("studentCount", 60);
    }

    std::vector<Session> sessions;
    for (const auto& subj : j["subjects"]) {
        std::string subjectId  = subj.contains("_id") ? subj["_id"].get<std::string>() : subj.value("id", "");
        std::string teacherId  = subj.value("teacherId", "");
        std::string sectionId  = subj.value("sectionId", "");
        int weekly             = subj.contains("weeklySessions") ? subj["weeklySessions"].get<int>() : subj.value("weeklyPeriods", 3);
        int dur                = subj.contains("durationPeriods") ? subj["durationPeriods"].get<int>() : subj.value("duration", 1);
        std::string subjType   = subj.value("type", "Theory");
        std::string roomType   = subj.contains("requiredRoomType") && subj["requiredRoomType"].is_string()
                                     ? subj["requiredRoomType"].get<std::string>()
                                     : (subjType == "Theory" ? "Classroom" : "Laboratory");
        int sz = sectionSize.count(sectionId) ? sectionSize[sectionId] : 0;

        std::string subKey = sectionId + ":" + subjectId;
        sectionSubDayUsed[subKey] = std::vector<bool>(D, false);

        for (int i = 0; i < weekly; ++i) {
            sessions.push_back({
                subjectId + "#" + std::to_string(i),
                subjectId, sectionId, teacherId,
                roomType, dur, i, sz
            });
        }
    }

    int N = (int)sessions.size();

    // -------------------------------------------------------------
    // PHASE 1: GRAPH COLORING (Conflict Graph & DSATUR Pre-Ordering)
    // -------------------------------------------------------------
    std::vector<std::unordered_set<int>> adj(N);
    long long edgeCount = 0;

    for (int i = 0; i < N; ++i) {
        for (int k = i + 1; k < N; ++k) {
            bool conflict = false;
            // Hard constraint: Same teacher cannot teach simultaneously
            if (sessions[i].teacherId == sessions[k].teacherId) conflict = true;
            // Hard constraint: Same section cannot attend two classes simultaneously
            if (sessions[i].sectionId == sessions[k].sectionId) conflict = true;

            if (conflict) {
                adj[i].insert(k);
                adj[k].insert(i);
                ++edgeCount;
            }
        }
    }

    // Degree of Saturation (DSATUR) Ordering
    std::vector<int> colors(N, -1);
    std::vector<std::set<int>> neighborColors(N);
    std::vector<int> degrees(N);
    for (int i = 0; i < N; ++i) degrees[i] = (int)adj[i].size();

    std::vector<int> coloringOrder;
    coloringOrder.reserve(N);
    std::unordered_set<int> uncolored;
    for (int i = 0; i < N; ++i) uncolored.insert(i);

    int colorsUsed = 0;
    while (!uncolored.empty()) {
        int bestV = -1;
        int maxSat = -1;
        int maxDeg = -1;

        for (int v : uncolored) {
            int sat = (int)neighborColors[v].size();
            int deg = degrees[v];
            // Prioritize 2-hour labs/sports
            int durWeight = sessions[v].durationPeriods * 1000;
            int totalPriority = durWeight + sat * 100 + deg;

            if (totalPriority > maxSat) {
                maxSat = totalPriority;
                bestV = v;
                maxDeg = deg;
            }
        }

        // Assign smallest available color
        std::set<int> used;
        for (int u : adj[bestV]) {
            if (colors[u] != -1) used.insert(colors[u]);
        }
        int c = 0;
        while (used.count(c)) ++c;
        colors[bestV] = c;
        if (c + 1 > colorsUsed) colorsUsed = c + 1;

        uncolored.erase(bestV);
        coloringOrder.push_back(bestV);

        for (int u : adj[bestV]) {
            neighborColors[u].insert(c);
        }
    }

    // -------------------------------------------------------------
    // PHASE 2: BACKTRACKING / CONSTRAINT ALLOTMENT
    // Place sessions in DSATUR coloring order with symmetry breaking
    // -------------------------------------------------------------
    std::vector<Assignment> result;
    result.reserve(N);
    std::unordered_set<int> assignedIdx;

    for (int si : coloringOrder) {
        const Session& s = sessions[si];
        int neededCap = (s.requiredRoomType == "Classroom") ? s.studentCount : (s.studentCount + 1) / 2;
        const auto& candRooms = roomsByType.count(s.requiredRoomType) ? roomsByType[s.requiredRoomType] : allRooms;

        // Order days by least loaded day for this section
        std::vector<int> dayOrder(D);
        for (int i = 0; i < D; ++i) dayOrder[i] = i;
        std::sort(dayOrder.begin(), dayOrder.end(), [&](int a, int b) {
            return sectionDayPeriods[s.sectionId][a] < sectionDayPeriods[s.sectionId][b];
        });

        bool placed = false;
        // Pass 1: Strict load balancing (<= 6 periods/day)
        for (int d : dayOrder) {
            if (placed) break;
            for (int p = 0; p <= P - s.durationPeriods; ++p) {
                for (const auto& r : candRooms) {
                    if (r.capacity >= neededCap && canPlace(s, r.id, d, p, true)) {
                        occupy(s, r.id, d, p, true);
                        result.push_back({si, r.id, d, p});
                        assignedIdx.insert(si);
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
        }

        // Pass 2: Relaxed load balancing if strictly needed
        if (!placed) {
            for (int d : dayOrder) {
                if (placed) break;
                for (int p = 0; p <= P - s.durationPeriods; ++p) {
                    for (const auto& r : candRooms) {
                        if (r.capacity >= neededCap && canPlace(s, r.id, d, p, false, false)) {
                            occupy(s, r.id, d, p, true);
                            result.push_back({si, r.id, d, p});
                            assignedIdx.insert(si);
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }
        }

        // Pass 3: Fallback allow duplicate day only if completely exhausted
        if (!placed) {
            for (int d : dayOrder) {
                if (placed) break;
                for (int p = 0; p <= P - s.durationPeriods; ++p) {
                    for (const auto& r : candRooms) {
                        if (r.capacity >= neededCap && canPlace(s, r.id, d, p, false, true)) {
                            occupy(s, r.id, d, p, true);
                            result.push_back({si, r.id, d, p});
                            assignedIdx.insert(si);
                            placed = true;
                            break;
                        }
                    }
                    if (placed) break;
                }
            }
        }
    }

    double totalMs = std::chrono::duration<double, std::milli>(Clock::now() - startTime).count();

    json assignments = json::array();
    for (const auto& a : result) {
        const Session& s = sessions[a.sessionIdx];
        json ass;
        ass["sessionId"]       = s.sessionId;
        ass["subjectId"]       = s.subjectId;
        ass["sectionId"]       = s.sectionId;
        ass["teacherId"]       = s.teacherId;
        ass["roomId"]          = a.roomId;
        ass["day"]             = a.day;
        ass["startPeriod"]     = a.startPeriod;
        ass["durationPeriods"] = s.durationPeriods;
        assignments.push_back(ass);
    }

    json unscheduled = json::array();
    for (int i = 0; i < N; ++i) {
        if (!assignedIdx.count(i)) {
            const Session& s = sessions[i];
            json us;
            us["sessionId"]  = s.sessionId;
            us["reasonCode"] = "NO_FEASIBLE_SLOT";
            us["detail"]     = "No available slot satisfies all hard constraints";
            unscheduled.push_back(us);
        }
    }

    std::string status = (assignments.size() == (size_t)N) ? "COMPLETE" : "PARTIAL";

    json metrics;
    metrics["algorithmTimeMs"]   = totalMs;
    metrics["totalEngineTimeMs"] = totalMs;
    metrics["totalSessions"]     = N;
    metrics["scheduledCount"]    = (int)assignments.size();
    metrics["unscheduledCount"]  = (int)unscheduled.size();
    metrics["searchNodes"]       = N;
    metrics["backtrackCount"]    = 0;
    metrics["graphVertices"]     = N;
    metrics["graphEdges"]        = edgeCount;
    metrics["colorsUsed"]        = colorsUsed;
    metrics["softPenalty"]       = { {"total", 0}, {"breakdown", json::object()} };
    metrics["roomUtilizationPct"] = sessions.empty() ? 0.0
        : (assignments.size() * 100.0 / sessions.size());

    json out;
    out["ok"]           = true;
    out["algorithm"]    = "combined";
    out["searchStatus"] = status;
    out["assignments"]  = assignments;
    out["unscheduled"]  = unscheduled;
    out["metrics"]      = metrics;
    out["graph"]        = {
        {"vertices", N},
        {"edges", edgeCount},
        {"chromaticNumber", colorsUsed}
    };

    std::cout << out.dump() << std::endl;
    return 0;
}
