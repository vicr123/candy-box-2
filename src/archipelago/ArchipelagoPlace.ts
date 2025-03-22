import {Place} from "../main/Place";
import {Game} from "../main/Game";
import {Database} from "../main/Database";
import {RenderArea} from "../main/RenderArea";
import {Archipelago} from "./Archipelago";
import {CallbackCollection} from "../main/CallbackCollection";
import {Pos} from "../main/Pos";
import {Saving} from "../main/Saving";
import {MainLoadingType} from "../main/MainLoadingType";
import {Color} from "../main/Color";
import {ColorType} from "../main/ColorType";

export class ArchipelagoPlace extends Place {
    // The render area
    private renderArea: RenderArea = new RenderArea();

    // Constructor
    constructor(game: Game){
        super(game);

        // Resize
        this.resize();

        // Update
        this.update();

        Archipelago.events.on("connectionStatusChanged", this.externalUpdate.bind(this));
        Archipelago.events.on("connectionErrorStringChanged", this.externalUpdate.bind(this));
        Archipelago.events.on("expectedClientVersionChanged", this.externalUpdate.bind(this));
        Archipelago.events.on("connectionStatusChanged", () => {
            if (Archipelago.connectionStatus.current == "connected" && !Saving.loadBool("statusBarUnlockedAp")) {
                // Initial setup complete - start the game by going to the candy box
                game.goToCandyBox();
            }
            game.updateStatusBar(true);
        });
        Archipelago.events.on("apLogUpdated", this.externalUpdate.bind(this));
    }

    private externalUpdate() {
        this.update();
        this.getGame().updatePlace();
    }

    public getRenderArea(): RenderArea{
        return this.renderArea;
    }

    public isArchipelagoPlace() {
        return true;
    }

    private resize(): void{
        if(Database.isTranslated())
            this.renderArea.resize(100, 84);
        else
            this.renderArea.resize(100, 74);
    }

    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();

        this.renderArea.drawArray(Database.getAscii("text/Archipelago"), 7 + 17, 0);

        this.renderArea.drawString(Database.getText("apUrl"), 7, 10);
        this.renderArea.drawString(Database.getTranslatedText("apUrl"), 7 + 30, 10, true);
        this.renderArea.drawString(Database.getText("apSlot"), 7, 15);
        this.renderArea.drawString(Database.getTranslatedText("apSlot"), 7 + 25, 15, true);
        this.renderArea.drawString(Database.getText("apPassword"), 7, 20);
        this.renderArea.drawString(Database.getTranslatedText("apPassword"), 7 + 35, 20, true);

        if (Archipelago.connectionStatus.current == "disconnected") {
            this.renderArea.addSimpleInput(10, 40, 12, new CallbackCollection(this.changeApUrl.bind(this)), "apUrl", Archipelago.apLink, false);
            this.renderArea.addSimpleInput(10, 40, 17, new CallbackCollection(this.changeApSlot.bind(this)), "apSlot", Archipelago.apSlot, false);
            this.renderArea.addSimpleInput(10, 40, 22, new CallbackCollection(this.changeApPassword.bind(this)), "apPassword", Archipelago.apPassword, false);
        } else {
            this.renderArea.drawString(Archipelago.apLink, 10, 12);
            this.renderArea.drawString(Archipelago.apSlot, 10, 17);
            this.renderArea.drawString([...Archipelago.apPassword].map(() => "*").join(""), 10, 22);
        }

        switch (Archipelago.connectionStatus.current) {
            case "disconnected":
                this.renderArea.addAsciiRealButton(Database.getText("apConnect"), 7, 25, "apConnect", Database.getTranslatedText("apConnect"));
                this.renderArea.addLinkCall(".apConnect", new CallbackCollection(this.connectToAp.bind(this)));
                break;
            case "connecting":
                this.renderArea.drawString(Database.getText("apStatusConnecting"), 7, 25);
                this.renderArea.drawString(Database.getText("apStatusConnecting"), 7 + 20, 25);
                break;
            case "connected":
                this.renderArea.addAsciiRealButton(Database.getText("apDisconnect"), 7, 25, "apDisconnect", Database.getTranslatedText("apDisconnect"));
                this.renderArea.addLinkCall(".apDisconnect", new CallbackCollection(this.disconnectFromAp.bind(this)));
                this.renderApLog();
                break;
        }

        if (Archipelago.connectionError.current.length != 0) {
            const errorText = Database.getText(Archipelago.connectionError.current)
            this.renderArea.drawString(errorText, 7, 27);
            this.renderArea.addColor(7, 7 + errorText.length, 27, new Color(ColorType.SAVE_RED));

            const translatedErrorText = Database.getTranslatedText(Archipelago.connectionError.current)
            if (translatedErrorText) {
                this.renderArea.drawString(translatedErrorText, 7, 28);
                this.renderArea.addColor(7, 7 + translatedErrorText.length, 28, new Color(ColorType.SAVE_RED));
            }

            if (Archipelago.expectedClientVersion.current) {
                this.renderArea.addAsciiRealButton(`Load Version ${Archipelago.expectedClientVersion.current}`, 7, 29, "apLoadCorrectVersion");
                this.renderArea.addLinkCall(".apLoadCorrectVersion", new CallbackCollection(this.loadCorrectVersion.bind(this)))
            }
        }
    }

    private loadCorrectVersion() {
        window.location.pathname = `/${Archipelago.expectedClientVersion.current}`
    }

    private renderApLog() {
        Archipelago.apLog.draw(this.renderArea, new Pos(0, 30));

        if (Archipelago.connectionStatus.current == "connected") {
            this.renderArea.addSimpleInputOnEnter(0, 95, 52, new CallbackCollection(this.sendApMessage.bind(this)), "apMessage", "", true);
            this.renderArea.addAsciiRealButton(Database.getText("apSend"), 95, 54, "apSend");
            const translatedSendText = Database.getTranslatedText("apSend")
            if (translatedSendText) {
                this.renderArea.drawString(translatedSendText, 95 - translatedSendText.length - 1, 94, true);
            }
            this.renderArea.addLinkCall(".apSend", new CallbackCollection(this.sendApMessage.bind(this)));
        }
    }

    private changeApUrl(): void{
        if($(".apUrl").length) {
            Archipelago.apLink = $(".apUrl").val() as string;
            localStorage.setItem("apUrl", Archipelago.apLink);
        }
    }

    private changeApSlot(): void {
        if ($(".apSlot").length) {
            Archipelago.apSlot = $(".apSlot").val() as string;
            localStorage.setItem("apSlot", Archipelago.apSlot);
        }
    }

    private changeApPassword(): void{
        if($(".apPassword").length) // If the element exists
            Archipelago.apPassword = $(".apPassword").val() as string;
    }

    private sendApMessage() {
        const messageBox = $(".apMessage");
        Archipelago.sendMessage(messageBox.val() as string);
        messageBox.val("");
    }

    private async connectToAp() {
        await Archipelago.connect();
        await Saving.load(this.getGame(), MainLoadingType.LOCAL);
        this.getGame().postLoad();
    }

    private disconnectFromAp() {
        window.location.reload();
    }
}