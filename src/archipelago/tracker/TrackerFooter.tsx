import Styles from "./TrackerFooter.module.css"
import {useTracker} from "./useTrackerController";
import {useTranslation} from "react-i18next";

function Tab({text, onClick, selected}: {
    text: string,
    onClick: () => void,
    selected?: boolean
}) {
    return <span className={[Styles.tab, ...(selected ? [Styles.selected] : [])].join(" ")} onClick={onClick}>{text}</span>
}

export function TrackerFooter() {
    const {currentTab, setCurrentTab} = useTracker();
    const {t} = useTranslation();

    return <div className={Styles.footer}>
        |<Tab onClick={() => setCurrentTab("locations")} text={t("tabLocations")} selected={currentTab == "locations"} />
        |<Tab onClick={() => setCurrentTab("navigation")} text={t("tabNavigation")} selected={currentTab == "navigation"} />
        |<Tab onClick={() => setCurrentTab("items")} text={t("tabItems")} selected={currentTab == "items"} />
        |
    </div>
}