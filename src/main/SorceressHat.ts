///<reference path="EqItem.ts"/>

import {EqItem} from "./EqItem";

export class SorceressHat extends EqItem{
    // Constructor
    constructor(){
        super("eqItemHatSorceressHat",
              "eqItemHatSorceressHatName",
              "eqItemHatSorceressHatDescription",
              "eqItems/hats/sorceressHat");
    }
    
    // Special ability
    public getSpecialAbility(): string{
        return "Enhances your spells & potions effects (sorceress hat).";
    }
}