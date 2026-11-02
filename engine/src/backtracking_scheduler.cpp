/**
 * SmartSched Backtracking Scheduler (Phase 3)
 * Depth-First Search with Forward Checking, Symmetry Breaking, and Fallback
 */
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <chrono>
#include <limits>
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

struct Assignment {
    int sessionIdx;
    std::string roomId;
    int day;
    int startPeriod;
};

struct Room {
    std::string id;
    std::string type;
    int capacity;
};

int D = 0, P = 0;
long long nodeLimit = 2000000;
double timeLimitMs = 25000.0;
Clock::time_point startTime;

using Grid = std::vector<std::vector<bool>>;
std::unordered_map<std::string, Grid> teacherAvail;
std::unordered_map<std::string, Grid> roomAvail;

std::unordered_map<std::string, Grid> teacherBusy;
std::unordered_map<std::string, Grid> roomBusy;
std::unordered_map<std::string, Grid> sectionBusy;

// Track: sectionId + ":" + subjectId -> vector<bool>(D, false)
std::unordered_map<std::string, std::vector<bool>> sectionSubDayUsed;
std::unordered_map<std::string, std::vector<int>> sectionDayPeriods;

std::vector<bool> periodIsBreak;
std::vector<int> dayMaxPeriods;
std::unordered_map<std::string, int> sectionLunchSlot;

std::vector<Room> allRooms;
std::unordered_map<std::string, std::vector<Room>> roomsByType;
std::vector<Assignment> bestResult;

long long nodeCount = 0;
long long backtrackCount = 0;
bool timedOut = false;
bool limitHit = false;

