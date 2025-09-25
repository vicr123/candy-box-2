import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {FileStore} from "./FileStore";

type EditorContextPage = "title" | "newFile" | "newFileConnect" | "editor";

export interface EditorContextInterface {
    currentPage: EditorContextPage,
    setCurrentPage: Dispatch<SetStateAction<EditorContextPage>>,
    store: FileStore
}

export const EditorContext = createContext<EditorContextInterface>(undefined);

export function useEditor() {
    return useContext(EditorContext);
}