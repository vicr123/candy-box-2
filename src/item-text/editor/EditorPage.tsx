import Styles from "./EditorPage.module.css";
import {useEditor} from "./EditorContext";
import {EditorHeader} from "./editorComponents/EditorHeader";
import {EditorSidebar} from "./editorComponents/EditorSidebar";
import {EditableOccurrences, EditorMain} from "./editorComponents/EditorMain";
import {useCallback, useState} from "react";
import {ItemTextOccurrence} from "../ItemText";
import {KeyboardEvent} from "react";

export function EditorPage() {
    const [selectedItem, setSelectedItem] = useState("__instructions");
    const [selectedOccurrence, setSelectedOccurrence] = useState<ItemTextOccurrence>("merchantPre")

    const {store} = useEditor();

    const goUp = useCallback(() => {
        const items = Object.keys(store.store);
        const currentItem = items.findIndex(i => i === selectedItem);
        if (currentItem == 0) {
            setSelectedItem("__instructions");
        } else {
            const nextItem = items[currentItem - 1];
            if (nextItem) {
                setSelectedItem(nextItem);
            }
        }
    }, [store, selectedItem]);

    const goDown = useCallback(() => {
        const items = Object.keys(store.store);
        const currentItem = items.findIndex(i => i === selectedItem);
        if (currentItem == -1) {
            setSelectedItem(items[0]);
        } else {
            const nextItem = items[currentItem + 1];
            if (nextItem) {
                setSelectedItem(nextItem);
            }
        }
    }, [store, selectedItem]);

    const goLeft = useCallback(() => {
        const occurrences = Object.keys(EditableOccurrences) as (keyof typeof EditableOccurrences)[];
        const currentOccurrence = occurrences.findIndex(i => i === selectedOccurrence);
        const nextOccurrence = occurrences[currentOccurrence - 1];
        if (nextOccurrence) {
            setSelectedOccurrence(nextOccurrence);
            return true;
        } else {
            return false;
        }
    }, [selectedOccurrence]);

    const goRight = useCallback(() => {
        const occurrences = Object.keys(EditableOccurrences) as (keyof typeof EditableOccurrences)[];
        const currentOccurrence = occurrences.findIndex(i => i === selectedOccurrence);
        const nextOccurrence = occurrences[currentOccurrence + 1];
        if (nextOccurrence) {
            setSelectedOccurrence(nextOccurrence);
            return true;
        } else {
            return false;
        }
    }, [selectedOccurrence]);

    const onKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        if (e.getModifierState("Control") && e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();

            if (!goRight()) {
                goDown();
                setSelectedOccurrence(Object.keys(EditableOccurrences)[0] as keyof typeof EditableOccurrences)
            }
        } else if (e.getModifierState("Alt")) {
            if (e.key == "ArrowUp") {
                e.preventDefault();
                e.stopPropagation();

                goUp();
            } else if (e.key == "ArrowDown") {
                e.preventDefault();
                e.stopPropagation();

                goDown();
            } else if (e.key == "ArrowLeft") {
                e.preventDefault();
                e.stopPropagation();

                goLeft();
            } else if (e.key == "ArrowRight") {
                e.preventDefault();
                e.stopPropagation();

                goRight();
            }
        }
    }, [goUp, goDown, goLeft, goRight]);

    return <div className={Styles.root} onKeyDown={onKeyDown}>
        <EditorHeader />
        <EditorSidebar selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
        <EditorMain selectedItem={selectedItem} selectedOccurrence={selectedOccurrence} setSelectedOccurrence={setSelectedOccurrence} />
    </div>
}