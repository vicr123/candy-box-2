///<reference path="Place.ts"/>
///<reference path="main.ts"/>

import {Place} from "./Place";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Saving} from "./Saving";
import {MainLoadingType} from "./MainLoadingType";
import {Main} from "./main";
import {LocalSaving} from "./LocalSaving";
import {Color} from "./Color";
import {ColorType} from "./ColorType";
import {Database} from "./Database";
import {CallbackCollection} from "./CallbackCollection";
import {Algo} from "./Algo";
import {ArchipelagoSaving} from "../archipelago/ArchipelagoSaving";
import {Archipelago} from "../archipelago/Archipelago";
import {SaveManagementPlace} from "../archipelago/SaveManagementPlace";
import {OpfsSaving} from "./OpfsSaving";

export class Save extends Place{
    // The render area
    private renderArea: RenderArea = new RenderArea();
    
    // The slots array used for local saving
    private slotsArray: string[];
    
    // The currently selected slot (slot1 by default)
    private selectedSlot: string = "slot1";
    
    // The last local autosave minute we drew (used to refresh the page at the right time)
    private lastLocalAutosaveMinute = null;
    
    // Should we show the file save warning?
    private showFileSaveWarning: boolean = false;
    
    // The textarea content
    private fileSaveTextareaContent: string = null;

