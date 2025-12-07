///<reference path="Place.ts"/>

import {RenderArea} from "./RenderArea";
import {Place} from "./Place";
import {Game} from "./Game";
import {Database} from "./Database";
import {Algo} from "./Algo";
import {CallbackCollection} from "./CallbackCollection";
import {Saving} from "./Saving";
import {i18n} from "../i18n";
import {Archipelago} from "../archipelago/Archipelago";
import {ArchipelagoPlace} from "../archipelago/ArchipelagoPlace";
import {Save} from "./Save";

export class Cfg extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // The map used for the language selection : match the select's options id with the actual usually two letters code used by the Saving module
    private languageSelectionMap: { [s: string]: string; } = {
        "cfgLanguageEn": "en",
        "cfgLanguagePtBr": "pt-BR",
        "cfgLanguageCz": "cz",
        "cfgLanguageEs": "es",
        "cfgLanguageFr": "fr",
        "cfgLanguageNl": "nl",
        "cfgLanguageZh": "zh",
        "cfgLanguageDe": "de",
        "cfgLanguageSe": "se",
        "cfgLanguageHu": "hu",
        "cfgLanguageId": "id",
        "cfgLanguageKr": "kr",
        "cfgLanguagePl": "pl",
        "cfgLanguageUk": "uk",
        "cfgLanguageRu": "ru",
        "cfgLanguageTr": "tr",
        "cfgLanguageEl": "el"
        };
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // Resize the area
        this.renderArea.resize(100, 48);
        
        // Update for the first time
        this.update();
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private drawAbout(x: number, y: number): void{
        // The title
        this.renderArea.drawArray(Database.getAscii("text/About"), x + 34, y);
        
        // Who?
        this.renderArea.drawString("Who?", x + 2, y + 7);
        this.renderArea.addBold(x+2, x+6, y+7);
        
        // Who...
        this.renderArea.drawString("Ideas, game design & code by aniwey.", x + 4, y + 9);
        this.renderArea.drawString("Ascii art by Tobias Nordqvist, GodsTurf, dixsept, Dani \"Deinol\" Gómez and aniwey.", x + 4, y + 10);
        this.renderArea.drawString("Archipelago fork by Victor Tran and Aren Merzoian.", x + 4, y + 11);
        
        // License?
        this.renderArea.drawString("License?", x + 2, y + 13);
        this.renderArea.addBold(x+2, x+10, y+13);
        
        // License...
        this.renderArea.drawString("The game source code is published under the GPLv3 license. This means you are free to modify and", x + 4, y + 15);
        this.renderArea.drawString("redistribute the game, even for commercial purposes, under some conditions.", x, y + 16);
        this.renderArea.addHtmlLink(x + 76, y + 16, "source_code.html", "Learn more.");
        
        this.renderArea.drawString("The ascii art is published under the CC-BY-SA license, which means that you can reuse it if you", x + 4, y + 18);
        this.renderArea.drawString("credit the artist who made the art and share your modifications under the same license.", x, y + 19);
        this.renderArea.addHtmlLink(x + 88, y + 19, "ascii_art.html", "Learn more.");
        
        // Aything else?
        this.renderArea.drawString("Anything else?", x + 2, y + 22);
        this.renderArea.addBold(x+2, x+16, y+22);
        
        // Contact
        this.renderArea.drawString("Feel free to contact me at vicr123@gmail.com if you have any comments or questions :)", x + 4, y + 24);
        this.renderArea.addHtmlLink(x + 4, y + 25, "https://candybox2.github.io/", "Play the original Candy Box 2.");
    }
    
    private drawCfgInvertColors(x: number, y: number): void{        
        // Text
        this.renderArea.drawString(Database.getText("cfgInvertColors"), x, y);
        this.renderArea.drawString(Database.getTranslatedText("cfgInvertColors"), x, y + 1, true);
        
        // The checkbox
        this.renderArea.addCheckbox(x + Algo.takeBiggest(Database.getText("cfgInvertColors").length, Database.getTranslatedText("cfgInvertColors").length) + 2, y, new CallbackCollection(this.invertColorsChecked.bind(this)), new CallbackCollection(this.invertColorsUnchecked.bind(this)), "cfgInvertColorsCheckbox", Saving.loadBool("gameInvertedColors"));
    }
    
    private drawCfgLanguage(x: number, y: number): void{
        // Text
        this.renderArea.drawString(Database.getText("cfgChooseLanguage"), x, y);
        this.renderArea.drawString(Database.getTranslatedText("cfgChooseLanguage"), x, y + 1, true);
        
        // List
        this.renderArea.addList(x + Algo.takeBiggest(Database.getText("cfgChooseLanguage").length, Database.getTranslatedText("cfgChooseLanguage").length) + 2, x + Algo.takeBiggest(Database.getText("cfgChooseLanguage").length, Database.getTranslatedText("cfgChooseLanguage").length) + 20, y, "cfgLanguageList", new CallbackCollection(this.languageSelected.bind(this)),
            [
            "category", "Supported Translations",
            "cfgLanguageEn", "English",
            "cfgLanguagePtBr", "Brazilian Portuguese (by TranslaCAT, Archipelago fork translations by Vrabbers and Nyunte)",
            "cfgLanguageNl", "Dutch (by Noël Wierema and Vincent van Gennep, corrections by Wessel van den Putte, Archipelago fork translations by Aren Merzoian)",
            "cfgLanguageFr", "French (by aniwey, Archipelago fork translations by Léana Terakopiantz and bennydreamly)",
            "cfgLanguageDe", "German (by Kai Kubasta, Archipelago fork translations by funnyna.me and palex00)",
            "cfgLanguageEs", "Spanish (by Saúl Ruiz Calleja and Tania López Camino, Archipelago fork translations by Eg)",
            "category", "Out of Date Translations",
            "cfgLanguageZh", "Chinese (by Fan Zhang)",
            "cfgLanguageCz", "Czech (by Keranis)",
            "cfgLanguageEl", "Greek (by VagosLabrou)",
            "cfgLanguageHu", "Hungarian (by The_Reaper_CooL)",
            "cfgLanguageId", "Indonesian (by Richard Sudaryono)",
            "cfgLanguageKr", "Korean (by jiyeonnn03)",
            "cfgLanguagePl", "Polish (by Patryk Połomski)",
            "cfgLanguageRu", "Russian (by Julia Richter (Zen Chelios Jr.))",
            "cfgLanguageSe", "Swedish (by Jessica Tsiamis)",
            "cfgLanguageTr", "Turkish (by B. Güler)",
            "cfgLanguageUk", "Ukrainian (by Volodymyr Lataniuk)"
            ]
        );
        
        // Add the link which will call the selectRightLanguage method after the html dom is created
        this.renderArea.addLinkCallbackCollection(new CallbackCollection(this.selectRightLanguage.bind(this)));
        
        // Add the special message for the chinese translation
        if(Saving.loadString("gameLanguage") == "zh"){
            this.renderArea.drawString("中文版翻译会导致少量图像显示错误，我会尽量修复它们的！", x + 9, y + 2, true);
        }
        // Add the TranslaCAT ascii art
        else if(Saving.loadString("gameLanguage") == "pt-BR"){
            this.renderArea.drawArray(Database.getAscii("general/translaCAT"), x + 70, y - 1);
            this.renderArea.addHtmlLink(x + 76, y + 7, "http://www.translacat.com/", "TranslaCAT");
        }
    }
    
    private drawConfigurationText(x: number, y: number): void{
        this.renderArea.drawArray(Database.getAscii("text/Configuration"), x + 17, y);
    }
    
    private invertColorsChecked(): void{
        this.setInvertedColors(true);
    }
    
    private invertColorsUnchecked(): void{
        this.setInvertedColors(false);
    }
    
    private async languageSelected(): Promise<void>{
        // Get the selected language id
        var id: string = $("#cfgLanguageList").find(":selected").attr("id");
        
        // Set the new language
        if(this.languageSelectionMap[id] != null){
            Saving.saveString("gameLanguage", this.languageSelectionMap[id]);
            await i18n.changeLanguage(Saving.loadString("gameLanguage"));
        }
        
        // Update Cfg
        this.update();
        this.getGame().updatePlace();
    }
    
    private selectRightLanguage(): void{
        // We iterate over all languages
        for(var language in this.languageSelectionMap){
            // If this is the right one, we select it
            if(Saving.loadString("gameLanguage") == this.languageSelectionMap[language]){
                $("#" + language).prop('selected', true);
            }
        }
    }
    
    private setInvertedColors(invertedColors: boolean): void{
        Saving.saveBool("gameInvertedColors", invertedColors);
        this.getGame().applyInvertedColorsToCss();
        this.update();
        this.getGame().updateStatusBar(); // We also update the status bar to fix the selected tab's color
        this.getGame().updatePlace();
    }

    private quitCfg() {
        this.getGame().setPlace(new ArchipelagoPlace(this.getGame()));
    }

    isArchipelagoPlace(): boolean {
        return true;
    }

    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // The "Configuration" text
        this.drawConfigurationText(0, 0);

        let yAdd = 0;
        if (Archipelago.connectionStatus.current == "disconnected") {
            this.renderArea.addAsciiRealButton(Database.getText("back"), 0, 8, "backButton", Database.getTranslatedText("back"));
            this.renderArea.addLinkCall(".backButton", new CallbackCollection(this.quitCfg.bind(this)));
            yAdd = 2;
        }

        // Language selection
        this.drawCfgLanguage(0, 8 + yAdd);
        
        // Invert colors checkbox
        this.drawCfgInvertColors(0, 12 + yAdd);
        
        // "About" section
        this.drawAbout(0, 18 + yAdd);
    }
}
