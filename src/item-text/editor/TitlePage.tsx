import {AsciiArt} from "../../react/AsciiArt";
import Styles from "./TitlePage.module.css"
import {Button} from "../../react/Button";
import {closeDialogueEditor} from "./EditorRoot";
import {useEditor} from "./EditorContext";

export function TitlePage() {
    const {store, setCurrentPage} = useEditor();

    const recents = JSON.parse(localStorage.getItem("recents") ?? "[]") as string[];

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
            <Button>Open Local File</Button>
            <div style={{flexGrow: 1}} />
            <Button onClick={() => closeDialogueEditor()}>Quit Dialogue Editor</Button>
        </div>
    </div>
}