import Styles from "./EditorHeader.module.css"
import {useEditor} from "../EditorContext";
import {Button} from "../../../react/Button";

export function EditorHeader() {
    const {setCurrentPage, store} = useEditor();

    const downloadFile = () => {
        const blob = new Blob([store.getSaveFileContents()], {
            type: "application/json",
        })
        const e = document.createElement("a");
        e.href = URL.createObjectURL(blob);
        e.download = `${store.gameName}.json`;
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
    }

    return <div className={Styles.header}>
        <Button onClick={() => setCurrentPage("title")}>Quit</Button>
        <div style={{width: "12px"}} />
        {store.gameName}
        <div style={{width: "12px"}} />
        <Button onClick={downloadFile}>Export</Button>
    </div>
}