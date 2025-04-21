import {Game} from "./Game";
import {RenderArea} from "./RenderArea";
import {CallbackCollection} from "./CallbackCollection";
import {Database} from "./Database";
import {Archipelago, ArchipelagoEntrance, ScoutResults} from "../archipelago/Archipelago";
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

    public scoutShouldHint() {
        return false;
    }

    public scoutResults(items: ScoutResults) {
        this._itemScoutResults = items;
    }

    public get itemScoutResults() {
        return this._itemScoutResults;
    }

    // Special method used to add a button to go back to the castle
    public addBackToTheCastleButton(renderArea: RenderArea, otherClass: string, thisEntrance: ArchipelagoEntrance): void {
        this.addBackButton(renderArea, otherClass, thisEntrance);
    }

    // Special method used to add a button to go back to the village
    public addBackToTheVillageButton(renderArea: RenderArea, otherClass: string, thisEntrance: ArchipelagoEntrance | "ENERGY_ROOM"): void {
        this.addBackButton(renderArea, otherClass, thisEntrance);
    }

    public addBackToMainMapButton(renderArea: RenderArea, otherClass: string, thisEntrance: ArchipelagoEntrance | "VILLAGE"): void{
        this.addBackButton(renderArea, otherClass, thisEntrance);
    }

    public addBackButton(renderArea: RenderArea, otherClass: string, thisEntrance: ArchipelagoEntrance | "VILLAGE" | "ENERGY_ROOM") {
        let buttonText = "buttonBackToTheMap";
        let buttonCallback = this.getGame().goToMainMap.bind(this.getGame());

        if (thisEntrance == "ENERGY_ROOM") {
            buttonText = "buttonBackToTheVillage";
            buttonCallback = this.getGame().goToVillage.bind(this.getGame());
        } else if (thisEntrance != "VILLAGE") {
            const parentEntrance = Archipelago.findEntrance(thisEntrance);
            switch (parentEntrance) {
                case "THE_DEVELOPER":
                case "HELL":
                    this.addBackButton(renderArea, otherClass, "DRAGON");
                    return;
                case "VILLAGE_SHOP":
                case "VILLAGE_QUEST_HOUSE":
                case "VILLAGE_FORGE":
                case "VILLAGE_MINIGAME":
                case "VILLAGE_FURNISHED_HOUSE":
                    buttonText = "buttonBackToTheVillage";
                    buttonCallback = this.getGame().goToVillage.bind(this.getGame());
                    break;
                case "CASTLE_BAKEHOUSE":
                case "CASTLE_DARK_ROOM":
                case "TOWER":
                case "DRAGON":
                case "THE_CASTLE_TRAP_ROOM":
                case "THE_GIANT_NOUGAT_MONSTER":
                case "THE_CASTLE_EGG_ROOM":
                    buttonText = "buttonBackToTheCastle";
                    buttonCallback = this.getGame().goToCastle.bind(this.getGame());
                    break;
                case "THE_LEDGE_ROOM":
                case "THE_XINOPHERYDON":
                case "THE_TEAPOT":
                    buttonText = "buttonBackToTheDesertFortress";
                    buttonCallback = this.getGame().goToInsideFortress.bind(this.getGame());
                    break;
                case "THE_NAKED_MONKEY_WIZARD":
                case "THE_OCTOPUS_KING":
                    buttonText = "buttonBackToTheCave";
                    buttonCallback = this.getGame().goToTheCave.bind(this.getGame());
                    break;
                case "THE_SEA":
                    buttonText = "buttonBackToThePier";
                    buttonCallback = this.getGame().goToThePier.bind(this.getGame());
                    break;
                case "THE_CELLAR":
                    buttonText = "buttonBackToVillageHouse";
                    buttonCallback = this.getGame().goToFifthHouse.bind(this.getGame());
                    break;
            }
        }

        this.addBackToButton(renderArea,
            new CallbackCollection(buttonCallback),
            Database.getText(buttonText),
            Database.getTranslatedText(buttonText),
            otherClass);
    }
}
