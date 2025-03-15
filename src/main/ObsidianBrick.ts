///<reference path="QuestEntitySpell.ts"/>

import {QuestEntitySpell} from "./QuestEntitySpell";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Naming} from "./Naming";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {QuestEntitySpellColor} from "./QuestEntitySpellColor";
import {Color} from "./Color";
import {ColorType} from "./ColorType";

export class ObsidianBrick extends QuestEntitySpell{
    // Constructor
    constructor(quest: Quest, pos: Pos, hp: number){
        super(quest,
              pos,
              new Naming("An obsidian brick", "an obsidian brick"),
              null,
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(2, 1))),
              new QuestEntityMovement()
             );
              
        // Set gravity
        this.getQuestEntityMovement().setGravity(true);
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(hp);
        this.setHp(hp);
        
        // Add the color
        this.addColor(new QuestEntitySpellColor(this.getQuest(), new Pos(0, 0), new Pos(2, 1), new Color(ColorType.PLAYER_OBSIDIAN_BRICK)));
    }
}