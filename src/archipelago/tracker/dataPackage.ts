import {useCallback, useEffect, useState} from "react";

import _20250430_1plus from "./data-packages/20250430-1plus.json"
import {ArchipelagoData} from "./useArchipelagoData";
import {ArchipelagoEntrance} from "../Archipelago";

type ArchipelagoRoom = ArchipelagoEntrance | "VILLAGE" | "WORLD_MAP";

interface TrackerDataPackage {
    expectedClientVersion: string;
    locations: Record<string, string>
    locationParents: Record<string, ArchipelagoEntrance>
    roomExits: Record<ArchipelagoRoom, ArchipelagoEntrance[]>
    rules: TrackerRulesDataPackage;
}

interface TrackerRulesDataPackage {
    locations: Record<string, TrackerRuleExpression>
    rooms: Record<string, TrackerRuleExpression>
}

type TrackerRuleExpression =
    // Constant Expression
    // "constant", true/false
    ["constant", boolean] |

    // Item Expression
    // "item", item code, number required
    ["item", number, number] |

    // Room Expression
    // "room", room code
    ["room", ArchipelagoRoom] |

    // Count Expression
    // "count", item, inequality, number required
    // inequality: 0 = equal to
    //             1 = less than
    //             2 = less than or equal to
    //             3 = greater than
    //             4 = greater than or equal to
    ["count", string, 0 | 1 | 2 | 3 | 4, number] |

    // Start Weapon Expression
    // "startWeapon", item code
    ["startWeapon", number] |

    // Boolean Expression
    // expression type, operand 1, operand 2
    ["and", TrackerRuleExpression, TrackerRuleExpression] |
    ["or", TrackerRuleExpression, TrackerRuleExpression] |

    // Unary Expression
    // expression type, operand
    ["not", TrackerRuleExpression];

const CandyBox2BaseId = 7665000;

function coreReachable(archipelagoData: ArchipelagoData, loadedDataPackage: TrackerDataPackage, room: ArchipelagoRoom) {
    if (room == "VILLAGE" || room == "WORLD_MAP") {
        return true;
    }

    const route = coreRouteTo(archipelagoData, loadedDataPackage, room);
    for (const step of route) {
        const rule = loadedDataPackage.rules.rooms[step];
        if (rule) {
            if (!coreEvaluate(archipelagoData, loadedDataPackage, rule)) {
                return false;
            }
        }
    }
    return true;
}

function coreEvaluate(archipelagoData: ArchipelagoData, loadedDataPackage: TrackerDataPackage, expression: TrackerRuleExpression) {
    switch (expression[0]) {
        case "constant":
            return expression[1];
        case "item": {
            const [, item, count] = expression;
            if (item == CandyBox2BaseId + 62) {
                // Special case Progressive Weapon
                // This check becomes false if progressive weapons aren't enabled
                if (!archipelagoData.progressiveWeaponsOn) return false;
            }
            return archipelagoData.claimedItemCount(item) >= count;
        }
        case "room":
            const [, room] = expression;
            return coreReachable(archipelagoData, loadedDataPackage, room);
        case "count":
            const [, item, inequality, count] = expression;
            const itemCount =
                item == "lollipop" ? archipelagoData.claimedItemCount(CandyBox2BaseId + 1) + archipelagoData.claimedItemCount(CandyBox2BaseId + 50) * 3:
                item == "chocolate" ? archipelagoData.claimedItemCount(CandyBox2BaseId + 2) + archipelagoData.claimedItemCount(CandyBox2BaseId + 45) * 4 + archipelagoData.claimedItemCount(CandyBox2BaseId + 51) * 3 :
                0

            switch (inequality) {
                case 0:
                    return itemCount < count;
                case 1:
                    return itemCount <= count;
                case 2:
                    return itemCount === count;
                case 3:
                    return itemCount >= count;
                case 4:
                    return itemCount > count;
                default:
                    return false;
            }
        case "startWeapon":
            const [, weaponItem] = expression;
            return archipelagoData.startingWeapon == weaponItem - CandyBox2BaseId;
        case "and":
            return coreEvaluate(archipelagoData, loadedDataPackage, expression[1]) && coreEvaluate(archipelagoData, loadedDataPackage, expression[2]);
        case "or":
            return coreEvaluate(archipelagoData, loadedDataPackage, expression[1]) || coreEvaluate(archipelagoData, loadedDataPackage, expression[2]);
        case "not":
            return !coreEvaluate(archipelagoData, loadedDataPackage, expression[1])
    }
}

function coreRouteTo(archipelagoData: ArchipelagoData, loadedDataPackage: TrackerDataPackage, room: ArchipelagoEntrance): ArchipelagoRoom[] {
    // Find this room in ER and go to its entrance
    const entranceTaken = archipelagoData.entranceRandomisationData.find(([, destination]) => destination == room)?.[0] as ArchipelagoEntrance ?? room;
    if (entranceTaken == "THE_X_POTION") {
        return [entranceTaken]
    }

    // Find the entrance in the possibility graph
    const parentRoom = Object.entries(loadedDataPackage.roomExits).find(([, entrances]) => entrances.includes(entranceTaken))?.[0] as ArchipelagoRoom ?? room;
    if (!parentRoom) {
        return [];
    }

    if (parentRoom == "VILLAGE" || parentRoom == "WORLD_MAP" || parentRoom == "THE_X_POTION") {
        return [parentRoom, entranceTaken]
    } else {
        return [...coreRouteTo(archipelagoData, loadedDataPackage, parentRoom), entranceTaken];
    }
}

export function useTrackerDataPackage(archipelagoData: ArchipelagoData) {
    const [loadedDataPackage, setLoadedDataPackage] = useState<TrackerDataPackage>();

    const loadDataPackage = (version: string) => {
        setLoadedDataPackage(_20250430_1plus as unknown as TrackerDataPackage);
    }

    const evaluateRule = useCallback((expression: TrackerRuleExpression | undefined) => {
        if (!expression) return true;
        return coreEvaluate(archipelagoData, loadedDataPackage, expression);
    }, [archipelagoData]);

    const routeTo = useCallback((room: ArchipelagoEntrance) => {
        if (!loadedDataPackage) return [];
        return coreRouteTo(archipelagoData, loadedDataPackage, room)
    }, [archipelagoData, loadedDataPackage]);

    const roomReachable = useCallback((room: ArchipelagoRoom) => {
        return coreReachable(archipelagoData, loadedDataPackage, room);
    }, [routeTo, evaluateRule]);

    useEffect(() => {
        loadDataPackage("20250430-1plus");
    }, []);

    return {
        loadDataPackage,
        loadedDataPackage,

        evaluateRule,
        routeTo,
        roomReachable
    }
}

export type TrackerDataPackageManager = ReturnType<typeof useTrackerDataPackage>;