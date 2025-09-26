import Styles from "./EditorPage.module.css";
import {useEditor} from "./EditorContext";
import {EditorHeader} from "./editorComponents/EditorHeader";
import {EditorSidebar} from "./editorComponents/EditorSidebar";
import {EditorMain} from "./editorComponents/EditorMain";
import {useState} from "react";
import {ItemTextOccurrence} from "../ItemText";

export function EditorPage() {
    const [selectedItem, setSelectedItem] = useState("__instructions");
    const [selectedOccurrence, setSelectedOccurrence] = useState<ItemTextOccurrence>("merchantPre")

    return <div className={Styles.root}>
        <EditorHeader />
        <EditorSidebar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        <EditorMain selectedItem={selectedItem} selectedOccurrence={selectedOccurrence} setSelectedOccurrence={setSelectedOccurrence} />
    </div>
}