    // Constructor
    constructor(game: Game){
        super(game);
        
        // Resize
        this.resize();
        
        // Create the slots array
        this.createSlotsArray();
        
        // Update
        this.update();

        Archipelago.events.on("saveDataUpdated", () => {
            this.update();
            this.getGame().updatePlace();
        })
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // willBeDisplayed()
    public willBeDisplayed(): void{
        // We resize (we must do this there and not in the constructor because the size depends on the translation)
        this.resize();
        
        // We add a callback : we will be updated every second (in order to show the correct time for the local autosave countdown)
        this.getGame().getOneSecondCallbackCollection().addCallback(this.oneSecondCallback.bind(this));
    }
    
    // Private methods
    private clickedAutosave(): void{
        if (!this.getGame().autosaveFileIsSame()) {
            if (!this.confirmApSaveOverwrite()) {
                return;
            }
        }

        // Save on AP
        Saving.save(this.getGame(), MainLoadingType.ARCHIPELAGO);
        
        // Enable autosaving
        this.getGame().enableLocalAutosave();
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private clickedDisableAutosave(): void{
        // We disable auto saving
        this.getGame().disableLocalAutosave();
        
        // We update
        this.update();
        this.getGame().updatePlace();
    }
    
    private clickedFileLoad(): void{
        Main.reloadEverythingFromFile($(".saveFileLoadTextarea").val());
    }

    private async clickedApLoad() {
        await Archipelago.interruptAfterTimeout(Saving.load(this.getGame(), MainLoadingType.ARCHIPELAGO));
        this.getGame().goToCandyBox()
    }
    
    private clickedFileSave(): void{
        // Save some special variables by calling the save() methods of various objects
        this.getGame().save(); // Various variables owned by the game object
        this.getGame().getPlayer().save(); // The player
        
        // We now show the warning
        this.showFileSaveWarning = true;
        
        // Reset the textarea content
        this.fileSaveTextareaContent = "";
        
        // Write bools
        for(var str in Saving.getAllBools()){
            if(this.fileSaveTextareaContent != "") this.fileSaveTextareaContent += ", "; // We add a comma if we're not adding the very first variable
            this.fileSaveTextareaContent += "bool " + str + "=" + Saving.boolToString(Saving.getAllBools()[str]);
        }
        
        // Write numbers
        for(var str in Saving.getAllNumbers()){
            if(this.fileSaveTextareaContent != "") this.fileSaveTextareaContent += ", "; // We add a comma if we're not adding the very first variable
            this.fileSaveTextareaContent += "number " + str + "=" + Saving.numberToString(Saving.getAllNumbers()[str]);
        }
        
        // Write strings
        for(var str in Saving.getAllStrings()){
            if(this.fileSaveTextareaContent != "") this.fileSaveTextareaContent += ", "; // We add a comma if we're not adding the very first variable
            this.fileSaveTextareaContent += "string " + str + "=" + Saving.getAllStrings()[str];
        }
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }
    
    private clickedSave(): void{
        // Save on the selected slot
        Saving.save(this.getGame(), MainLoadingType.LOCAL);
        
        // Re-create the slots array
        this.createSlotsArray();
        
        // Update
        this.update();
        this.getGame().updatePlace();
    }

    private async clickedApSave() {
        if (!this.getGame().autosaveFileIsSame()) {
            if (!this.confirmApSaveOverwrite()) {
                return;
            }
        }
        await Archipelago.interruptAfterTimeout(Saving.save(this.getGame(), MainLoadingType.ARCHIPELAGO));
    }

    private confirmApSaveOverwrite(): boolean {
        return confirm([Database.getText("saveApConflictWarning"), ...(Database.isTranslated() ? ["", Database.getTranslatedText("saveApConflictWarning")] : [])].join("\n"));
    }

    private createSlotsArray(): void{
        // Reset the array
        this.slotsArray = [];
        
        // Fill it
        for(var i = 1; i <= 5; i++){
            this.slotsArray.push("slot" + i.toString());
            this.slotsArray.push("Slot " + i.toString() + " (" + LocalSaving.getSlotSummaryAsString("slot" + i.toString()) + ")");
        }
    }
    
    private drawGreen(text: string, x: number, y: number, translated: boolean = false): void{
        this.renderArea.drawString(text, x, y, translated);
        this.renderArea.addColor(x, x + text.length, y, new Color(ColorType.SAVE_GREEN));
    }
    
    private drawLocalLoad(x: number, y: number): number{
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;
        
        // Var we will use for link generation
        var link: string;
        
        // Title
        this.drawTitle("saveLocalLoadTitle", y+yAdd);
        
        // If we support local saving
        // if(LocalSaving.supportsLocalSaving()){
        //     // "You can load.."
        //     this.drawPoint("saveLocalLoadYouCan", x, y+yAdd+2);
        //     if(Database.isTranslated()) yAdd += 1;
        //
        //     // The links
        //     for(var i = 1; i <= 5; i++){
        //         link = "http://candybox2.github.io/?slot=" + i.toString();
        //         this.renderArea.addHtmlLink(x+2, y+yAdd+3+i, link, link);
        //         this.renderArea.drawString("(slot " + i.toString() + ")", x + link.length + 4, y+yAdd+3+i);
        //     }
        //
        //     // "Thanks to.."
        //     this.drawPoint("saveLocalLoadThanksTo", x, y+yAdd+10);
        //     if(Database.isTranslated()) yAdd += 1;
        // }
        // else{
        //     // Warning messages
        //     this.drawWarning(Database.getText("saveLocalSaveWarning0") + " (local storage and application cache)", x, y+yAdd+2);
        //     this.drawWarning(Database.getText("saveLocalSaveWarning1"), x, y+yAdd+3);
        //
        //     this.drawWarning(Database.getTranslatedText("saveLocalSaveWarning0"), x, y+yAdd+5, true);
        //     this.drawWarning(Database.getTranslatedText("saveLocalSaveWarning1"), x, y+yAdd+6, true);
        // }
        this.renderArea.drawString(Database.getText("loadPrompt"), x, y+yAdd+3);
        this.renderArea.drawString(Database.getText("loadPrompt2"), x, y+yAdd+4);
        
        // Return yAdd
        return yAdd;
    }

    private drawApLoad(x: number, y: number) {
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;

        // The title
        this.drawTitle("loadApLoadTitle", y+yAdd);

        if (ArchipelagoSaving.lastDate()) {
            this.renderArea.drawString(Database.getText("loadApLoadDescription"), x, y+yAdd+2);
            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("loadApLoadDescription"), x, y+yAdd+3, true);
                yAdd += 1;
            }

            this.renderArea.addAsciiRealButton(Database.getText("loadApLoadNow"), x+36, y+yAdd+4, "loadApLoadButton", Database.getTranslatedText("loadApLoadNow"), true)
            this.renderArea.addLinkCall(".loadApLoadButton", new CallbackCollection(this.clickedApLoad.bind(this)));
        } else {
            this.renderArea.drawString(Database.getText("loadApLastSaveNone"), x, y+yAdd+2);
            this.renderArea.drawString(Database.getTranslatedText("loadApLastSaveNone"), x, y+yAdd+3, true);
        }

        return yAdd;
    }
    
