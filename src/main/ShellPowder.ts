///<reference path="QuestEntity.ts"/>

import {QuestEntity} from "./QuestEntity";
import {Quest} from "./Quest";
import {Pos} from "./Pos";
import {Database} from "./Database";
import {Naming} from "./Naming";
import {RenderArea} from "./RenderArea";
import {CollisionBoxCollection} from "./CollisionBoxCollection";
import {CollisionBox} from "./CollisionBox";
import {QuestEntityTeam} from "./QuestEntityTeam";
import {QuestItemFound} from "./QuestItemFound";
import { Saving } from "./Saving";
import {Algo} from "./Algo";
import itemName = Algo.itemName;

Saving.registerApLocation("apShellPowder", "SEA_SHELL_POWDER_ACQUIRED")

export class ShellPowder extends QuestEntity{
    // Constructor
    constructor(quest: Quest, leftDownCornerPosition: Pos){
        // Create the real global position
        var globalPosition: Pos = leftDownCornerPosition;
        globalPosition.add(new Pos(0, -Database.getAsciiHeight("places/quests/theSea/shellPowder")+1));
        
        // Call the mother constructor
        super(quest,
              globalPosition,
              new Naming("Shell powder", "shell powder"),
              new RenderArea(),
              new Pos(0, 0),
              new CollisionBoxCollection(new CollisionBox(new Pos(0, 0), new Pos(6, 3)))
             );
        
        // Set destructible
        this.setDestructible(true);
        this.setMaxHp(10);
        this.setHp(10);
        
        // Set the team (nature)
        this.setTeam(QuestEntityTeam.NATURE);
        
        // Draw the ascii art
        this.getRenderArea().resizeFromArray(Database.getAscii("places/quests/theSea/shellPowder"));
        this.getRenderArea().drawArray(Database.getAscii("places/quests/theSea/shellPowder"));
    }
    
    // willDie()
    public willDie(): void{
       super.willDie();
       this.getQuest().foundGridOrEqItem(new QuestItemFound(this.getQuest(), "apShellPowder", `You found ${itemName(this.getQuest().itemScoutResults.findItem("SEA_SHELL_POWDER_ACQUIRED"))}.`, this.getQuest().itemScoutResults.findItem("SEA_SHELL_POWDER_ACQUIRED")));
    }
}