///<reference path="Place.ts"/>

import {Place} from "./Place";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {Saving} from "./Saving";
import {CallbackCollection} from "./CallbackCollection";
import {Archipelago, ScoutResults} from "../archipelago/Archipelago";
import {ArchipelagoLocationRegion} from "../archipelago/ArchipelagoLocation";
import {i18n} from "../i18n";
import {Item} from "archipelago.js";
import {Algo} from "./Algo";
import posessive = Algo.posessive;

export class Moutains extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();

    private scoutItem: Item;
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        this.renderArea.resizeFromArray(Database.getAscii("places/mountains"), 0, 10);

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }

    public static get welcomeMessage() {
        return "You climb the mountain."
    }

    scoutResults(items: ScoutResults) {
        this.scoutItem = items.findItem("POGO_STICK");
        this.update();
    }

    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private getPogoStick(): void{
        // Get the pogo stick
        Archipelago.check("POGO_STICK");
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Back to the map button
        this.addBackToMainMapButton(this.renderArea, "mountainsBackToTheMapButton", "POGO_STICK_SPOT");
        
        // Draw the moutains
        this.renderArea.drawArray(Database.getAscii("places/mountains"), 0, 3);
        
        // If we didn't get the pogo stick yet
        if(!Archipelago.isChecked("POGO_STICK")){
            // Add the "*" showing that there's a pogo stick here
            this.renderArea.drawString("*", 52, 11);
            
            // Draw the text
            this.renderArea.drawString(Database.getText("mountainsText0"), 19, 22);
            this.renderArea.drawString(Database.getText("mountainsText1"), 19, 23);
            
            // Add the button
            this.renderArea.addAsciiRealButton(Database.getText("mountainsTextButton"), 19, 25, "mountainsClimbButton", Database.getTranslatedText("mountainsTextButton"));
            this.renderArea.addLinkCall(".mountainsClimbButton", new CallbackCollection(this.getPogoStick.bind(this)));
            
            // Draw the translated text
            this.renderArea.drawString(Database.getTranslatedText("mountainsText0"), 19, 27, true);
            this.renderArea.drawString(Database.getTranslatedText("mountainsText1"), 19, 28, true);
        }
        // Else, we already found it
        else{
            this.renderArea.drawString(i18n.t("mountainsTextAfter", {
                lng: "en",
                player: posessive(this.scoutItem.receiver.alias),
                item: this.scoutItem.name
            }), 19, 22);

            if (Saving.loadString("gameLanguage") != "en") {
                this.renderArea.drawString(i18n.t("mountainsTextAfter", {
                    player: posessive(this.scoutItem.receiver.alias),
                    item: this.scoutItem.name
                }), 19, 24, true);
            }
        }
    }

    scoutKeys(): (keyof typeof ArchipelagoLocationRegion)[] {
        return ["MOUNTAINS"]
    }
}