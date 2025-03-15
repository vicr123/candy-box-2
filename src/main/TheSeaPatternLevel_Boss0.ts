///<reference path="TheSeaPatternLevel.ts"/>

import {TheSeaPatternLevel} from "./TheSeaPatternLevel";
import {TheSea} from "./TheSea";
import {TheSeaPatternLevel_Level1} from "./TheSeaPatternLevel_Level1";
import {TheSeaPattern} from "./TheSeaPattern";
import {TheSeaPattern_Boss0_Shapes} from "./TheSeaPattern_Boss0_Shapes";

export class TheSeaPatternLevel_Boss0 extends TheSeaPatternLevel{
    // Constructor
    constructor(theSea: TheSea){
        super(theSea);
    }
    
    // Public methods
    public getNextLevel(): TheSeaPatternLevel{
        return new TheSeaPatternLevel_Level1(this.getTheSea());
    }
    
    public getPattern(initialDistance: number): TheSeaPattern{
        this.increaseHowManyPatterns();
        
        return new TheSeaPattern_Boss0_Shapes(this.getTheSea(), initialDistance);
    }
    
    public isLevelDone(): boolean{
        if(this.getHowManyPatterns() >= 1)
            return true;
        return false;
    }
}
