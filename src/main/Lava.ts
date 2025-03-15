///<reference path="QuestEntity.ts"/>

import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {QuestEntityTeam} from "./QuestEntityTeam";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";

export class Lava extends QuestEntity{
    // Constructor
    constructor(quest: Quest, globalPosition: Pos, size: Pos){
        // Call the mother constructor
        super(quest,
              globalPosition,
              new Naming("Lava", "lava")
             );
        
        // Set the team (nature)
        this.setTeam(QuestEntityTeam.NATURE);
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Fire", "fire"), new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), size)), 1000));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(0);
    }
}