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
import {RenderTransparency} from "./RenderTransparency";
import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {QuestLogMessage} from "./QuestLogMessage";
import {Algo} from "./Algo";
import {Random} from "./Random";

export class MiniShark extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("A dangerous fish", "a dangerous fish"),
              new RenderArea(19, 5),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(8, 1), new Pos(2, 1)),
                                         new CollisionBox(new Pos(17, 1), new Pos(2, 1)),
                                         new CollisionBox(new Pos(5, 2), new Pos(14, 1)),
                                         new CollisionBox(new Pos(2, 3), new Pos(17, 1)),
                                         new CollisionBox(new Pos(0, 4), new Pos(12, 1)),
                                         new CollisionBox(new Pos(18, 4), new Pos(1, 1))
              ),
              new QuestEntityMovement(new Pos(-1, 0))
             );
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(70);
        this.setHp(70);
        
        // Set the ascii art
        this.getRenderArea().drawArray(Database.getAscii("places/quests/theSea/miniShark"));
        
        // Set the transparency
        this.setTransparency(new RenderTransparency(" ", "%"));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Its teeth", "its teeth"), new CollisionBoxCollection(new CollisionBox(new Pos(-1, -1), new Pos(21, 7))), 8));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(2);
    }
    
    // willDie()
    public willDie(): void{
        this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage(this.getDeathMessage() + " (and found " + Algo.pluralFormat(this.getQuest().foundCandies(50 + 10*Random.upTo(5)), " candy", " candies") + ")", this.getQuest().getCandiesFoundMessage()));
    }
}