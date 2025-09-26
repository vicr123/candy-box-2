///<reference path="CastleRoom.ts"/>

// Is the hoven happy? He is if he cooked something at least once
import {RenderArea} from "./RenderArea";
import {Saving} from "./Saving";
import {CastleRoom} from "./CastleRoom";
import {Game} from "./Game";
import {Database} from "./Database";
import {CallbackCollection} from "./CallbackCollection";
import {ArchipelagoLocation, ArchipelagoLocationRegion} from "../archipelago/ArchipelagoLocation";
import {Archipelago, ScoutResults} from "../archipelago/Archipelago";
import { Algo } from "./Algo";
import {getItemString} from "../item-text/ItemText";

Saving.registerBool("castleBigRoomHovenHappy", false);
Saving.registerBool("castleBigRoomHovenSadAgain", false);

export class CastleBigRoom extends CastleRoom{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // Current hoven speech
    private currentSpeech: string;
    
    // Is the hoven waiting? (if true, the hoven is asking us to give it sweets, if false he's telling us he just made a pain au chocolat)
    private hovenWaiting: boolean;


    // Constructor
    constructor(game: Game){
        super(game);
        
        // At first the hoven is waiting
        this.hovenWaiting = true;
        
        // Set the default speech, depending on if the hoven is happy or not
        if (Saving.loadBool("castleBigRoomHovenSadAgain")) {
            this.currentSpeech = "castleBigRoomHovenSpeechVerySad";
        }
        else if(Saving.loadBool("castleBigRoomHovenHappy") == false){
            this.currentSpeech = "castleBigRoomHovenSpeechSad";
        }
        else{
            this.currentSpeech = "castleBigRoomHovenSpeechHappy";
        }
        
        // Resize the area and update
        this.renderArea.resize(160, 30);
        this.update();
    }

    public static get welcomeMessage() {
        return "You enter the castle's big room."
    }

    public scoutKeys(): (keyof typeof ArchipelagoLocationRegion)[] {
        return ["CASTLE_BAKEHOUSE"];
    }

    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // update()
    public update(): void{
        // Reset the area
        this.renderArea.resetAllButSize();
        
        // Add the button to go back to the castle
        this.addBackToTheCastleButton(this.renderArea, "castleBigRoomBackToTheCastleButton", "CASTLE_BAKEHOUSE");
        
        // Draw the background
        this.drawBackground(0, 3);
        
        // Draw the speech
        this.drawSpeech(83, 10);

        // Don't draw the button if the hoven is very sad
        if (!Saving.loadBool("castleBigRoomHovenSadAgain")) {
            // If the hoven is waiting, we add the button to give it the sweets
            if(this.hovenWaiting){
                this.renderArea.addAsciiRealButton(Database.getText("castleBigRoomHovenLetHovenTakeButton"), 83, 19, "castleBigRoomLetHovenTakeButton", Database.getTranslatedText("castleBigRoomHovenLetHovenTakeButton"), true);
                this.renderArea.addLinkCall(".castleBigRoomLetHovenTakeButton", new CallbackCollection(this.letHovenTake.bind(this)));
            }
            // Else, we add the "thanks" button
            else{
                this.renderArea.addAsciiRealButton(Database.getText("castleBigRoomHovenThanks"), 83, 19, "castleBigRoomThanksButton", Database.getTranslatedText("castleBigRoomHovenThanks"), true);
                this.renderArea.addLinkCall(".castleBigRoomThanksButton", new CallbackCollection(this.thanksHoven.bind(this)));
            }
        }
    }
    
    // Private methods
    private drawBackground(x: number, y: number): void{
        // Draw the background ascii art
        this.renderArea.drawArray(Database.getAscii("places/castle/bigRoom/background"), x, y);
        
        // If the hoven is happy, change its face
        if(Saving.loadBool("castleBigRoomHovenHappy") && !Saving.loadBool("castleBigRoomHovenSadAgain")){
            this.renderArea.drawString("^       ^", x + 61, y + 9);
            this.renderArea.drawString("         ", x + 61, y + 10);
            this.renderArea.drawString("  '-.-'  ", x + 61, y + 11);
        }
    }
    
    private drawSpeech(x: number, y: number): void{
        const nextAvailableCheck = this.nextAvailableCheck();
        const scoutedItem = this.itemScoutResults?.findItem(nextAvailableCheck);

        let text: string;
        let translatedText: string;
        if (this.currentSpeech == "castleBigRoomHovenSpeechMadePainAuChocolat") {
            text = getItemString("hoven", scoutedItem);
        } else {
            text = Database.getText(this.currentSpeech, {
                player: Algo.posessive(scoutedItem?.receiver.name ?? ""),
                item: scoutedItem?.name
            });

            translatedText = Database.getTranslatedText(this.currentSpeech, {
                player: Algo.posessive(scoutedItem?.receiver.name ?? ""),
                item: scoutedItem?.name
            })
        }
        this.renderArea.drawSpeech(text, y, x, x + 30, "CastleBigRoomHovenSpeech", translatedText);
    }

    private nextAvailableCheck() {
        const ovenChecks: (keyof typeof ArchipelagoLocation)[] = ["BAKE_PAIN_AU_CHOCOLAT_1", "BAKE_PAIN_AU_CHOCOLAT_2", "BAKE_PAIN_AU_CHOCOLAT_3", "BAKE_PAIN_AU_CHOCOLAT_4", "BAKE_PAIN_AU_CHOCOLAT_5"];
        return ovenChecks.find(check => !Archipelago.isChecked(check));
    }
    
    private letHovenTake(): void{
        // If we have enough sweets
        if(this.getGame().getCandies().getCurrent() >= 100 && this.getGame().getChocolateBars().getCurrent() >= 1){
            const nextAvailableCheck = this.nextAvailableCheck();
            if (!nextAvailableCheck) {
                this.currentSpeech = "castleBigRoomHovenSpeechVerySad";
                Saving.saveBool("castleBigRoomHovenSadAgain", true);
                this.update();
                this.getGame().updatePlace();
                return;
            }

            // We spend the sweets
            this.getGame().getCandies().add(-100);
            this.getGame().getChocolateBars().add(-1);
            // The hoven is now happy
            Saving.saveBool("castleBigRoomHovenHappy", true);
            // The hoven isn't waiting anymore
            this.hovenWaiting = false;
            // We set the new speech
            this.currentSpeech = "castleBigRoomHovenSpeechMadePainAuChocolat";
            // We clear the check
            Archipelago.check(nextAvailableCheck);
        }
        // Else, we don't have enough sweets
        else{
            // If the hoven isn't happy
            if(Saving.loadBool("castleBigRoomHovenHappy") == false){
                this.currentSpeech = "castleBigRoomHovenNotEnough";
            }
            // Else, if it is happy
            else{
                this.currentSpeech = "castleBigRoomHovenSpeechHappyNotEnough";
            }
        }
        
        // We update
        this.update();
        this.getGame().updatePlace();
    }
    
    private thanksHoven(): void{
        // The hoven is now waiting
        this.hovenWaiting = true;
        
        // Set the new speech
        this.currentSpeech = "castleBigRoomHovenSpeechHappy";
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }
}