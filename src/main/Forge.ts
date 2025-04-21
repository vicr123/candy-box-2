///<reference path="House.ts"/>

// The lollipop
import {Saving} from "./Saving";
import {House} from "./House";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {StatusBarTabType} from "./StatusBarTabType";
import {CallbackCollection} from "./CallbackCollection";
import {Archipelago, ScoutResults} from "../archipelago/Archipelago";
import {ArchipelagoLocationRegion} from "../archipelago/ArchipelagoLocation";
import { Item } from "archipelago.js";
import {san} from "../utils";

Saving.registerApLocation("forgeFoundLollipop", "FORGE_LOLLIPOP");

// Items sold
Saving.registerApLocation("forgeBoughtWoodenSword", "FORGE_WOODEN_SWORD");
Saving.registerApLocation("forgeBoughtIronAxe", "FORGE_IRON_AXE");
Saving.registerApLocation("forgeBoughtPolishedSilverSword", "FORGE_POLISHED_SILVER_SWORD");
Saving.registerApLocation("forgeBoughtLightweightBodyArmour", "FORGE_LIGHTWEIGHT_BODY_ARMOUR");
Saving.registerApLocation("forgeBoughtScythe", "FORGE_SCYTHE");

export class Forge extends House{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // The speech, comes back to its default value each time we enter the forge
    private currentSpeech: string;

    private scoutedItems: ScoutResults;
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // If...
            // We didn't buy one of the first three items
        if((Saving.loadBool("forgeBoughtWoodenSword") == false || Saving.loadBool("forgeBoughtIronAxe") == false || Saving.loadBool("forgeBoughtPolishedSilverSword") == false)
            || // OR
            // We didn't buy the armour and we made the cave entrance
           (Saving.loadBool("forgeBoughtLightweightBodyArmour") == false && Saving.loadBool("mainMapDoneCaveEntrance") == true)
            || // OR
            // We didn't buy the scythe and the dragon is done
           (Saving.loadBool("forgeBoughtScythe") == false && Saving.loadBool("dragonDone") == true)
        ){
            // We set the normal introduction speech
            this.currentSpeech = "mapVillageForgeIntroductionSpeech";
        }
        // Else
        else{
            // We set the no more to sell introduction speech
            this.currentSpeech = "mapVillageForgeIntroductionSpeechNoMoreToSell";
        }

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
        
