import {House} from "./House";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {Archipelago, findCompatibleSendableItem, sendableItems} from "../archipelago/Archipelago";
import {CallbackCollection} from "./CallbackCollection";
import {Saving} from "./Saving";
import {Color} from "./Color";
import {ColorType} from "./ColorType";
import {GiftTraitType} from "../archipelago/gifting/GiftTrait";
import { Player } from "archipelago.js";

export class PostOffice extends House{
    private renderArea: RenderArea = new RenderArea();

    private state: "idle" | "sending" | "recipient" | "sendFinish" | "receiving" = "idle";

    private item: string = "health";
    private amount: string = "1";
    private player: [number, number] = [0, 0];

    private validPlayers: Player[] = [];
    private error: string;

    // Constructor
    constructor(game: Game) {
        super(game);

        this.renderArea.resizeFromArray(Database.getAscii("places/village/share/postOffice"), 0, 3);

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });

        this.resetState();
    }

    public getRenderArea(): RenderArea{
        return this.renderArea;
    }

    private update(): void {
        // Erase everything
        this.renderArea.resetAllButSize();

        // Back to the map button
        this.addBackToTheVillageButton(this.renderArea, "postOfficeBackToTheVillageButton", "ENERGY_ROOM");

        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/share/postOffice"), 0, 3);

        switch (this.state) {
            case "idle":
                this.drawIdle();
                return;
            case "sending":
                this.drawSending();
                return;
            case "recipient":
                this.drawRecipient();
                return;
            case "sendFinish":
                this.drawSendFinish();
                return;
            case "receiving":
                this.drawReceiving();
                return;
        }
    }

    private drawIdle() {
        this.renderArea.drawSpeech(Database.getText("postOfficeWelcome"), 3, 30, 60, "postmanSpeech", Database.getTranslatedText("postOfficeWelcome"));

        this.renderArea.addAsciiRealButton(Database.getText("postOfficeSend"), 20, 10, "postOfficeSend", Database.getTranslatedText("postOfficeSend"), true);
        this.renderArea.addLinkCall(".postOfficeSend", new CallbackCollection(this.startSend.bind(this)))
    }

    private drawSending() {
        this.renderArea.drawSpeech(Database.getText("postOfficeSending"), 3, 30, 60, "postmanSpeech", Database.getTranslatedText("postOfficeSending"));

        this.renderArea.drawString(Database.getText("postOfficeSendLabel"), 20, 10, false);
        this.renderArea.addList(20, 70, 11, "potionSendType", new CallbackCollection(this.changeItem.bind(this)),
            sendableItems.filter(item => item.amount() != undefined).flatMap(item => [item.id, `${item.name} (you have ${item.amount()})`])
        );

        this.renderArea.drawString(Database.getText("postOfficeAmountLabel"), 20, 13, false);
        this.renderArea.addSimpleInput(20, 40, 14, new CallbackCollection(this.changeAmount.bind(this)), "postOfficeAmount", this.amount);

        this.renderArea.addAsciiRealButton(Database.getText("postOfficeChooseItem"), 20, 16, "postOfficeChooseItem", Database.getTranslatedText("postOfficeChooseItem"), true);
        this.renderArea.addLinkCall(".postOfficeChooseItem", new CallbackCollection(this.commitItems.bind(this)))

        if (this.error) {
            const errorText = Database.getText(this.error)
            this.renderArea.drawString(errorText, 20, Database.isTranslated() ? 19 : 18);
            this.renderArea.addColor(20, 20 + errorText.length, Database.isTranslated() ? 19 : 18, new Color(ColorType.SAVE_RED))
        }

        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("postOfficeSendLabel"), 30, 10, true);
            this.renderArea.drawString(Database.getTranslatedText("postOfficeAmountLabel"), 30, 13, true);
            if (this.error) {
                const errorText = Database.getTranslatedText(this.error)
                this.renderArea.drawString(errorText, 20, 20, true);
                if (errorText) {
                    this.renderArea.addColor(20, 20 + errorText.length, 20, new Color(ColorType.SAVE_RED))
                }
            }
        }

        this.renderArea.addLinkCallbackCollection(new CallbackCollection(() => {
            $("#" + this.item).prop('selected', true)
        }));
    }

    private drawRecipient() {
        this.renderArea.drawSpeech(Database.getText("postOfficeRecipientText"), 3, 30, 60, "postmanSpeech", Database.getTranslatedText("postOfficeRecipientText"));

        this.renderArea.drawString(Database.getText("postOfficeSendLabel"), 20, 10, false);
        this.renderArea.addList(20, 70, 11, "potionRecipient", new CallbackCollection(this.changePlayer.bind(this)),
            this.validPlayers.flatMap(player => [`gift_${player.team}_${player.slot}`, `${player.name} in ${player.game}`])
        );

        this.renderArea.addAsciiRealButton(Database.getText("wishingWellEnchantButton"), 20, 13, "postOfficeSendItem", Database.getTranslatedText("wishingWellEnchantButton"), true);
        this.renderArea.addLinkCall(".postOfficeSendItem", new CallbackCollection(this.sendItems.bind(this)))

        this.renderArea.addLinkCallbackCollection(new CallbackCollection(() => {
            $(`#gift_${this.player[1]}_${this.player[0]}`).prop('selected', true)
        }));
    }

    private drawSendFinish() {
        this.renderArea.drawSpeech(Database.getText("postOfficeSendFinishText"), 3, 30, 60, "postmanSpeech", Database.getTranslatedText("postOfficeSendFinishText"));

        this.renderArea.addAsciiRealButton(Database.getText("postOfficeThankYou"), 20, 10, "postOfficeThankYou", Database.getTranslatedText("postOfficeThankYou"), true);
        this.renderArea.addLinkCall(".postOfficeThankYou", new CallbackCollection(this.resetState.bind(this)))
    }

    private drawReceiving() {
        const nextGift = Archipelago.giftManager.gifts()[0];
        const compatibleItem = findCompatibleSendableItem(nextGift.traits.map(x => x.trait));
        const player = Archipelago.client.players.findPlayer(nextGift.isRefund ? nextGift.receiverSlot : nextGift.senderSlot, nextGift.isRefund ? nextGift.receiverTeam : nextGift.senderTeam);

        const speechArgs = {
            item: compatibleItem.name,
            game: player.game,
            player: player.name,
            count: nextGift.amount
        }
        this.renderArea.drawSpeech(Database.getText(nextGift.isRefund ? "postOfficeRefunded" : "postOfficeReceived", speechArgs), 3, 30, 60, "postmanSpeech", Database.getTranslatedText(nextGift.isRefund ? "postOfficeRefunded" : "postOfficeReceived", speechArgs));

        this.renderArea.addAsciiRealButton(Database.getText("postOfficeThankYou"), 20, 14, "postOfficeCollectGift", Database.getTranslatedText("postOfficeThankYou"), true);
        this.renderArea.addLinkCall(".postOfficeCollectGift", new CallbackCollection(this.collectGift.bind(this)))
    }

    private resetState() {
        if (Archipelago.giftManager.gifts().length > 0) {
            this.state = "receiving";
            this.update();
            this.getGame().updatePlace();
            return;
        }
        this.state = "idle";
        this.update();
        this.getGame().updatePlace();
    }

    private async collectGift() {
        const nextGift = Archipelago.giftManager.gifts()[0];
        const compatibleItem = findCompatibleSendableItem(nextGift.traits.map(x => x.trait));
        compatibleItem.receive(compatibleItem.giftedAmount(nextGift), this.getGame());
        await Archipelago.interruptAfterTimeout(Archipelago.giftManager.claimGift(nextGift));

        queueMicrotask(() => this.resetState());
    }

    private startSend() {
        this.state = "sending";
        this.update();
        this.getGame().updatePlace();
    }

    private commitItems() {
        const amountInt = +this.amount;
        if (!Number.isInteger(amountInt) || amountInt <= 0) {
            this.error = "postOfficeInvalidText";
            this.update();
            this.getGame().updatePlace();
            return;
        }

        const potion = sendableItems.find(x => x.id == this.item);
        if (potion.amount() < amountInt) {
            this.error = "postOfficeInsufficientText";
            this.update();
            this.getGame().updatePlace();
            return;
        }

        this.error = "";

        Archipelago.interruptAfterTimeout((async () => {
            const giftBoxes = await Promise.all(Archipelago.client.players.teams.flat().map(async player => {
                if (Archipelago.client.players.self.name == player.name) {
                    return undefined;
                }

                const giftBox = await Archipelago.giftManager.giftBox(player.team, player.slot)
                if (!giftBox) {
                    return undefined;
                }

                if (giftBox.acceptsAnyGift) {
                    return player;
                }

                if (potion.traits.some(trait => giftBox.desiredTraits?.includes(trait) ?? [])) {
                    return player;
                }

                return undefined;
            }))
            return giftBoxes.filter(x => !!x);
        })()).then((playerData) => {
            if (playerData.length == 0) {
                this.error = "postOfficeNoRecipientText";
            } else {
                this.validPlayers = playerData;
                this.state = "recipient";
                this.player = [playerData[0].slot, playerData[0].team]
            }
            this.update();
            this.getGame().updatePlace();
        })
    }

    private changeAmount() {
        this.amount = $(".postOfficeAmount").val() as string;
    }

    private changePlayer() {
        const player = this.validPlayers.find(x => `gift_${x.team}_${x.slot}` == $("#potionRecipient").find(":selected").attr("id"));
        this.player = [player.slot, player.team];
        this.update();
        this.getGame().updatePlace();
    }

    private async changeItem() {
        // Get the selected language id
        this.item = $("#potionSendType").find(":selected").attr("id");

        // Update
        this.update();
        this.getGame().updatePlace();
    }

    private async sendItems() {
        const potion = sendableItems.find(x => x.id == this.item);

        // Send it!
        await Archipelago.interruptAfterTimeout(Archipelago.giftManager.sendGift({
            itemName: potion.name,
            traits: potion.traits.map(trait => ({
                trait: trait,
            })),
            amount: parseInt(this.amount),
            isRefund: false,
            receiverTeam: this.player[1],
            receiverSlot: this.player[0]
        }))

        // Remove items from our inventory
        potion.send(parseInt(this.amount));

        this.state = "sendFinish";
        this.update();
        this.getGame().updatePlace();
    }
}