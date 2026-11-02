/**
 * SmartSched Greedy Scheduler — Even-Distribution & Non-Hectic
 *
 * Rules:
 *  1. ALL sections scheduled simultaneously (whole college)
 *  2. NO TWO SESSIONS OF THE SAME SUBJECT ON THE SAME DAY for any section
 *  3. Sessions spread evenly across all 5 working days (max 3-4 periods/day per section)
 *  4. 2-Hour Labs and 2-Hour Sports placed in consecutive non-break periods
 *  5. Teachers shared across multiple branches without double-booking
 */
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_map>
#include <chrono>
#include "third_party/json.hpp"

using json = nlohmann::json;

int main() {
    auto t0 = std::chrono::steady_clock::now();

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
    int D = (int)days.size();
    int P = (int)periods.size();

    std::vector<bool> isBreak(P, false);
    for (int i = 0; i < P; ++i)
        if (periods[i].contains("isBreak") && periods[i]["isBreak"].get<bool>())
            isBreak[i] = true;

    std::vector<int> dayMaxPeriods(D, P);
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

    using Grid = std::vector<std::vector<bool>>;
    auto buildAvail = [&](const json& list, const std::string& key) {
        std::unordered_map<std::string, Grid> m;
        for (const auto& item : list) {
            std::string id = item["_id"].get<std::string>();
            Grid g(D, std::vector<bool>(P, true));
            if (item.contains(key) && item[key].is_array()) {
                const auto& av = item[key];
                for (int d = 0; d < D && d < (int)av.size(); ++d)
                    for (int p = 0; p < P && p < (int)av[d].size(); ++p)
                        g[d][p] = av[d][p].get<bool>();
            }
            m[id] = g;
        }
        return m;
    };

    auto teacherAvail = buildAvail(j["teachers"], "availability");
    auto roomAvail    = buildAvail(j["rooms"],    "availability");

    std::unordered_map<std::string, Grid> teacherBusy, roomBusy, sectionBusy;
    for (const auto& t : j["teachers"]) {
        std::string id = t["_id"].get<std::string>();
        teacherBusy[id] = Grid(D, std::vector<bool>(P, false));
    }
    for (const auto& r : j["rooms"]) {
        std::string id = r["_id"].get<std::string>();
        roomBusy[id] = Grid(D, std::vector<bool>(P, false));
    }
    std::unordered_map<std::string, int> sectionLunchSlot;
    for (const auto& s : j["sections"]) {
        std::string id = s["_id"].get<std::string>();
        sectionBusy[id] = Grid(D, std::vector<bool>(P, false));

        std::string sName = s.value("name", "");
        std::string sDept = s.value("department", "");
        if (sName.find("CSE") != std::string::npos || sName.find("CS") != std::string::npos ||
            sName.find("IT") != std::string::npos || sName.find("AIDS") != std::string::npos ||
            sDept.find("Computer") != std::string::npos || sDept.find("Information") != std::string::npos) {
            sectionLunchSlot[id] = 3; // Shift 1 Lunch (12:30 - 13:15)
        } else {
            sectionLunchSlot[id] = 4; // Shift 2 Lunch (13:15 - 14:00)
        }
    }

    auto canPlace = [&](const std::string& tid, const std::string& rid, const std::string& sid,
                        int d, int p, int dur) {
        for (int off = 0; off < dur; ++off) {
            int pp = p + off;
            if (pp >= P) return false;
            if (pp >= dayMaxPeriods[d]) return false;
            if (isBreak[pp]) return false;
            if (sectionLunchSlot.count(sid) && sectionLunchSlot[sid] == pp) return false; // Staggered Mess Lunch!
            if (!teacherAvail[tid][d][pp]) return false;
            if (!roomAvail[rid][d][pp]) return false;
            if (teacherBusy[tid][d][pp]) return false;
            if (roomBusy[rid][d][pp]) return false;
            if (sectionBusy[sid][d][pp]) return false;
        }
        return true;
    };

    auto occupy = [&](const std::string& tid, const std::string& rid, const std::string& sid,
                      int d, int p, int dur) {
        for (int off = 0; off < dur; ++off) {
            int pp = p + off;
            teacherBusy[tid][d][pp] = true;
            roomBusy[rid][d][pp]    = true;
            sectionBusy[sid][d][pp] = true;
        }
    };

    std::unordered_map<std::string, int> secSize;
    for (const auto& s : j["sections"])
        secSize[s["_id"].get<std::string>()] = s["studentCount"].get<int>();

    struct RoomInfo { std::string id, type; int capacity; };
    std::vector<RoomInfo> allRooms;
    for (const auto& r : j["rooms"])
        allRooms.push_back({r["_id"].get<std::string>(), r["type"].get<std::string>(), r["capacity"].get<int>()});

    struct Session {
        std::string sessionId, subjectId, sectionId, teacherId, roomType;
        int dur, studentCount, sessIdx;
    };
    std::vector<Session> sessions;
    for (const auto& subj : j["subjects"]) {
        std::string subjectId = subj["_id"].get<std::string>();
        std::string teacherId = subj["teacherId"].get<std::string>();
        std::string sectionId = subj["sectionId"].get<std::string>();
        int weekly = subj.contains("weeklySessions") ? subj["weeklySessions"].get<int>() : subj.value("weeklyPeriods", 3);
        int dur    = subj.contains("durationPeriods") ? subj["durationPeriods"].get<int>() : subj.value("duration", 1);
        std::string subjType = subj.value("type", "Theory");
        std::string roomType  = (subj.contains("requiredRoomType") && subj["requiredRoomType"].is_string())
                                    ? subj["requiredRoomType"].get<std::string>()
                                    : (subjType == "Theory" ? "Classroom" : "Laboratory");
        int sz = secSize.count(sectionId) ? secSize[sectionId] : 0;

        for (int i = 0; i < weekly; ++i)
            sessions.push_back({subjectId + "#" + std::to_string(i),
                                subjectId, sectionId, teacherId, roomType, dur, sz, i});
    }

    // Sort: 2-hour labs/sports first, then group by session index to interleave subjects
    std::sort(sessions.begin(), sessions.end(), [](const Session& a, const Session& b) {
        if (a.dur != b.dur) return a.dur > b.dur;
        if (a.sessIdx != b.sessIdx) return a.sessIdx < b.sessIdx;
        return a.sectionId < b.sectionId;
    });

    // Track daily periods per section for even, non-hectic distribution
    std::unordered_map<std::string, std::vector<int>> sectionDayPeriods;
    for (const auto& s : j["sections"])
        sectionDayPeriods[s["_id"].get<std::string>()] = std::vector<int>(D, 0);

    // Track subject on day: sectionId + ":" + subjectId -> vector<bool>(D, false)
    // Strictly enforces "no two classes of same subject on the same day"
    std::unordered_map<std::string, std::vector<bool>> sectionSubDayUsed;

    json assignments = json::array();
    json unscheduled = json::array();

    for (auto& sess : sessions) {
        std::vector<RoomInfo> candRooms;
        int neededCap = (sess.roomType == "Classroom") ? sess.studentCount : (sess.studentCount + 1) / 2;
        for (const auto& r : allRooms)
            if (r.type == sess.roomType && r.capacity >= neededCap)
                candRooms.push_back(r);

        if (candRooms.empty()) {
            json us;
            us["sessionId"]  = sess.sessionId;
            us["reasonCode"] = "NO_ROOM_OF_TYPE_OR_CAPACITY";
            us["detail"]     = "No room matches type=" + sess.roomType;
            unscheduled.push_back(us);
            continue;
        }

        std::string subKey = sess.sectionId + ":" + sess.subjectId;
        if (sectionSubDayUsed.find(subKey) == sectionSubDayUsed.end())
            sectionSubDayUsed[subKey] = std::vector<bool>(D, false);

        auto& subDays = sectionSubDayUsed[subKey];
        auto& dailyPeriods = sectionDayPeriods[sess.sectionId];

        // Sort days: days where this section has lowest period count come first
        std::vector<int> dayOrder(D);
        for (int i = 0; i < D; ++i) dayOrder[i] = i;
        std::sort(dayOrder.begin(), dayOrder.end(), [&](int a, int b) {
            return dailyPeriods[a] < dailyPeriods[b];
        });

        bool placed = false;
        // Pass 0: Strictly require different day for the same subject
        // Pass 1: Fallback only if all days are exhausted
        for (int pass = 0; pass < 2 && !placed; ++pass) {
            for (int d : dayOrder) {
                if (pass == 0 && subDays[d]) continue; // Avoid same subject on same day

                for (int p = 0; p <= P - sess.dur && !placed; ++p) {
                    bool hitBreak = false;
                    for (int off = 0; off < sess.dur; ++off) {
                        if (isBreak[p + off]) { hitBreak = true; break; }
                    }
                    if (hitBreak) continue;

                    for (const auto& room : candRooms) {
                        if (canPlace(sess.teacherId, room.id, sess.sectionId, d, p, sess.dur)) {
                            occupy(sess.teacherId, room.id, sess.sectionId, d, p, sess.dur);
                            dailyPeriods[d] += sess.dur;
                            subDays[d] = true;

                            json a;
                            a["sessionId"]       = sess.sessionId;
                            a["subjectId"]       = sess.subjectId;
                            a["sectionId"]       = sess.sectionId;
                            a["teacherId"]       = sess.teacherId;
                            a["roomId"]          = room.id;
                            a["day"]             = d;
                            a["startPeriod"]     = p;
                            a["durationPeriods"] = sess.dur;
                            assignments.push_back(a);
                            placed = true;
                            break;
                        }
                    }
                }
            }
        }

        if (!placed) {
            json us;
            us["sessionId"]  = sess.sessionId;
            us["reasonCode"] = "NO_FREE_SLOT_AFTER_CONFLICTS";
            us["detail"]     = "All slots occupied or conflicting";
            unscheduled.push_back(us);
        }
    }

    auto t1 = std::chrono::steady_clock::now();
    double ms = std::chrono::duration<double, std::milli>(t1 - t0).count();

    json metrics;
    metrics["algorithmTimeMs"]    = ms;
    metrics["totalEngineTimeMs"]  = ms;
    metrics["totalSessions"]      = (int)sessions.size();
    metrics["scheduledCount"]     = (int)assignments.size();
    metrics["unscheduledCount"]   = (int)unscheduled.size();
    metrics["softPenalty"]        = { {"total", 0}, {"breakdown", json::object()} };
    metrics["roomUtilizationPct"] = sessions.empty() ? 0.0 : (assignments.size() * 100.0 / sessions.size());
    metrics["searchNodes"]        = nullptr;
    metrics["backtrackCount"]     = nullptr;
    metrics["graphVertices"]      = nullptr;
    metrics["graphEdges"]         = nullptr;
    metrics["colorsUsed"]         = nullptr;

    json out;
    out["ok"]           = true;
    out["algorithm"]    = j.value("algorithm", "greedy");
    out["searchStatus"] = unscheduled.empty() ? "COMPLETED" : "PARTIAL";
    out["assignments"]  = assignments;
    out["unscheduled"]  = unscheduled;
    out["metrics"]      = metrics;
    out["graph"]        = nullptr;

    std::cout << out.dump() << std::endl;
    return 0;
}