        this.renderArea.resizeFromArray(Database.getAscii("places/village/forge"), 0, 3);
    }

    public static get welcomeMessage() {
        return "You enter the forge."
    }

    scoutKeys(): (keyof typeof ArchipelagoLocationRegion)[] {
        return ["FORGE_1", "FORGE_2", "FORGE_3", "FORGE_4", "FORGE_5"];
    }

    scoutResults(items: ScoutResults) {
        this.scoutedItems = items;
        this.update();
    }

    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private clickedBuyIronAxeButton(): void{
        if(this.getGame().getCandies().getCurrent() >= 400){
            const item = this.scoutedItems.findItem("FORGE_IRON_AXE");
            this.getGame().getCandies().add(-400); // -400 candies
            Saving.saveBool("forgeBoughtIronAxe", true); // We bought the axe
            //this.getGame().gainItem("eqItemWeaponIronAxe"); // We now own the axe
            this.updateSpeechBuy(item);
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private clickedBuyLightweightBodyArmourButton(): void{
        if(this.getGame().getCandies().getCurrent() >= 15000){
            const item = this.scoutedItems.findItem("FORGE_LIGHTWEIGHT_BODY_ARMOUR");
            this.getGame().getCandies().add(-15000); // -15000 candies
            Saving.saveBool("forgeBoughtLightweightBodyArmour", true); // We bought the armour
            //this.getGame().gainItem("eqItemBodyArmoursLightweightBodyArmour"); // We now own the armour
            this.updateSpeechBuy(item);
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private clickedBuyPolishedSilverSwordButton(): void{
        if(this.getGame().getCandies().getCurrent() >= 2000){
            const item = this.scoutedItems.findItem("FORGE_POLISHED_SILVER_SWORD");
            this.getGame().getCandies().add(-2000); // -2000 candies
            Saving.saveBool("forgeBoughtPolishedSilverSword", true); // We bought the sword
            //this.getGame().gainItem("eqItemWeaponPolishedSilverSword"); // We now own the sword
            this.updateSpeechBuy(item);
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private clickedBuyScytheButton(): void{
        if(this.getGame().getCandies().getCurrent() >= 5000000){
            const item = this.scoutedItems.findItem("FORGE_SCYTHE");
            this.getGame().getCandies().add(-5000000); // -5000000 candies
            Saving.saveBool("forgeBoughtScythe", true); // We bought the scythe
            //this.getGame().gainItem("eqItemWeaponScythe"); // We now own the scythe
            this.updateSpeechBuy(item);
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private clickedBuyWoodenSwordButton(): void{
        if(this.getGame().getCandies().getCurrent() >= 150){
            const item = this.scoutedItems.findItem("FORGE_WOODEN_SWORD");
            this.getGame().getCandies().add(-150); // -150 candies
            Saving.saveBool("forgeBoughtWoodenSword", true); // We bought the sword
            //this.getGame().gainItem("eqItemWeaponWoodenSword"); // We now own the sword
            this.updateSpeechBuy(item);
            Saving.saveBool("statusBarUnlockedInventory", true); // We unlock the inventory
            this.getGame().updateStatusBar(true); // We update the status bar
            this.getGame().getStatusBar().selectTabByType(StatusBarTabType.MAP); // We re-select the map tab (because adding the inventory tab created a gap in tab selection..)
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }

    private updateSpeechBuy(item: Item) {
        let sentence = "";
        if (item.useful || item.progression) {
            sentence = `I'm sure ${item.receiver.name} will find it very useful.`;
        } else if (item.trap) {
            sentence = `I'm sure ${item.receiver.name} will have lots of fun with it(!)`;
        }

        this.currentSpeech = san`Thanks for the candies! I've just sent ${item.name} straight to ${item.game} - free of charge! ${sentence}`
    }
    
    private drawLollipopStuff(x: number, y: number): void{
        // If we didn't find the lollipop yet
        if(Saving.loadBool("forgeFoundLollipop") == false){
            // We add a button to take the lollipop on the cupboard
            this.renderArea.addAsciiButton(x, x+5, y, "forgeLollipopButton");
            // We add the link
            this.renderArea.addLinkCall(".forgeLollipopButton", new CallbackCollection(this.takeLollipop.bind(this)));
        }
        // Else, we found the lollipop
        else{
            // We erase the lollipop
            this.renderArea.drawString("      ", x, y);
        }
    }
    
    private takeLollipop(): void{
        // If we didn't get the lollipop yet
        if(Saving.loadBool("forgeFoundLollipop") == false){
            // Set the bool
            Saving.saveBool("forgeFoundLollipop", true);
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Back to the map button
        this.addBackToTheVillageButton(this.renderArea, "forgeBackToTheVillageButton", "VILLAGE_FORGE");
        
        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/forge"), 0, 3);
        
        // Draw the stuff about the lollipop
        this.drawLollipopStuff(18, 15);
        
        // Draw the blacksmith's speech
        this.renderArea.drawSpeech(Database.getText(this.currentSpeech), 13, 44, 67, "forgeSpeech", Database.getTranslatedText(this.currentSpeech));
        
        // Draw the buttons
            // If we never bought the wooden sword and we don't have one
            if(Saving.loadBool("forgeBoughtWoodenSword") == false){
                const item = this.scoutedItems.findItem("FORGE_WOODEN_SWORD");
                this.renderArea.addAsciiRealButton(Database.getBuyText(item, 150, "candies"), 8, 35, "mapVillageForgeBuyWoodenSwordButton");
                this.renderArea.addLinkCall(".mapVillageForgeBuyWoodenSwordButton", new CallbackCollection(this.clickedBuyWoodenSwordButton.bind(this)));
            }
            // If we bought the wooden sword, never bought the iron axe and we don't have one
            else if(Saving.loadBool("forgeBoughtWoodenSword") == true && Saving.loadBool("forgeBoughtIronAxe") == false){
                const item = this.scoutedItems.findItem("FORGE_IRON_AXE");
                this.renderArea.addAsciiRealButton(Database.getBuyText(item, 400, "candies"), 8, 35, "mapVillageForgeBuyIronAxeButton");
                this.renderArea.addLinkCall(".mapVillageForgeBuyIronAxeButton", new CallbackCollection(this.clickedBuyIronAxeButton.bind(this)));
            }
            // If we bought the iron axe, never bought the polished silver sword and we don't have one
            else if(Saving.loadBool("forgeBoughtIronAxe") == true && Saving.loadBool("forgeBoughtPolishedSilverSword") == false){
                const item = this.scoutedItems.findItem("FORGE_POLISHED_SILVER_SWORD");
                this.renderArea.addAsciiRealButton(Database.getBuyText(item, 2_000, "candies"), 8, 35, "mapVillageForgeBuyPolishedSilverSwordButton");
                this.renderArea.addLinkCall(".mapVillageForgeBuyPolishedSilverSwordButton", new CallbackCollection(this.clickedBuyPolishedSilverSwordButton.bind(this)));
            }
            // If we bought the polished silver sword, never bought the lightweight body armour and we don't have one and we made the cave entrance
            else if(Saving.loadBool("forgeBoughtPolishedSilverSword") == true && Saving.loadBool("forgeBoughtLightweightBodyArmour") == false && Saving.loadBool("mainMapDoneCaveEntrance")){
                const item = this.scoutedItems.findItem("FORGE_LIGHTWEIGHT_BODY_ARMOUR");
                this.renderArea.addAsciiRealButton(Database.getBuyText(item, 15_000, "candies"), 8, 35, "mapVillageForgeBuyLightweightBodyArmourButton");
                this.renderArea.addLinkCall(".mapVillageForgeBuyLightweightBodyArmourButton", new CallbackCollection(this.clickedBuyLightweightBodyArmourButton.bind(this)));
            }
            // If we bought the lightweight body armour, never bought the scythe and we don't have one and the dragon is done
            else if(Saving.loadBool("forgeBoughtLightweightBodyArmour") == true && Saving.loadBool("forgeBoughtScythe") == false && Saving.loadBool("dragonDone")){
                const item = this.scoutedItems.findItem("FORGE_SCYTHE");
                this.renderArea.addAsciiRealButton(Database.getBuyText(item, 5_000_000, "candies"), 8, 35, "mapVillageForgeBuyScytheButton", Database.getTranslatedText("mapVillageForgeBuyScytheButton"), true, -1, null, false);
                this.renderArea.addLinkCall(".mapVillageForgeBuyScytheButton", new CallbackCollection(this.clickedBuyScytheButton.bind(this)));
            }
    }
}