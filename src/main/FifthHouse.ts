///<reference path="House.ts"/>

import {RenderArea} from "./RenderArea";
import {House} from "./House";
import {Game} from "./Game";
import {Database} from "./Database";
import {Cellar} from "./Cellar";
import {Saving} from "./Saving";
import {CallbackCollection} from "./CallbackCollection";
import {Archipelago} from "../archipelago/Archipelago";

export class FifthHouse extends House{
    private renderArea: RenderArea = new RenderArea();
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        this.renderArea.resizeFromArray(Database.getAscii("places/village/fifthHouse"), 0, 3);
        this.update();
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Public methods
    public willBeDisplayed(): void{
        // We need to update each time we're going to be displayed to avoid a "bug" in a very special case :
        // If the player is in the fifth house and the npc is asking for someone with a weapon
        // And then the player goes to its inventory, equip a weapon and then goes back to the fifth house
        // Here the fifth house must be updated so that the npc know that the player now has a weapon
        this.update();
    }
    
    // Private methods
    private beginQuest(): void{
        void this.getGame().loadRandomisedEntrance("THE_CELLAR");
    }
    
    private update(): void {
        // Erase everything
        this.renderArea.resetAllButSize();

        // Back to the village button
        this.addBackToTheVillageButton(this.renderArea, "fifthHouseBackToTheVillageButton", "VILLAGE_QUEST_HOUSE");

        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/fifthHouse"), 0, 3);

        // If we have a weapon
        if (this.getGame().getSelectedEqItems()["weapon"] != null) {
            // Draw the speech
            this.renderArea.drawSpeech(Database.getText("mapVillageFifthHouseWeaponSpeech"), 6, 44, 67, "fifthHouseSpeech", Database.getTranslatedText("mapVillageFifthHouseWeaponSpeech"));

            // Add the button
            this.renderArea.addAsciiRealButton(Database.getText("mapVillageFifthHouseAgree"), 69, 8, "mapVillageFifthHouseAgreeButton", Database.getTranslatedText("mapVillageFifthHouseAgree"), true);
            this.renderArea.addLinkCall(".mapVillageFifthHouseAgreeButton", new CallbackCollection(this.beginQuest.bind(this)));
        }
        // Else if this quest is the egg quest
        else if (Archipelago.findExit("THE_CELLAR") == "The Castle Egg Room") {
            // Draw the speech
            this.renderArea.drawSpeech(Database.getText("mapVillageFifthHouseEggSpeech"), 6, 44, 67, "fifthHouseSpeech", Database.getTranslatedText("mapVillageFifthHouseEggSpeech"));

            // Add the button
            this.renderArea.addAsciiRealButton(Database.getText("mapVillageFifthHouseAgree"), 69, 8, "mapVillageFifthHouseAgreeButton", Database.getTranslatedText("mapVillageFifthHouseAgree"), true);
            this.renderArea.addLinkCall(".mapVillageFifthHouseAgreeButton", new CallbackCollection(this.beginQuest.bind(this)));
        }
        // Else, we don't have a weapon yet
        else{
            // Draw the speech
            this.renderArea.drawSpeech(Database.getText("mapVillageFifthHouseNoWeaponSpeech"), 6, 44, 67, "fifthHouseSpeech", Database.getTranslatedText("mapVillageFifthHouseNoWeaponSpeech"));
        }
    }
}