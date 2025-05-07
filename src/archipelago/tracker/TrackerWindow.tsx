import { useRef } from "react";
import Draggable from "react-draggable";

import Styles from "./TrackerWindow.module.css"
import TrackerHeaderStyles from "./TrackerHeader.module.css"
import {TrackerHeader} from "./TrackerHeader";
import { TrackerFooter } from "./TrackerFooter";
import {useTracker} from "./useTrackerController";
import {LocationsTracker} from "./LocationsTracker";
import {NavigationTracker} from "./NavigationTracker";

export function TrackerWindow() {
    const {currentTab, rolledUp} = useTracker();
    const nodeRef = useRef<HTMLDivElement>({} as any);

    return <Draggable
        nodeRef={nodeRef}
        defaultPosition={{x: 100, y: 100}}
        handle={`.${TrackerHeaderStyles.trackerHeader}`}
    >
        <div ref={nodeRef} className={[Styles.trackerWindow, ...(rolledUp ? [Styles.rolledUp] : [])].join(" ")}>
            <TrackerHeader/>
            {!rolledUp && <>
                {currentTab == "locations" && <LocationsTracker />}
                {currentTab == "navigation" && <NavigationTracker />}
                <TrackerFooter/>
            </>}
        </div>
    </Draggable>
}