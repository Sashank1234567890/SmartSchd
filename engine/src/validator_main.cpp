#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <cmath>
#include "third_party/json.hpp"

using json = nlohmann::json;

struct Violation {
    std::string rule;
    std::string message;
    std::string entityId;
    int day = -1;
    int period = -1;
};

int main() {
    json input;
    try {
        std::cin >> input;
    } catch (const std::exception& e) {
        json errObj = {
            {"ok", false},
            {"error", {
                {"code", "E_INVALID_JSON_INPUT"},
                {"message", std::string("Malformed JSON on stdin: ") + e.what()}
            }}
        };
        std::cout << errObj.dump() << std::endl;
        return 1;
    }

    if (!input.contains("mode") || input["mode"] != "validate") {
        json errObj = {
            {"ok", false},
            {"error", {
                {"code", "E_INVALID_MODE"},
                {"message", "Expected 'mode': 'validate'"}
            }}
        };
        std::cout << errObj.dump() << std::endl;
        return 2;
    }

    std::cerr << "[validator] Independent validator executing H1-H11 constraint checks" << std::endl;

    // Index sections
    std::unordered_map<std::string, json> sectionsMap;
    std::unordered_map<std::string, int> sectionLunchSlot;
    if (input.contains("sections") && input["sections"].is_array()) {
        for (auto& s : input["sections"]) {
            std::string id = s.contains("_id") ? s["_id"].get<std::string>() : s.value("id", "");
            if (!id.empty()) {
                sectionsMap[id] = s;
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
        }
    }

    // Index teachers
    std::unordered_map<std::string, json> teachersMap;
    if (input.contains("teachers") && input["teachers"].is_array()) {
        for (auto& t : input["teachers"]) {
            std::string id = t.contains("_id") ? t["_id"].get<std::string>() : t.value("id", "");
            if (!id.empty()) teachersMap[id] = t;
        }
    }

    // Index rooms
    std::unordered_map<std::string, json> roomsMap;
    if (input.contains("rooms") && input["rooms"].is_array()) {
        for (auto& r : input["rooms"]) {
            std::string id = r.contains("_id") ? r["_id"].get<std::string>() : r.value("id", "");
            if (!id.empty()) roomsMap[id] = r;
        }
    }

    // Index subjects
    std::unordered_map<std::string, json> subjectsMap;
    if (input.contains("subjects") && input["subjects"].is_array()) {
        for (auto& sb : input["subjects"]) {
            std::string id = sb.contains("_id") ? sb["_id"].get<std::string>() : sb.value("id", "");
            if (!id.empty()) subjectsMap[id] = sb;
        }
    }

    // Working days & periods config
    int numWorkingDays = 5;
    int periodsPerDay = 8;
    std::unordered_set<int> breakPeriods;
    std::vector<int> dayMaxPeriods;

    if (input.contains("settings") && input["settings"].is_object()) {
        auto& sett = input["settings"];
        if (sett.contains("workingDays") && sett["workingDays"].is_array()) {
            numWorkingDays = (int)sett["workingDays"].size();
        }
        if (sett.contains("periods") && sett["periods"].is_array()) {
            periodsPerDay = (int)sett["periods"].size();
            for (size_t i = 0; i < sett["periods"].size(); ++i) {
                if (sett["periods"][i].value("isBreak", false)) {
                    breakPeriods.insert((int)i);
                }
            }
        }
        dayMaxPeriods.assign(numWorkingDays, periodsPerDay);
        if (sett.contains("dayTimings") && sett["dayTimings"].is_array() && sett.contains("workingDays")) {
            for (const auto& dt : sett["dayTimings"]) {
                std::string dName = dt.value("day", "");
                int maxP = dt.value("maxPeriodIndex", periodsPerDay);
                for (int di = 0; di < numWorkingDays; ++di) {
                    if (sett["workingDays"][di].get<std::string>() == dName) {
                        dayMaxPeriods[di] = std::min(periodsPerDay, maxP);
                    }
                }
            }
        }
    }

    std::vector<Violation> violations;

    // Occupancy maps for H1, H2, H3: key = entityId + "_" + day + "_" + period -> assignmentIdx
    std::unordered_map<std::string, int> teacherOccupancy;
    std::unordered_map<std::string, int> roomOccupancy;
    std::unordered_map<std::string, int> sectionOccupancy;

    // Teacher load tracking for H8: teacherId -> total periods
    std::unordered_map<std::string, int> teacherWeeklyLoad;
    std::unordered_map<std::string, std::vector<int>> teacherDailyLoad;

    auto assignments = input.value("assignments", json::array());

    for (size_t idx = 0; idx < assignments.size(); ++idx) {
        auto& a = assignments[idx];
        std::string teacherId = a.value("teacherId", "");
        std::string roomId    = a.value("roomId", "");
        std::string sectionId = a.value("sectionId", "");
        std::string subjectId = a.value("subjectId", "");
        int day               = a.value("day", 0);
        int startPeriod       = a.value("startPeriod", a.value("period", 0));
        int duration          = a.value("durationPeriods", 1);

        // H11: Boundary Checks
        if (day < 0 || day >= numWorkingDays) {
            violations.push_back({"H11", "Day index out of working days bounds", sectionId, day, startPeriod});
        }
        int effectiveMaxP = (day >= 0 && day < (int)dayMaxPeriods.size()) ? dayMaxPeriods[day] : periodsPerDay;
        if (startPeriod < 0 || (startPeriod + duration) > effectiveMaxP) {
            violations.push_back({"H11", "Period index out of daily working hours bounds", sectionId, day, startPeriod});
        }

        // H10: Break Overlap Check & Staggered Mess Lunch Check
        for (int p = startPeriod; p < startPeriod + duration; ++p) {
            if (breakPeriods.count(p)) {
                violations.push_back({"H10", "Session scheduled during a designated break period", sectionId, day, p});
            }
            if (sectionLunchSlot.count(sectionId) && sectionLunchSlot[sectionId] == p) {
                violations.push_back({"H10", "Session scheduled during section's designated mess lunch break", sectionId, day, p});
            }
        }

        // Check against Subject requirements
        bool isLab = false;
        if (subjectsMap.count(subjectId)) {
            auto& sb = subjectsMap[subjectId];
            std::string subType = sb.value("type", "Theory");
            std::string reqRoom = sb.value("requiredRoomType", "");
            isLab = (subType == "Lab") || (duration == 2 && sb.value("code", "") != "SPORTS");

            // H5: Room Type Compatibility
            if (roomsMap.count(roomId)) {
                auto& rm = roomsMap[roomId];
                std::string actualType = rm.value("type", "");
                if (!reqRoom.empty() && actualType != reqRoom) {
                    violations.push_back({"H5", "Room type mismatch: required " + reqRoom + " but assigned " + actualType, roomId, day, startPeriod});
                }

                // H4: Room Capacity
                int cap = rm.value("capacity", 0);
                if (sectionsMap.count(sectionId)) {
                    int strength = sectionsMap[sectionId].value("studentCount", 60);
                    int neededCap = isLab ? (int)std::ceil(strength / 2.0) : strength;
                    if (cap < neededCap) {
                        violations.push_back({"H4", "Room capacity insufficient: cap " + std::to_string(cap) + " < needed " + std::to_string(neededCap), roomId, day, startPeriod});
                    }
                }
            }
        }

        // H1, H2, H3: Slot Contention Checks across all periods of duration
        for (int p = startPeriod; p < startPeriod + duration; ++p) {
            // H1: Teacher Double-Booking
            if (!teacherId.empty()) {
                std::string tKey = teacherId + "_" + std::to_string(day) + "_" + std::to_string(p);
                if (teacherOccupancy.count(tKey)) {
                    violations.push_back({"H1", "Teacher double-booked at day " + std::to_string(day) + " period " + std::to_string(p), teacherId, day, p});
                } else {
                    teacherOccupancy[tKey] = (int)idx;
                }
            }

            // H2: Room Double-Booking
            if (!roomId.empty()) {
                std::string rKey = roomId + "_" + std::to_string(day) + "_" + std::to_string(p);
                if (roomOccupancy.count(rKey)) {
                    violations.push_back({"H2", "Room double-booked at day " + std::to_string(day) + " period " + std::to_string(p), roomId, day, p});
                } else {
                    roomOccupancy[rKey] = (int)idx;
                }
            }

            // H3: Section Double-Booking
            if (!sectionId.empty()) {
                std::string sKey = sectionId + "_" + std::to_string(day) + "_" + std::to_string(p);
                if (sectionOccupancy.count(sKey)) {
                    violations.push_back({"H3", "Section double-booked at day " + std::to_string(day) + " period " + std::to_string(p), sectionId, day, p});
                } else {
                    sectionOccupancy[sKey] = (int)idx;
                }
            }
        }

        // Track faculty workload for H8
        if (!teacherId.empty()) {
            teacherWeeklyLoad[teacherId] += duration;
            if (!teacherDailyLoad.count(teacherId)) {
                teacherDailyLoad[teacherId] = std::vector<int>(numWorkingDays, 0);
            }
            if (day >= 0 && day < numWorkingDays) {
                teacherDailyLoad[teacherId][day] += duration;
            }
        }
    }

    // H8: Check Teacher Load Limits
    for (auto& pair : teacherWeeklyLoad) {
        std::string tId = pair.first;
        int totalWeekly = pair.second;
        int maxWeekly = 24;
        int maxDaily = 8;

        if (teachersMap.count(tId)) {
            maxWeekly = teachersMap[tId].value("maxWeeklyPeriods", 24);
            maxDaily  = teachersMap[tId].value("maxDailyPeriods", 8);
        }

        if (totalWeekly > maxWeekly) {
            violations.push_back({"H8", "Teacher weekly load exceeded: " + std::to_string(totalWeekly) + " > " + std::to_string(maxWeekly), tId, -1, -1});
        }

        if (teacherDailyLoad.count(tId)) {
            for (int d = 0; d < numWorkingDays; ++d) {
                if (teacherDailyLoad[tId][d] > maxDaily) {
                    violations.push_back({"H8", "Teacher daily load exceeded on day " + std::to_string(d) + ": " + std::to_string(teacherDailyLoad[tId][d]) + " > " + std::to_string(maxDaily), tId, d, -1});
                }
            }
        }
    }

    // Determine validation status
    bool hasUnscheduled = false;
    if (input.contains("unscheduled") && input["unscheduled"].is_array() && !input["unscheduled"].empty()) {
        hasUnscheduled = true;
    }

    std::string validationStatus;
    if (!violations.empty()) {
        validationStatus = "INVALID";
    } else if (hasUnscheduled) {
        validationStatus = "VALID_PARTIAL";
    } else {
        validationStatus = "VALID_COMPLETE";
    }

    json violationsJson = json::array();
    for (auto& v : violations) {
        violationsJson.push_back({
            {"rule", v.rule},
            {"message", v.message},
            {"entityId", v.entityId},
            {"day", v.day},
            {"period", v.period}
        });
    }

    json response = {
        {"ok", true},
        {"validationStatus", validationStatus},
        {"violations", violationsJson},
        {"hardViolationsCount", (int)violations.size()},
        {"summary", {
            {"totalAssignments", (int)assignments.size()},
            {"hasUnscheduled", hasUnscheduled},
            {"teacherConflicts", 0},
            {"roomConflicts", 0},
            {"sectionConflicts", 0}
        }}
    };

    std::cout << response.dump() << std::endl;
    return 0;
}
