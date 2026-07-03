"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOCKOUT_DEFS = exports.FINAL_DEFS = exports.SF_DEFS = exports.QF_DEFS = exports.R16_DEFS = exports.R32_DEFS = exports.KNOCKOUT_STATIC_RESULTS = void 0;
exports.buildFullKnockoutBracket = buildFullKnockoutBracket;
exports.buildRoundOf32 = buildRoundOf32;
exports.allGroupsComplete = allGroupsComplete;
exports.getGroupStandingsMap = getGroupStandingsMap;
var tournament_1 = require("@/lib/types/tournament");
var teams_1 = require("@/data/teams");
var standings_1 = require("@/lib/standings");
var fixtures_1 = require("@/lib/fixtures");
exports.KNOCKOUT_STATIC_RESULTS = {
    "r32-1": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 0, homePen: 3, awayPen: 4, winnerId: "par", played: true }, // Germany vs Paraguay
    "r32-2": { homeScore: 3, awayScore: 0, winnerId: "fra", played: true }, // France vs Sweden
    "r32-3": { homeScore: 0, awayScore: 1, winnerId: "can", played: true }, // South Africa vs Canada
    "r32-4": { homeScore: 1, awayScore: 1, homeET: 0, awayET: 0, homePen: 2, awayPen: 3, winnerId: "mar", played: true }, // Netherlands vs Morocco
    "r32-5": { homeScore: 2, awayScore: 1, winnerId: "por", played: true }, // Portugal vs Croatia
    "r32-6": { homeScore: 3, awayScore: 0, winnerId: "esp", played: true }, // Spain vs Austria
    "r32-7": { homeScore: 2, awayScore: 0, winnerId: "usa", played: true }, // USA vs Bosnia-Herzegovina
    "r32-8": { homeScore: 3, awayScore: 2, winnerId: "bel", played: true }, // Belgium vs Senegal
    "r32-9": { homeScore: 2, awayScore: 1, winnerId: "bra", played: true }, // Brazil vs Japan
    "r32-10": { homeScore: 1, awayScore: 2, winnerId: "nor", played: true }, // Ivory Coast vs Norway
    "r32-11": { homeScore: 2, awayScore: 0, winnerId: "mex", played: true }, // Mexico vs Ecuador
    "r32-12": { homeScore: 2, awayScore: 1, winnerId: "eng", played: true }, // England vs DR Congo
};
// Definitions of official slots, dates, times, and stadiums for all rounds
exports.R32_DEFS = [
    { id: "r32-1", slot: "R32-1", name: "Maç 74", homeSym: "E1", awayOpts: ["A", "B", "C", "D", "F"], date: "2026-06-29", time: "23:30", stadium: "Boston Stadı" },
    { id: "r32-2", slot: "R32-2", name: "Maç 77", homeSym: "I1", awayOpts: ["C", "D", "F", "G", "H"], date: "2026-07-01", time: "00:00", stadium: "New York New Jersey Stadyumu" },
    { id: "r32-3", slot: "R32-3", name: "Maç 73", homeSym: "A2", awaySym: "B2", date: "2026-06-28", time: "22:00", stadium: "Los Angeles Stadı" },
    { id: "r32-4", slot: "R32-4", name: "Maç 75", homeSym: "F1", awaySym: "C2", date: "2026-06-30", time: "04:00", stadium: "Monterrey Stadı" },
    { id: "r32-5", slot: "R32-5", name: "Maç 83", homeSym: "K2", awaySym: "L2", date: "2026-07-03", time: "02:00", stadium: "Toronto Stadı" },
    { id: "r32-6", slot: "R32-6", name: "Maç 84", homeSym: "H1", awaySym: "J2", date: "2026-07-02", time: "22:00", stadium: "Los Angeles Stadı" },
    { id: "r32-7", slot: "R32-7", name: "Maç 81", homeSym: "D1", awayOpts: ["B", "E", "F", "I", "J"], date: "2026-07-02", time: "03:00", stadium: "San Francisco Bay Area Stadı" },
    { id: "r32-8", slot: "R32-8", name: "Maç 82", homeSym: "G1", awayOpts: ["A", "E", "H", "I", "J"], date: "2026-07-01", time: "23:00", stadium: "Seattle Stadı" },
    { id: "r32-9", slot: "R32-9", name: "Maç 76", homeSym: "C1", awaySym: "F2", date: "2026-06-29", time: "20:00", stadium: "Houston Stadı" },
    { id: "r32-10", slot: "R32-10", name: "Maç 78", homeSym: "E2", awaySym: "I2", date: "2026-06-30", time: "20:00", stadium: "Dallas Stadı" },
    { id: "r32-11", slot: "R32-11", name: "Maç 79", homeSym: "A1", awayOpts: ["C", "E", "F", "H", "I"], date: "2026-07-01", time: "04:00", stadium: "Mexico City Stadı" },
    { id: "r32-12", slot: "R32-12", name: "Maç 80", homeSym: "L1", awayOpts: ["E", "H", "I", "J", "K"], date: "2026-07-01", time: "19:00", stadium: "Atlanta Stadı" },
    { id: "r32-13", slot: "R32-13", name: "Maç 86", homeSym: "J1", awaySym: "H2", date: "2026-07-04", time: "01:00", stadium: "Miami Stadı" },
    { id: "r32-14", slot: "R32-14", name: "Maç 88", homeSym: "D2", awaySym: "G2", date: "2026-07-03", time: "21:00", stadium: "Dallas Stadı" },
    { id: "r32-15", slot: "R32-15", name: "Maç 85", homeSym: "B1", awayOpts: ["E", "F", "G", "I", "J"], date: "2026-07-03", time: "06:00", stadium: "BC Place Vancouver Stadı" },
    { id: "r32-16", slot: "R32-16", name: "Maç 87", homeSym: "K1", awayOpts: ["D", "E", "I", "J", "L"], date: "2026-07-04", time: "04:30", stadium: "Kansas City Stadı" }
];
exports.R16_DEFS = [
    { id: "r16-1", slot: "R16-1", name: "Maç 89", date: "2026-07-05", time: "00:00", stadium: "Philadelphia Stadı" },
    { id: "r16-2", slot: "R16-2", name: "Maç 90", date: "2026-07-04", time: "20:00", stadium: "Houston Stadı" },
    { id: "r16-3", slot: "R16-3", name: "Maç 93", date: "2026-07-06", time: "22:00", stadium: "Dallas Stadı" },
    { id: "r16-4", slot: "R16-4", name: "Maç 94", date: "2026-07-07", time: "03:00", stadium: "Seattle Stadı" },
    { id: "r16-5", slot: "R16-5", name: "Maç 91", date: "2026-07-05", time: "23:00", stadium: "New York New Jersey Stadı" },
    { id: "r16-6", slot: "R16-6", name: "Maç 92", date: "2026-07-06", time: "03:00", stadium: "Mexico City Stadı" },
    { id: "r16-7", slot: "R16-7", name: "Maç 95", date: "2026-07-07", time: "19:00", stadium: "Atlanta Stadı" },
    { id: "r16-8", slot: "R16-8", name: "Maç 96", date: "2026-07-07", time: "23:00", stadium: "BC Place Vancouver Stadı" }
];
exports.QF_DEFS = [
    { id: "qf-1", slot: "QF-1", name: "Maç 97", date: "2026-07-09", time: "23:00", stadium: "Boston Stadı" },
    { id: "qf-2", slot: "QF-2", name: "Maç 98", date: "2026-07-10", time: "22:00", stadium: "Los Angeles Stadı" },
    { id: "qf-3", slot: "QF-3", name: "Maç 99", date: "2026-07-12", time: "00:00", stadium: "Miami Stadı" },
    { id: "qf-4", slot: "QF-4", name: "Maç 100", date: "2026-07-12", time: "04:00", stadium: "Kansas City Stadı" }
];
exports.SF_DEFS = [
    { id: "sf-1", slot: "SF-1", name: "Maç 101", date: "2026-07-14", time: "22:00", stadium: "Dallas Stadı" },
    { id: "sf-2", slot: "SF-2", name: "Maç 102", date: "2026-07-15", time: "22:00", stadium: "Atlanta Stadı" }
];
exports.FINAL_DEFS = [
    { id: "final-1", slot: "Final-1", name: "Maç 104", date: "2026-07-19", time: "22:00", stadium: "New York New Jersey Stadı" }
];
exports.KNOCKOUT_DEFS = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], exports.R32_DEFS, true), exports.R16_DEFS, true), exports.QF_DEFS, true), exports.SF_DEFS, true), exports.FINAL_DEFS, true);
function buildFullKnockoutBracket(allMatches, predictions, groupTableOverrides, liveRawMatches) {
    var _a;
    var standingsMap = getGroupStandingsMap(allMatches, predictions, groupTableOverrides);
    // Check if we have teams resolved for group stages
    var totalResolvedTeams = 0;
    for (var _i = 0, GROUP_IDS_1 = tournament_1.GROUP_IDS; _i < GROUP_IDS_1.length; _i++) {
        var group = GROUP_IDS_1[_i];
        totalResolvedTeams += ((_a = standingsMap[group]) === null || _a === void 0 ? void 0 : _a.length) || 0;
    }
    if (totalResolvedTeams < 48) {
        return createPlaceholderBracket();
    }
    var r32Matches = buildR32Matches(standingsMap, predictions, liveRawMatches);
    var r16Matches = buildNextRound(r32Matches, predictions, "r16", 8, liveRawMatches);
    var qfMatches = buildNextRound(r16Matches, predictions, "qf", 4, liveRawMatches);
    var sfMatches = buildNextRound(qfMatches, predictions, "sf", 2, liveRawMatches);
    var finalMatch = buildNextRound(sfMatches, predictions, "final", 1, liveRawMatches);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], r32Matches, true), r16Matches, true), qfMatches, true), sfMatches, true), finalMatch, true);
}
function buildR32Matches(standingsMap, predictions, liveRawMatches) {
    var matches = [];
    // Get best 8 third place teams
    var thirdPlaceTeams = [];
    for (var _i = 0, GROUP_IDS_2 = tournament_1.GROUP_IDS; _i < GROUP_IDS_2.length; _i++) {
        var group = GROUP_IDS_2[_i];
        var standings = standingsMap[group];
        if (standings[2]) {
            thirdPlaceTeams.push(standings[2]);
        }
    }
    var sortedThirdPlace = (0, standings_1.sortStandings)(thirdPlaceTeams);
    var bestThirds = sortedThirdPlace.slice(0, 8).map(function (s) { return s.teamId; });
    var assignedThirds = new Set();
    var getThirdPlaceForSlot = function (allowedGroups, opponentGroup) {
        var _a, _b;
        for (var _i = 0, bestThirds_1 = bestThirds; _i < bestThirds_1.length; _i++) {
            var teamId = bestThirds_1[_i];
            if (assignedThirds.has(teamId))
                continue;
            var group = (_a = (0, teams_1.getTeamById)(teamId)) === null || _a === void 0 ? void 0 : _a.group;
            if (group && allowedGroups.includes(group)) {
                if (opponentGroup && group === opponentGroup) {
                    continue;
                }
                assignedThirds.add(teamId);
                return teamId;
            }
        }
        // Fallback 1: relax opponentGroup
        for (var _c = 0, bestThirds_2 = bestThirds; _c < bestThirds_2.length; _c++) {
            var teamId = bestThirds_2[_c];
            if (assignedThirds.has(teamId))
                continue;
            var group = (_b = (0, teams_1.getTeamById)(teamId)) === null || _b === void 0 ? void 0 : _b.group;
            if (group && allowedGroups.includes(group)) {
                assignedThirds.add(teamId);
                return teamId;
            }
        }
        // Fallback 2: any unassigned
        for (var _d = 0, bestThirds_3 = bestThirds; _d < bestThirds_3.length; _d++) {
            var teamId = bestThirds_3[_d];
            if (assignedThirds.has(teamId))
                continue;
            assignedThirds.add(teamId);
            return teamId;
        }
        return null;
    };
    var getThirdPlaceForGroup = function (group) {
        var _a;
        var standings = standingsMap[group];
        return ((_a = standings === null || standings === void 0 ? void 0 : standings[2]) === null || _a === void 0 ? void 0 : _a.teamId) || null;
    };
    var qualifiedGroups = bestThirds.map(function (id) { var _a; return (_a = (0, teams_1.getTeamById)(id)) === null || _a === void 0 ? void 0 : _a.group; }).filter(Boolean);
    var sortedCombo = __spreadArray([], qualifiedGroups, true).sort().join(",");
    var isDefaultCombo = sortedCombo === "B,D,E,F,G,I,J,L";
    // Pre-defined mapping for the default combo (Annex C 2026 Regulations)
    var defaultComboMap = {
        "r32-1": "D", // Home E1 (Germany) vs D3 (Paraguay)
        "r32-2": "F", // Home I1 (France) vs F3 (Sweden)
        "r32-7": "B", // Home D1 (USA) vs B3 (Bosnia-Herzegovina)
        "r32-8": "I", // Home G1 (Belgium) vs I3 (Senegal)
        "r32-11": "E", // Home A1 (Mexico) vs E3 (Ecuador)
        "r32-12": "G", // Home L1 (England) vs G3 (Iran)
        "r32-15": "J", // Home B1 (Switzerland) vs J3 (Algeria)
        "r32-16": "L", // Home K1 (Colombia) vs L3 (Ghana)
    };
    var getTeamIdFromSym = function (sym) {
        var _a, _b;
        var match = sym.match(/^([A-L])([12])$/);
        if (!match)
            return null;
        var group = match[1];
        var rank = parseInt(match[2], 10) - 1;
        return ((_b = (_a = standingsMap[group]) === null || _a === void 0 ? void 0 : _a[rank]) === null || _b === void 0 ? void 0 : _b.teamId) || null;
    };
    exports.R32_DEFS.forEach(function (def) {
        var _a, _b, _c, _d;
        var homeTeamId = getTeamIdFromSym(def.homeSym);
        var awayTeamId = null;
        if (def.awaySym) {
            awayTeamId = getTeamIdFromSym(def.awaySym);
        }
        else if (def.awayOpts) {
            // Force user's specific Round of 32 pairings when predictions are empty or live scores are active
            var forceAwayMap = {
                "r32-1": "par",
                "r32-2": "swe",
                "r32-7": "bih",
                "r32-8": "sen",
                "r32-11": "ecu",
                "r32-12": "cod",
                "r32-15": "alg",
                "r32-16": "gha"
            };
            var useForced = !predictions || Object.keys(predictions).length === 0 || (liveRawMatches && liveRawMatches.length > 0);
            if (useForced && forceAwayMap[def.id]) {
                awayTeamId = forceAwayMap[def.id];
            }
            else if (isDefaultCombo && defaultComboMap[def.id]) {
                awayTeamId = getThirdPlaceForGroup(defaultComboMap[def.id]);
            }
            else {
                var homeTeam = homeTeamId ? (0, teams_1.getTeamById)(homeTeamId) : null;
                awayTeamId = getThirdPlaceForSlot(def.awayOpts, homeTeam === null || homeTeam === void 0 ? void 0 : homeTeam.group);
            }
        }
        // Resolve real score/played status/winner from static results or live scores
        var homeScore = null;
        var awayScore = null;
        var homeET = null;
        var awayET = null;
        var homePen = null;
        var awayPen = null;
        var played = false;
        var isLive = false;
        var winnerId = null;
        // Use static fallback results for already completed matches if available
        var staticRes = exports.KNOCKOUT_STATIC_RESULTS[def.id];
        if (staticRes && homeTeamId && awayTeamId) {
            homeScore = staticRes.homeScore;
            awayScore = staticRes.awayScore;
            homeET = (_a = staticRes.homeET) !== null && _a !== void 0 ? _a : null;
            awayET = (_b = staticRes.awayET) !== null && _b !== void 0 ? _b : null;
            homePen = (_c = staticRes.homePen) !== null && _c !== void 0 ? _c : null;
            awayPen = (_d = staticRes.awayPen) !== null && _d !== void 0 ? _d : null;
            played = staticRes.played;
            winnerId = staticRes.winnerId;
        }
        else if (liveRawMatches && homeTeamId && awayTeamId) {
            var realMatch = liveRawMatches.find(function (rm) {
                return (rm.homeTeamId === homeTeamId && rm.awayTeamId === awayTeamId) ||
                    (rm.homeTeamId === awayTeamId && rm.awayTeamId === homeTeamId);
            });
            if (realMatch) {
                var isSwapped = realMatch.homeTeamId === awayTeamId;
                homeScore = isSwapped ? realMatch.awayScore : realMatch.homeScore;
                awayScore = isSwapped ? realMatch.homeScore : realMatch.awayScore;
                played = realMatch.played;
                isLive = realMatch.isLive;
                homeET = isSwapped ? realMatch.awayET : realMatch.homeET;
                awayET = isSwapped ? realMatch.homeET : realMatch.awayET;
                homePen = isSwapped ? realMatch.awayPen : realMatch.homePen;
                awayPen = isSwapped ? realMatch.homePen : realMatch.awayPen;
                // Subtract penalty goals from the fullTime score if they are included in it
                if (homePen !== null && awayPen !== null && homeScore !== null && awayScore !== null) {
                    homeScore = homeScore - homePen;
                    awayScore = awayScore - awayPen;
                }
                if (played && homeScore !== null && awayScore !== null) {
                    if (homeScore > awayScore) {
                        winnerId = homeTeamId;
                    }
                    else if (awayScore > homeScore) {
                        winnerId = awayTeamId;
                    }
                    else {
                        var hET = homeET !== null && homeET !== void 0 ? homeET : 0;
                        var aET = awayET !== null && awayET !== void 0 ? awayET : 0;
                        if (hET > aET) {
                            winnerId = homeTeamId;
                        }
                        else if (aET > hET) {
                            winnerId = awayTeamId;
                        }
                        else {
                            var hPen = homePen !== null && homePen !== void 0 ? homePen : 0;
                            var aPen = awayPen !== null && awayPen !== void 0 ? awayPen : 0;
                            if (hPen > aPen) {
                                winnerId = homeTeamId;
                            }
                            else if (aPen > hPen) {
                                winnerId = awayTeamId;
                            }
                        }
                    }
                }
            }
        }
        matches.push({
            id: def.id,
            round: "r32",
            slot: def.slot,
            homeTeamId: homeTeamId,
            awayTeamId: awayTeamId,
            homeScore: homeScore,
            awayScore: awayScore,
            homeET: homeET,
            awayET: awayET,
            homePen: homePen,
            awayPen: awayPen,
            winnerId: winnerId,
            played: played,
            isLive: isLive,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    return matches;
}
function buildNextRound(prevRoundMatches, predictions, roundType, count, liveRawMatches) {
    var _a, _b, _c, _d, _e, _f;
    var matches = [];
    var roundDefs = {
        r16: exports.R16_DEFS,
        qf: exports.QF_DEFS,
        sf: exports.SF_DEFS,
        final: exports.FINAL_DEFS
    }[roundType];
    var _loop_1 = function (i) {
        var prev1 = prevRoundMatches[i * 2];
        var prev2 = prevRoundMatches[i * 2 + 1];
        // User predicted winners take precedence, otherwise fallback to real-world winner
        var homeTeamId = prev1 ? (getWinner(prev1.id, prev1.homeTeamId, prev1.awayTeamId, predictions) || prev1.winnerId) : null;
        var awayTeamId = prev2 ? (getWinner(prev2.id, prev2.homeTeamId, prev2.awayTeamId, predictions) || prev2.winnerId) : null;
        var def = roundDefs[i];
        var p = predictions["".concat(roundType, "-").concat(i + 1)];
        var homeScore = (_a = p === null || p === void 0 ? void 0 : p.home) !== null && _a !== void 0 ? _a : null;
        var awayScore = (_b = p === null || p === void 0 ? void 0 : p.away) !== null && _b !== void 0 ? _b : null;
        var homeET = (_c = p === null || p === void 0 ? void 0 : p.homeET) !== null && _c !== void 0 ? _c : null;
        var awayET = (_d = p === null || p === void 0 ? void 0 : p.awayET) !== null && _d !== void 0 ? _d : null;
        var homePen = (_e = p === null || p === void 0 ? void 0 : p.homePen) !== null && _e !== void 0 ? _e : null;
        var awayPen = (_f = p === null || p === void 0 ? void 0 : p.awayPen) !== null && _f !== void 0 ? _f : null;
        var played = false;
        var isLive = false;
        var winnerId = null;
        if (liveRawMatches && homeTeamId && awayTeamId) {
            var realMatch = liveRawMatches.find(function (rm) {
                return (rm.homeTeamId === homeTeamId && rm.awayTeamId === awayTeamId) ||
                    (rm.homeTeamId === awayTeamId && rm.awayTeamId === homeTeamId);
            });
            if (realMatch) {
                var isSwapped = realMatch.homeTeamId === awayTeamId;
                homeScore = isSwapped ? realMatch.awayScore : realMatch.homeScore;
                awayScore = isSwapped ? realMatch.homeScore : realMatch.awayScore;
                played = realMatch.played;
                isLive = realMatch.isLive;
                homeET = isSwapped ? realMatch.awayET : realMatch.homeET;
                awayET = isSwapped ? realMatch.homeET : realMatch.awayET;
                homePen = isSwapped ? realMatch.awayPen : realMatch.homePen;
                awayPen = isSwapped ? realMatch.homePen : realMatch.awayPen;
                // Subtract penalty goals from the fullTime score if they are included in it
                if (homePen !== null && awayPen !== null && homeScore !== null && awayScore !== null) {
                    homeScore = homeScore - homePen;
                    awayScore = awayScore - awayPen;
                }
                if (played && homeScore !== null && awayScore !== null) {
                    if (homeScore > awayScore) {
                        winnerId = homeTeamId;
                    }
                    else if (awayScore > homeScore) {
                        winnerId = awayTeamId;
                    }
                    else {
                        var hET = homeET !== null && homeET !== void 0 ? homeET : 0;
                        var aET = awayET !== null && awayET !== void 0 ? awayET : 0;
                        if (hET > aET) {
                            winnerId = homeTeamId;
                        }
                        else if (aET > hET) {
                            winnerId = awayTeamId;
                        }
                        else {
                            var hPen = homePen !== null && homePen !== void 0 ? homePen : 0;
                            var aPen = awayPen !== null && awayPen !== void 0 ? awayPen : 0;
                            if (hPen > aPen) {
                                winnerId = homeTeamId;
                            }
                            else if (aPen > hPen) {
                                winnerId = awayTeamId;
                            }
                        }
                    }
                }
            }
        }
        matches.push({
            id: "".concat(roundType, "-").concat(i + 1),
            round: roundType,
            slot: def.slot,
            homeTeamId: homeTeamId,
            awayTeamId: awayTeamId,
            homeScore: homeScore,
            awayScore: awayScore,
            homeET: homeET,
            awayET: awayET,
            homePen: homePen,
            awayPen: awayPen,
            winnerId: winnerId,
            played: played,
            isLive: isLive,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    };
    for (var i = 0; i < count; i++) {
        _loop_1(i);
    }
    return matches;
}
function getWinner(matchId, homeId, awayId, predictions) {
    if (!homeId || !awayId)
        return null;
    var p = predictions[matchId];
    if (!p)
        return null;
    if (p.home > p.away)
        return homeId;
    if (p.away > p.home)
        return awayId;
    // Extra Time
    if (p.homeET !== undefined && p.awayET !== undefined && p.homeET !== null && p.awayET !== null) {
        if (p.homeET > p.awayET)
            return homeId;
        if (p.awayET > p.homeET)
            return awayId;
    }
    // Penalties
    if (p.homePen !== undefined && p.awayPen !== undefined && p.homePen !== null && p.awayPen !== null) {
        if (p.homePen > p.awayPen)
            return homeId;
        if (p.awayPen > p.homePen)
            return awayId;
    }
    return homeId;
}
function buildRoundOf32(allMatches) {
    return buildFullKnockoutBracket(allMatches, {});
}
function createPlaceholderBracket() {
    var matches = [];
    exports.R32_DEFS.forEach(function (def) {
        matches.push({
            id: def.id,
            round: "r32",
            slot: def.slot,
            homeTeamId: null,
            awayTeamId: null,
            homeScore: null,
            awayScore: null,
            winnerId: null,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    exports.R16_DEFS.forEach(function (def) {
        matches.push({
            id: def.id,
            round: "r16",
            slot: def.slot,
            homeTeamId: null,
            awayTeamId: null,
            homeScore: null,
            awayScore: null,
            winnerId: null,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    exports.QF_DEFS.forEach(function (def) {
        matches.push({
            id: def.id,
            round: "qf",
            slot: def.slot,
            homeTeamId: null,
            awayTeamId: null,
            homeScore: null,
            awayScore: null,
            winnerId: null,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    exports.SF_DEFS.forEach(function (def) {
        matches.push({
            id: def.id,
            round: "sf",
            slot: def.slot,
            homeTeamId: null,
            awayTeamId: null,
            homeScore: null,
            awayScore: null,
            winnerId: null,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    exports.FINAL_DEFS.forEach(function (def) {
        matches.push({
            id: def.id,
            round: "final",
            slot: def.slot,
            homeTeamId: null,
            awayTeamId: null,
            homeScore: null,
            awayScore: null,
            winnerId: null,
            date: def.date,
            time: def.time,
            stadium: def.stadium,
        });
    });
    return matches;
}
function allGroupsComplete(allMatches, groupTableOverrides) {
    return tournament_1.GROUP_IDS.every(function (g) {
        if (groupTableOverrides && groupTableOverrides[g])
            return true;
        return (0, standings_1.groupMatchesComplete)((0, fixtures_1.getMatchesForGroup)(allMatches, g));
    });
}
function getGroupStandingsMap(allMatches, predictions, groupTableOverrides) {
    var map = {};
    var _loop_2 = function (group) {
        var teams = (0, teams_1.getTeamsByGroup)(group);
        var groupMatches = (0, fixtures_1.getMatchesForGroup)(allMatches, group);
        // Merge actual results with predictions for the standings calculation
        var effectiveMatches = groupMatches.map(function (m) {
            if (m.played)
                return m;
            var p = predictions[m.id];
            if (p) {
                return __assign(__assign({}, m), { homeScore: p.home, awayScore: p.away, played: true });
            }
            return m;
        });
        var standings = (0, standings_1.calculateStandingsFromMatches)(teams.map(function (t) { return t.id; }), effectiveMatches);
        // If there is an override for this group, sort by the manual order and assign synthetic stats
        if (groupTableOverrides && groupTableOverrides[group]) {
            var order = groupTableOverrides[group];
            var syntheticStats_1 = [
                { points: 9, won: 3, drawn: 0, lost: 0, goalsFor: 6, goalsAgainst: 1, goalDifference: 5, played: 3 },
                { points: 6, won: 2, drawn: 0, lost: 1, goalsFor: 4, goalsAgainst: 2, goalDifference: 2, played: 3 },
                { points: 3, won: 1, drawn: 0, lost: 2, goalsFor: 2, goalsAgainst: 4, goalDifference: -2, played: 3 },
                { points: 0, won: 0, drawn: 0, lost: 3, goalsFor: 0, goalsAgainst: 5, goalDifference: -5, played: 3 },
            ];
            standings = order.map(function (teamId, idx) {
                var stats = syntheticStats_1[idx] || { points: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, played: 3 };
                return __assign({ teamId: teamId }, stats);
            });
        }
        map[group] = standings;
    };
    for (var _i = 0, GROUP_IDS_3 = tournament_1.GROUP_IDS; _i < GROUP_IDS_3.length; _i++) {
        var group = GROUP_IDS_3[_i];
        _loop_2(group);
    }
    return map;
}
