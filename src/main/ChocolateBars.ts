///<reference path="StatusBarResource.ts"/>

import {Game} from "./Game";
import {StatusBarResource} from "./StatusBarResource";
import {Algo} from "./Algo";
import {Archipelago} from "../archipelago/Archipelago";
import {Saving} from "./Saving";

export class ChocolateBars extends StatusBarResource{
    // Constructor
    constructor(game: Game, savingPrefix: string){
        super(game, savingPrefix);

        Archipelago.events.on("itemToBeProcessed", () => {
            this.updateChocolateCount();
        })
        Archipelago.client.room.on("locationsChecked", () => {
            this.updateChocolateCount();
        })
    }

    // Public setters
    public setCurrent(n: number, reCalcPlayerMaxHp: boolean = false): void{ // We update the status bar every time our current value changes
        // noop
    }

    load() {
        this.updateChocolateCount();
    }

    private updateChocolateCount() {
        super.setCurrent(
            Archipelago.itemCount("CHOCOLATE_BAR") +
            Archipelago.itemCount("CHOCOLATE_BAR_3") * 3 +
            Archipelago.itemCount("CHOCOLATE_BAR_4") * 4 -

            (Archipelago.isChecked("ENCHANT_ENCHANTED_KNIGHT_BODY_ARMOUR") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_ENCHANTED_MONKEY_WIZARD_STAFF") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_GIANT_SPOON_OF_DOOM") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_PINK_ENCHANTED_GLOVES") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_SUMMONING_TRIBAL_SPEAR") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_OCTOPUS_KING_CROWN_WITH_JASPERS") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_OCTOPUS_KING_CROWN_WITH_OBSIDIAN") ? 1 : 0) -
            (Archipelago.isChecked("ENCHANT_RED_ENCHANTED_GLOVES") ? 1 : 0) -
            (Saving.loadBool("wishingWellWeAreEnchanting") ? 1 : 0) -

            (Archipelago.isChecked("BAKE_PAIN_AU_CHOCOLAT_1") ? 1 : 0) -
            (Archipelago.isChecked("BAKE_PAIN_AU_CHOCOLAT_2") ? 1 : 0) -
            (Archipelago.isChecked("BAKE_PAIN_AU_CHOCOLAT_3") ? 1 : 0) -
            (Archipelago.isChecked("BAKE_PAIN_AU_CHOCOLAT_4") ? 1 : 0) -
            (Archipelago.isChecked("BAKE_PAIN_AU_CHOCOLAT_5") ? 1 : 0)
        );
    }
    
    // Public methods
    public getCurrentAsString(totalSize: number = 10): string{
        var n: number = this.getCurrent();
        var size: number = totalSize;
        
        var base: string = "";
        var prefix: string = "";
        var suffix: string = "";
        
        // We set the base or return right now in some special cases
        if(n < 0)
            return "What, negative chocolate bars?!";
        else if(n == 1)
            return "You have 1 chocolate bar";
        else
            base = Algo.numberToStringButNicely(n);
        
        // How much space do we still have ?
        size = totalSize - base.length;
        
        // We set the suffix
        if(size >= 15){
            suffix = " chocolate bars";
            
            // We add a suffix
                // How much space do we still have ?
                size = totalSize - base.length - suffix.length;
                
                // We set the prefix
                if(size >= 9) prefix = "You have ";
                else if(size >= 3) prefix = "-> ";
        }
        else if(size >= 3) suffix = " cb";
        
        // How much space do we still have ?
        size = totalSize - base.length - prefix.length - suffix.length;
        
        return prefix + base + suffix;
    }
}