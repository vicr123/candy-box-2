///<reference path="EqItem.ts"/>

import {EqItem} from "./EqItem";
import {Player} from "./Player";
import {Quest} from "./Quest";

export class MerchantHat extends EqItem{
    // Constructor
    constructor(){
        super("eqItemHatMerchantHat",
              "eqItemHatMerchantHatName",
              "eqItemHatMerchantHatDescription",
              "eqItems/hats/merchantHat");
    }
    
    // Special ability
    public getSpecialAbility(): string{
        return "Multiplies the number of candies found in quests by 7 (merchant hat).";
    }
    
    // Candies found * 7
    public foundCandies(player: Player, quest: Quest, howMany: number): number{
        return howMany*7;
    }
}