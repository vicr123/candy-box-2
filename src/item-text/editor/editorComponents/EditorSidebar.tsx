import Styles from "./EditorSidebar.module.css"
import {useEditor} from "../EditorContext";
import {Dispatch, SetStateAction} from "react";
import {EditableOccurrences} from "./EditorMain";

export function EditorSidebar({
    selectedItem, setSelectedItem,
}: {
    selectedItem: string,
    setSelectedItem: Dispatch<SetStateAction<string>>
}) {
    const {store} = useEditor();

    return <div className={Styles.sidebar}>
        <div className={[Styles.item, ...(selectedItem == "__instructions" ? [Styles.selected] : [])].join(" ")} onClick={() => setSelectedItem("__instructions")}>Guide</div>
        <div style={{height: "10px"}} />
        <b>ITEMS</b>
        <div className={Styles.items}>
            {Object.keys(store.store).map(item => <div
                className={[Styles.item, ...(selectedItem == item ? [Styles.selected] : [])].join(" ")}
                onClick={() => setSelectedItem(item)}>
                {item}
                <div className={Styles.doneList}>
                    {Object.entries(EditableOccurrences).map(([occurrence, details]) => {
                        const done = store.store[item][occurrence];
                        return <div
                            className={done ? Styles.done : Styles.notDone}
                            title={done ? `${details.name}: Done` : `${details.name}: Not Done`}
                        />;
                    })}
                </div>
            </div>)}
        </div>
    </div>
}