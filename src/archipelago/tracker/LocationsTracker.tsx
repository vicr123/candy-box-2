import Styles from "./LocationsTracker.module.css"
import {useTracker} from "./useTrackerController";

export function LocationsTracker() {
    const {
        locations: {
            availableLocations
        },
    } = useTracker();

    return <div className={Styles.locations}>
        Connect to a slot to check locations

        {availableLocations.map(location => <div key={location}>{location}</div>)}
    </div>
}