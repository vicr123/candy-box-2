///<reference path="TheSeaPatternLevel.ts"/>

import {TheSeaPatternLevel} from "./TheSeaPatternLevel";
import {TheSea} from "./TheSea";
import {TheSeaPatternLevel_Boss1} from "./TheSeaPatternLevel_Boss1";
import {TheSeaPattern} from "./TheSeaPattern";
import {Random} from "./Random";
import {TheSeaPattern_LotOfMiniSharks} from "./TheSeaPattern_LotOfMiniSharks";
import {TheSeaPattern_JellyFishStorm} from "./TheSeaPattern_JellyFishStorm";

export class TheSeaPatternLevel_Level1 extends TheSeaPatternLevel{
    // Constructor
    constructor(theSea: TheSea){
        super(theSea);
    }
    
    // Public methods
    public getNextLevel(): TheSeaPatternLevel{
        return new TheSeaPatternLevel_Boss1(this.getTheSea());
    }
    
    public getPattern(initialDistance: number): TheSeaPattern{
        this.increaseHowManyPatterns();
        
        switch(Random.upTo(1)){
            case 0: return new TheSeaPattern_LotOfMiniSharks(this.getTheSea(), initialDistance); break;
            case 1: return new TheSeaPattern_JellyFishStorm(this.getTheSea(), initialDistance); break;
        }
    }
    
    public isLevelDone(): boolean{
        if(this.getHowManyPatterns() >= 2)
            return true;
        return false;
    }
}
