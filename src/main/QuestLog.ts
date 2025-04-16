import {QuestLogMessage} from "./QuestLogMessage";
import {RenderArea} from "./RenderArea";
import {Pos} from "./Pos";
import EventEmitter from "eventemitter3";

export class QuestLog{
    // Array of messages contained in the quest log
    private messages: QuestLogMessage[] = [];
    private readonly size: number;
    reversed: boolean;
    
    // Constructor
    constructor(size: number, reversed: boolean){
        this.size = size;
        this.reversed = reversed;
    }
    
    // Public method
    public addDelimiter(): void{
        this.messages.push(new QuestLogMessage("----------------------------------------------------------------------------------------------------"));
        this.messages.push(new QuestLogMessage(""));
    }
    
    public addMessage(message: QuestLogMessage): void{
        // We add the message
        this.messages.push(message);
        
        // We check the log size
        this.checkLogSize();
    }
    
    public draw(renderArea: RenderArea, pos: Pos): void{
        // We draw the lines
        renderArea.drawHorizontalLine("-", pos.x, pos.x+100, pos.y);
        renderArea.drawHorizontalLine("-", pos.x, pos.x+100, pos.y+ this.size + 1);
        
        // We draw the messages
        for(var i = 0; i < this.messages.length; i++){
            if (this.reversed) {
                this.messages[i].draw(renderArea, new Pos(pos.x, 1 + pos.y + this.messages.length-1-i), 100);
            } else {
                this.messages[i].draw(renderArea, new Pos(pos.x, 1 + pos.y + i), 100);
            }
        }
    }
    
    // Private methods
    private checkLogSize(): void{
        if(this.messages.length > this.size){
            this.messages.splice(0, this.messages.length - this.size);
        }
    }
}

