import {Place} from "../main/Place";
import {Game} from "../main/Game";
import {Database} from "../main/Database";
import {RenderArea} from "../main/RenderArea";
import {Archipelago, ArchipelagoPlacePage} from "./Archipelago";
import {CallbackCollection} from "../main/CallbackCollection";
import {Pos} from "../main/Pos";
import {Saving} from "../main/Saving";
import {MainLoadingType} from "../main/MainLoadingType";
import {Color} from "../main/Color";
import {ColorType} from "../main/ColorType";

export class ArchipelagoPlace extends Place {
    // The render area
    private renderArea: RenderArea = new RenderArea();

    private tabs: {text: string, page: ArchipelagoPlacePage}[] = [
        {
            text: "apConnectionTab",
            page: "connection"
        },
        {
            text: "apChatTab",
            page: "chat"
        }
    ]

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
        Archipelago.events.on("apPageChanged", this.externalUpdate.bind(this));
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
            this.renderArea.resize(100, 50);
        else
            this.renderArea.resize(100, 50);
    }

    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();

        this.renderArea.drawArray(Database.getAscii("text/Archipelago"), 7 + 17, 0);

        let y = 7;
        let x = 0;
        if (Archipelago.connectionStatus.current == "connected") {
            for (const tab of this.tabs) {
                const text = Database.getText(tab.text)
                const translatedText = Database.getTranslatedText(tab.text)

                const startX = x;

                this.renderArea.drawVerticalLine("|", x, y + 1, Database.isTranslated() ? y + 2 : y + 1);
                this.renderArea.drawString(text, x + 2, y + 1);
                if (Database.isTranslated()) {
                    this.renderArea.drawString(translatedText, x + 2, y + 1, true);
                    x += Math.max(text.length, translatedText.length) + 3;
                } else {
                    x += text.length + 3;
                }

                if (Archipelago.apPage.current == tab.page) {
                    this.renderArea.addBackgroundColor(startX + 1, x, y + 1, new Color(ColorType.STATUS_BAR_SELECTED_TAB, true));
                    if (Database.isTranslated()) this.renderArea.addBackgroundColor(startX + 1, x, y + 2, new Color(ColorType.STATUS_BAR_SELECTED_TAB, true));
                } else {
                    this.renderArea.addAsciiButton(startX + 1, x, y + 1, `changeTo${tab.page}Tab`)
                    if (Database.isTranslated()) this.renderArea.addAsciiButton(startX + 1, x, y + 1, `changeTo${tab.page}Tab`)
                    this.renderArea.addLinkCall(`.changeTo${tab.page}Tab`, new CallbackCollection(() => {
                        Archipelago.apPage.current = tab.page;
                    }));
                }
            }
            this.renderArea.drawVerticalLine("|", x, y + 1, Database.isTranslated() ? y + 2 : y + 1);
            y = Database.isTranslated() ? y + 4 : y + 3;
        }

        switch (Archipelago.apPage.current) {
            case "connection":
                this.renderApConnection(y);
                break;
            case "chat":
                this.renderApLog(y);
                break;
        }
    }

    private renderApConnection(y: number) {
        this.renderArea.drawString(Database.getText("apUrl"), 7, y);
        this.renderArea.drawString(Database.getTranslatedText("apUrl"), 7 + 30, y, true);
        this.renderArea.drawString(Database.getText("apSlot"), 7, y + 5);
        this.renderArea.drawString(Database.getTranslatedText("apSlot"), 7 + 25, y + 5, true);
        this.renderArea.drawString(Database.getText("apPassword"), 7, y + 10);
        this.renderArea.drawString(Database.getTranslatedText("apPassword"), 7 + 35, y + 10, true);

        if (Archipelago.connectionStatus.current == "disconnected") {
            this.renderArea.addSimpleInput(10, 40, y + 2, new CallbackCollection(this.changeApUrl.bind(this)), "apUrl", Archipelago.apLink, false);
            this.renderArea.addSimpleInput(10, 40, y + 7, new CallbackCollection(this.changeApSlot.bind(this)), "apSlot", Archipelago.apSlot, false);
            this.renderArea.addSimpleInput(10, 40, y + 12, new CallbackCollection(this.changeApPassword.bind(this)), "apPassword", Archipelago.apPassword, false);
        } else {
            this.renderArea.drawString(Archipelago.apLink, 10, y + 2);
            this.renderArea.drawString(Archipelago.apSlot, 10, y + 7);
            this.renderArea.drawString([...Archipelago.apPassword].map(() => "*").join(""), 10, 7 + 12);
        }

        switch (Archipelago.connectionStatus.current) {
            case "disconnected":
                this.renderArea.addAsciiRealButton(Database.getText("apConnect"), 7, y + 15, "apConnect", Database.getTranslatedText("apConnect"));
                this.renderArea.addLinkCall(".apConnect", new CallbackCollection(this.connectToAp.bind(this)));
                break;
            case "connecting":
                this.renderArea.drawString(Database.getText("apStatusConnecting"), 7, y + 15);
                this.renderArea.drawString(Database.getText("apStatusConnecting"), 7 + 32, y + 15);
                break;
            case "connected":
                this.renderArea.addAsciiRealButton(Database.getText("apDisconnect"), 7, y + 15, "apDisconnect", Database.getTranslatedText("apDisconnect"));
                this.renderArea.addLinkCall(".apDisconnect", new CallbackCollection(this.disconnectFromAp.bind(this)));
                break;
        }

        if (Archipelago.connectionError.current.length != 0) {
            const errorText = Database.getText(Archipelago.connectionError.current)
            this.renderArea.drawString(errorText, 7, y + 17);
            this.renderArea.addColor(7, 7 + errorText.length, y + 17, new Color(ColorType.SAVE_RED));

            const translatedErrorText = Database.getTranslatedText(Archipelago.connectionError.current)
            if (translatedErrorText) {
                this.renderArea.drawString(translatedErrorText, 7, y + 18);
                this.renderArea.addColor(7, 7 + translatedErrorText.length, y + 18, new Color(ColorType.SAVE_RED));
                y += 1;
            }

            if (Archipelago.expectedClientVersion.current) {
                this.renderArea.addAsciiRealButton(Database.getText("apLoadCorrectVersion", {
                    version: Archipelago.expectedClientVersion.current
                }), 7, y + 19, "apLoadCorrectVersion", Database.getTranslatedText("apLoadCorrectVersion", {
                    version: Archipelago.expectedClientVersion.current
                }));
                this.renderArea.addLinkCall(".apLoadCorrectVersion", new CallbackCollection(this.loadCorrectVersion.bind(this)))
            }
        }
    }

    private loadCorrectVersion() {
        window.location.pathname = `/${Archipelago.expectedClientVersion.current}`
    }

    private renderApLog(y: number) {
        Archipelago.apLog.draw(this.renderArea, new Pos(0, y));

        if (Archipelago.connectionStatus.current == "connected") {
            this.renderArea.addSimpleInputOnEnter(0, 95, y + 32, new CallbackCollection(this.sendApMessage.bind(this)), "apMessage", "", true);
            this.renderArea.addAsciiRealButton(Database.getText("apSend"), 95, y + 34, "apSend");
            const translatedSendText = Database.getTranslatedText("apSend")
            if (translatedSendText) {
                this.renderArea.drawString(translatedSendText, 95 - translatedSendText.length - 1, y + 34, true);
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