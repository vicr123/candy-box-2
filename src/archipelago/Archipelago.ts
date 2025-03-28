import {Client, Item, itemsHandlingFlags, LoginError} from "archipelago.js";
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
import {ArchipelagoNotification} from "./ArchipelagoNotificationTray";
import {Database} from "../main/Database";

declare const __LAST_TAG: string;
declare const __COMMITS_SINCE_LAST_TAG: string;

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type ArchipelagoEventTypes = "connectionStatusChanged" | "apLogUpdated" | "itemToBeProcessed" | "connectionErrorStringChanged" | "apCountdownChanged" | "expectedClientVersionChanged" | "apPageChanged";
export type ArchipelagoPlacePage = "connection" | "chat" | "hint";

export type ArchipelagoEntrance = "Village House Enter Cellar" | "The Desert Click" | "The Bridge Click" | "The Octopus King Click" |
    "Naked Monkey Wizard Click" | "The Forest Click" | "Castle Entrance Click" | "Giant Nougat Monster Click" | "Castle Egg Room Click" |
    "Hell Room Click" | "The Developer Quest Click" | "The Teapot Quest Click" | "Hole Click" | "The Xinopherydon Quest Click" |
    "The Ledge Room Quest Click" | "Castle Trap Room Click" | "The Sea Click" | "The X Potion Quest Click";
export type ArchipelagoExit = "Village Cellar" | "The Desert" | "The Bridge" | "The Octopus King Quest" | "The Naked Monkey Wizard" |
    "The Forest" | "The Castle Entrance" | "The Giant Nougat Monster" | "The Castle Egg Room" | "Hell" | "The Developer Quest" | "The Teapot Quest" |
    "The Hole" | "The Xinopherydon Quest" | "The Ledge Room Quest" | "The Trap Room" | "The Sea" | "The X Potion Quest";

type EntrancePairing = [ArchipelagoEntrance, ArchipelagoExit];

interface ArchipelagoSlotData {
    uuid: string;
    entranceInformation: EntrancePairing[];
    deathLink: number;
    expectedClientVersion: string;
    multipliers: {
        candies: number;
        lollipops: number;
    };
    prices: {
        candyMerchantHat: number;
        sorceressHat: number;
    };
    health: {
        teapot: number;
    }
    defaults: {
        weapon: number;
    }
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
    export let slotData: ArchipelagoSlotData;

    export const client = new Client();
    export const events = new EventEmitter<ArchipelagoEventTypes>();
    export const apLog = new QuestLog(30, false);
    export const apCountdown = createObservable(0, events, "apCountdownChanged");

    export const connectionStatus = createObservable<ConnectionStatus>("disconnected", events, "connectionStatusChanged");
    export const connectionError = createObservable<string>("", events, "connectionErrorStringChanged");
    export const expectedClientVersion = createObservable("", events, "expectedClientVersionChanged");

    export let apPage = createObservable<ArchipelagoPlacePage>("connection", events, "apPageChanged");

    export let equivalence: string[][] = [];

    export async function connect() {
        connectionError.current = "";
        try {
            connectionStatus.current = "connecting";
            // @ts-expect-error Slot data type is correct here
            slotData = await client.login<ArchipelagoSlotData>(apLink, apSlot, "Candy Box 2", {
                password: apPassword,
                items: itemsHandlingFlags.all
            });

            // Determine if the client version is acceptable
            const expectedVersion = `${__LAST_TAG}${__COMMITS_SINCE_LAST_TAG != "0" ? "+" : ""}`;

            // Find equivalence versions
            const equivalence = Archipelago.equivalence.find(e => e.includes(expectedVersion)) ?? [expectedVersion];

            if (slotData.expectedClientVersion && !equivalence.includes(slotData.expectedClientVersion)) {
                client.socket.disconnect();

                const newVersion = equivalence[equivalence.length - 1];
                const newEquivalence = Archipelago.equivalence.find(e => e.includes(newVersion)) ?? [newVersion];
                connectionError.current = "apConnectErrorVersion";
                expectedClientVersion.current = newEquivalence[newEquivalence.length - 1];
                connectionStatus.current = "disconnected";
                return;
            }

            localSaveSlot = slotData.uuid;

            if (slotData.deathLink) {
                client.deathLink.enableDeathLink()
            }

            connectionStatus.current = "connected";
            apPage.current = "chat";

            client.socket.on("disconnected", () => {
                connectionStatus.current = "disconnected";
                interruptGame(true);
            })
        } catch (e) {
            connectionStatus.current = "disconnected";

            if (e instanceof LoginError) {
                const loginError = e as LoginError;
                switch (loginError.errors[0]) {
                    case "InvalidSlot":
                        connectionError.current = "apConnectErrorSlot";
                        break;
                    case "InvalidGame":
                        connectionError.current = "apConnectErrorGame";
                        break;
                    case "IncompatibleVersion":
                        connectionError.current = "apConnectErrorVersion";
                        break;
                    case "InvalidPassword":
                        connectionError.current = "apConnectErrorPassword";
                        break;
                    case "InvalidItemsHandling":
                    default:
                        connectionError.current = "apConnectError";
                        break;
                }
            } else {
                connectionError.current = "apConnectError";
            }
            console.log(e);
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
            for (let i = ArchipelagoLocationRegion[room]; Object.values(ArchipelagoLocation).includes(i) || i == 0; i++) {
                if (i == 0) continue;
                scoutIds.push(i);
            }
        }

        return new ScoutResults(await client.scout(scoutIds, 0));
    }

