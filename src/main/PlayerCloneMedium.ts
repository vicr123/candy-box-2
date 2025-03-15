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

export class PlayerCloneMedium extends QuestEntity{
    // Constructor
    constructor(quest: Quest, pos: Pos){
        super(quest,
              pos,
              new Naming("A clone", "a clone"),
              new RenderArea(11, 4),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(11, 1)),
                                         new CollisionBox(new Pos(1, 1), new Pos(9, 1)),
                                         new CollisionBox(new Pos(2, 2), new Pos(7, 1)),
                                         new CollisionBox(new Pos(4, 3), new Pos(3, 1))),
              new QuestEntityMovement()
             );
        
        // Set the team
        this.setTeam(QuestEntityTeam.PLAYER);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(quest.getGame().getPlayer().getHp());
        this.setHp(quest.getGame().getPlayer().getHp());
        
        // Set the ascii art and the transparent character
        this.getRenderArea().drawArray(Database.getAscii("players/medium"));
        this.setTransparency(new RenderTransparency(" ", "%"));
        
        // Set the weapon and its delay
        this.addQuestEntityWeapon(new QuestEntityWeapon(this.getQuest(), this, new Naming("Its fists", "its fists"), new CollisionBoxCollection(new CollisionBox(new Pos(-1, -1), new Pos(13, 6))), 3));
        this.getLastQuestEntityWeapon().getCloseCombatDelay().setFixedDelay(3);
    }
}