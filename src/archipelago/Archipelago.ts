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
import {energyLinkStorageName} from "./ArchipelagoEnergyLink";
import {GiftManager} from "./gifting/GiftManager";
import {Saving} from "../main/Saving";
import {GiftTraitType} from "./gifting/GiftTrait";
import { Gift } from "./gifting/Gift";
import {Game} from "../main/Game";
import {ArchipelagoSaving} from "./ArchipelagoSaving";

declare const __LAST_TAG: string;
declare const __COMMITS_SINCE_LAST_TAG: string;

type ConnectionStatus = "disconnected" | "connecting" | "connected";
type ArchipelagoEventTypes = "connectionStatusChanged" | "apLogUpdated" | "itemToBeProcessed" | "connectionErrorStringChanged" | "apCountdownChanged" | "expectedClientVersionChanged" | "apPageChanged" | "energyLinkUpdated" | "saveDataUpdated" | "trackerOpenChanged";
export type ArchipelagoPlacePage = "backupRestore" | "connection" | "chat" | "hint" | "tracker" | "startInterstitial";

export type ArchipelagoEntrance = "THE_CELLAR" | "THE_DESERT" | "THE_BRIDGE" | "THE_OCTOPUS_KING" |
    "THE_NAKED_MONKEY_WIZARD" | "THE_FOREST" | "THE_CASTLE_ENTRANCE" | "THE_GIANT_NOUGAT_MONSTER" | "THE_CASTLE_EGG_ROOM" |
    "HELL" | "THE_DEVELOPER" | "THE_TEAPOT" | "THE_HOLE" | "THE_XINOPHERYDON" |
    "THE_LEDGE_ROOM" | "THE_CASTLE_TRAP_ROOM" | "THE_SEA" | "THE_X_POTION" |
    "VILLAGE_SHOP" | "VILLAGE_MINIGAME" | "VILLAGE_FORGE" | "VILLAGE_FURNISHED_HOUSE" | "VILLAGE_QUEST_HOUSE" |
    "SQUIRREL_TREE" | "LONELY_HOUSE" | "DIG_SPOT" | "DESERT_FORTRESS" | "POGO_STICK_SPOT" | "SORCERESS_HUT" | "WISHING_WELL" |
    "CAVE" | "PIER" | "LIGHTHOUSE" | "HOLE" | "CASTLE" | "CASTLE_BAKEHOUSE" | "CASTLE_DARK_ROOM" | "DRAGON" | "TOWER" | "LOLLIPOP_FARM";

type EntrancePairing = [ArchipelagoEntrance, ArchipelagoEntrance];

export const lollipopCalorieExchangeRate = 47.3;
export const candyCalorieExchangeRate = 57.8;

