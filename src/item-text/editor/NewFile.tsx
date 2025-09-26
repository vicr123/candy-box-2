import Styles from "./NewFile.module.css";
import {Button} from "../../react/Button";
import {useEditor} from "./EditorContext";
import {AsciiArt} from "../../react/AsciiArt";

export function NewFile() {
    const {setCurrentPage} = useEditor();

    return <div className={Styles.page}>
        <Button onClick={() => setCurrentPage("title")}>Go Back</Button>
        <AsciiArt name={"dialogue-editor/NewFile"} />
        How do you want to create a new file?
        <hr />
        <b>OPEN AN EXISTING GAME</b>
        If you want to change the dialogue for an existing game, you can download the dialogue for that game here
        <Button onClick={() => setCurrentPage("existingGame")}>Open an existing game</Button>
        <hr />
        <b>CONNECT TO A GAME</b>
        If Candy Box 2 doesn't have dialogue for the game you want to write for yet, connect to a multiworld with that game present.
        <Button onClick={() => setCurrentPage("newFileConnect")}>Connect to a game</Button>
    </div>
}