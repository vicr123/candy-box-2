///<reference path="Place.ts"/>

import {RenderArea} from "./RenderArea";
import {Place} from "./Place";
import {Game} from "./Game";
import {Database} from "./Database";
import {Saving} from "./Saving";
import {CallbackCollection} from "./CallbackCollection";
import {Archipelago} from "../archipelago/Archipelago";

export class Treasure extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        this.renderArea.resizeFromArray(Database.getAscii("places/treasure"), 57, 3);
        this.update();

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private dig(): void{
        // We found the treasure
        Saving.saveBool("TheCavePattern_TreasureMapFoundTreasure", true);

        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Back to the map button
        this.addBackToMainMapButton(this.renderArea, "treasureBackToTheMapButton", "DIG_SPOT");
        
        // Draw the ascii
        this.renderArea.drawArray(Database.getAscii("places/treasure"), 28, 3);
        
        // If we didn't find the treasure yet
        if(Saving.loadBool("TheCavePattern_TreasureMapFoundTreasure") == false){
            // Add the button to get the treasure
            this.renderArea.addAsciiRealButton(Database.getText("treasureButtonDig"), 49, 14, "treasureButton", Database.getTranslatedText("treasureButtonDig"), true, -1, null, false);
            this.renderArea.addLinkCall(".treasureButton", new CallbackCollection(this.dig.bind(this)));
        }
        // Else, we found the treasure
        else{
            // Add the text
            this.renderArea.drawString(Database.getText("treasureButtonYouFound"), 49, 14);
            this.renderArea.drawString(Database.getTranslatedText("treasureButtonYouFound"), 49, 15, true);
        }
    }
}