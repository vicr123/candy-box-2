import {Game} from "./Game";
import {RenderArea} from "./RenderArea";
import {CallbackCollection} from "./CallbackCollection";
import {Database} from "./Database";
import { ScoutResults } from "../archipelago/Archipelago";
import {ScoutKeys} from "../archipelago/ArchipelagoLocation";

export class Place{
    private game: Game;

    private _itemScoutResults: ScoutResults | undefined;
    
    // Constructor
    constructor(game: Game){
        this.game = game;
    }
    
    // Public methods
    public addBackToButton(renderArea: RenderArea, callbackCollection: CallbackCollection, text: string, translated: string, otherClass: string, y: number = 0, x: number = -1): void{
        // If the x position is under zero, we set it so that the button will be centered
        if(x < 0){
            x = renderArea.getWidth()/2 - text.length/2;
        }
        
        renderArea.addAsciiRealButton(text, x, y, otherClass, translated, true);
        renderArea.addLinkCall("." + otherClass, callbackCollection);
    }
    
    public addBackToMainMapButton(renderArea: RenderArea, otherClass: string, textName: string = "buttonBackToTheMap"): void{
        this.addBackToButton(renderArea,
                             new CallbackCollection(this.getGame().goToMainMap.bind(this.getGame())),
                             Database.getText(textName),
                             Database.getTranslatedText(textName),
                             otherClass);
    }
    
    // Public getters
    public getDefaultScroll(): number{
        return 0;
    }
    
    public getGame(): Game{
        return this.game;
    }
    
    public getGap(): number{
        return 0;
    }
    
    public getRenderArea(): RenderArea{
        return new RenderArea(); // We return a new render area, but this should not happen, since our daughter class should override this function
    }
    
    public getScrolling(): boolean{
        return false; // By default, we disable scrolling on the place
    }
    
    public willBeClosed(): void{}
    
    public willBeDisplayed(): void{}
    
    public willStopBeingDisplayed(): void{}

    public isArchipelagoPlace() {
        return false;
    }

    public scoutKeys(): ScoutKeys {
        return [];
    }

    public scoutResults(items: ScoutResults) {
        this._itemScoutResults = items;
    }

    public get itemScoutResults() {
        return this._itemScoutResults;
    }
}
