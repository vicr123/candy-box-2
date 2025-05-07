import {useEffect, useMemo, useState} from "react";
import {ArchipelagoData} from "./useArchipelagoData";
import {TrackerDataPackageManager} from "./dataPackage";

export function useLocationTracker({missingLocations}: ArchipelagoData, datapackage: TrackerDataPackageManager) {
    const availableLocations = useMemo(() => {
        return missingLocations
            .filter(location => datapackage.evaluateRule(datapackage.loadedDataPackage.rules.locations[location]))
            .filter(location => {
                const locationParent = datapackage.loadedDataPackage?.locationParents?.[location.toString()];
                if (!locationParent) {
                    return true;
                }

                return datapackage.roomReachable(locationParent);
            })
    }, [missingLocations]);

    return {
        availableLocations,
    }
}