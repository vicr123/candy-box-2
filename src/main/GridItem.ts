///<reference path="Item.ts"/>

import {Item} from "./Item";
import {Pos} from "./Pos";
import {Player} from "./Player";
import {Quest} from "./Quest";

export class GridItem extends Item{
    // Position in the item grid
    private _position: Pos;
    private _condition: { (): boolean };

    // Constructor
    constructor(savingName: string, databaseName: string, databaseDescriptionName: string, ascii: string, condition: () => boolean = () => true){
        super(savingName, databaseName, databaseDescriptionName, ascii);
        this._condition = condition;
    }
    
    // Public methods
    public update(player: Player, quest: Quest): void{
        
    }

    public setPosition(pos: Pos) {
        this._position = pos;
    }
    
    // Public getters
    public getPosition(): Pos{
        return this._position;
    }

    public isEnabled() {
        return this._condition();
    }
}