    private drawLocalSave(x: number, y: number): number{
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;
        
        // Title & why
        this.drawTitle("saveLocalSaveTitle", y+yAdd);
        this.drawPoint("saveLocalSaveWhy", x, y+yAdd+2);
        if(Database.isTranslated()) yAdd += 1;

        this.renderArea.drawHorizontalLine("-", x, x+100, y+yAdd+3);
        this.renderArea.drawString(Database.getText("savePrompt"), x, y+yAdd+5);
        this.renderArea.drawString(Database.getText("savePrompt2"), x, y+yAdd+6);
        this.renderArea.drawString(Database.getText("savePrompt3"), x, y+yAdd+7);
        this.renderArea.drawString(Database.getText("savePrompt4"), x, y+yAdd+8);
        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("savePrompt"), x, y+yAdd+10, true);
            this.renderArea.drawString(Database.getTranslatedText("savePrompt2"), x, y+yAdd+11, true);
            this.renderArea.drawString(Database.getTranslatedText("savePrompt3"), x, y+yAdd+12, true);
            this.renderArea.drawString(Database.getTranslatedText("savePrompt4"), x, y+yAdd+13, true);
            this.renderArea.addAsciiRealButton(Database.getText("eraseSaveButton"), 7, y+yAdd+16, "eraseSave", Database.getTranslatedText("eraseSaveButton"));
            this.renderArea.addLinkCall(".eraseSave", new CallbackCollection(this.eraseSave.bind(this)));
            this.renderArea.addAsciiRealButton(Database.getText("eraseAllSavesButton"), 7, y+yAdd+17, "eraseAllSave", Database.getTranslatedText("eraseAllSavesButton"));
            this.renderArea.addLinkCall(".eraseAllSave", new CallbackCollection(this.eraseAllSave.bind(this)));

