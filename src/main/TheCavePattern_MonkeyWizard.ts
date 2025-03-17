///<reference path="TheCavePattern.ts"/>

import {TheCavePattern} from "./TheCavePattern";
import {TheCave} from "./TheCave";
import {RenderArea} from "./RenderArea";
import {Database} from "./Database";
import {RenderTransparency} from "./RenderTransparency";
import {CallbackCollection} from "./CallbackCollection";
import {MonkeyWizardQuest} from "./MonkeyWizardQuest";

export class TheCavePattern_MonkeyWizard extends TheCavePattern{
    // Constructor
    constructor(theCave: TheCave){
        super(theCave);
    }
    
    // Public methods
    public draw(renderArea: RenderArea, x: number, y: number): void{
        // Draw the monkey wizard
        renderArea.drawArray(Database.getAscii("places/theCave/monkeyWizard"), x + 32, y + 6, new RenderTransparency(" ", "%"));
        
        // Add the button & the link allowing the player to challenge him
        renderArea.addAsciiRealButton(Database.getText("theCavePattern_MonkeyWizardButton"), x + 39, y + 26, "theCavePattern_MonkeyWizardButton", Database.getTranslatedText("theCavePattern_MonkeyWizardButton"));
        renderArea.addLinkCall(".theCavePattern_MonkeyWizardButton", new CallbackCollection(this.challenge.bind(this)));
    }
    
    public ended(): boolean{
        return true;
    }
    
    public getSentence(): string{
        return "theCavePattern_MonkeyWizardSentence";
    }
    
    // Private methods
    private challenge(): void{
        if(this.getTheCave().getGame().canStartQuest())
            this.getTheCave().getGame().loadRandomisedEntrance("Naked Monkey Wizard Click");
    }
}