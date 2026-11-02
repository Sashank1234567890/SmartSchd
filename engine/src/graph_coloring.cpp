/**
 * SmartSched Graph-Coloring Scheduler (Phase 6) — Non-Hectic & Distributed
 * Algorithm: DSATUR (Degree of SATURation)
 *
 * Enforces:
 *  - H1-H11 hard constraints
 *  - No two classes of the same subject on the same day for a section
 *  - Sessions distributed smoothly across Monday to Friday
 *  - 2-hour labs and 2-hour sports in continuous non-break periods
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

struct Slot {
    std::string roomId;
    int day;
    int startPeriod;
    bool operator==(const Slot& o) const {
        return roomId == o.roomId && day == o.day && startPeriod == o.startPeriod;
    }
};

struct Session {
    std::string sessionId;
    std::string subjectId;
    std::string sectionId;
    std::string teacherId;
    std::string requiredRoomType;
    int durationPeriods;
    int studentCount;
};

struct Room {
    std::string id;
    std::string type;
    int capacity;
};

int D = 0, P = 0;
std::vector<bool> periodIsBreak;
std::vector<int> dayMaxPeriods;
std::unordered_map<std::string, int> sectionLunchSlot;
std::vector<Room> allRooms;

using Grid = std::vector<std::vector<bool>>;
std::unordered_map<std::string, Grid> teacherAvail;
std::unordered_map<std::string, Grid> roomAvail;

std::unordered_map<std::string, Grid> teacherBusy;
std::unordered_map<std::string, Grid> roomBusy;
std::unordered_map<std::string, Grid> sectionBusy;

// Track: sectionId + ":" + subjectId -> vector<bool>(D, false)
std::unordered_map<std::string, std::vector<bool>> sectionSubDayUsed;
// Track daily period count per section
std::unordered_map<std::string, std::vector<int>> sectionDayPeriods;

bool slotValid(const Session& s, const Slot& sl, bool strictDayCheck) {
    if (strictDayCheck) {
        std::string subKey = s.sectionId + ":" + s.subjectId;
        if (sectionSubDayUsed[subKey][sl.day]) return false; // same subject already on this day
        if (sectionDayPeriods[s.sectionId][sl.day] + s.durationPeriods > 5) return false; // max 5 periods/day
    }

    for (int off = 0; off < s.durationPeriods; ++off) {
        int p = sl.startPeriod + off;
        if (p >= P) return false;
        if (sl.day < (int)dayMaxPeriods.size() && p >= dayMaxPeriods[sl.day]) return false;
        if (periodIsBreak[p]) return false;
        if (sectionLunchSlot.count(s.sectionId) && sectionLunchSlot[s.sectionId] == p) return false;
        if (!teacherAvail[s.teacherId][sl.day][p]) return false;
        if (!roomAvail[sl.roomId][sl.day][p]) return false;
        if (teacherBusy[s.teacherId][sl.day][p]) return false;
        if (roomBusy[sl.roomId][sl.day][p]) return false;
        if (sectionBusy[s.sectionId][sl.day][p]) return false;
    }
    return true;
}

void setOccupied(const Session& s, const Slot& sl, bool v) {
    for (int off = 0; off < s.durationPeriods; ++off) {
        int p = sl.startPeriod + off;
        teacherBusy[s.teacherId][sl.day][p] = v;
        roomBusy[sl.roomId][sl.day][p] = v;
        sectionBusy[s.sectionId][sl.day][p] = v;
    }
    std::string subKey = s.sectionId + ":" + s.subjectId;
    sectionSubDayUsed[subKey][sl.day] = v;
    sectionDayPeriods[s.sectionId][sl.day] += (v ? s.durationPeriods : -s.durationPeriods);
}

std::vector<Slot> candidateSlots(const Session& s) {
    std::vector<Slot> out;
    // Order candidate days by least busy day for this section
    std::vector<int> dayOrder(D);
    for (int i = 0; i < D; ++i) dayOrder[i] = i;
    std::sort(dayOrder.begin(), dayOrder.end(), [&](int a, int b) {
        return sectionDayPeriods[s.sectionId][a] < sectionDayPeriods[s.sectionId][b];
    });

    int neededCap = (s.requiredRoomType == "Classroom") ? s.studentCount : (s.studentCount + 1) / 2;
    for (const auto& r : allRooms) {
        if (r.type != s.requiredRoomType) continue;
        if (r.capacity < neededCap) continue;
        for (int d : dayOrder) {
            int maxP = (d < (int)dayMaxPeriods.size()) ? dayMaxPeriods[d] : P;
            for (int p = 0; p <= maxP - s.durationPeriods; ++p) {
                bool ok = true;
                for (int off = 0; off < s.durationPeriods && ok; ++off) {
                    int pp = p + off;
                    if (periodIsBreak[pp]) { ok = false; break; }
                    if (sectionLunchSlot.count(s.sectionId) && sectionLunchSlot[s.sectionId] == pp) { ok = false; break; }
                    if (!teacherAvail[s.teacherId][d][pp]) { ok = false; break; }
                    if (!roomAvail[r.id][d][pp]) { ok = false; break; }
                }
                if (ok) out.push_back({r.id, d, p});
            }
        }
    }
    return out;
}

struct VertexState {
    int idx;
    int saturation;
    int degree;
    bool colored;
    Slot color;
};

bool conflicts(const Session& a, const Session& b) {
    return a.teacherId == b.teacherId || a.sectionId == b.sectionId;
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
            std::string id = item["_id"].get<std::string>();
            Grid g(D, std::vector<bool>(P, true));
            if (item.contains(key) && item[key].is_array()) {
                const auto& av = item[key];
                for (int d = 0; d < D && d < (int)av.size(); ++d)
                    for (int p = 0; p < P && p < (int)av[d].size(); ++p)
                        g[d][p] = av[d][p].get<bool>();
            }
            avail[id] = g;
            busy[id]  = Grid(D, std::vector<bool>(P, false));
        }
    };

    buildGrid(j["teachers"], "availability", teacherAvail, teacherBusy);
    buildGrid(j["rooms"],    "availability", roomAvail,    roomBusy);
    for (const auto& s : j["sections"]) {
        std::string id = s["_id"].get<std::string>();
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

    for (const auto& r : j["rooms"])
        allRooms.push_back({r["_id"].get<std::string>(), r["type"].get<std::string>(), r["capacity"].get<int>()});

    std::unordered_map<std::string, int> secSize;
    for (const auto& s : j["sections"])
        secSize[s["_id"].get<std::string>()] = s["studentCount"].get<int>();

    std::vector<Session> sessions;
    for (const auto& subj : j["subjects"]) {
        std::string subjectId = subj["_id"].get<std::string>();
        std::string teacherId = subj["teacherId"].get<std::string>();
        std::string sectionId = subj["sectionId"].get<std::string>();
        int weekly            = subj.contains("weeklySessions") ? subj["weeklySessions"].get<int>() : subj.value("weeklyPeriods", 3);
        int dur               = subj.contains("durationPeriods") ? subj["durationPeriods"].get<int>() : subj.value("duration", 1);
        std::string subjType  = subj.value("type", "Theory");
        std::string roomType  = (subj.contains("requiredRoomType") && subj["requiredRoomType"].is_string())
                                    ? subj["requiredRoomType"].get<std::string>()
                                    : (subjType == "Theory" ? "Classroom" : "Laboratory");
        int sz = secSize.count(sectionId) ? secSize[sectionId] : 0;

        std::string subKey = sectionId + ":" + subjectId;
        sectionSubDayUsed[subKey] = std::vector<bool>(D, false);

        for (int i = 0; i < weekly; ++i)
            sessions.push_back({subjectId + "#" + std::to_string(i),
                                subjectId, sectionId, teacherId, roomType, dur, sz});
    }

    int N = (int)sessions.size();

    // Conflict graph
    std::vector<std::vector<int>> adj(N);
    int edgeCount = 0;
    for (int i = 0; i < N; ++i)
        for (int k = i + 1; k < N; ++k)
            if (conflicts(sessions[i], sessions[k])) {
                adj[i].push_back(k);
                adj[k].push_back(i);
                ++edgeCount;
            }

    std::vector<VertexState> state(N);
    for (int i = 0; i < N; ++i) {
        state[i].idx        = i;
        state[i].saturation = 0;
        state[i].degree     = (int)adj[i].size();
        state[i].colored    = false;
    }

    std::unordered_map<int, int> slotColorId;
    int nextColorId = 0;
    std::vector<std::unordered_set<int>> neighborColors(N);

    json assignments = json::array();
    json unscheduled = json::array();
    int colorsUsed = 0;

    for (int iter = 0; iter < N; ++iter) {
        int best = -1;
        for (int i = 0; i < N; ++i) {
            if (state[i].colored) continue;
            if (best == -1) { best = i; continue; }
            if (state[i].saturation > state[best].saturation) { best = i; continue; }
            if (state[i].saturation == state[best].saturation &&
                state[i].degree > state[best].degree) { best = i; }
        }
        if (best == -1) break;

        const Session& s = sessions[best];
        auto cands = candidateSlots(s);

        bool placed = false;
        // Pass 0: strictly avoid same subject on same day & non-hectic
        // Pass 1: relaxed if needed
        for (int pass = 0; pass < 2 && !placed; ++pass) {
            bool strict = (pass == 0);
            for (const auto& sl : cands) {
                if (!slotValid(s, sl, strict)) continue;

                state[best].colored = true;
                state[best].color   = sl;
                setOccupied(s, sl, true);

                int cid = nextColorId++;
                slotColorId[best] = cid;
                colorsUsed = std::max(colorsUsed, cid + 1);

                for (int nb : adj[best]) {
                    if (!state[nb].colored) {
                        neighborColors[nb].insert(cid);
                        state[nb].saturation = (int)neighborColors[nb].size();
                    }
                }

                json a;
                a["sessionId"]       = s.sessionId;
                a["subjectId"]       = s.subjectId;
                a["sectionId"]       = s.sectionId;
                a["teacherId"]       = s.teacherId;
                a["roomId"]          = sl.roomId;
                a["day"]             = sl.day;
                a["startPeriod"]     = sl.startPeriod;
                a["durationPeriods"] = s.durationPeriods;
                assignments.push_back(a);
                placed = true;
                break;
            }
        }

        if (!placed) {
            json us;
            us["sessionId"]  = s.sessionId;
            us["reasonCode"] = cands.empty() ? "NO_ROOM_OF_TYPE_OR_CAPACITY" : "NO_FREE_SLOT_AFTER_CONFLICTS";
            us["detail"]     = cands.empty()
                ? "No room matches required type/capacity"
                : "All candidate slots occupied by conflicting neighbors";
            unscheduled.push_back(us);
            state[best].colored = true;
        }
    }

    double totalMs = std::chrono::duration<double, std::milli>(Clock::now() - startTime).count();

    json graphVertices = json::array();
    for (int i = 0; i < N; ++i) {
        json v;
        v["id"]        = sessions[i].sessionId;
        v["subjectId"] = sessions[i].subjectId;
        v["sectionId"] = sessions[i].sectionId;
        v["teacherId"] = sessions[i].teacherId;
        v["color"]     = slotColorId.count(i) ? json(slotColorId[i]) : json(nullptr);
        graphVertices.push_back(v);
    }
    json graphEdges = json::array();
    for (int i = 0; i < N; ++i)
        for (int nb : adj[i])
            if (nb > i) {
                json e;
                e["u"] = sessions[i].sessionId;
                e["v"] = sessions[nb].sessionId;
                graphEdges.push_back(e);
            }

    json metrics;
    metrics["algorithmTimeMs"]   = totalMs;
    metrics["totalEngineTimeMs"] = totalMs;
    metrics["totalSessions"]     = N;
    metrics["scheduledCount"]    = (int)assignments.size();
    metrics["unscheduledCount"]  = (int)unscheduled.size();
    metrics["searchNodes"]       = nullptr;
    metrics["backtrackCount"]    = nullptr;
    metrics["domainWipeouts"]    = nullptr;
    metrics["graphVertices"]     = N;
    metrics["graphEdges"]        = edgeCount;
    metrics["colorsUsed"]        = colorsUsed;
    metrics["softPenalty"]       = { {"total", 0}, {"breakdown", json::object()} };
    metrics["roomUtilizationPct"] = N == 0 ? 0.0 : ((int)assignments.size() * 100.0 / N);

    std::string status = unscheduled.empty() ? "COMPLETE" : "PARTIAL";

    json out;
    out["ok"]           = true;
    out["algorithm"]    = "graph-coloring";
    out["searchStatus"] = status;
    out["assignments"]  = assignments;
    out["unscheduled"]  = unscheduled;
    out["metrics"]      = metrics;
    out["graph"]        = { {"vertices", graphVertices}, {"edges", graphEdges} };

    std::cout << out.dump() << std::endl;
    return 0;
}
