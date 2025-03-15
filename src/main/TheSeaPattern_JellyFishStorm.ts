///<reference path="TheSeaPattern.ts"/>

import {TheSeaPattern} from "./TheSeaPattern";
import {TheSea} from "./TheSea";
import {Random} from "./Random";
import {Pos} from "./Pos";

export class TheSeaPattern_JellyFishStorm extends TheSeaPattern{
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
        if(Random.oneChanceOutOf(10))
            this.getTheSea().addJellyFish(new Pos(Random.between(x1, x2), Random.between(0, this.getTheSea().getRealQuestSize().y - this.getTheSea().getFloorMaxHeight() - 6)));
    }
}
