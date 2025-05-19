import {Pos} from "./Pos";
import {Saving} from "./Saving";
import {i18n} from "../i18n";
import {Item} from "archipelago.js";

import {AsciiArt} from "virtual:ascii-art";

export type DatabaseTextReplacements = Record<string, string | number> & {
    count?: number;
}

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
    
    export function getText(key: string, replacements?: DatabaseTextReplacements): string{
        return i18n.t(key, {
            lng: "en",
            ...(replacements ?? {})
        });
    }
    
    export function getTranslatedText(key: string, replacements?: DatabaseTextReplacements): string{
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

    export function getTranslatedTextWithFallback(key: string, replacements?: DatabaseTextReplacements): string{
        let retval = getTranslatedText(key, replacements);
        if (!retval) {
            retval = getText(key, replacements);
        }
        return retval;
    }

    export function getBuyText(item: Item | Item[], price: number, currency: "candies" | "lollipops") {
        if (Array.isArray(item) && item.length > 1) {
            return getText(currency == "candies" ? "buyCandiesMultiple" : "buyLollipopsMultiple", {
                count: price
            });
        } else {
            const selectedItem = Array.isArray(item) ? item[0] : item;
            return getText(currency == "candies" ? "buyCandies" : "buyLollipops", {
                item: selectedItem.name,
                player: selectedItem.receiver.name,
                count: price
            });
        }
    }

    export function getTranslatedBuyText(item: Item, price: number, currency: "candies" | "lollipops") {
        return getTranslatedText(currency == "candies" ? "buyCandies" : "buyLollipops", {
            item: item.name,
            player: item.receiver.name,
            count: price
        });
    }
}

for (const art of AsciiArt) {
    Database.addAscii(art.name, art.width, art.height, art.art);
}