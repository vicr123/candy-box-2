///<reference path="QuestEntity.ts"/>

import {Naming} from "./Naming";
import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {Database} from "./Database";
import {RenderTransparency} from "./RenderTransparency";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {QuestLogMessage} from "./QuestLogMessage";
import {Algo} from "./Algo";
import {Random} from "./Random";

export class Camel extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("A camel", "a camel"),
              new RenderArea(7, 2),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(6, 1)), new CollisionBox(new Pos(2, 1), new Pos(5, 1))),
              new QuestEntityMovement()
             );
        
        // Set gravity
        this.getQuestEntityMovement().setGravity(true);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(7);
        this.setHp(7);
        
        // Set the ascii art and the transparent character
        this.getRenderArea().drawArray(Database.getAscii("places/quests/desert/camel"));
        this.setTransparency(new RenderTransparency(" "));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Its long neck", "its long neck"), new CollisionBoxCollection(new CollisionBox(new Pos(-1, 0), new Pos(3, 3))), 5));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setBetweenDelay(5, 7);
    }
    
    // Public methods
    public willDie(): void{
        this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage(this.getDeathMessage() + " (and found " + Algo.pluralFormat(this.getQuest().foundCandies(5 + Random.upTo(5)), " candy", " candies") + ")", this.getQuest().getCandiesFoundMessage()));
    }
}