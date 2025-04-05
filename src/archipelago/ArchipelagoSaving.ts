import { Saving } from "../main/Saving";
import {Archipelago} from "./Archipelago";

interface SavePackage {
    date: number,
    data: {
        [key: string]: string | boolean | number;
    }
}

export namespace ArchipelagoSaving{
    export function saveStorageKey() {
        return `CandyBox2SaveData:${Archipelago.client.players.self.team}:${Archipelago.client.players.self.slot}`;
    }

    export async function save() {
        const savePackage = {
            date: new Date().getTime(),
            data: {
                ...Saving.getAllBools(),
                ...Saving.getAllNumbers(),
                ...Saving.getAllStrings(),
            }
        } satisfies SavePackage;

        await Archipelago.client.storage.prepare(saveStorageKey(), {}).update(savePackage).commit(false);
        return true;
    }

    export function lastDate() {
        const savePackage = Archipelago.client.storage.store[saveStorageKey()] as unknown as SavePackage;
        if (!savePackage?.date) {
            return undefined;
        }

        return new Date(savePackage.date);
    }

    export async function load() {
        const savePackage = Archipelago.client.storage.store[saveStorageKey()] as unknown as SavePackage;
        if (!savePackage?.date) {
            return false;
        }

        // Load bools
        for(const str in Saving.getAllBools()){
            Saving.saveBool(str, savePackage.data[str] as boolean);
        }

        // Load numbers
        for(const str in Saving.getAllNumbers()){
            Saving.saveNumber(str, savePackage.data[str] as number);
        }

        // Load strings
        for(const str in Saving.getAllStrings()){
            Saving.saveString(str, savePackage.data[str] as string);
        }
    }

    export function haveSave() {
        const savePackage = Archipelago.client.storage.store[saveStorageKey()] as unknown as SavePackage;
        return !!savePackage?.date;
    }
}