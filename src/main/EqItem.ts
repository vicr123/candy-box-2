///<reference path="Item.ts"/>

import {Player} from "./Player";
import {Item} from "./Item";
import {Quest} from "./Quest";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Naming} from "./Naming";

export class EqItem extends Item{
    // Public methods    
    public update(player: Player, quest: Quest): void{
        
    }
    
    // Public getters
    public getQuestEntityWeapon(quest: Quest, player: Player): QuestEntityWeapon{
        return new QuestEntityWeapon(quest, player, new Naming("???", "???")); 
    }
}