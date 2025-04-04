import {Client, EventBasedManager} from "archipelago.js";
import {GiftEvents} from "./GiftEvents";
import {GiftTraitType} from "./GiftTrait";
import {GiftBox, NetworkGiftBox} from "./GiftBox";
import {Gift, NetworkGift} from "./Gift";
import {Archipelago} from "../Archipelago";
import client = Archipelago.client;

type GiftBoxWithNoVersionInformation = Omit<GiftBox, "minimumGiftDataVersion" | "maximumGiftDataVersion">
type GiftWithNoSenderInformation = Omit<Gift, "senderSlot" | "senderTeam">

export class GiftManager extends EventBasedManager<GiftEvents> {
    private client: Client;
    private currentGiftBox: GiftBoxWithNoVersionInformation = {
        isOpen: false,
        acceptsAnyGift: false,
        desiredTraits: []
    };

    constructor(client: Client) {
        super();
        this.client = client;

        this.client.socket.on("connected", this.setup.bind(this));
    }

    private setup() {
        void this.client.storage.notify([this.motherboxStorageKey(), this.giftboxStorageKey()], (key, value, oldValue) => {
            if (key == this.giftboxStorageKey()) {
                const currentGiftBox = value as unknown as Record<string, NetworkGift>;
                const oldGiftBox = oldValue as unknown as Record<string, NetworkGift>
                const newGifts = Object.keys(currentGiftBox).filter(x => !Object.keys(oldGiftBox).includes(x));
                const removedGifts = Object.keys(oldGiftBox).filter(x => !Object.keys(currentGiftBox).includes(x));

                const gifts = this.gifts();
                for (const newGift of newGifts) {
                    this.emit("giftReceived", [gifts.find(x => x.id == newGift)])
                }
                for (const newGift of newGifts) {
                    this.emit("giftRemoved", [gifts.find(x => x.id == newGift)])
                }
            }
        })
    }

    private motherboxStorageKey(team?: number) {
        return `GiftBoxes;${team ?? this.client.players.self.team}`
    }

    private giftboxStorageKey(team?: number, slot?: number) {
        return `GiftBox;${team ?? this.client.players.self.team};${slot ?? this.client.players.self.slot}`
    }

    private async motherbox(team?: number) {
        const key = this.motherboxStorageKey(team);
        const motherboxData = await this.client.storage.fetch([key], true);
        const motherbox = motherboxData[key] as unknown as Record<string, NetworkGiftBox>

        return Object.fromEntries<GiftBox>(Object.entries(motherbox).map(([key, value]) => [key, {
            isOpen: value.is_open,
            acceptsAnyGift: value.accepts_any_gift,
            desiredTraits: value.desired_traits,
            minimumGiftDataVersion: value.minimum_gift_data_version,
            maximumGiftDataVersion: value.maximum_gift_data_version
        }])) satisfies Record<string, GiftBox>;
    }

    public async giftBox(team?: number, slot?: number) {
        const motherbox = await this.motherbox(team);
        return motherbox[slot.toString()];
    }

    public gifts() {
        const giftbox = this.client.storage.store[this.giftboxStorageKey()] as unknown as Record<string, NetworkGift> ?? [];
        return Object.values(giftbox).map((giftbox) => ({
            id: giftbox.id,
            itemName: giftbox.item_name,
            amount: giftbox.amount,
            itemValue: giftbox.item_value,
            traits: giftbox.traits,
            senderSlot: giftbox.sender_slot,
            receiverSlot: giftbox.receiver_slot,
            senderTeam: giftbox.sender_team,
            receiverTeam: giftbox.receiver_team,
            isRefund: giftbox.is_refund,
        } satisfies Gift))
    }

    public async openGiftBox(acceptAnyGift: boolean = true, desiredTraits: GiftTraitType[] = []) {
        if (!this.client.authenticated) {
            throw new Error("Not authenticated with Archipelago server")
        }

        await this.updateGiftBox({
            isOpen: true,
            acceptsAnyGift: acceptAnyGift,
            desiredTraits: desiredTraits,
        })
    }

