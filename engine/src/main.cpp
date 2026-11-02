#include <iostream>
#include <string>
#include <chrono>
#include "third_party/json.hpp"

using json = nlohmann::json;

int main() {
    auto totalStart = std::chrono::steady_clock::now();

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

    if (!input.contains("mode") || input["mode"] != "schedule") {
        json errObj = {
            {"ok", false},
            {"error", {
                {"code", "E_INVALID_MODE"},
                {"message", "Expected 'mode': 'schedule'"}
            }}
        };
        std::cout << errObj.dump() << std::endl;
        return 2;
    }

    std::string algorithm = input.value("algorithm", "greedy");
    std::cerr << "[scheduler] Received schedule request for algorithm: " << algorithm << std::endl;

    auto algoStart = std::chrono::steady_clock::now();
    // In Phase 1 foundation: verify round-trip contract
    // Real scheduling algorithms (Greedy, Backtracking, Graph Coloring) will be implemented in Phases 3-6.
    auto algoEnd = std::chrono::steady_clock::now();

    int sessionCount = 0;
    if (input.contains("sessions") && input["sessions"].is_array()) {
        sessionCount = static_cast<int>(input["sessions"].size());
    }

    auto totalEnd = std::chrono::steady_clock::now();
    double algoTimeMs = std::chrono::duration<double, std::milli>(algoEnd - algoStart).count();
    double totalTimeMs = std::chrono::duration<double, std::milli>(totalEnd - totalStart).count();

    json response = {
        {"ok", true},
        {"algorithm", algorithm},
        {"searchStatus", "COMPLETED"},
        {"assignments", json::array()},
        {"unscheduled", json::array()},
        {"metrics", {
            {"algorithmTimeMs", algoTimeMs},
            {"totalEngineTimeMs", totalTimeMs},
            {"totalSessions", sessionCount},
            {"scheduledCount", 0},
            {"unscheduledCount", 0},
            {"softPenalty", {
                {"total", 0},
                {"breakdown", {
                    {"gaps", 0},
                    {"workloadBalance", 0},
                    {"consecutiveTeaching", 0},
                    {"preferredSlots", 0},
                    {"distribution", 0},
                    {"earlyLate", 0}
                }}
            }},
            {"roomUtilizationPct", 0.0},
            {"searchNodes", nullptr},
            {"backtrackCount", nullptr},
            {"domainWipeouts", nullptr},
            {"graphVertices", nullptr},
            {"graphEdges", nullptr},
            {"colorsUsed", nullptr}
        }},
        {"graph", nullptr}
    };

    // ONLY the JSON on stdout
    std::cout << response.dump() << std::endl;
    return 0;
}
