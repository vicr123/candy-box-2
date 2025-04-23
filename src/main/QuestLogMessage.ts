import {RenderArea} from "./RenderArea";
import {Pos} from "./Pos";
import {Archipelago, ArchipelagoEntrance} from "../archipelago/Archipelago";
import {Game} from "./Game";

export class QuestLogMessage{
    // Strings
    private left: string = null;
    private right: string = null;
    
    // Should the message be bold ?
    private bold: boolean;
    
    // Constructor
    private disableScrolling: boolean;

    constructor(left: string, right: string = null, bold: boolean = false, disableScrolling?: boolean){
        // Set the parameters
        this.left = left;
        this.right = right;
        this.bold = bold;
        this.disableScrolling = disableScrolling ?? false;

        if (right) {
            // If the left string is too big
            if(this.left.length > 100 - (this.right != null? this.right.length:0)){
                this.left = this.left.substr(0, 100 - (this.right != null? this.right.length:0) - 7) + " (...)"
            }
        }

    }

    // Public methods
    public draw(renderArea: RenderArea, pos: Pos, width: number): void{
        if(this.left != null){
            if (this.disableScrolling) {
                renderArea.drawString(this.left, pos.x, pos.y);
            } else {
                renderArea.drawScrollingString(this.left, pos.x, pos.y, 100);
            }
            if(this.bold) renderArea.addBold(pos.x, pos.x + this.left.length, pos.y);
        }
        if(this.right != null){
            renderArea.drawString(this.right, pos.x + width - this.right.length, pos.y);
            if(this.bold) renderArea.addBold(pos.x + width - this.right.length, width, pos.y);
        }
    }
}

export class WelcomeQuestLogMessage extends QuestLogMessage{
    constructor(game: Game, quest: ArchipelagoEntrance) {
        const questMessage = ({
            THE_BRIDGE: "A huge troll is blocking your way!",
            THE_CASTLE_ENTRANCE: "",
            THE_CASTLE_TRAP_ROOM: "Damn, it seems to be full of spikes!",
            THE_CASTLE_EGG_ROOM: "",
            THE_CELLAR: "It's dark and you hear rats squeaking all around you.",
            THE_DESERT: "Camels and palm trees as far as the eye can see.",
            THE_DEVELOPER: "You're attacking the developer.",
            THE_FOREST: "",
            THE_XINOPHERYDON: "It seems tricky.",
            THE_TEAPOT: "There's a giant teapot in the center of the room.",
            THE_LEDGE_ROOM: "There's a chest up there. How to reach it?!",
            THE_GIANT_NOUGAT_MONSTER: "The Giant Nougat Monster seems to be asleep.",
            HELL: "You enter Hell.",
            THE_NAKED_MONKEY_WIZARD: "Let the fight begin!",
            THE_OCTOPUS_KING: "Let the fight begin!",
            THE_HOLE: "You're falling quickly, try to stay alive!",
            THE_SEA: "You know you could find precious hidden treasures in the depths...",
            THE_X_POTION: "You are now fighting yourself."
        } satisfies {[key in ArchipelagoEntrance]?: string})[quest];

        let message = `${game.room(Archipelago.findEntrance(quest)).welcomeMessage} ${questMessage}`;
        super(message);
    }
}