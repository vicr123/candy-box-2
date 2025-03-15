///<reference path="TheCavePattern.ts"/>

import {TheCavePattern} from "./TheCavePattern";
import {Saving} from "./Saving";
import {TheCave} from "./TheCave";
import {RenderArea} from "./RenderArea";
import {Database} from "./Database";

Saving.registerBool("TheCavePattern_TreasureMapSawMap", false);
Saving.registerBool("TheCavePattern_TreasureMapFoundTreasure", false);

export class TheCavePattern_TreasureMap extends TheCavePattern{
    // Constructor
    constructor(theCave: TheCave){
        super(theCave);
        
        // We saw the map!
        Saving.saveBool("TheCavePattern_TreasureMapSawMap", true);
    }
    
    // Public methods
    public draw(renderArea: RenderArea, x: number, y: number): void{
       renderArea.drawArray(Database.getAscii("places/theCave/treasureMap"), x + 38, y + 22);
    }
    
    public ended(): boolean{
        return true;
    }
    
    public getSentence(): string{
        return "theCavePattern_TreasureMapSentence";
    }
}