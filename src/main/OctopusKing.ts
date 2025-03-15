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
import {QuestItemFound} from "./QuestItemFound";

export class OctopusKing extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("The Octopus King", "the Octopus King"),
              new RenderArea(6, 4),
              new Pos(0, 0),
            // @ts-expect-error
              new CollisionBoxCollection(new CollisionBox(this, new Pos(2, 0), new Pos(2, 1)),
                  // @ts-expect-error
                                         new CollisionBox(this, new Pos(1, 1), new Pos(4, 1)),
                  // @ts-expect-error
                                         new CollisionBox(this, new Pos(1, 2), new Pos(4, 1)),
                  // @ts-expect-error
                                         new CollisionBox(this, new Pos(0, 3), new Pos(6, 1))
                                        ),
              new QuestEntityMovement()
             );
        
        // Set gravity
        this.getQuestEntityMovement().setGravity(true);
        this.getQuestEntityMovement().setWormsLike(false);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(380);
        this.setHp(380);
        
        // Set the ascii art and the transparent character
        this.getRenderArea().drawArray(Database.getAscii("places/quests/octopusKing/octopusKing"));
        this.setTransparency(new RenderTransparency(" "));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Its tentacles", "its tentacles"), new CollisionBoxCollection(new CollisionBox(this, new Pos(-1, -1), new Pos(8, 6))), 16));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(3);
    }
    
    // update()
    public update(): void{
        // Go towards the player
        this.goTowards(this.getGlobalPosition(), this.getQuest().getGame().getPlayer().getGlobalPosition(), 0, new Pos(1, 0));
        
        // Call the mother class update method
        super.update();
    }
    
    // willDie()
    public willDie(): void{
        // Candies
        this.getQuest().getGame().getQuestLog().addMessage(new QuestLogMessage(this.getDeathMessage() + " (and found " + Algo.pluralFormat(this.getQuest().foundCandies(4000), " candy", " candies") + ")", this.getQuest().getCandiesFoundMessage()));
        // The monkey wizard staff
        this.getQuest().foundGridOrEqItem(new QuestItemFound(this.getQuest(), "eqItemHatOctopusKingCrown", "You found the Octopus King crown.", "You gain the Octopus King crown."));
    }
}