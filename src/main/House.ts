///<reference path="Place.ts"/>

import {Game} from "./Game";
import {Place} from "./Place";

export class House extends Place{
    // Constructor
    constructor(game: Game){
        super(game);
    }
}