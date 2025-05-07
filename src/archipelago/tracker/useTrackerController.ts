import {createContext, useContext, useState} from "react";
import { useTrackerDataPackage } from "./dataPackage";
import {useLocationTracker} from "./locations";
import {useArchipelagoData} from "./useArchipelagoData";
import {useNavigationTracker} from "./navigation";

type TrackerTab = "locations" | "navigation" | "items";

export function useTrackerController() {
    const [currentTab, setCurrentTab] = useState<TrackerTab>("locations")

    const archipelagoData = useArchipelagoData();
    const dataPackageManager = useTrackerDataPackage(archipelagoData);
    const locations = useLocationTracker(archipelagoData, dataPackageManager);
    const navigation = useNavigationTracker(archipelagoData, dataPackageManager);

    return {
        currentTab,
        setCurrentTab,

        archipelagoData,
        dataPackageManager,
        locations,
        navigation,
    }
}

export type TrackerController = ReturnType<typeof useTrackerController>;

export const TrackerContext = createContext<TrackerController>(undefined!);

export function useTracker() {
    return useContext(TrackerContext);
}
