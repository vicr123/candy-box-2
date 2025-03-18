import {Client, Item, itemsHandlingFlags} from "archipelago.js";
import EventEmitter from "eventemitter3";
import {QuestLog} from "../main/QuestLog";
import {QuestLogMessage} from "../main/QuestLogMessage";
import {
    ArchipelagoItem,
    ArchipelagoItemBaseId,
    ArchipelagoLocation,
    ArchipelagoLocationRegion
} from "./ArchipelagoLocation";
import {san, sanitiseText} from "../utils";

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type ArchipelagoEventTypes = "connectionStatusChanged" | "apLogUpdated" | "itemToBeProcessed";

export type ArchipelagoEntrance = "Village House Enter Cellar" | "The Desert Click" | "The Bridge Click" | "The Octopus King Click" |
    "Naked Monkey Wizard Click" | "The Forest Click" | "Castle Entrance Click" | "Giant Nougat Monster Click" | "Castle Egg Room Click" |
    "Hell Room Click" | "The Developer Quest Click" | "The Teapot Quest Click";
export type ArchipelagoExit = "Village Cellar" | "The Desert" | "The Bridge" | "The Octopus King Quest" | "The Naked Monkey Wizard" |
    "The Forest" | "The Castle Entrance" | "The Giant Nougat Monster" | "The Castle Egg Room" | "Hell" | "The Developer Quest" | "The Teapot Quest";

type EntrancePairing = [ArchipelagoEntrance, ArchipelagoExit];

interface ArchipelagoSlotData {
    uuid: string;
    entranceInformation: EntrancePairing[]
}

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
    export let apLink = localStorage.getItem("apUrl") ?? "";
    export let apSlot = localStorage.getItem("apSlot") ?? "";
    export let apPassword = "";
    export let localSaveSlot = "";
    let slotData: ArchipelagoSlotData;

    export const client = new Client();
    export const events = new EventEmitter<ArchipelagoEventTypes>();
    export const apLog = new QuestLog(20, false);

    export let connectionStatus = createObservable<ConnectionStatus>("disconnected", events, "connectionStatusChanged");

    export async function connect() {
        try {
            connectionStatus.current = "connecting";
            // @ts-expect-error Slot data type is correct here
            slotData = await client.login<ArchipelagoSlotData>(apLink, apSlot, "Candy Box 2", {
                password: apPassword,
                tags: ["DeathLink"],
                items: itemsHandlingFlags.all
            });
            localSaveSlot = slotData.uuid;
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

    export async function scoutRoom(item: (keyof typeof ArchipelagoLocationRegion)[]) {
        if (connectionStatus.current != "connected") {
            return new ScoutResults([]);
        }

        const scoutIds: number[] = [];
        for (const room of item) {
            for (let i = ArchipelagoLocationRegion[room]; Object.values(ArchipelagoLocation).includes(i); i++) {
                scoutIds.push(i);
            }
        }

        return new ScoutResults(await client.scout(scoutIds, 0));
    }

    export function findExit(entrance: ArchipelagoEntrance) {
        return slotData.entranceInformation.find(([transitionEntrance]) => transitionEntrance == entrance)[1];
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

Archipelago.client.messages.on("message", content => console.log(content));
Archipelago.client.messages.on("chat", (message, player) => {
    for (const line of message.split("\n")) {
        if (player.name == Archipelago.client.name) {
            Archipelago.apLog.addMessage(new QuestLogMessage("", sanitiseText(line)));
        } else {
            Archipelago.apLog.addMessage(new QuestLogMessage(san`${player.name}: ${line}`));
        }
    }
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("serverChat", (message) => {
    for (const line of message.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(sanitiseText(line)));
    }
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("tutorial", (message) => {
    for (const line of message.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(sanitiseText(line)));
    }
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("userCommand", (message) => {
    for (const line of message.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(sanitiseText(line)));
    }
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("adminCommand", (message) => {
    for (const line of message.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(sanitiseText(line)));
    }
    Archipelago.events.emit("apLogUpdated");
})

window.archipelago = Archipelago;