///<reference path="TheSeaPatternLevel.ts"/>

import {TheSeaPatternLevel} from "./TheSeaPatternLevel";
import {TheSea} from "./TheSea";
import {TheSeaPattern} from "./TheSeaPattern";
import {TheSeaPattern_BigSharks} from "./TheSeaPattern_BigSharks";
import {TheSeaPattern_SeaSnakesForever} from "./TheSeaPattern_SeaSnakesForever";

export class TheSeaPatternLevel_Level2 extends TheSeaPatternLevel{
    // Constructor
    constructor(theSea: TheSea){
        super(theSea);
    }
    
    // Public methods
    public getNextLevel(): TheSeaPatternLevel{
        return new TheSeaPatternLevel_Level2(this.getTheSea());
    }
    
    public getPattern(initialDistance: number): TheSeaPattern{
        this.increaseHowManyPatterns();
        
        // If this is the first pattern, then we return the big sharks pattern
        if(this.getHowManyPatterns() == 1)
            return new TheSeaPattern_BigSharks(this.getTheSea(), initialDistance);
        // Else, we return the sea snakes pattern
        else
            return new TheSeaPattern_SeaSnakesForever(this.getTheSea(), initialDistance);
    }
    
    public isLevelDone(): boolean{
        return false;
    }
}