interface ArchipelagoSlotData {
    uuid: string;
    entranceInformation: EntrancePairing[];
    deathLink: number;
    energyLink: number;
    gifting: number;
    expectedClientVersion: string;
    multiX: number;
    enableComputer: number;
    scouting: number;
    multipliers: {
        candies: number;
        candyDrops: number;
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
        grimoires: number;
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
    export const giftManager = new GiftManager(client);
    export const events = new EventEmitter<ArchipelagoEventTypes>();
    export const apLog = new QuestLog(30, false);
    export const apCountdown = createObservable(0, events, "apCountdownChanged");

    export const connectionStatus = createObservable<ConnectionStatus>("disconnected", events, "connectionStatusChanged");
    export const connectionError = createObservable<string>("", events, "connectionErrorStringChanged");
    export const expectedClientVersion = createObservable("", events, "expectedClientVersionChanged");

    export const trackerOpen = createObservable(false, events, "trackerOpenChanged");

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

            if (import.meta.env.PROD) {
                // Determine if the client version is acceptable
                const expectedVersion = `${__LAST_TAG}${__COMMITS_SINCE_LAST_TAG != "0" ? "+" : ""}`;

                // Find equivalence versions
                const equivalence = Archipelago.equivalence.find(e => e.includes(expectedVersion)) ?? [expectedVersion];

                if (slotData.expectedClientVersion && !equivalence.includes(slotData.expectedClientVersion)) {
                    client.socket.disconnect();

                    const newVersion = slotData.expectedClientVersion;
                    const newEquivalence = Archipelago.equivalence.find(e => e.includes(newVersion)) ?? [newVersion];
                    connectionError.current = "apConnectErrorVersion";
                    expectedClientVersion.current = newEquivalence[newEquivalence.length - 1];
                    connectionStatus.current = "disconnected";
                    return false;
                }
            }

            localSaveSlot = slotData.uuid;

            const tags = [];
            if (slotData.deathLink) {
                tags.push("DeathLink")
            }
            if (slotData.energyLink) {
                tags.push("EnergyLink")
                await client.storage.notify([energyLinkStorageName()], (key, value, oldValue) => {
                    if (key == energyLinkStorageName()) {
                        events.emit("energyLinkUpdated");
                    }
                });
            }
            if (slotData.gifting) {
                await giftManager.openGiftBox(false, [...new Set(sendableItems.flatMap(x => x.traits))]);
                // Process any gifts we might have received while we were offline
                for (const gift of Archipelago.giftManager.gifts()) {
                    await receiveGift(gift);
                }
            }
            client.updateTags(tags)

            await client.storage.notify([ArchipelagoSaving.saveStorageKey()], (key, value, oldValue) => {
                if (key == ArchipelagoSaving.saveStorageKey()) {
                    events.emit("saveDataUpdated");
                }
            });

            client.socket.on("disconnected", () => {
                connectionStatus.current = "disconnected";
                interruptGame(true);
            })
            return true;
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
            return false;
        }
    }

    export function finaliseConnection() {
        connectionStatus.current = "connected";
        apPage.current = "chat";
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

    export async function scoutRoom(item: (keyof typeof ArchipelagoLocationRegion)[], shouldHint: boolean) {
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

        return new ScoutResults(await client.scout(scoutIds, shouldHint && slotData.scouting ? 2 : 0));
    }

    export function findExit(entrance: ArchipelagoEntrance) {
        return slotData.entranceInformation.find(([transitionEntrance]) => transitionEntrance == entrance)?.[1] ?? entrance;
    }

    export function findEntrance(exit: ArchipelagoEntrance) {
        return slotData.entranceInformation.find(([, transitionExit]) => transitionExit == exit)?.[0] ?? exit;
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

    export async function receiveGift(gift: Gift) {
        if (!findCompatibleSendableItem(gift.traits.map(x => x.trait))) {
            // We don't understand this gift so refund it immediately
            if (gift.isRefund) {
                // Huh, this is a refund. We don't know what to do with this so just discard it
                await Archipelago.giftManager.claimGift(gift);
            } else {
                await Archipelago.giftManager.refundGift(gift);
            }
        }
    }

    function visitedRoomStorageKey() {
        return `CandyBox2VisitedRoom:${Archipelago.client.players.self.team}:${Archipelago.client.players.self.slot}`;
    }

    export function markVisitedRoom(room: ArchipelagoEntrance) {
        void client.storage.prepare(visitedRoomStorageKey(), [])
            .add([room])
            .commit(false);
    }

    export async function isRoomVisited(room: ArchipelagoEntrance) {
        if (Archipelago.connectionStatus.current != "connected") {
            return false;
        }

        const visitedRooms = await client.storage.fetch(visitedRoomStorageKey()) as ArchipelagoEntrance[];
        return visitedRooms.includes(room);
    }

    export function isGrimoireOption(type: "GRIMOIRE" | "SPELL", progressive?: boolean | undefined) {
        if (type == "GRIMOIRE") {
            if (progressive == true) {
                return Archipelago.slotData.defaults.grimoires == 1;
            } else if (progressive == false) {
                return Archipelago.slotData.defaults.grimoires == 0;
            } else {
                return Archipelago.slotData.defaults.grimoires == 0 || Archipelago.slotData.defaults.grimoires == 1;
            }
        } else {
            if (progressive == true) {
                return Archipelago.slotData.defaults.grimoires == 3;
            } else if (progressive == false) {
                return Archipelago.slotData.defaults.grimoires == 2;
            } else {
                return Archipelago.slotData.defaults.grimoires == 2 || Archipelago.slotData.defaults.grimoires == 3;
            }
        }
    }
}

export const sendableItems = [
    {
        id: "health",
        amount: () => Saving.loadNumber("questPlayerSpellHealthPotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellHealthPotionQuantity", Saving.loadNumber("questPlayerSpellHealthPotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellHealthPotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellHealthPotionQuantity", Saving.loadNumber("questPlayerSpellHealthPotionQuantity") + amount);
        },
        name: "Health Potion",
        traits: ["Consumable", "Drink", "Heal"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "turtle",
        amount: () => Saving.loadNumber("questPlayerSpellTurtlePotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellTurtlePotionQuantity", Saving.loadNumber("questPlayerSpellTurtlePotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellTurtlePotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellTurtlePotionQuantity", Saving.loadNumber("questPlayerSpellTurtlePotionQuantity") + amount);
        },
        name: "Turtle Potion",
        traits: ["Consumable", "Drink", "Slowness", "Armor"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "berserk",
        amount: () => Saving.loadNumber("questPlayerSpellBerserkPotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellBerserkPotionQuantity", Saving.loadNumber("questPlayerSpellBerserkPotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellBerserkPotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellBerserkPotionQuantity", Saving.loadNumber("questPlayerSpellBerserkPotionQuantity") + amount);
        },
        name: "Berserk Potion",
        traits: ["Consumable", "Drink", "Damage", "Buff"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "cloning",
        amount: () => Saving.loadNumber("questPlayerSpellCloningPotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellCloningPotionQuantity", Saving.loadNumber("questPlayerSpellCloningPotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellCloningPotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellCloningPotionQuantity", Saving.loadNumber("questPlayerSpellCloningPotionQuantity") + amount);
        },
        name: "Cloning Potion",
        traits: ["Consumable", "Drink", "Copy"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "p-potion",
        amount: () => Saving.loadNumber("questPlayerSpellPPotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellPPotionQuantity", Saving.loadNumber("questPlayerSpellPPotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellPPotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellPPotionQuantity", Saving.loadNumber("questPlayerSpellPPotionQuantity") + amount);
        },
        name: "P Potion",
        traits: ["Consumable", "Drink", "Random"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "x-potion",
        amount: () => Saving.loadNumber("questPlayerSpellXPotionQuantity"),
        send: (amount) => Saving.saveNumber("questPlayerSpellXPotionQuantity", Saving.loadNumber("questPlayerSpellXPotionQuantity") - amount),
        receive: (amount) => {
            Saving.saveBool("questPlayerSpellXPotionHasSpell", true);
            Saving.saveNumber("questPlayerSpellXPotionQuantity", Saving.loadNumber("questPlayerSpellXPotionQuantity") + amount);
        },
        name: "X Potion",
        traits: ["Consumable", "Drink", "Teleport", "Quest"],
        giftedAmount: (gift) => gift.amount
    },
    {
        id: "extra-hp",
        amount: () => undefined,
        send: () => void 0,
        receive: (amount, game) => {
            Saving.saveNumber("gameGiftHealth", Saving.loadNumber("gameGiftHealth") + amount);
            game.getPlayer().reCalcMaxHp();
        },
        name: "Extra HP",
        traits: ["Life"],
        giftedAmount: (gift) => Math.floor(gift.amount * (gift.traits.find(x => x.trait == "Life")?.quality ?? 1))
    }
] satisfies {
    id: string,
    amount: () => number | undefined,
    send: (amount: number) => void,
    receive: (amount: number, game: Game) => void,
    name: string,
    traits: GiftTraitType[],
    giftedAmount: (gift: Gift) => number
}[]

export function findCompatibleSendableItem(traits: GiftTraitType[]) {
    const items = sendableItems.map(item => {
        return {
            item: item,
            common: item.traits.filter(x => traits.includes(x)),
            missing: item.traits.filter(x => !traits.includes(x)),
            surplus: traits.filter(x => !item.traits.includes(x)),
        }
    })
    // First look for an item that has exactly the traits required
    const perfectMatch = items.find(x => x.missing.length == 0 && x.surplus.length == 0);
    if (perfectMatch) {
        return perfectMatch.item;
    }

    let maxSurplus = items.filter(item => item.missing.length == 0).reduce((acc, item )=> Math.max(acc, item.surplus.length), 0);
    const surplusOnly = items.flatMap(item => Array(maxSurplus + 1 - item.surplus.length).map(() => item))

    if (surplusOnly.length > 0)
        return surplusOnly[Math.floor(Math.random()*surplusOnly.length)].item

    let maxDistance = items.reduce((acc, item ) => Math.max(acc, item.missing.length + item.surplus.length), 0)
    const weightedItems = items
        .flatMap(item => Array(maxDistance + 1 - (item.surplus.length + item.surplus.length))
        .map(() => item))
        .filter(x => (x.missing.length + x.surplus.length) <= (traits.length * 1.5))

    if (weightedItems.length > 0)
        return weightedItems[Math.floor(Math.random()*weightedItems.length)].item

    return null;
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
Archipelago.client.messages.on("disconnected", (_, player) => {
    Archipelago.apLog.addMessage(new QuestLogMessage(san`${player.name} playing ${player.game} left.`));
    Archipelago.events.emit("apLogUpdated");
})
Archipelago.client.messages.on("countdown", (_, value, tags) => {
    Archipelago.apCountdown.current = value;
})

Archipelago.giftManager.on("giftReceived", (gift) => {
    Archipelago.receiveGift(gift);
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