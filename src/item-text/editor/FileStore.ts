import {useCallback, useMemo, useReducer, useState} from "react";
import {GameItemText, ItemTextOccurrence} from "../ItemText";
import {Archipelago} from "../../archipelago/Archipelago";
import {Saving} from "../../main/Saving";

type DispatchFileStore = ["reset", GameItemText]
    | ["edit", string, ItemTextOccurrence, string];

export function useFileStore() {
    const [store, dispatchStore] = useReducer((store: GameItemText, args: DispatchFileStore) => {
        switch (args[0]) {
            case "reset":
                return args[1];
            case "edit":
                const [, item, occurrence, string] = args;
                return {
                    ...store,
                    [item]: {
                        ...store[item],
                        [occurrence]: string
                    }
                }
        }
    }, {});
    const [gameName, setGameName] = useState("");

    const getSaveFileContents = useCallback(() => {
        return JSON.stringify({
            name: gameName,
            store: store,
        }, null, 2);
    }, [store]);

    const reset = (items: string[]) => {
        dispatchStore(["reset", Object.fromEntries(items.map(item => [item, {}]))])
    }

    const edit = (item: string, occurrence: ItemTextOccurrence, string: string) => {
        dispatchStore(["edit", item, occurrence, string]);
    };

    const save = async () => {
        const rootOpfsDirectory = await navigator.storage.getDirectory();
        const dialogueEditorDirectory = await rootOpfsDirectory.getDirectoryHandle("dialogue-editor", {
            create: true
        });
        const savesDirectory = await dialogueEditorDirectory.getDirectoryHandle("saves", {
            create: true
        });
        const saveFile = await savesDirectory.getFileHandle(gameName, {
            create: true
        });

        const stream = await saveFile.createWritable();
        await stream.write(getSaveFileContents());
        await stream.close();

        const recents = JSON.parse(localStorage.getItem("recents") ?? "[]") as string[];
        localStorage.setItem("recents", JSON.stringify([gameName, ...recents.filter(x => x != gameName)]));
    }

    const loadFile = async (game: string) => {
        const rootOpfsDirectory = await navigator.storage.getDirectory();
        const dialogueEditorDirectory = await rootOpfsDirectory.getDirectoryHandle("dialogue-editor");
        const savesDirectory = await dialogueEditorDirectory.getDirectoryHandle("saves");
        const saveFile = await savesDirectory.getFileHandle(game);

        const file = await saveFile.getFile();
        const contents = JSON.parse(await file.text());
        console.log(contents);
        setGameName(contents.name);
        dispatchStore(["reset", contents.store]);
    }

    return {
        store,
        reset,
        edit,
        save,
        getSaveFileContents,
        loadFile,

        gameName,
        setGameName
    }
}

export type FileStore = ReturnType<typeof useFileStore>;