import {AsciiArt} from "../../react/AsciiArt";
import Styles from "./TitlePage.module.css"
import {Button} from "../../react/Button";
import {closeDialogueEditor} from "./EditorRoot";
import {useEditor} from "./EditorContext";
import {useRef} from "react";

export function TitlePage() {
    const {store, setCurrentPage} = useEditor();
    const pickerRef = useRef<HTMLInputElement>(null);

    const recents = JSON.parse(localStorage.getItem("recents") ?? "[]") as string[];

    const openLocalFile = async (e) => {
        try {
            const file = e.target.files[0];
            e.target.value = null;

            const contents = await new Promise<string>((res, rej) => {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.onerror = rej;
                reader.onload = (e) => res(e.target.result as string);
            })

            const fileJs = JSON.parse(contents);

            if (await store.fileExists(fileJs.name)) {
                if (!confirm(`You already have a save file for ${fileJs.name}. Creating a new file will overwrite your local changes. Continue to create a new file?`)) {
                    return;
                }
            }

            await store.loadString(contents);
            setCurrentPage("editor")
        } catch (e) {
            console.log(e)
            alert("Unable to read the file you provided");
        }
    }

    return <div className={Styles.titlePage}>
        <AsciiArt name={"dialogue-editor/Title"} />
        Welcome to the Dialogue Editor. Here, you can create custom dialogue
        to be submitted for items from other games.
        <hr />
        <div className={Styles.recents}>
            <b>RECENT FILES</b>
            <div className={Styles.recentsList}>
                {recents.map(recent => <div
                    className={Styles.recent}
                    onClick={async () => {
                        try {
                            await store.loadFile(recent);
                            setCurrentPage("editor");
                        } catch {
                            alert("Unable to load the file");
                        }
                    }}
                >
                    {recent}
                </div>)}
            </div>
        </div>
        <hr />
        <div className={Styles.buttons}>
            <Button onClick={() => setCurrentPage("newFile")}>Create New File</Button>
            <Button onClick={() => pickerRef.current.click()}>Open Local File</Button>
            <div style={{flexGrow: 1}} />
            <Button onClick={() => closeDialogueEditor()}>Quit Dialogue Editor</Button>
        </div>
        <input className={Styles.picker} type={"file"} ref={pickerRef} onChange={openLocalFile} />
    </div>
}