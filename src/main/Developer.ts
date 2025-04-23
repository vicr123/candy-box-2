///<reference path="Quest.ts"/>

import {Game} from "./Game";
import {Quest} from "./Quest";
import {DeveloperEntity} from "./DeveloperEntity";
import {Pos} from "./Pos";
import {QuestLogMessage, WelcomeQuestLogMessage} from "./QuestLogMessage";
import {QuestEntity} from "./QuestEntity";
import {QuestEntityMovement} from "./QuestEntityMovement";
import {CallbackCollection} from "./CallbackCollection";
import {QuestEntityHealthBar} from "./QuestEntityHealthBar";
import {QuestEntityHealthBarPositionType} from "./QuestEntityHealthBarPositionType";
import {BarType} from "./BarType";
import {ScoutKeys} from "../archipelago/ArchipelagoLocation";

export class Developer extends Quest{
    // The developer
    private developerEntity: DeveloperEntity;
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // Resize the quest
        this.resizeQuest(100, 34);
        
        // Add collision boxes around
        this.addPlayerCollisionBoxes(true, true, true, true);
        
        // Add the player
        this.getGame().getPlayer().loadCandyBoxCharacter(this);
        this.getGame().getPlayer().setGlobalPosition(new Pos(0, 33));
        this.configPlayerOrClone(this.getGame().getPlayer());
        this.addEntity(this.getGame().getPlayer());
        
        // Add the developer entity
        this.addDeveloperEntity(new Pos(57, 0));
        
        // Add the message
        this.getGame().getQuestLog().addMessage(new WelcomeQuestLogMessage(game, "THE_DEVELOPER"));
    }

    public static get welcomeMessage() {
        return "The dragon took you on its back to a far away location."
    }

    scoutKeys(): ScoutKeys {
        return ["THE_DEVELOPER"]
    }

    // Public methods
    public castPlayerBlackDemons(): void{
        super.castPlayerBlackDemons();
        this.developerEntity.playerUsedBlackMagic();
    }
    
    public castPlayerBlackhole(): void{
        super.castPlayerBlackhole();
        this.developerEntity.playerUsedBlackMagic();
    }
    
    public castPlayerEraseMagic(): void{
        super.castPlayerEraseMagic();
        this.developerEntity.playerUsedBlackMagic();
    }
    
    public castPlayerObsidianWall(): void{
        super.castPlayerObsidianWall();
        this.developerEntity.playerUsedBlackMagic();
    }
    
    public configPlayerOrClone(entity: QuestEntity): void{
        entity.setQuestEntityMovement(new QuestEntityMovement(new Pos(1, 0)));
        entity.getQuestEntityMovement().setGravity(true);
        entity.getQuestEntityMovement().setWormsLike(true);
    }
    
    public endQuest(win: boolean): void{
        // We add some messages
        if(win){
            this.getGame().getQuestLog().addMessage(new QuestLogMessage("You managed to beat me. Congratulations :)"));
        }
        else{
            this.getGame().getQuestLog().addMessage(new QuestLogMessage("You died fighting the developer. Eh, he made this game after all!"));
        }
        
        // We call the endQuest method of our mother class
        super.endQuest(win);
    }
    
    public update(): void{
        if(this.getQuestEnded() == false){
            // Test if the player won the quest, if so, end the quest and return
            if(this.thePlayerWon()){
                this.endQuest(true);
                return;
            }
            
            // Test if the player is dead, if so, end the quest and return
            if(this.getGame().getPlayer().shouldDie()){
                this.endQuest(false);
                return;
            }
            
            // Update entities
            this.updateEntities();
        }
        
        // Draw
        this.preDraw();
        this.drawEntities();
        this.drawAroundQuest();
        if(this.getQuestEnded() == false) this.addExitQuestButton(new CallbackCollection(this.getGame().goToMainMap.bind(this.getGame())), "buttonExitQuestNoKeeping", "THE_DEVELOPER");
        else if(this.getQuestEndedAndWeWon() == false) this.addExitQuestButton(new CallbackCollection(this.getGame().goToMainMap.bind(this.getGame())), "buttonExitQuestNoKeepingBecauseLose", "THE_DEVELOPER");
        else this.addExitQuestButton(new CallbackCollection(this.getGame().goToMainMap.bind(this.getGame())), "buttonExitQuestKeeping", "THE_DEVELOPER");
        this.postDraw();
    }
    
    // Private methods
    private addDeveloperEntity(pos: Pos): void{
        this.developerEntity = new DeveloperEntity(this, pos);
        this.developerEntity.setHealthBar(new QuestEntityHealthBar(this.developerEntity, new Pos(100, 1), new Pos(0, 0), QuestEntityHealthBarPositionType.FIXED_ON_PAGE, true, true, BarType.HEALTH));
        this.addEntity(this.developerEntity);
    }
    
    private thePlayerWon(): boolean{
        // If the developer is dead, we return true
        if(this.developerEntity.shouldDie())
            return true;
        
        // Else we return false
        return false;
    }
}
