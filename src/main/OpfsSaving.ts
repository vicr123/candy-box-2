import {Archipelago} from "../archipelago/Archipelago";
import {Saving} from "./Saving";
import {loadString} from "./LocalSaving";

interface SaveFile {
    date: string,
    slot: string,
    bools: Record<string, boolean>,
    numbers: Record<string, number>,
    strings: Record<string, string>,
}

export module OpfsSaving {
    export async function load() {
        if (!Archipelago.localSaveSlot) return;

        try {
            const rootOpfsDirectory = await navigator.storage.getDirectory();
            const saveFilesDirectory = await rootOpfsDirectory.getDirectoryHandle("saves", {
                create: true
            });
            const saveFile = await saveFilesDirectory.getFileHandle(Archipelago.localSaveSlot);
            const file = await saveFile.getFile();
            const saveFileData = JSON.parse(await file.text()) as SaveFile;

            // Load bools
            for(const str in Saving.getAllBools()){
                Saving.saveBool(str, saveFileData.bools[str]);
            }

            // Load numbers
            for(const str in Saving.getAllNumbers()){
                Saving.saveNumber(str, saveFileData.numbers[str]);
            }

            // Load strings
            for(const str in Saving.getAllStrings()){
                Saving.saveString(str, saveFileData.strings[str]);
            }

            // No error, return true
            return true;
        } catch {
            return false;
        }
    }

    export async function haveSave() {
        if (!Archipelago.localSaveSlot) return false;

        try {
            const rootOpfsDirectory = await navigator.storage.getDirectory();
            const saveFilesDirectory = await rootOpfsDirectory.getDirectoryHandle("saves", {
                create: true
            });
            const saveFile = await saveFilesDirectory.getFileHandle(Archipelago.localSaveSlot);
            return true;
        } catch {
            return false;
        }
    }

    export async function save() {
        const rootOpfsDirectory = await navigator.storage.getDirectory();
        const saveFilesDirectory = await rootOpfsDirectory.getDirectoryHandle("saves", {
            create: true
        });
        const saveFile = await saveFilesDirectory.getFileHandle(Archipelago.localSaveSlot, {
            create: true
        });

        const stream = await saveFile.createWritable();
        await stream.write(JSON.stringify({
            date: getDateAsString(),
            slot: Archipelago.client.name,

            bools: Saving.getAllBools(),
            numbers: Saving.getAllNumbers(),
            strings: Saving.getAllStrings()
        } satisfies SaveFile));
        await stream.close();

        // No error, return true
        return true;
    }

    export async function erase() {
        const rootOpfsDirectory = await navigator.storage.getDirectory();
        const saveFilesDirectory = await rootOpfsDirectory.getDirectoryHandle("saves", {
            create: true
        });
        await saveFilesDirectory.removeEntry(Archipelago.localSaveSlot);
        window.location.reload();
    }

    export async function eraseAll() {
        const rootOpfsDirectory = await navigator.storage.getDirectory();
        await rootOpfsDirectory.removeEntry("saves", {
            recursive: true
        })
        window.location.reload();
    }

    // Private functions
    function getDateAsString(): string{
        var currentdate: Date = new Date();
        return (currentdate.getDate() < 10? "0":"") // 0 before day
            + currentdate.getDate() // Day
            + "/"
            + (currentdate.getMonth()+1 < 10? "0":"") // 0 before month
            + (currentdate.getMonth()+1) // month
            + "/"
            + currentdate.getFullYear() // year
            + " @ "
            + (currentdate.getHours() < 10? "0":"") // 0 before hours
            + currentdate.getHours() // hour
            + ":"
            + (currentdate.getMinutes() < 10? "0":"") // 0 before minutes
            + currentdate.getMinutes() // minutes
            + ":"
            + (currentdate.getSeconds() < 10? "0":"") // 0 before seconds
            + currentdate.getSeconds(); // seconds
    }
}