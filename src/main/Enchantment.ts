import {EnchantmentItem} from "./EnchantmentItem";
import {Saving} from "./Saving";
import {ArchipelagoLocation} from "../archipelago/ArchipelagoLocation";

export class Enchantment{
    // Two items : before (the enchanted item) and after (the result of the enchantment)
    private beforeItem: EnchantmentItem;
    private beforeApName: keyof typeof ArchipelagoLocation;
    private afterItem: EnchantmentItem;
    
    // Constructor
    constructor(beforeItem: EnchantmentItem, beforeApName: keyof typeof ArchipelagoLocation, afterItem: EnchantmentItem){
        this.beforeApName = beforeApName;
        this.beforeItem = beforeItem;
        this.afterItem = afterItem;
    }
    
    // Public methods
    public enchant(): void{
        // We lose gain the after item
        Saving.saveBool(this.afterItem.getSavingName(), true);
    }
    
    public isPossible(): boolean{ // Is the enchatment possible?
        // If we have the before item but not the after item, we return true
        if(this.beforeItem.isPossessed() == true && this.afterItem.isPossessed() == false)
            return true;
        
        // Else we return false
        return false;
    }
    
    // Public getters
    public getAfterItem(): EnchantmentItem{
        return this.afterItem;
    }
    
    public getBeforeItem(): EnchantmentItem{
        return this.beforeItem;
    }

    public getBeforeApName() {
        return this.beforeApName;
    }
}