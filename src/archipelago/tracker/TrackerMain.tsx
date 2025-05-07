import { createRoot } from "react-dom/client";
import {StrictMode, useEffect, useState} from "react";
import {Archipelago} from "../Archipelago";
import {TrackerWindow} from "./TrackerWindow";
import {I18nextProvider} from "react-i18next";
import {i18n} from "../../i18n";
import {TrackerContext, useTrackerController} from "./useTrackerController";

createRoot(document.getElementById("trackerRoot")!).render(<StrictMode>
    <TrackerApp />
</StrictMode>)

function TrackerApp() {
    const [trackerOpen, setTrackerOpen] = useState(false)
    const controller = useTrackerController();

    useEffect(() => {
        const updateTrackerOpen = () => {
            setTrackerOpen(Archipelago.trackerOpen.current)
        }

        Archipelago.events.on("trackerOpenChanged", updateTrackerOpen);
        return () => {
            Archipelago.events.off("trackerOpenChanged", updateTrackerOpen);
        }
    }, [])

    if (!trackerOpen) {
        return null;
    }

    return <I18nextProvider i18n={i18n} defaultNS={"tracker"}>
        <TrackerContext value={controller}>
            <TrackerWindow />
        </TrackerContext>
    </I18nextProvider>
}