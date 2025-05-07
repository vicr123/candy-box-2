import {ArchipelagoData} from "./useArchipelagoData";
import {TrackerDataPackageManager} from "./dataPackage";
import {useMemo} from "react";

export function useNavigationTracker({}: ArchipelagoData, datapackage: TrackerDataPackageManager) {
    const route = useMemo(() => {
        return datapackage.routeTo("POGO_STICK_SPOT");
    }, [datapackage.routeTo]);

    return {
        route
    }
}