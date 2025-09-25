import Styles from "./ReactRenderArea.module.css"
import {RenderArea} from "../main/RenderArea";

export function ReactRenderArea({
    renderArea
}: {
    renderArea: RenderArea;
}) {
    return <div className={Styles.root} dangerouslySetInnerHTML={{
        __html: renderArea.getForRendering()
    }} />
}