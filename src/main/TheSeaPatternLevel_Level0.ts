///<reference path="TheSeaPatternLevel.ts"/>

import {TheSeaPatternLevel} from "./TheSeaPatternLevel";
import {TheSea} from "./TheSea";
import {TheSeaPatternLevel_Boss0} from "./TheSeaPatternLevel_Boss0";
import {TheSeaPattern} from "./TheSeaPattern";
import {Random} from "./Random";
import {TheSeaPattern_MaybeOneSmallestFish} from "./TheSeaPattern_MaybeOneSmallestFish";
import {TheSeaPattern_OneSmallestFish} from "./TheSeaPattern_OneSmallestFish";
import {TheSeaPattern_MaybeOneMediumFish} from "./TheSeaPattern_MaybeOneMediumFish";

export class TheSeaPatternLevel_Level0 extends TheSeaPatternLevel{
    // Constructor
    constructor(theSea: TheSea){
        super(theSea);
    }
    
    // Public methods
    public getNextLevel(): TheSeaPatternLevel{
        return new TheSeaPatternLevel_Boss0(this.getTheSea());
    }
    
    public getPattern(initialDistance: number): TheSeaPattern{
        this.increaseHowManyPatterns();
        
        switch(Random.upTo(2)){
            case 0: return new TheSeaPattern_MaybeOneSmallestFish(this.getTheSea(), initialDistance); break;
            case 1: return new TheSeaPattern_OneSmallestFish(this.getTheSea(), initialDistance); break;
            case 2: return new TheSeaPattern_MaybeOneMediumFish(this.getTheSea(), initialDistance); break;
        }
    }
    
    public isLevelDone(): boolean{
        if(this.getHowManyPatterns() >= 2)
            return true;
        return false;
    }
}
