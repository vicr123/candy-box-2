import {House} from "./House";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {Archipelago} from "../archipelago/Archipelago";
import {EnergyRoom} from "./EnergyRoom";
import {CallbackCollection} from "./CallbackCollection";

export class ShareHouse extends House {
    private renderArea: RenderArea = new RenderArea();

    // Constructor
    constructor(game: Game) {
        super(game);

        this.renderArea.resizeFromArray(Database.getAscii("places/village/share/shareHouse"), 0, 3);
        this.update();

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }

    public getRenderArea(): RenderArea{
        return this.renderArea;
    }

    private update(): void {
        // Erase everything
        this.renderArea.resetAllButSize();

        // Back to the map button
        this.addBackToTheVillageButton(this.renderArea, "shareHouseBackToTheVillageButton");

        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/share/shareHouse"), 0, 3);

        const giftButtonArgs = [
            16, 36, 18,
            16, 36, 19,
            16, 36, 20,
            16, 36, 21,
            16, 36, 22,
            16, 36, 23,
            16, 36, 24,
            16, 36, 25,
            16, 36, 26,
            16, 36, 27,
        ];
        if (Archipelago.slotData.gifting) {
        } else {
            this.renderArea.drawArray(Database.getAscii("places/village/share/lockedDoor"), 15, 17);
            this.renderArea.addMultipleAsciiNinjaButtons("shareHouseLockedGiftButton", ...giftButtonArgs);
            // Comments
            this.renderArea.addFullComment(26, 28, Database.getText("lockedDoorComment"), Database.getTranslatedText("lockedDoorComment"), "shareHouseLockedGiftComment");
            // Interactions
            this.renderArea.addLinkOver(".shareHouseLockedGiftButton, .shareHouseLockedGiftComment", ".shareHouseLockedGiftComment");
        }

        const nrgButtonArgs = [
            61, 81, 18,
            61, 81, 19,
            61, 81, 20,
            61, 81, 21,
            61, 81, 22,
            61, 81, 23,
            61, 81, 24,
            61, 81, 25,
            61, 81, 26,
            61, 81, 27,
        ];
        if (Archipelago.slotData.energyLink) {
            this.renderArea.addMultipleAsciiButtons("shareHouseNrgButton", ...nrgButtonArgs);
            // Comments
            this.renderArea.addFullComment(71, 28, Database.getText("energyRoomComment"), Database.getTranslatedText("energyRoomComment"), "shareHouseNrgComment");
            // Interactions
            this.renderArea.addLinkOver(".shareHouseNrgButton, .shareHouseNrgComment", ".shareHouseNrgComment");
            this.renderArea.addLinkCall(".shareHouseNrgButton, .shareHouseNrgComment", new CallbackCollection(this.goToEnergyRoom.bind(this)));
        } else {
            this.renderArea.drawArray(Database.getAscii("places/village/share/lockedDoor"), 60, 17);
            this.renderArea.addMultipleAsciiNinjaButtons("shareHouseLockedNrgButton", ...nrgButtonArgs);
            // Comments
            this.renderArea.addFullComment(71, 28, Database.getText("lockedDoorComment"), Database.getTranslatedText("lockedDoorComment"), "shareHouseLockedNrgComment");
            // Interactions
            this.renderArea.addLinkOver(".shareHouseLockedNrgButton, .shareHouseLockedNrgComment", ".shareHouseLockedNrgComment");
        }
    }

    private goToEnergyRoom() {
        this.getGame().setPlace(new EnergyRoom(this.getGame()));
    }
}