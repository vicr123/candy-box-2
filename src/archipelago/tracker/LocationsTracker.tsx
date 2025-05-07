import Styles from "./LocationsTracker.module.css"
import {useTracker} from "./useTrackerController";
import {useTranslation} from "react-i18next";

export function LocationsTracker() {
    const {
        locations: {
            availableLocations
        },
    } = useTracker();

    const {t} = useTranslation();

    return <div className={Styles.locations}>
        {availableLocations.length == 0 && <div className={Styles.noLocations}>{t("noLocations")}</div>}
        {availableLocations.map(location => <div key={location}>{location}</div>)}
    </div>
}