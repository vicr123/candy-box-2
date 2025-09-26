import Styles from "./Editor.module.css"
import {EditorContext, EditorContextInterface} from "./EditorContext";
import {useState} from "react";
import {TitlePage} from "./TitlePage";
import {NewFile} from "./NewFile";
import {NewFileConnect} from "./NewFileConnect";
import {useFileStore} from "./FileStore";
import {EditorPage} from "./EditorPage";
import {ExistingGamePage} from "./ExistingGamePage";

export function Editor() {
    const [currentPage, setCurrentPage] = useState<EditorContextInterface["currentPage"]>("title")
    const store = useFileStore();

    return <EditorContext value={{
        currentPage: currentPage,
        setCurrentPage,
        store
    }}>
        <div className={Styles.root}>
            {currentPage === "title" ?
                <TitlePage />
            : currentPage == "newFile" ?
                <NewFile />
            : currentPage == "newFileConnect" ?
                <NewFileConnect />
            : currentPage == "existingGame" ?
                <ExistingGamePage />
            : currentPage == "editor" ?
                <EditorPage />
            : null}
        </div>
    </EditorContext>
}