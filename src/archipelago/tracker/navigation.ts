import {ArchipelagoData} from "./useArchipelagoData";
import {TrackerDataPackageManager} from "./dataPackage";
import {useEffect, useMemo, useState} from "react";
import {Archipelago, ArchipelagoEntrance} from "../Archipelago";

export function useNavigationTracker({}: ArchipelagoData, datapackage: TrackerDataPackageManager) {
    const [currentDestination, setCurrentDestination] = useState<ArchipelagoEntrance>()
    const [hideUndiscoveredLocation, setHideUndiscoveredLocation] = useState(true);
    const [locationDiscovered, setLocationDiscovered] = useState(false);

    useEffect(() => {
        setLocationDiscovered(false);
        setHideUndiscoveredLocation(true);

        Archipelago.isRoomVisited(currentDestination).then(isVisited => {
            setLocationDiscovered(isVisited);
        })
    }, [currentDestination]);

    const route = useMemo(() => {
        return datapackage.routeTo(currentDestination);
    }, [datapackage.routeTo]);

    return {
        route,

        currentDestination,
        setCurrentDestination,

        hideUndiscoveredLocation,
        setHideUndiscoveredLocation,

        locationDiscovered
    }
}