import {RenderArea} from "./RenderArea";
import {Item} from "archipelago.js";

export class CandiesThrownSmiley{
    // Constructor
    constructor(){
        
    }
    
    // Public methods
    public draw(renderArea: RenderArea, x: number, y: number, base: string, item: Item): number{
        // We're in the mother class, so we just draw nothing and return 0
        return 0;
    }
}