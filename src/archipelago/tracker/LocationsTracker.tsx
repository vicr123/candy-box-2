import { Button } from "../../react/Button";
import Styles from "./LocationsTracker.module.css"
import {useTracker} from "./useTrackerController";
import {useTranslation} from "react-i18next";

export function LocationsTracker() {
    const {
        locations: {
            availableLocations,
            isGoMode
        },
        navigation: {
            setCurrentDestination
        },
        dataPackageManager: {
            loadedDataPackage,
        },
        archipelagoData: {
            locationName,
            checkedLocations,
            allLocations
        },
        setCurrentTab
    } = useTracker();

    const {t} = useTranslation();

    return <div className={Styles.locations}>
        <span>{t("locationsChecked", {
            checked: checkedLocations.length,
            total: allLocations.length
        })}{isGoMode && <>&nbsp;<span className={Styles.goMode}>GO MODE!</span></>}</span>
        {availableLocations.length == 0 && <div className={Styles.noLocations}>{t("noLocations")}</div>}
        {availableLocations.length > 0 && <div className={Styles.locationsGrid}>
            {availableLocations.map(location => <div className={Styles.locationLine} key={location}>
                <span>{locationName(location)}</span>
                <Button onClick={() => {
                    setCurrentDestination(loadedDataPackage?.locationParents?.[location.toString()]);
                    setCurrentTab("navigation");
                }}>{t("findLocation")}</Button>
            </div>)}
        </div>}
    </div>
}