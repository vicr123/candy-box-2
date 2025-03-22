import {Pos} from "./Pos";
import {Saving} from "./Saving";
import {i18n} from "../i18n";
import {Item} from "archipelago.js";
import {san} from "../utils";

export module Database{
    // Variables
    var asciiMap: { [s: string]: string[]; } = {}; // A map which associates strings (the keys) to array of strings (the ascii arts)
    var asciiSizeMap: { [s: string]: Pos; } = {}; // A map which associates strings (the keys) to the sizes of ascii arts
    var textMap: { [s: string]: string; } = {}; // A map which associated strings (the keys) to strings (the texts)

    // Public functions
    export function addAscii(asciiName: string, width: number, height: number, asciiArray: string[]): void{
        asciiMap[asciiName] = asciiArray;
        asciiSizeMap[asciiName] = new Pos(width, height);
    }
    
    export function addText(key: string, text: string): void{
        textMap[key] = text;
    }
    
    export function isTranslated(): boolean{
        if(Saving.loadString("gameLanguage") != "en")
            return true;
        return false;
    }
    
    // Public getters
    export function getAscii(key: string): string[]{
        if(asciiMap[key] == null)
            console.log("Error : trying to access the unknown ascii art \"" + key + "\"");
        
        return asciiMap[key];
    }
    
    export function getAsciiHeight(key: string): number{
        return asciiSizeMap[key].y;
    }
    
    export function getAsciiWidth(key: string): number{
        return asciiSizeMap[key].x;
    }
    
    export function getPartOfAscii(key: string, y1: number, y2: number): string[]{
        return getAscii(key).slice(y1, y2);
    }
    
    export function getText(key: string, replacements?: Record<string, string>): string{
        return i18n.t(key, {
            lng: "en",
            ...(replacements ?? {})
        });
    }
    
    export function getTranslatedText(key: string, replacements?: Record<string, string>): string{
        // If we have a language (other than english) selected
        if(Saving.loadString("gameLanguage") != "en"){
            // If the translated text isn't chinese
            if(Saving.loadString("gameLanguage") != "zh")
                return i18n.t(key, replacements);
            // Else, the translated text is chinese
            else
                return i18n.t(key, replacements).addChineseSpaces(); // We return the text after adding spaces
        }
        
        // Else, we return an empty string
        return "";
    }

    export function getBuyText(item: Item, price: number, currency: "candies" | "lollipops") {
        return san`Send ${item.name} to ${item.receiver.name} (${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${currency})`;
    }
}
