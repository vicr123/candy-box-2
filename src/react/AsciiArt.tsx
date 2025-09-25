import Styles from "./AsciiArt.module.css"
import {useMemo} from "react";
import {Database} from "../main/Database";

export function AsciiArt({name}: {
    name: string
}) {
    const artContents = useMemo(() => {
        return Database.getAscii(name).join("\n");
    }, [name]);

    return <div className={Styles.asciiArt}>
        {artContents}
    </div>
}