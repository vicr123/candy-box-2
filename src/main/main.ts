import {MainLoadingType} from "./MainLoadingType";
import {Game} from "./Game";
import {Keyboard} from "./Keyboard";
import {Saving} from "./Saving";
import {LocalSaving} from "./LocalSaving";
import {i18n} from "../i18n";
import {Archipelago} from "../archipelago/Archipelago";

export module Main{
    // The game
    import loadGlobals = LocalSaving.loadGlobals;
    var game: Game = null;
    
    // Information about loading
    var loadingType: MainLoadingType = MainLoadingType.NONE;
    var loadingString: string = null;
    
    // Information about the game mode
    var gameMode: string = null;

    // Public functions    
    export function documentIsReady(): void{
        Keyboard.execute(); // Execute the Kayboard jquery stuff
        start(); // Start the game
    }
    
    export async function reloadEverythingFromFile(fileContent: string) {
        // Set the loading string
        loadingString = fileContent;

        await Saving.load(game, MainLoadingType.FILE);
        game.goToCandyBox()
    }
    
    export function setUrlData(urlData: string): void{
        // Create some variables
        var beforeEqual: string;
        var afterEqual: string;
        
        // If there's something in the url and we can find an equal sign and this equal sign isn't the last character of the string
        if(urlData != "" && urlData.indexOf("=") != -1 && urlData.indexOf("=") < urlData.length-1){
            // Strip the question mark
            urlData = urlData.substr(1);
            // Separate the data in two parts : before and after the equal sign
            beforeEqual = urlData.substr(0, urlData.indexOf("="));
            afterEqual = urlData.substr(urlData.indexOf("=") + 1);
            // Do different things depending on the value of beforeEqual
            switch(beforeEqual){
                // If we're trying to load a local slot
                case "slot":
                    loadingType = MainLoadingType.LOCAL;
                    loadingString = "slot" + afterEqual;
                break;
                // If we're trying to launch a new game with a special mode
                case "gamemode":
                    gameMode = afterEqual;
                break;
            }
        }
    }
    
    async function start(): Promise<void> {
        loadGlobals();

        // Translations
        await i18n.changeLanguage(Saving.loadString("gameLanguage"));

        game = new Game(gameMode);
        game.applyInvertedColorsToCss();
        window.game = game;
        Keyboard.setGame(game);
        game.postLoad();

        // We go to Archipelago configuration
        game.goToArchipelago();
    }
}