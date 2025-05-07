import Styles from "./NavigationTracker.module.css"
import {useTracker} from "./useTrackerController";
import {ArchipelagoEntrance} from "../Archipelago";
import {useTranslation} from "react-i18next";

export function NavigationTracker() {
    const {
        navigation: {
            route,
            currentDestination,
            setCurrentDestination
        },
        dataPackageManager: {
            loadedDataPackage
        }
    } = useTracker();
    const {t} = useTranslation();

    return <div className={Styles.navigation}>
        <select onChange={e => setCurrentDestination(e.target.value as ArchipelagoEntrance)} value={currentDestination}>
            {Object.values(loadedDataPackage?.roomExits ?? {}).flat().map(exit => <option key={exit} value={exit}>{t(exit)}</option>)}
        </select>
        {route.map((location, i) => <div key={location}>{i+1}. {t(`nav_${location}`)}</div>)}
    </div>
}
