import Styles from "./ReactRenderArea.module.css"
import {RenderArea} from "../main/RenderArea";
import {ReactNode} from "react";

export function ReactRenderArea({
    renderArea,
    notificationArea
}: {
    renderArea: RenderArea;
    notificationArea: ReactNode
}) {
    return <div className={Styles.root}>
        <div dangerouslySetInnerHTML={{
            __html: renderArea.getForRendering()
        }} />
        {notificationArea}
    </div>
}