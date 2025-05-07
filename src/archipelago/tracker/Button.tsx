import {ReactNode} from "react";
import Styles from "./Button.module.css"

export function Button({children, onClick}: {
    children: ReactNode,
    onClick?: () => void,
}) {
    return <div className={["asciiRealButton", Styles.button].join(" ")} onClick={onClick}>
        {children}
    </div>
}