import {Client, Item} from "archipelago.js";
import EventEmitter from "eventemitter3";
import {QuestLog} from "../main/QuestLog";
import {QuestLogMessage} from "../main/QuestLogMessage";
import {ArchipelagoPlace} from "./ArchipelagoPlace";
import {
    ArchipelagoItem,
    ArchipelagoItemBaseId,
    ArchipelagoLocation,
    ArchipelagoLocationRegion
} from "./ArchipelagoLocation";

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type ArchipelagoEventTypes = "connectionStatusChanged" | "apLogUpdated";

function createObservable<T>(initialValue: T, eventEmitter: EventEmitter<ArchipelagoEventTypes>, event: ArchipelagoEventTypes) {
    let observable = {
        current: initialValue
    };

    return new Proxy(observable, {
        get(target: { current: T }, p: string | symbol, receiver: any): any {
            return target.current;
        },
        set(target: { current: T }, p: string | symbol, newValue: any, receiver: any): boolean {
            queueMicrotask(() => eventEmitter.emit(event, newValue))
            target.current = newValue;
            return true;
        }
    })
}

export namespace Archipelago {
    export let apLink = localStorage.getItem("apLink") ?? "";
    export let apSlot = localStorage.getItem("apSlot") ?? "";
    export let apPassword = "";

    export const client = new Client();
    export const events = new EventEmitter<ArchipelagoEventTypes>();
    export const apLog = new QuestLog(20, false);

    export let connectionStatus = createObservable<ConnectionStatus>("disconnected", events, "connectionStatusChanged");

    export async function connect() {
        try {
            connectionStatus.current = "connecting";
            await client.login(apLink, apSlot, "Candy Box 2", {
                password: apPassword,
                tags: ["DeathLink"]
            });
            connectionStatus.current = "connected";
        } catch {
            connectionStatus.current = "disconnected";
        }
    }

    export function sendMessage(message) {
        client.messages.say(message);
    }

    export function isChecked(location: keyof typeof ArchipelagoLocation) {
        return client.room.checkedLocations.includes(ArchipelagoLocation[location]);
    }

    export function itemCount(item: keyof typeof ArchipelagoItem) {
        return client.items.received.filter(x => x.id == ArchipelagoItem[item] + ArchipelagoItemBaseId).length;
    }

    export function check(check: keyof typeof ArchipelagoLocation) {
        client.check(ArchipelagoLocation[check]);
    }

    export async function scoutRoom(item: keyof typeof ArchipelagoLocationRegion) {
        const scoutIds: number[] = [];
        for (let i = ArchipelagoLocationRegion[item]; Object.values(ArchipelagoLocation).includes(i); i++) {
            scoutIds.push(i);
        }

        return new ScoutResults(await client.scout(scoutIds, 0));
    }
}

export class ScoutResults {
    private items: Item[];

    constructor(items: Item[]) {
        this.items = items;
    }

    findItem(location: keyof typeof ArchipelagoLocation) {
        return this.items.find(x => x.locationId == ArchipelagoLocation[location]);
    }
}

Archipelago.client.messages.on("message", content => {
    console.log(content);
    for (const line of content.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(line));
    }
    Archipelago.events.emit("apLogUpdated");
})

window.archipelago = Archipelago;