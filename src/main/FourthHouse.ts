///<reference path="House.ts"/>

import {Saving} from "./Saving";
import {House} from "./House";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {CallbackCollection} from "./CallbackCollection";
import {Archipelago} from "../archipelago/Archipelago";

Saving.registerBool("fourthHouseCupboardStep", false); // false : closed ; true : opened
Saving.registerBool("fourthHouseCarpetStep", false); // false : lollipop still under the carpet ; true : lollipop outside

Saving.registerApLocation("fourthHouseFoundLollipopInCupboard", "VILLAGE_HOUSE_1_LOLLIPOP_IN_BOOKSHELF");
Saving.registerApLocation("fourthHouseFoundLollipopUnderCarpet", "VILLAGE_HOUSE_1_LOLLIPOP_UNDER_RUG");
Saving.registerApLocation("fourthHouseFoundLollipopOnCupboard", "VILLAGE_HOUSE_1_LOLLIPOP_ON_BOOKSHELF");

export class FourthHouse extends House{
    private renderArea: RenderArea = new RenderArea();
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        this.renderArea.resizeFromArray(Database.getAscii("places/village/fourthHouse"), 0, 3);
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
    private clickOnCarpet(): void{
        // If we never clicked on the carpet
        if(Saving.loadBool("fourthHouseCarpetStep") == false){
            // Set the step
            Saving.saveBool("fourthHouseCarpetStep", true);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private drawCarpetStuff(x: number, y: number): void{

        if (Saving.loadBool("fourthHouseFoundLollipopUnderCarpet"))
            return;

        // We do different things depending on the step
        switch(Saving.loadBool("fourthHouseCarpetStep")){
            case false: // The lollipop is still under the carpet
                // We add a button on the area of the carpet around the lollipop
                this.renderArea.addMultipleAsciiButtons("fourthHouseCarpetButton",
                                                        x-2, x+2, y-1,
                                                        x-6, x+1, y,
                                                        x-4, x, y+1);
                // We add the link
                this.renderArea.addLinkCall(".fourthHouseCarpetButton", new CallbackCollection(this.clickOnCarpet.bind(this)));
            break;
            case true: // The lollipop is outside the carpet, ready to be clicked
                // We draw the lollipop
                this.renderArea.drawArray(Database.getAscii("places/village/fourthHouseLollipopUnderCarpet"), x, y);
                // We add a button on the lollipop
                this.renderArea.addAsciiButton(x, x+4, y, "fourthHouseLollipopUnderCarpetButton");
                // We add the link
                this.renderArea.addLinkCall(".fourthHouseLollipopUnderCarpetButton", new CallbackCollection(this.pickCarpetLollipop.bind(this)));
            break;
        }
    }
    
    private drawLollipopOnCupboardStuff(x: number, y: number): void{
        // If we didn't find the lollipop yet
        if(Saving.loadBool("fourthHouseFoundLollipopOnCupboard") == false){
            // We add a button to take the lollipop on the cupboard
            this.renderArea.addAsciiButton(x+8, x+13, y+1, "fourthHouseLollipopOnCupboardButton");
            // We add the link
            this.renderArea.addLinkCall(".fourthHouseLollipopOnCupboardButton", new CallbackCollection(this.takeLollipopOnCupboard.bind(this)));
        }
        // Else, we found the lollipop
        else{
            // We draw the no lollipop ascii art
            this.renderArea.drawArray(Database.getAscii("places/village/fourthHouseNoLollipopOnCupboard"), x, y);
        }
    }
    
    private drawOpenCupboardStuff(x: number, y: number): void{
        if (Saving.loadBool("fourthHouseFoundLollipopInCupboard")) {
            this.renderArea.drawArray(Database.getAscii("places/village/fourthHouseCupboardOpenedWithoutLollipop"), x-2, y);
            return;
        }
        // We do different things depending on the step
        switch(Saving.loadBool("fourthHouseCupboardStep")){
            case false: // The cupboard is closed
                // We add a button on the cupboard's door
                this.renderArea.addMultipleAsciiButtons("fourthHouseCupboardDoorButton",
                                                        x, x+7, y,
                                                        x, x+7, y+1,
                                                        x, x+7, y+2,
                                                        x, x+7, y+3,
                                                        x, x+7, y+4,
                                                        x, x+7, y+5,
                                                        x, x+7, y+6,
                                                        x, x+7, y+7,
                                                        x, x+7, y+8,
                                                        x, x+7, y+9,
                                                        x, x+7, y+10,
                                                        x, x+7, y+11,
                                                        x, x+7, y+12);
                // We add the link
                this.renderArea.addLinkCall(".fourthHouseCupboardDoorButton", new CallbackCollection(this.openCupboard.bind(this)));
            break;
            case true: // The cupboard is opened with the lollipop in it
                // We draw the opened cupboard with the lollipop in it
                this.renderArea.drawArray(Database.getAscii("places/village/fourthHouseCupboardOpenedWithLollipop"), x-2, y);
                // We add a button on the lollipop
                this.renderArea.addAsciiButton(x+4, x+6, y+7, "fourthHouseLollipopInsideCupboardButton");
                // We add the link
                this.renderArea.addLinkCall(".fourthHouseLollipopInsideCupboardButton", new CallbackCollection(this.takeLollipopInsideCupboard.bind(this)));
            break;
        }
    }
    
    private openCupboard(): void{
        // If the cupboard isn't opened yet
        if(Saving.loadBool("fourthHouseCupboardStep") == false){
            // Set the step
            Saving.saveBool("fourthHouseCupboardStep", true);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private pickCarpetLollipop(): void{
        // If the lollipop is outside the carpet
        if(Saving.loadBool("fourthHouseCarpetStep") == true){
            // Set the step
            Saving.saveBool("fourthHouseFoundLollipopUnderCarpet", true);
            // Add one lollipop
            //this.getGame().getLollipops().add(1);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private takeLollipopInsideCupboard(): void{
        // If the cupboard is opened with the lollipop inside it
        if(Saving.loadBool("fourthHouseCupboardStep") == true){
            // Set the step
            Saving.saveBool("fourthHouseFoundLollipopInCupboard", true);
            // Add one lollipop
            //this.getGame().getLollipops().add(1);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private takeLollipopOnCupboard(): void{
        // If we didn't get the lollipop yet
        if(Saving.loadBool("fourthHouseFoundLollipopOnCupboard") == false){
            // Add one lollipop
            //this.getGame().getLollipops().add(1);
            // Set the bool
            Saving.saveBool("fourthHouseFoundLollipopOnCupboard", true);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Back to the map button
        this.addBackToTheVillageButton(this.renderArea, "fourthHouseBackToTheVillageButton", "VILLAGE_FURNISHED_HOUSE");
        
        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/fourthHouse"), 0, 3);
        
        // Draw stuff about the lollipop on the cupboard
        this.drawLollipopOnCupboardStuff(35, 11);
        
        // Draw stuff about opening the cupboard
        this.drawOpenCupboardStuff(35, 14);
        
        // Draw stuff about the lollipop under the carpet
        this.drawCarpetStuff(41, 32);
    }
}

