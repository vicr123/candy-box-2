///<reference path="QuestEntity.ts"/>

import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {Database} from "./Database";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Random} from "./Random";
import {QuestLogMessage} from "./QuestLogMessage";
import {Algo} from "./Algo";

export class Rat extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("A rat", "a rat"),
              new RenderArea(3, 1),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(3, 1))),
              new QuestEntityMovement()
             );
        
        // Set gravity
        this.getQuestEntityMovement().setGravity(true);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(3);
        this.setHp(3);
        
        // Set the ascii art
        this.getRenderArea().drawArray(Database.getAscii("places/quests/cellar/rat"));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Its teeth", "its teeth"), new CollisionBoxCollection(new CollisionBox(new Pos(-1, -1), new Pos(5, 2))), 1));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(3);
    }
    
    // Public methods
    public willDie(): void{
        // We find a candy
        if(Random.oneChanceOutOf(3))
            this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage(this.getDeathMessage() + " (and found " + Algo.pluralFormat(this.getQuest().foundCandies(1), " candy", " candies") + ")", this.getQuest().getCandiesFoundMessage()));
        // We don't find a candy
        else
            this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage(this.getDeathMessage()));
    }
}