            if (OpfsSaving.isSupported()) {
                this.renderArea.addAsciiRealButton(Database.getText("apSaveManagement"), 7, y + yAdd + 18, "saveManagement", Database.getTranslatedText("apSaveManagement"));
                this.renderArea.addLinkCall(".saveManagement", new CallbackCollection(this.saveManagement.bind(this)));
            }
            yAdd += 8;
        } else {
            this.renderArea.addAsciiRealButton(Database.getText("eraseSaveButton"), 7, y+yAdd+10, "eraseSave");
            this.renderArea.addLinkCall(".eraseSave", new CallbackCollection(this.eraseSave.bind(this)));
            this.renderArea.addAsciiRealButton(Database.getText("eraseAllSavesButton"), 35, y+yAdd+10, "eraseAllSave");
            this.renderArea.addLinkCall(".eraseAllSave", new CallbackCollection(this.eraseAllSave.bind(this)));

            if (OpfsSaving.isSupported()) {
                this.renderArea.addAsciiRealButton(Database.getText("apSaveManagement"), 63, y + yAdd + 10, "saveManagement");
                this.renderArea.addLinkCall(".saveManagement", new CallbackCollection(this.saveManagement.bind(this)));
            }
        }
        this.renderArea.drawHorizontalLine("-", x, x+100, y+yAdd+12);

        // Return yAdd
        return yAdd;
    }

    private eraseSave() {
        if (confirm([Database.getText("eraseDialog"), ...(Database.isTranslated() ? ["", Database.getTranslatedText("eraseDialog")] : [])].join("\n"))) {
            void Saving.erase();
        }
    }

    private eraseAllSave() {
        if (confirm([Database.getText("eraseAllDialog"), ...(Database.isTranslated() ? ["", Database.getTranslatedText("eraseAllDialog")] : [])].join("\n"))) {
            void Saving.eraseAll();
        }
    }

    private saveManagement() {
        this.getGame().setPlace(new SaveManagementPlace(this.getGame()));
    }
    
    private drawFileLoad(x: number, y: number): number{
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;
        
        // Title
        this.drawTitle("saveFileLoadTitle", y+yAdd);
        
        // Instructions
        this.renderArea.drawString(Database.getText("saveFileLoadPaste"), x, y+yAdd+2);
        this.renderArea.drawString(Database.getTranslatedText("saveFileLoadPaste"), x, y+yAdd+3, true);

        this.renderArea.drawString(Database.getText("loadSaveImportantNote"), x, y+yAdd+5);
        this.renderArea.addBold(x, x + Database.getText("loadSaveImportantNote").length, y+yAdd+5);
        if(Database.isTranslated()){
            this.renderArea.drawString(Database.getTranslatedText("loadSaveImportantNote"), x, y+yAdd+6, true);
            this.renderArea.addBold(x, x + Database.getTranslatedText("loadSaveImportantNote").length, y+yAdd+6);
            yAdd += 1;
        }

        // Add the text area
        this.renderArea.addTextarea(x + 2, y+yAdd+7, 96, 6, "saveFileLoadTextarea");

        yAdd += 2;
        
        // Add the load button
        this.renderArea.addAsciiRealButton(Database.getText("saveFileLoadButton"), 48, y+yAdd+13, "saveFileLoadButton", Database.getTranslatedText("saveFileLoadButton"), true);
        this.renderArea.addLinkCall(".saveFileLoadButton", new CallbackCollection(this.clickedFileLoad.bind(this)));
        
        // Return yAdd
        return yAdd;
    }

    private drawApSave(x: number, y: number) {
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;

        // The title
        this.drawTitle("saveApSaveTitle", y+yAdd);

        // The "why"
        this.renderArea.drawString(Database.getText("saveApSaveWhy0"), x, y+yAdd+2);
        this.renderArea.drawString(Database.getText("saveApSaveWhy1"), x, y+yAdd+3);
        this.renderArea.drawString(Database.getText("saveApSaveWhy2"), x, y+yAdd+4);
        this.renderArea.drawString(Database.getText("saveApSaveWhy3"), x, y+yAdd+5);

        // The translated "why" (only if there's a translation)
        if(Database.isTranslated()){
            this.renderArea.drawString(Database.getTranslatedText("saveApSaveWhy0"), x, y+yAdd+7, true);
            this.renderArea.drawString(Database.getTranslatedText("saveApSaveWhy1"), x, y+yAdd+8, true);
            this.renderArea.drawString(Database.getTranslatedText("saveApSaveWhy2"), x, y+yAdd+9, true);
            this.renderArea.drawString(Database.getTranslatedText("saveApSaveWhy3"), x, y+yAdd+10, true);
            yAdd += 5; // We increase yAdd by 5 because the translations took 5 lines
        }

        // yAdd += 50
        this.renderArea.drawHorizontalLine("-", x, x + 100, y + yAdd + 6);
        const lastSave = ArchipelagoSaving.lastDate();
        if (lastSave) {
            this.renderArea.drawString(Database.getText("saveApLastSave", {
                date: new Intl.DateTimeFormat(Saving.loadString("gameLanguage"), {
                    dateStyle: "medium",
                    timeStyle: "medium"
                }).format(lastSave)
            }), x+7, y+yAdd+8, false);
        } else {
            this.renderArea.drawString(Database.getText("saveApLastSaveNone"), x+7, y+yAdd+8, false);
            if (Database.isTranslated()){
                this.renderArea.drawString(Database.getTranslatedText("saveApLastSaveNone"), x+7, y+yAdd+9, true);
                yAdd += 1;
            }
        }

        // Autosave enabled ?
        if(this.getGame().getLocalAutosaveEnabled()){
            if (this.getGame().autosavePossible()) {
                this.drawGreen(Database.getText("saveLocalSaveAutosaveEnabled"), x+7, y+yAdd+10);
                if(Database.getTranslatedText("saveLocalSaveAutosaveEnabled") != "") this.drawGreen("(" + Database.getTranslatedText("saveLocalSaveAutosaveEnabled") + ")", x+7, y+yAdd+10, true);
                this.drawGreen("Next save in " + Algo.pluralFormat(Math.ceil(this.getGame().getLocalAutosaveTime()/60), " minute", " minutes"), x+7, y+yAdd+11);
            } else {
                this.drawWarning(Database.getText("saveLocalSaveAutosaveConflicting"), x+7, y+yAdd+10);
                this.drawWarning(Database.getText("saveLocalSaveAutosaveConflictingResolution"), x+7, y+yAdd+11);
            }
        }
        yAdd += 3;

        if (Database.isTranslated()) {
            this.renderArea.drawHorizontalLine("-", x, x + 100, y + yAdd + 13);
            this.renderArea.addAsciiRealButton(Database.getText("saveApSaveNow"), x+7, y+yAdd+10, "saveApSaveButton", Database.getTranslatedText("saveApSaveNow"))
            this.renderArea.addLinkCall(".saveApSaveButton", new CallbackCollection(this.clickedApSave.bind(this)));

            if(this.getGame().getLocalAutosaveEnabled()) {
                this.renderArea.addAsciiRealButton(Database.getText("saveLocalSaveDisableAutosaveButton"), x + 7, y + yAdd + 11, "saveApDisableAutosaveButton", Database.getTranslatedText("saveLocalSaveDisableAutosaveButton"))
                this.renderArea.addLinkCall(".saveApDisableAutosaveButton", new CallbackCollection(this.clickedDisableAutosave.bind(this)));
            } else {
                this.renderArea.addAsciiRealButton(Database.getText("saveLocalSaveAutosaveButton"), x + 7, y + yAdd + 11, "saveApAutosaveButton", Database.getTranslatedText("saveLocalSaveAutosaveButton"))
                this.renderArea.addLinkCall(".saveApAutosaveButton", new CallbackCollection(this.clickedAutosave.bind(this)));
            }
            yAdd += 1;
        } else {
            this.renderArea.drawHorizontalLine("-", x, x + 100, y + yAdd + 12);
            this.renderArea.addAsciiRealButton(Database.getText("saveApSaveNow"), x+7, y+yAdd+10, "saveApSaveButton", Database.getTranslatedText("saveApSaveNow"))
            this.renderArea.addLinkCall(".saveApSaveButton", new CallbackCollection(this.clickedApSave.bind(this)));

            if(this.getGame().getLocalAutosaveEnabled()) {
                this.renderArea.addAsciiRealButton(Database.getText("saveLocalSaveDisableAutosaveButton"), x + 35, y + yAdd + 10, "saveApDisableAutosaveButton", Database.getTranslatedText("saveLocalSaveDisableAutosaveButton"))
                this.renderArea.addLinkCall(".saveApDisableAutosaveButton", new CallbackCollection(this.clickedDisableAutosave.bind(this)));
            } else {
                this.renderArea.addAsciiRealButton(Database.getText("saveLocalSaveAutosaveButton"), x + 35, y + yAdd + 10, "saveApAutosaveButton", Database.getTranslatedText("saveLocalSaveAutosaveButton"))
                this.renderArea.addLinkCall(".saveApAutosaveButton", new CallbackCollection(this.clickedAutosave.bind(this)));
            }
        }

        // We return yAdd
        return yAdd;
    }
    
    private drawFileSave(x: number, y: number): number{
        // The y we will return (will remain 0 if there's no translation to show)
        var yAdd: number = 0;

        // The title
        this.drawTitle("saveFileSaveTitle", y+yAdd);
        
        // The "why"
        this.renderArea.drawString(Database.getText("saveFileSaveWhy0"), x, y+yAdd+2);
        this.renderArea.drawString(" - " + Database.getText("saveFileSaveWhy1"), x, y+yAdd+3);
        this.renderArea.drawString(" - " + Database.getText("saveFileSaveWhy2"), x, y+yAdd+4);
        this.renderArea.drawString(" - " + Database.getText("saveFileSaveWhy3"), x, y+yAdd+5);
        this.renderArea.drawString("   " + Database.getText("saveFileSaveWhy4"), x, y+yAdd+6);
        
        // The translated "why" (only if there's a translation)
        if(Database.isTranslated()){
            this.renderArea.drawString(Database.getTranslatedText("saveFileSaveWhy0"), x, y+yAdd+8, true);
            this.renderArea.drawString(" - " + Database.getTranslatedText("saveFileSaveWhy1"), x, y+yAdd+9, true);
            this.renderArea.drawString(" - " + Database.getTranslatedText("saveFileSaveWhy2"), x, y+yAdd+10, true);
            this.renderArea.drawString(" - " + Database.getTranslatedText("saveFileSaveWhy3"), x, y+yAdd+11, true);
            this.renderArea.drawString("   " + Database.getTranslatedText("saveFileSaveWhy4"), x, y+yAdd+12, true);
            yAdd += 6; // We increase yAdd by 6 because the translations took 6 lines
        }

        this.renderArea.drawString(Database.getText("loadSaveImportantNote"), x, y+yAdd+8);
        this.renderArea.addBold(x, x + Database.getText("loadSaveImportantNote").length, y+yAdd+8);
        if(Database.isTranslated()){
            this.renderArea.drawString(Database.getTranslatedText("loadSaveImportantNote"), x, y+yAdd+9, true);
            this.renderArea.addBold(x, x + Database.getTranslatedText("loadSaveImportantNote").length, y+yAdd+9);
            yAdd += 1;
        }
        yAdd += 2;
        
        // Add the button
        this.renderArea.addAsciiRealButton(Database.getText("saveFileSaveButton"), 35, y+yAdd+8, "saveFileSaveButton", Database.getTranslatedText("saveFileSaveButton"), true);
        this.renderArea.addLinkCall(".saveFileSaveButton", new CallbackCollection(this.clickedFileSave.bind(this)));
        
        // Add the text area
        this.renderArea.addTextarea(x + 2, y+yAdd+11, 96, 6, "saveFileSaveTextarea", (this.fileSaveTextareaContent != null? this.fileSaveTextareaContent : ""));
        
        // Should we show the warning?
        if(this.showFileSaveWarning){
            this.drawWarning(Database.getText("saveFileSaveWarning"), x+2, y+yAdd+12);
            this.drawWarning(Database.getTranslatedText("saveFileSaveWarning"), x+2, y+yAdd+13, true);
        }
        
        // We return yAdd
        return yAdd;
    }
    
    private drawPoint(textName: string, x: number, y: number): void{
        this.renderArea.drawString(Database.getText(textName), x, y);
        this.renderArea.drawString(Database.getTranslatedText(textName), x, y + 1, true);
    }
    
    private drawTitle(textName: string, y: number): void{
        var x: number = 50 - Math.floor((Database.getText(textName).length/2 + 1 + Database.getTranslatedText(textName).length/2));
        this.renderArea.drawString(Database.getText(textName), x, y);
        this.renderArea.addBold(x, x + Database.getText(textName).length, y);
        this.renderArea.drawString(Database.getTranslatedText(textName), x + Database.getText(textName).length + 1, y, true);
    }
    
    private drawWarning(text: string, x: number, y: number, translated: boolean = false): void{
        if(text != ""){
            this.renderArea.drawString(text, x, y, translated);
            this.renderArea.addColor(x, x + text.length, y, new Color(ColorType.SAVE_RED));
        }
    }
    
    private oneSecondCallback(): void{
        // If there's no last minute or it's different from the current minute
        if(this.lastLocalAutosaveMinute == null || this.lastLocalAutosaveMinute != Math.ceil(this.getGame().getLocalAutosaveTime()/60)){
            // We set the minute
            this.lastLocalAutosaveMinute = Math.ceil(this.getGame().getLocalAutosaveTime()/60);
            // We update
            this.createSlotsArray();
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private resize(): void{
        // The size depends on if there's a translation or not
        if(Database.isTranslated())
            this.renderArea.resize(100, 125);
        else
            this.renderArea.resize(100, 105);
    }
    
    private selectRightSlot(): void{
        // We select the right slot
        $("#" + this.selectedSlot).prop('selected', true);
    }
    
    private slotSelected(): void{
        // Get the selected language id
        this.selectedSlot = $("#saveLocalSaveSlotsList").find(":selected").attr("id");
        
        // Update the ligthouse
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        var yPosition: number = 0; // The y position where we will add things. Can be incremented sometimes, depending on the user's language..
        
        // Erase everything
        this.renderArea.resetAllButSize();
        
        // Saving
        this.renderArea.drawArray(Database.getAscii("text/Saving"), 50 - Math.floor((Database.getAsciiWidth("text/Saving")/2)), yPosition);
        yPosition += this.drawLocalSave(0, yPosition+7);
        yPosition += this.drawApSave(0, yPosition+21);
        yPosition += this.drawFileSave(0, yPosition+35);
        
        // Loading
        this.renderArea.drawArray(Database.getAscii("text/Loading"), 50 - Math.floor((Database.getAsciiWidth("text/Loading")/2)), yPosition+54);
        yPosition += this.drawLocalLoad(0, yPosition+61);
        yPosition += this.drawApLoad(0, yPosition+67);
        yPosition += this.drawFileLoad(0, yPosition+75);
        
        // Add the link which will call the selectRightSlot method after the html dom is created
        this.renderArea.addLinkCallbackCollection(new CallbackCollection(this.selectRightSlot.bind(this)));
    }
}
