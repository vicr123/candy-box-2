import {ArchipelagoData} from "./useArchipelagoData";
import {TrackerDataPackageManager} from "./dataPackage";
import {useMemo, useState} from "react";
import {ArchipelagoEntrance} from "../Archipelago";

export function useNavigationTracker({}: ArchipelagoData, datapackage: TrackerDataPackageManager) {
    const [currentDestination, setCurrentDestination] = useState<ArchipelagoEntrance>()

    const route = useMemo(() => {
        return datapackage.routeTo(currentDestination);
    }, [datapackage.routeTo]);

    return {
        route,
        currentDestination,
        setCurrentDestination,
    }
}