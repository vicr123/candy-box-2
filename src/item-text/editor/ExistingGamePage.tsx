import {useEditor} from "./EditorContext";
import Styles from "./ExistingGamePage.module.css";
import {AsciiArt} from "../../react/AsciiArt";
import {Button} from "../../react/Button";
import {useEffect, useState} from "react";
import {fetchGameItemText} from "../ItemText";

export function ExistingGamePage() {
    const {store, setCurrentPage} = useEditor();

    const [games, setGames] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const meta = await fetch("/item-text/meta.json", {

            });
            setGames(Object.keys(await meta.json()));
        })()
    }, [])

    return <div className={Styles.page}>
        <Button onClick={() => setCurrentPage("newFile")}>Go Back</Button>
        <AsciiArt name={"dialogue-editor/NewFile"} />
        Choose a game to edit
        <hr />
        <div className={Styles.games}>
            <div className={Styles.gamesList}>
                {games.map(game => <div
                    className={Styles.game}
                    onClick={async () => {
                        if (await store.fileExists(game)) {
                            if (!confirm(`You already have a save file for ${game}. Creating a new file will overwrite your local changes. Continue to create a new file?`)) {
                                return;
                            }
                        }

                        try {
                            await store.loadNetwork(game);
                            setCurrentPage("editor");
                        } catch {
                            alert("Unable to load the file");
                        }
                    }}
                >
                    {game}
                </div>)}
            </div>
        </div>
    </div>
}