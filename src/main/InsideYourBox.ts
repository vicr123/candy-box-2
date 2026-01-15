///<reference path="Place.ts"/>

import {InsideYourBoxSweet} from "./InsideYourBoxSweet";
import {Place} from "./Place";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {RenderTransparency} from "./RenderTransparency";
import {Archipelago} from "../archipelago/Archipelago";
import {permissions} from "archipelago.js";
import {CallbackCollection} from "./CallbackCollection";

export class InsideYourBox extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // The sweets
    private sweets: InsideYourBoxSweet[] = [];
    
    // The interval ID
    private intervalID: number;
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // Launch the interval
        this.intervalID = setInterval(this.actionInterval.bind(this), 100);
        
        // Resize and update
        this.renderArea.resize(100, 40);
        this.update();

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
        Archipelago.events.on("itemToBeProcessed", () => {
            this.update();
            this.getGame().updatePlace();
        })
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // willStopBeingDisplayed()
    public willStopBeingDisplayed(): void{
        clearInterval(this.intervalID);
    }
    
    // Private methods
    private actionInterval(): void{
        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Add a sweet
        this.sweets.push(new InsideYourBoxSweet());
        
        // Update the sweets and delete the one which need to be deleted
        for(var i = 0; i < this.sweets.length; i++){
            if(this.sweets[i].update()){
                this.sweets.splice(i, 1);
                i--;
            }
        }
        
        // Draw the sweets
        for(var i = 0; i < this.sweets.length; i++){
            this.sweets[i].draw(this.renderArea);
        }
        
        // Draw the text
        this.renderArea.drawArray(Database.getAscii("general/insideYourBox/text"), 0, 5, new RenderTransparency(" ", "%"));

        // Add AP buttons as needed
        const apPerms = Archipelago.client.room.permissions;
        if (apPerms.release == permissions.goal && Archipelago.client.room.missingLocations.length > 0) {
            this.renderArea.addAsciiRealButton(Database.getText("apReleaseButton"), 40, 20, "candyBoxApReleaseButton", Database.getTranslatedText("apReleaseButton"), true, -1, null, true);
            this.renderArea.addLinkCall(".candyBoxApReleaseButton", new CallbackCollection(this.apRelease.bind(this)));
        }
    }

    private apRelease(): void {
        queueMicrotask(() => {
            Archipelago.sendMessage("!release");
        })
    }
}