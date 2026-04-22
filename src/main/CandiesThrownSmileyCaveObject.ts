import {Pos} from "./Pos";
import {Item} from "archipelago.js";

export class CandiesThrownSmileyCaveObject{
    // The string
    private str: string;
    
    // The position
    private position: Pos;
    
    // Constructor
    constructor(str: string, position: Pos){
        this.str = str;
        this.position = position;
    }
    
    // Public getters
    public getPosition(): Pos{
        return this.position;
    }
    
    public getStr(item: Item): string{
        return this.str.replace("{player}", item.receiver.alias).replace("{item}", item.name);
    }
}