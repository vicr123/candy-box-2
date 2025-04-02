///<reference path="QuestEntity.ts"/>

import {Quest} from "./Quest";
import {QuestEntity} from "./QuestEntity";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {QuestEntityAnimation} from "./QuestEntityAnimation";
import {Random} from "./Random";
import {QuestItemFound} from "./QuestItemFound";
import {Saving} from "./Saving";
import {Algo} from "./Algo";
import itemName = Algo.itemName;

Saving.registerApLocation("apDesertBirdFeather", "DESERT_BIRD_FEATHER");

export class DesertBird extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos, goingRight: boolean){
        super(quest,
              pos,
              new Naming("A desert bird", "a desert bird"),
              new RenderArea(9, 4),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(9, 4)))
             );
        
        // If we're heading to right
        if(goingRight){
            this.setQuestEntityMovement(new QuestEntityMovement(new Pos(1, 0)));
            this.setQuestEntityAnimation(new QuestEntityAnimation(3, Random.upTo(2), Random.upTo(1), "places/quests/desert/birdRightUp", "places/quests/desert/birdRightDown"));
        }
        // Else
        else{
            this.setQuestEntityMovement(new QuestEntityMovement(new Pos(-1, 0)));
            this.setQuestEntityAnimation(new QuestEntityAnimation(3, Random.upTo(2), Random.upTo(1), "places/quests/desert/birdLeftUp", "places/quests/desert/birdLeftDown"));
        }
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(6);
        this.setHp(6);
    }
    
    // willDie()
    public willDie(): void{
        super.willDie();
        this.getQuest().foundGridOrEqItem(new QuestItemFound(this.getQuest(), "apDesertBirdFeather", `You found ${itemName(this.getQuest().itemScoutResults.findItem("DESERT_BIRD_FEATHER"))}!`, this.getQuest().itemScoutResults.findItem("DESERT_BIRD_FEATHER")));
    }
}