    public async closeGiftBox() {
        await this.updateGiftBox({
            isOpen: false,
            acceptsAnyGift: false,
            desiredTraits: []
        })
    }

    private populateGiftForSending(gift: GiftWithNoSenderInformation | Gift): Gift {
        if (gift.isRefund && (!("senderSlot" in gift) || !("senderTeam" in gift))) {
            throw new Error("Gift not refundable");
        }

        return {
            ...gift,
            id: gift.id ?? window.crypto.randomUUID(),
            senderSlot: "senderSlot" in gift ? gift.senderSlot : this.client.players.self.slot,
            senderTeam: "senderTeam" in gift ? gift.senderTeam : this.client.players.self.team
        }
    }

    private giftRecipient(gift: GiftWithNoSenderInformation | Gift): [number, number] {
        if (gift.isRefund) {
            if (("senderSlot" in gift) && ("senderTeam" in gift)) {
                return [gift.senderSlot, gift.senderTeam];
            } else {
                throw new Error("Gift not refundable");
            }
        }
        const [targetPlayer, targetTeam] = [gift.receiverSlot, gift.receiverTeam];
        if (this.client.players.teams.every(x => x.every(player => player.slot != targetPlayer && player.team != targetTeam))) {
            throw new Error("Target player not valid")
        }

        return [targetPlayer, targetTeam];
    }

    public async canSendGift(gift: GiftWithNoSenderInformation | Gift) {
        if (gift.isRefund && (!("senderSlot" in gift) || !("senderTeam" in gift))) {
            throw new Error("Gift not refundable");
        }

        // Ensure that the recipient has an open gift box
        const [targetPlayer, targetTeam] = this.giftRecipient(gift);
        const giftbox = await this.giftBox(targetTeam, targetPlayer);
        if (!(giftbox.maximumGiftDataVersion >= 3 || giftbox.minimumGiftDataVersion <= 3)) {
            // Gifting not supported because of an API version mismatch
            return false;
        }
        if (!giftbox.isOpen) {
            // Gifting not supported because the giftbox is not open
            return false;
        }
        return true;
    }

    public async sendGift(gift: GiftWithNoSenderInformation | Gift) {
        if (!await this.canSendGift(gift)) {
            return;
        }

        const [targetPlayer, targetTeam] = this.giftRecipient(gift);
        const populatedGift = this.populateGiftForSending(gift);

        await this.client.storage.prepare(this.giftboxStorageKey(targetTeam, targetPlayer), {})
            // @ts-expect-error Weird typings
            .update({
                [populatedGift.id]: {
                    id: populatedGift.id,
                    item_name: populatedGift.itemName,
                    amount: populatedGift.amount,
                    item_value: populatedGift.itemValue,
                    traits: populatedGift.traits,
                    sender_slot: populatedGift.senderSlot,
                    receiver_slot: populatedGift.receiverSlot,
                    sender_team: populatedGift.senderTeam,
                    receiver_team: populatedGift.receiverTeam,
                    is_refund: populatedGift.isRefund
                } satisfies NetworkGift
            })
            .commit(false)

        return populatedGift.id;
    }

    public async refundGift(gift: Gift) {
        // TODO: Check if the gift is directed to this player
        if (gift.isRefund) {
            throw new Error("Gift not refundable");
        }

        await this.claimGift(gift);
        return await this.sendGift({
            ...gift,
            isRefund: true
        })
    }

    public async claimGift(gift: Gift) {
        await this.client.storage.prepare(this.giftboxStorageKey(), {}).pop(gift.id).commit(true);
    }

    private async updateGiftBox(giftBox: GiftBoxWithNoVersionInformation) {
        this.currentGiftBox = giftBox;

        await this.client.storage.prepare(this.motherboxStorageKey(), {})
            .update({
                [this.client.players.self.slot.toString()]: {
                    is_open: giftBox.isOpen,
                    accepts_any_gift: giftBox.acceptsAnyGift,
                    desired_traits: giftBox.desiredTraits,
                    minimum_gift_data_version: 3,
                    maximum_gift_data_version: 3
                }
            }).commit(false);
    }
}