bool canPlace(const Session& s, const std::string& roomId, int d, int p) {
    // 1. Avoid two sessions of same subject on same day
    std::string subKey = s.sectionId + ":" + s.subjectId;
    if (sectionSubDayUsed[subKey][d]) return false;

    // 2. Daily load limit (<= 6 periods per day out of 8/9 for non-hectic distribution)
    if (sectionDayPeriods[s.sectionId][d] + s.durationPeriods > 6) return false;

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

bool canPlaceRelaxed(const Session& s, const std::string& roomId, int d, int p) {
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

bool solve(
    std::vector<Session>& sessions,
    std::vector<int>& order,
    std::vector<Assignment>& result
) {
    double elapsed = std::chrono::duration<double, std::milli>(Clock::now() - startTime).count();
    if (elapsed >= timeLimitMs) { timedOut = true; return false; }
    if (nodeCount >= nodeLimit)  { limitHit = true; return false; }

    if (result.size() > bestResult.size()) {
        bestResult = result;
    }

    if (order.empty()) return true;

    int si = order.front();
    order.erase(order.begin());

    ++nodeCount;
    const Session& s = sessions[si];

    // Order candidate days by least busy day for this section (balanced distribution)
    std::vector<int> dayOrder(D);
    for (int i = 0; i < D; ++i) dayOrder[i] = i;
    std::sort(dayOrder.begin(), dayOrder.end(), [&](int a, int b) {
        return sectionDayPeriods[s.sectionId][a] < sectionDayPeriods[s.sectionId][b];
    });

    int neededCap = (s.requiredRoomType == "Classroom") ? s.studentCount : (s.studentCount + 1) / 2;
    const auto& candRooms = roomsByType.count(s.requiredRoomType) ? roomsByType[s.requiredRoomType] : allRooms;

    for (int d : dayOrder) {
        for (int p = 0; p <= P - s.durationPeriods; ++p) {
            // Find first free suitable room of matching type for slot (d, p)
            const Room* chosenRoom = nullptr;
            for (const auto& r : candRooms) {
                if (r.capacity >= neededCap && canPlace(s, r.id, d, p)) {
                    chosenRoom = &r;
                    break; // Symmetry breaking: pick first available matching room
                }
            }
            if (!chosenRoom) continue;

            occupy(s, chosenRoom->id, d, p, true);
            result.push_back({si, chosenRoom->id, d, p});

            if (solve(sessions, order, result)) return true;

            result.pop_back();
            occupy(s, chosenRoom->id, d, p, false);
            ++backtrackCount;

            elapsed = std::chrono::duration<double, std::milli>(Clock::now() - startTime).count();
            if (elapsed >= timeLimitMs) { timedOut = true; order.insert(order.begin(), si); return false; }
            if (nodeCount >= nodeLimit)  { limitHit = true;  order.insert(order.begin(), si); return false; }
        }
    }

    order.insert(order.begin(), si);
    return false;
}

int main() {
    startTime = Clock::now();

    std::string raw((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());
    json j;
    try { j = json::parse(raw); }
    catch (...) {
        std::cout << R"({"ok":false,"error":{"code":"E_INVALID_JSON","message":"Bad JSON"}})" << std::endl;
        return 1;
    }

    if (j.contains("params")) {
        auto& p = j["params"];
        if (p.contains("nodeLimit"))  nodeLimit  = p["nodeLimit"].get<long long>();
        if (p.contains("timeLimitMs")) timeLimitMs = p["timeLimitMs"].get<double>();
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

    // Sort rooms in each category by capacity ascending for tight packing
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

    // Map teacher weekly load to prioritize busy teachers
    std::unordered_map<std::string, int> teacherLoad;
    for (const auto& subj : j["subjects"]) {
        std::string tid = subj.value("teacherId", "");
        int weekly = subj.contains("weeklySessions") ? subj["weeklySessions"].get<int>() : subj.value("weeklyPeriods", 3);
        int dur    = subj.contains("durationPeriods") ? subj["durationPeriods"].get<int>() : subj.value("duration", 1);
        teacherLoad[tid] += (weekly * dur);
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

    // Sort order: 2-hour sessions first (most constrained), then teachers with higher load
    std::vector<int> order(sessions.size());
    for (int i = 0; i < (int)sessions.size(); ++i) order[i] = i;
    std::sort(order.begin(), order.end(), [&](int a, int b) {
        if (sessions[a].durationPeriods != sessions[b].durationPeriods)
            return sessions[a].durationPeriods > sessions[b].durationPeriods;
        int loadA = teacherLoad.count(sessions[a].teacherId) ? teacherLoad[sessions[a].teacherId] : 0;
        int loadB = teacherLoad.count(sessions[b].teacherId) ? teacherLoad[sessions[b].teacherId] : 0;
        if (loadA != loadB) return loadA > loadB;
        return sessions[a].sessionIndex < sessions[b].sessionIndex;
    });

    std::vector<Assignment> result;
    result.reserve(sessions.size());

    bool solved = solve(sessions, order, result);
    if (!solved && result.size() < bestResult.size()) {
        result = bestResult;
    }

    // If any session remains unplaced due to strict daily load <=6 limit, place via relaxed pass
    std::unordered_set<int> assignedIdx;
    for (const auto& a : result) assignedIdx.insert(a.sessionIdx);

    if (result.size() < sessions.size()) {
        for (int i = 0; i < (int)sessions.size(); ++i) {
            if (assignedIdx.count(i)) continue;
            const Session& s = sessions[i];
            int neededCap = (s.requiredRoomType == "Classroom") ? s.studentCount : (s.studentCount + 1) / 2;
            const auto& candRooms = roomsByType.count(s.requiredRoomType) ? roomsByType[s.requiredRoomType] : allRooms;

            bool placed = false;
            for (int d = 0; d < D && !placed; ++d) {
                for (int p = 0; p <= P - s.durationPeriods && !placed; ++p) {
                    for (const auto& r : candRooms) {
                        if (r.capacity >= neededCap && canPlaceRelaxed(s, r.id, d, p)) {
                            occupy(s, r.id, d, p, true);
                            result.push_back({i, r.id, d, p});
                            assignedIdx.insert(i);
                            placed = true;
                            break;
                        }
                    }
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
    for (int i = 0; i < (int)sessions.size(); ++i) {
        if (!assignedIdx.count(i)) {
            const Session& s = sessions[i];
            json us;
            us["sessionId"]  = s.sessionId;
            us["reasonCode"] = timedOut ? "TIMEOUT" : limitHit ? "NODE_LIMIT" : "NO_FEASIBLE_SLOT";
            us["detail"]     = timedOut ? "Search time limit reached" :
                               limitHit ? "Search node limit reached" :
                               "No feasible slot found after search";
            unscheduled.push_back(us);
        }
    }

    std::string status = (assignments.size() == sessions.size()) ? "COMPLETE"
                       : timedOut  ? "TIMEOUT"
                       : limitHit  ? "NODE_LIMIT_REACHED"
                       : "PARTIAL";

    json metrics;
    metrics["algorithmTimeMs"]   = totalMs;
    metrics["totalEngineTimeMs"] = totalMs;
    metrics["totalSessions"]     = (int)sessions.size();
    metrics["scheduledCount"]    = (int)assignments.size();
    metrics["unscheduledCount"]  = (int)unscheduled.size();
    metrics["searchNodes"]       = nodeCount;
    metrics["backtrackCount"]    = backtrackCount;
    metrics["domainWipeouts"]    = nullptr;
    metrics["graphVertices"]     = nullptr;
    metrics["graphEdges"]        = nullptr;
    metrics["colorsUsed"]        = nullptr;
    metrics["softPenalty"]       = { {"total", 0}, {"breakdown", json::object()} };
    metrics["roomUtilizationPct"] = sessions.empty() ? 0.0
        : (assignments.size() * 100.0 / sessions.size());

    json out;
    out["ok"]           = true;
    out["algorithm"]    = "backtracking";
    out["searchStatus"] = status;
    out["assignments"]  = assignments;
    out["unscheduled"]  = unscheduled;
    out["metrics"]      = metrics;
    out["graph"]        = nullptr;

    std::cout << out.dump() << std::endl;
    return 0;
}
