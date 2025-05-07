import Styles from "./TrackerFooter.module.css"
import {useTracker} from "./useTrackerController";

function Tab({text, onClick, selected}: {
    text: string,
    onClick: () => void,
    selected?: boolean
}) {
    return <span className={[Styles.tab, ...(selected ? [Styles.selected] : [])].join(" ")} onClick={onClick}>{text}</span>
}

export function TrackerFooter() {
    const {currentTab, setCurrentTab} = useTracker();

    return <div className={Styles.footer}>
        |<Tab onClick={() => setCurrentTab("locations")} text={"Locations"} selected={currentTab == "locations"} />
        |<Tab onClick={() => setCurrentTab("navigation")} text={"Navigation"} selected={currentTab == "navigation"} />
        |<Tab onClick={() => setCurrentTab("items")} text={"Items"} selected={currentTab == "items"} />
        |
    </div>
}