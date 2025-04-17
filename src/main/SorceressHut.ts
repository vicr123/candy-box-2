///<reference path="Place.ts"/>

import {RenderArea} from "./RenderArea";
import {Saving} from "./Saving";
import {Place} from "./Place";
import {Game} from "./Game";
import {CallbackCollection} from "./CallbackCollection";
import {Database} from "./Database";
import {RenderTransparency} from "./RenderTransparency";
import {Archipelago, ScoutResults} from "../archipelago/Archipelago";
import {ArchipelagoLocationRegion} from "../archipelago/ArchipelagoLocation";
import {san} from "../utils";
import {Item} from "archipelago.js";
import {Algo} from "./Algo";
import posessive = Algo.posessive;

Saving.registerApLocation("sorceressHutTookLollipop", "SORCERESS_HUT_LOLLIPOP");
Saving.registerApLocation("sorceressHutBoughtGrimoire", "SORCERESS_HUT_BEGINNER_GRIMOIRE");
Saving.registerApLocation("sorceressHutBoughtGrimoire2", "SORCERESS_HUT_ADVANCED_GRIMOIRE");
Saving.registerApLocation("sorceressHutBoughtCauldron", "SORCERESS_HUT_CAULDRON");
Saving.registerApLocation("sorceressHutBoughtHat", "SORCERESS_HUT_HAT");

