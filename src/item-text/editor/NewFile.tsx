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
        <b>CONNECT TO A GAME</b>
        Connect to an Archipelago session and download the game data.
        <Button onClick={() => setCurrentPage("newFileConnect")}>Connect to a game</Button>
        <hr />
        <b>OPEN AN EXISTING GAME</b>
        Choose from a list of games that already have strings
        <Button>Open an existing game</Button>
    </div>
}