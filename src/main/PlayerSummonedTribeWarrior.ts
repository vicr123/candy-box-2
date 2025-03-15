///<reference path="QuestEntity.ts"/>

import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {QuestEntityTeam} from "./QuestEntityTeam";
import {Database} from "./Database";
import {RenderTransparency} from "./RenderTransparency";
import {QuestEntityWeapon} from "./QuestEntityWeapon";

export class PlayerSummonedTribeWarrior extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("A tribe warrior", "a tribe warrior"),
              new RenderArea(4, 4),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(1, 1)), new CollisionBox(new Pos(0, 1), new Pos(4, 3))),
              new QuestEntityMovement()
             );

        // Set gravity and worms like
        this.setQuestEntityMovement(new QuestEntityMovement(new Pos(1, 0)));
        this.getQuestEntityMovement().setGravity(true);
        this.getQuestEntityMovement().setWormsLike(true);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(25);
        this.setHp(25);
        
        // Set the team
        this.setTeam(QuestEntityTeam.PLAYER);
        
        // Set the ascii art and the transparent character
        this.getRenderArea().drawArray(Database.getAscii("places/quests/theHole/lostTribeWarrior"));
        this.setTransparency(new RenderTransparency(" "));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("A tribal spear", "a tribal spear"), new CollisionBoxCollection(new CollisionBox(new Pos(-1, -1), new Pos(6, 6))), 8));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(2);
    }
    
    // update()
    public update(): void{
        super.update();
        
        
    }
}