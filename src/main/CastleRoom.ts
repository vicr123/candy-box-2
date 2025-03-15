///<reference path="Place.ts"/>

import {Game} from "./Game";
import {Place} from "./Place";
import {RenderArea} from "./RenderArea";
import {CallbackCollection} from "./CallbackCollection";
import {Database} from "./Database";

export class CastleRoom extends Place{
    // Constructor
    constructor(game: Game){
        super(game);
    }
    
    // Special method used to add a button to go back to the castle
    public addBackToTheCastleButton(renderArea: RenderArea, otherClass: string): void{
        this.addBackToButton(renderArea,
                             new CallbackCollection(this.getGame().goToCastle.bind(this.getGame())),
                             Database.getText("buttonBackToTheCastle"),
                             Database.getTranslatedText("buttonBackToTheCastle"),
                             otherClass);
    }
}