    export function findExit(entrance: ArchipelagoEntrance) {
        return slotData.entranceInformation.find(([transitionEntrance]) => transitionEntrance == entrance)[1];
    }

    function interruptGame(isDisconnection: boolean) {
        const container = document.createElement("pre");
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.bottom = "0";
        container.style.left = "0";
        container.style.right = "0";
        container.style.background = "rgba(0, 0, 0, 0.8)"
        container.style.color = "white";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.flexDirection = "column";
        container.style.zIndex = "100";
        container.style.margin = "0";

        if (isDisconnection) {
            const errorMessage = document.createElement("span");
            errorMessage.innerText = Database.getText("apLostConnection");
            errorMessage.style.position = "static";
            container.appendChild(errorMessage)

            const lostConnectionTranslated = Database.getTranslatedText("apLostConnection");
            if (lostConnectionTranslated) {
                const errorMessageTranslated = document.createElement("i");
                errorMessageTranslated.innerText = lostConnectionTranslated
                errorMessageTranslated.style.position = "static";
                container.appendChild(errorMessageTranslated);
            }

            const spacing = document.createElement("span");
            spacing.innerText = " ";
            spacing.style.position = "static";
            container.appendChild(spacing)

            const button = document.createElement("span");
            button.classList.add("asciiRealButton");
            button.innerText = Database.getText("apReloadTryAgain")
            button.style.color = "black"
            button.style.position = "static";
            button.onclick = () => window.location.reload()
            container.appendChild(button);

            const reloadTryAgainTranslated = Database.getTranslatedText("apReloadTryAgain");
            if (reloadTryAgainTranslated) {
                const errorMessageTranslated = document.createElement("i");
                errorMessageTranslated.innerText = reloadTryAgainTranslated
                errorMessageTranslated.style.position = "static";
                container.appendChild(errorMessageTranslated);
            }

            document.body.style.pointerEvents = "initial";
        } else {
            const errorMessage = document.createElement("span");
            errorMessage.innerText = Database.getText("apWaitingForArchipelago");
            errorMessage.style.position = "static";
            container.appendChild(errorMessage)

            const errorMessageTranslatedString = Database.getTranslatedText("apWaitingForArchipelago");
            if (errorMessageTranslatedString) {
                const errorMessageTranslated = document.createElement("i");
                errorMessageTranslated.innerText = errorMessageTranslatedString
                errorMessageTranslated.style.position = "static";
                container.appendChild(errorMessageTranslated);
            }
        }

        document.body.appendChild(container);

        return container;
    }

    export function interruptAfterTimeout<T>(operation: Promise<T>) {
        return new Promise<T>((res, rej) => {
            const finishInterrupt = () => {
                document.body.style.pointerEvents = "initial";
                operation.then(res).catch(rej);
            }

            document.body.style.pointerEvents = "none";

            let interrupt: HTMLPreElement | undefined;
            let shouldRemoveInterrupt = false;
            let operationDone = false;

            const timeout = setTimeout(() => {
                interrupt = interruptGame(false);
                setTimeout(() => {
                    shouldRemoveInterrupt = true;
                    if (operationDone) {
                        interrupt.remove();
                        finishInterrupt();
                    }
                }, 1000);
            }, 1000);

            operation.finally(() => {
                clearTimeout(timeout);
                operationDone = true;
                if (!interrupt || shouldRemoveInterrupt) {
                    interrupt?.remove();
                    finishInterrupt();
                }
            })
        })
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
Archipelago.client.messages.on("itemSent", (_, item) => {
    Archipelago.apLog.addMessage(new QuestLogMessage(san`${item.sender.name} sent ${item.name} to ${item.receiver.name} (found at ${item.locationName})`));
})
Archipelago.client.messages.on("itemHinted", (_, item, found) => {
    Archipelago.apLog.addMessage(new QuestLogMessage(san`${item.name} is at ${item.sender.name}'s ${item.locationName}${found ? " (found)" : ""}`));
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("connected", (_, player, tags) => {
    Archipelago.apLog.addMessage(new QuestLogMessage(san`${player.name} joined playing ${player.game} - ${JSON.stringify(tags)}`));
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("disconnected", (_, player, tags) => {
    Archipelago.apLog.addMessage(new QuestLogMessage(san`${player.name} playing ${player.game} left - ${JSON.stringify(tags)}`));
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("countdown", (_, value, tags) => {
    Archipelago.apCountdown.current = value;
})

// Check equivalence
fetch("/equivalence.json")
    .then(response => response.json())
    .then(json => Archipelago.equivalence = json)
    .catch(err => {
        console.log("Unable to retrieve version equivalence information");
        console.log(err);
    })

window.archipelago = Archipelago;