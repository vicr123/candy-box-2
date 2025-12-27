///<reference path="QuestEntity.ts"/>

import {CallbackCollection} from "./CallbackCollection";
import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {Database} from "./Database";
import {QuestLogMessage} from "./QuestLogMessage";
import {QuestEntityDamageReason} from "./QuestEntityDamageReason";

export class Egg extends QuestEntity{
    // The callback we need to call when we die
    private callbackWhenDying: CallbackCollection;
    
    // Constructor
    constructor(quest: Quest, globalPosition: Pos, callbackWhenDying: CallbackCollection){
        // Call the mother constructor
        super(quest,
              globalPosition,
              new Naming("An egg", "an egg"),
              new RenderArea(2, 1),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(2, 1))),
              new QuestEntityMovement()
             );
        
        // Set the callback from parameter
        this.callbackWhenDying = callbackWhenDying;
        
        // Set gravity
        this.getQuestEntityMovement().setGravity(true);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(4);
        this.setHp(4);
        
        // Set the ascii art
        this.getRenderArea().drawArray(Database.getAscii("places/quests/castle/room3/egg"));
    }

    inflictDamage(damage: number, reason: QuestEntityDamageReason) {
        // Special case fists
        if (reason.getQuestEntityWeapon().getNaming().getAnywhere() != "your fists") {
            super.inflictDamage(damage, reason);
        }
    }

    // willDie()
    public willDie(): void{
        this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage("An egg was destroyed."));
        this.callbackWhenDying.fire();
    }
}