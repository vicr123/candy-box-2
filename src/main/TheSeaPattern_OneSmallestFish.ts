///<reference path="TheSeaPattern.ts"/>

import {TheSeaPattern} from "./TheSeaPattern";
import {TheSea} from "./TheSea";
import {Pos} from "./Pos";
import {Random} from "./Random";

export class TheSeaPattern_OneSmallestFish extends TheSeaPattern{
    // Constructor
    constructor(theSea: TheSea, initialDistance: number){
        super(theSea, initialDistance);
    }
    
    // Public methods
    public isPatternDone(): boolean{
        if(this.getTheSea().getDistance() > this.getInitialDistance() + 100)
            return true;
        return false;
    }
    
    public run(x1: number, x2: number): void{
        this.getTheSea().addSmallestFish(new Pos(Random.between(x1, x2), Random.between(0, this.getTheSea().getRealQuestSize().y - this.getTheSea().getFloorMaxHeight() - 2)));
    }
}
