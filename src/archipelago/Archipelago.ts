import { Client } from "archipelago.js";
import EventEmitter from "eventemitter3";
import {QuestLog} from "../main/QuestLog";
import {QuestLogMessage} from "../main/QuestLogMessage";
import {ArchipelagoPlace} from "./ArchipelagoPlace";

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
    export let apLink = "";
    export let apSlot = "";
    export let apPassword = "";

    export const client = new Client();
    export const events = new EventEmitter<ArchipelagoEventTypes>();
    export const apLog = new QuestLog(20, false);

    export let connectionStatus = createObservable<ConnectionStatus>("disconnected", events, "connectionStatusChanged");

    export async function connect() {
        try {
            connectionStatus.current = "connecting";
            await client.login(apLink, apSlot, undefined, {
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
}

Archipelago.client.messages.on("message", content => {
    console.log(content);
    for (const line of content.split("\n")) {
        Archipelago.apLog.addMessage(new QuestLogMessage(line));
    }
    Archipelago.events.emit("apLogUpdated");
})