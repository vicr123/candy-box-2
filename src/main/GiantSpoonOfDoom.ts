///<reference path="EqItem.ts"/>

import {EqItem} from "./EqItem";
import {Quest} from "./Quest";
import {Player} from "./Player";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Naming} from "./Naming";

export class GiantSpoonOfDoom extends EqItem{
    // Constructor
    constructor(){
        super("eqItemWeaponGiantSpoonOfDoom",
              "eqItemWeaponGiantSpoonOfDoomName",
              "eqItemWeaponGiantSpoonOfDoomDescription",
              "eqItems/weapons/giantSpoonOfDoom");
    }
    
    // Public getters
    public getQuestEntityWeapon(quest: Quest, player: Player): QuestEntityWeapon{
        var qew: QuestEntityWeapon = 
                 new QuestEntityWeapon(quest,
                                       player,
                                       new Naming("The giant Spoon of Doom", "the giant Spoon of Doom"),
                                       player.getClassicCollisionBoxCollection(),
                                       315
                                      );
        qew.getCloseCombatDelay().setFixedDelay(14, 0);
        return qew;
    }
}