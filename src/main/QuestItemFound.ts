import {Quest} from "./Quest";
import {QuestLogMessage} from "./QuestLogMessage";
import {Item} from "archipelago.js";
import {Algo} from "./Algo";
import sentItem = Algo.sentItem;

export class QuestItemFound{
    // The quest
    private quest: Quest;
    
    // The saving name of the item
    private savingName: string;
    
    // The text to show when we find the item
    private foundText: string;
    
    // The text to show when we get the item
    private item: Item;
    
    // Constructor
    constructor(quest: Quest, savingName: string, foundText: string, item: Item){
        this.quest = quest;
        this.savingName = savingName;
        this.foundText = foundText;
        this.item = item;
    }
    
    // Public methods
    public found(): void{ // Called when we find the item
        this.quest.getGame().getQuestLog().addMessage(new QuestLogMessage(this.foundText, null, true));
    }
    
    public get(): void{ // Called when we get the item
        this.quest.getGame().getQuestLog().addMessage(new QuestLogMessage(`You sent ${sentItem(this.item)}`, null, true));
    }
    
    // Public getters    
    public getSavingName(): string{
        return this.savingName;
    }
}