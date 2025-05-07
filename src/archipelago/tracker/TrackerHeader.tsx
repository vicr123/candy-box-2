import Styles from "./TrackerHeader.module.css"
import {Archipelago} from "../Archipelago";
import {useTranslation} from "react-i18next";

export function TrackerHeader() {
    const {t} = useTranslation();

    return <div className={Styles.trackerHeader}>
        <div>{t("tracker")}</div>
        <div style={{flexGrow: 1}} />
        <div className={Styles.closeButton} onClick={() => Archipelago.trackerOpen.current = false}>x</div>
    </div>
}