export class SorceressHut extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // Current speech
    private currentSpeech: string;

    private selectedItem: Item;
    private selectedPrice: number;
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // Set the default speech
        this.currentSpeech = "sorceressHutHello";
        
        // Resize & update
        this.renderArea.resize(144, 48);
        this.update();

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }

    scoutKeys(): (keyof typeof ArchipelagoLocationRegion)[] {
        return ["SORCERESS_HUT"];
    }

    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private buyCauldron(): void{
        // If we have enough lollipops
        if(this.getGame().getLollipops().getCurrent() >= 100000){
            this.getGame().getLollipops().add(-100000); // We spend the lollipops
            Saving.saveBool("sorceressHutBoughtCauldron", true); // We now bought the cauldron
            this.getGame().updateStatusBar(true); // We update the status bar
            this.currentSpeech = ""; // We set the speech
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private buyGrimoire(): void{
        // If we have enough lollipops
        if(this.getGame().getLollipops().getCurrent() >= 5000){
            this.getGame().getLollipops().add(-5000); // We spend the lollipops
            Saving.saveBool("sorceressHutBoughtGrimoire", true); // We now bought the grimoire
            this.currentSpeech = ""; // We set the speech
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private buyGrimoire2(): void{
        // If we have enough lollipops
        if(this.getGame().getLollipops().getCurrent() >= 20000){
            this.getGame().getLollipops().add(-20000); // We spend the lollipops
            Saving.saveBool("sorceressHutBoughtGrimoire2", true); // We now bought the grimoire
            this.currentSpeech = ""; // We set the speech
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private buyHat(): void{
        // If we have enough lollipops
        if(this.getGame().getLollipops().getCurrent() >= Archipelago.slotData.prices.sorceressHat){
            this.getGame().getLollipops().add(-Archipelago.slotData.prices.sorceressHat); // We spend the lollipops
            Saving.saveBool("sorceressHutBoughtHat", true); // We now bought the hat
            this.currentSpeech = ""; // We set the speech
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private clickedCauldron(): void{
        this.selectedItem = this.itemScoutResults.findItem("SORCERESS_HUT_CAULDRON");
        // Set the new speech
        this.currentSpeech = "sorceressHutClickedSpeech";
        this.selectedPrice = 100000;
        
        // Update
        this.update();
        this.drawBuyingButton(Database.getBuyText(this.selectedItem, 100000, "lollipops"), new CallbackCollection(this.buyCauldron.bind(this)));
        this.getGame().updatePlace();
    }
    
    private clickedGrimoire(): void{
        this.selectedItem = this.itemScoutResults.findItem("SORCERESS_HUT_BEGINNER_GRIMOIRE");
        // Set the new speech
        this.currentSpeech = "sorceressHutClickedSpeech";
        this.selectedPrice = 5000;
        
        // Update
        this.update();
        this.drawBuyingButton(Database.getBuyText(this.selectedItem, 5000, "lollipops"), new CallbackCollection(this.buyGrimoire.bind(this)));
        this.getGame().updatePlace();
    }
    
    private clickedGrimoire2(): void{
        this.selectedItem = this.itemScoutResults.findItem("SORCERESS_HUT_ADVANCED_GRIMOIRE");
        // Set the new speech
        this.currentSpeech = "sorceressHutClickedSpeech";
        this.selectedPrice = 20000;
        
        // Update
        this.update();
        this.drawBuyingButton(Database.getBuyText(this.selectedItem, 20000, "lollipops"), new CallbackCollection(this.buyGrimoire2.bind(this)));
        this.getGame().updatePlace();
    }
    
    private clickedHat(): void{
        this.selectedItem = this.itemScoutResults.findItem("SORCERESS_HUT_HAT");
        // Set the new speech
        this.currentSpeech = "sorceressHutClickedSpeech";
        this.selectedPrice = Archipelago.slotData.prices.sorceressHat;
        
        // Update
        this.update();
        this.drawBuyingButton(Database.getBuyText(this.selectedItem, Archipelago.slotData.prices.sorceressHat, "lollipops"), new CallbackCollection(this.buyHat.bind(this)));
        this.getGame().updatePlace();
    }
    
    private drawBackground(x: number, y: number): void{
        this.renderArea.drawArray(Database.getAscii("places/sorceressHut/background"), x, y);
    }
    
    private drawBroom(x: number, y: number): void{
        this.renderArea.drawArray(Database.getAscii("places/sorceressHut/broom"), x, y);
    }
    
    private drawBuyingButton(text: string, callbackCollection : CallbackCollection): void{
        this.renderArea.addAsciiRealButton(text, 73, 22, "sorceressHutBuyingButton");
        this.renderArea.addLinkCall(".sorceressHutBuyingButton", callbackCollection);
    }
    
    private drawCauldron(x: number, y: number): void{
        // If we didn't buy the cauldron yet
        if(Saving.loadBool("sorceressHutBoughtCauldron") == false){
            // Draw it
            this.renderArea.drawArray(Database.getAscii("places/sorceressHut/cauldron"), x, y, new RenderTransparency(" ", "%"));
            
            // Add the button
            this.renderArea.addMultipleAsciiButtons("sorceressHutBuyCauldronButton",
                                                    x+11, x+30, y+1,
                                                    x+10, x+31, y+2,
                                                    x+8, x+33, y+3,
                                                    x+7, x+34, y+4,
                                                    x+6, x+35, y+5,
                                                    x+5, x+36, y+6,
                                                    x+4, x+37, y+7,
                                                    x+4, x+37, y+8,
                                                    x+4, x+37, y+9,
                                                    x+5, x+36, y+10,
                                                    x+6, x+35, y+11,
                                                    x+8, x+33, y+12
                                                   );
            // Add the link
            this.renderArea.addLinkCall(".sorceressHutBuyCauldronButton", new CallbackCollection(this.clickedCauldron.bind(this)));
        }
    }
    
    private drawCurrentSpeech(x: number, y: number): void{
        if (this.currentSpeech) {
            const args = {
                player: this.selectedItem && posessive(this.selectedItem.receiver.name),
                item: this.selectedItem?.name,
                game: this.selectedItem?.game,
                count: this.selectedPrice
            };
            this.renderArea.drawSpeech(Database.getText(this.currentSpeech, args), y, x, x + 27, "sorceressHutSpeech", Database.getTranslatedText(this.currentSpeech, args));
        }
    }
    
    private drawHat(x: number, y: number): void{
        // If we didn't buy the hat yet
        if(Saving.loadBool("sorceressHutBoughtHat") == false){
            // Draw it
            this.renderArea.drawArray(Database.getAscii("places/sorceressHut/hat"), x, y, new RenderTransparency(" ", "%"));
            
            // Add the button
            this.renderArea.addMultipleAsciiButtons("sorceressHutBuyHatButton",
                                                    x+20, x+23, y,
                                                    x+16, x+25, y+1,
                                                    x+14, x+26, y+2,
                                                    x+11, x+19, y+3,
                                                    x+10, x+19, y+4,
                                                    x+9, x+20, y+5,
                                                    x+1, x+27, y+6
                                                   );
            // Add the link
            this.renderArea.addLinkCall(".sorceressHutBuyHatButton", new CallbackCollection(this.clickedHat.bind(this)));
        }
    }
    
    private drawShelves(x: number, y: number): void{
        // Draw the ascii art
        this.renderArea.drawArray(Database.getAscii("places/sorceressHut/shelves"), x, y);
        
        // If we didn't take the lollipop yet
        if(Saving.loadBool("sorceressHutTookLollipop") == false){
            // Draw the lollipop
            this.renderArea.drawArray(Database.getAscii("places/sorceressHut/lollipop"), x + 32, y + 16);
            // Add the button and the link
            this.renderArea.addAsciiButton(x + 32, x + 37, y + 16, "sorceressHutTakeLollipopButton");
            this.renderArea.addLinkCall(".sorceressHutTakeLollipopButton", new CallbackCollection(this.takeLollipop.bind(this)));
        }
        
        // If we didn't buy the grimoire yet
        if(Saving.loadBool("sorceressHutBoughtGrimoire") == false){
            // Draw the grimoire
            this.renderArea.drawArray(Database.getAscii("places/sorceressHut/grimoire"), x + 18, y + 8);
            // Add the button and the link
            this.renderArea.addAsciiButton(x + 18, x + 20, y + 9, "sorceressHutBuyGrimoireButton");
            this.renderArea.addAsciiButton(x + 18, x + 20, y + 10, "sorceressHutBuyGrimoireButton");
            this.renderArea.addAsciiButton(x + 18, x + 20, y + 11, "sorceressHutBuyGrimoireButton");
            this.renderArea.addLinkCall(".sorceressHutBuyGrimoireButton", new CallbackCollection(this.clickedGrimoire.bind(this)));
        }
        
        // If we didn't buy the second grimoire yet
        if(Saving.loadBool("sorceressHutBoughtGrimoire2") == false){
            // Draw the grimoire
            this.renderArea.drawArray(Database.getAscii("places/sorceressHut/grimoire2"), x + 30, y + 1);
            // Add the button and the link
            this.renderArea.addAsciiButton(x + 31, x + 34, y + 2, "sorceressHutBuyGrimoire2Button");
            this.renderArea.addAsciiButton(x + 31, x + 34, y + 3, "sorceressHutBuyGrimoire2Button");
            this.renderArea.addAsciiButton(x + 31, x + 34, y + 4, "sorceressHutBuyGrimoire2Button");
            this.renderArea.addAsciiButton(x + 31, x + 34, y + 5, "sorceressHutBuyGrimoire2Button");
            this.renderArea.addAsciiButton(x + 31, x + 34, y + 6, "sorceressHutBuyGrimoire2Button");
            this.renderArea.addLinkCall(".sorceressHutBuyGrimoire2Button", new CallbackCollection(this.clickedGrimoire2.bind(this)));
        }
    }
    
    private takeLollipop(): void{
        // We took the lollipop
        Saving.saveBool("sorceressHutTookLollipop", true);
        
        // Add 1 lollipop
        this.getGame().getLollipops().add(1);
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Back to the map button
        this.addBackToMainMapButton(this.renderArea, "theHoleBackToTheMapButton", "SORCERESS_HUT");
        
        // Draw everything
        this.drawBackground(0, 3);
        this.drawHat(14, 3);
        this.drawShelves(73, 3);
        this.drawCauldron(80, 27);
        this.drawBroom(49, 18);
        
        // Draw the speech
        this.drawCurrentSpeech(43, 4);
    }
}