///<reference path="EqItem.ts"/>

import {EqItem} from "./EqItem";
import {Quest} from "./Quest";
import {Player} from "./Player";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Naming} from "./Naming";

export class Scythe extends EqItem{
    // Constructor
    constructor(){
        super("eqItemWeaponScythe",
              "eqItemWeaponScytheName",
              "eqItemWeaponScytheDescription",
              "eqItems/weapons/scythe");
    }
    
    // Public getters
    public getQuestEntityWeapon(quest: Quest, player: Player): QuestEntityWeapon{
        var qew: QuestEntityWeapon = 
                 new QuestEntityWeapon(quest,
                                       player,
                                       new Naming("A scythe", "a scythe"),
                                       player.getClassicCollisionBoxCollection(),
                                       21
                                      );
        qew.getCloseCombatDelay().setFixedDelay(0);
        return qew;
    }
}