import Styles from "./NavigationTracker.module.css"
import {useTracker} from "./useTrackerController";
import {ArchipelagoEntrance} from "../Archipelago";
import {useTranslation} from "react-i18next";
import { Button } from "../../react/Button";

export function NavigationTracker() {
    const {
        navigation: {
            route,
            currentDestination,
            setCurrentDestination,
            hideUndiscoveredLocation,
            setHideUndiscoveredLocation,
            locationDiscovered
        },
        dataPackageManager: {
            loadedDataPackage
        }
    } = useTracker();
    const {t} = useTranslation();

    return <div className={Styles.navigation}>
        <select className={Styles.selection} onChange={e => setCurrentDestination(e.target.value as ArchipelagoEntrance)} value={currentDestination}>
            {Object.values(loadedDataPackage?.roomExits ?? {}).flat().sort((a, b) => t(a).localeCompare(t(b))).map(exit => <option key={exit} value={exit}>{t(exit)}</option>)}
        </select>
        {hideUndiscoveredLocation && !locationDiscovered ? <div className={[Styles.navigationBody, Styles.navigationNotFound].join(" ")}>
            <div>{t("locationNotDiscovered")}</div>
            <Button onClick={() => setHideUndiscoveredLocation(false)}>{t("showRouteAnyway")}</Button>
        </div> : <div className={[Styles.navigationBody, Styles.navigationList].join(" ")}>
            {route.map((location, i) => <div key={location}>{i+1}. {t(`nav_${location}`)}</div>)}
        </div>}
    </div>
}
