import Styles from "./NewFileConnect.module.css"
import {useEditor} from "./EditorContext";
import {Button} from "../../react/Button";
import {AsciiArt} from "../../react/AsciiArt";
import {useState} from "react";
import {Client, LoginError} from "archipelago.js";

export function NewFileConnect() {
    const {setCurrentPage, store} = useEditor();

    const [server, setServer] = useState("");
    const [slot, setSlot] = useState("");
    const [password, setPassword] = useState("");

    const [connecting, setConnecting] = useState(false)
    const [connectionError, setConnectionError] = useState("");

    const startDownload = async () => {
        setConnecting(true);
        try {
            const client = new Client();
            await client.login(server, slot, undefined, {
                tags: ["TextOnly"]
            });

            const dataPackage = client.package.findPackage(client.game);
            store.setGameName(client.game);
            store.reset(Object.keys(dataPackage.itemTable));

            setCurrentPage("editor");
        } catch (e) {
            if (e instanceof LoginError) {
                const loginError = e as LoginError;
                switch (loginError.errors[0]) {
                    case "InvalidSlot":
                        setConnectionError("Check the slot name and try again.");
                        break;
                }
            } else {
                setConnectionError("Unable to connect to Archipelago. Check your parameters and try again.");
            }
        } finally {
            setConnecting(false);
        }
    };

    if (connecting) {
        return <div className={Styles.page}>
            One moment please...
        </div>
    }

    return <div className={Styles.page}>
        <Button onClick={() => setCurrentPage("newFile")}>Go Back</Button>
        <AsciiArt name={"text/Archipelago"} />

        Archipelago Server and port
        <input type={"text"} placeholder={"archipelago.gg:12345"} value={server} onChange={(e) => setServer(e.target.value)} />

        Archipelago Slot Name
        <input type={"text"} value={slot} onChange={(e) => setSlot(e.target.value)} />

        Archipelago Password (Optional)
        <input type={"text"} value={password} onChange={(e) => setPassword(e.target.value)} />

        <Button onClick={startDownload}>Download Game Information</Button>

        {connectionError}
    </div>
}