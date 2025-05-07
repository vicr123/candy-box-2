import Styles from "./NavigationTracker.module.css"
import {useTracker} from "./useTrackerController";
import {ArchipelagoData} from "./useArchipelagoData";
import {TrackerDataPackageManager} from "./dataPackage";

export function NavigationTracker() {
    const {
        navigation: {
            route
        }
    } = useTracker();

    return <div className={Styles.navigation}>
        {route.map(location => <div key={location}>{location}</div>)}
    </div>
}