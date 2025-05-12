import {Place} from "../main/Place";
import {Game} from "../main/Game";
import {Database} from "../main/Database";
import {RenderArea, RenderAreaEvents} from "../main/RenderArea";
import {Archipelago, ArchipelagoPlacePage} from "./Archipelago";
import {CallbackCollection} from "../main/CallbackCollection";
import {Pos} from "../main/Pos";
import {Saving} from "../main/Saving";
import {MainLoadingType} from "../main/MainLoadingType";
import {Color} from "../main/Color";
import {ColorType} from "../main/ColorType";
import {Algo} from "../main/Algo";
import posessive = Algo.posessive;
import {LocalSaving} from "../main/LocalSaving";
import {ArchipelagoSaving} from "./ArchipelagoSaving";
import {Hint} from "archipelago.js";
import {StatusBarTabType} from "../main/StatusBarTabType";
import {OpfsSaving} from "../main/OpfsSaving";
import {SaveManagementPlace} from "./SaveManagementPlace";
import figlet from "figlet";
import big from "figlet/importable-fonts/Big.js"

figlet.parseFont("Big", big)

let chatMessage = "";

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
        },
        {
            text: "apHintTab",
            page: "hint"
        },
        {
            text: "apTrackerTab",
            page: "tracker"
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
            if (Archipelago.connectionStatus.current == "connected") {
                if (!Saving.loadBool("statusBarUnlockedAp")) {
                    // Initial setup complete - start the game by going to the candy box
                    game.goToCandyBox();
                    game.updateStatusBar(true);
                } else {
                    game.goToMap();
                    game.updateStatusBar(true);
                    game.getStatusBar().selectTabByType(StatusBarTabType.MAP)
                }
            }
        });
        Archipelago.events.on("apCountdownChanged", this.externalUpdate.bind(this));
        Archipelago.events.on("apLogUpdated", this.externalUpdate.bind(this));
    }

    willBeDisplayed() {
        super.willBeDisplayed();

        RenderAreaEvents.on("scrollChanged", this.scrollChanged);
    }

    willStopBeingDisplayed() {
        super.willStopBeingDisplayed();

        RenderAreaEvents.off("scrollChanged", this.scrollChanged);
    }

    private scrollChanged = () => {
        if (Archipelago.apPage.current == "chat" || Archipelago.apPage.current == "hint") {
            if (chatMessage == null) {
                chatMessage = "";
            } else {
                const messageBox = $(".apMessage");
                chatMessage = messageBox.val() as string;
            }

            this.externalUpdate();
        }
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
                    this.renderArea.drawString(translatedText, x + 2, y + 2, true);
                    x += Math.max(text.length, translatedText.length) + 3;
                } else {
                    x += text.length + 3;
                }

                if (Archipelago.apPage.current == tab.page) {
                    this.renderArea.addBackgroundColor(startX + 1, x, y + 1, new Color(ColorType.STATUS_BAR_SELECTED_TAB, true));
                    if (Database.isTranslated()) this.renderArea.addBackgroundColor(startX + 1, x, y + 2, new Color(ColorType.STATUS_BAR_SELECTED_TAB, true));
                } else {
                    this.renderArea.addAsciiButton(startX + 1, x, y + 1, `changeTo${tab.page}Tab`)
                    if (Database.isTranslated()) this.renderArea.addAsciiButton(startX + 1, x, y + 2, `changeTo${tab.page}Tab`)
                    this.renderArea.addLinkCall(`.changeTo${tab.page}Tab`, new CallbackCollection(() => {
                        Archipelago.apPage.current = tab.page;
                    }));
                }
            }
            this.renderArea.drawVerticalLine("|", x, y + 1, Database.isTranslated() ? y + 2 : y + 1);
            y = Database.isTranslated() ? y + 4 : y + 3;
        }

        switch (Archipelago.apPage.current) {
            case "startInterstitial":
                this.renderStartInterstitial(y);
                break;
            case "backupRestore":
                this.renderBackupRestore(y);
                break;
            case "connection":
                this.renderApConnection(y);
                break;
            case "chat":
                this.renderApLog(y);
                break;
            case "hint":
                this.renderHints(y);
                break;
            case "tracker":
                this.renderTracker(y);
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

                this.renderArea.drawString("Other options:", 7, y + 23);
                this.renderArea.addAsciiRealButton(Database.getText("apSaveManagement"), 7, y + 25, "apSaveManagement", Database.getTranslatedText("apSaveManagement"));
                this.renderArea.addLinkCall(".apSaveManagement", new CallbackCollection(this.apSaveManagement.bind(this)));

                this.renderArea.addAsciiRealButton(Database.getText("apTrackerOpen"), 7, y + 27, "apTrackerOpen", Database.getTranslatedText("apTrackerOpen"));
                this.renderArea.addLinkCall(".apTrackerOpen", new CallbackCollection(this.apTrackerOpen.bind(this)));
                break;
            case "connecting":
                this.renderArea.drawString(Database.getText("apStatusConnecting"), 7, y + 15);
                this.renderArea.drawString(Database.getTranslatedText("apStatusConnecting"), 7 + 32, y + 15, true);
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

    private apSaveManagement() {
        this.getGame().setPlace(new SaveManagementPlace(this.getGame()));
    }

    private apTrackerOpen() {
        Archipelago.trackerOpen.current = !Archipelago.trackerOpen.current;
    }

    private loadCorrectVersion() {
        window.location.pathname = `/${Archipelago.expectedClientVersion.current}`
    }

    private renderApLog(y: number) {
        Archipelago.apLog.draw(this.renderArea, new Pos(0, y));

        if (Archipelago.connectionStatus.current == "connected") {
            this.renderArea.addSimpleInputOnEnter(0, 95, y + 32, new CallbackCollection(this.sendApMessage.bind(this)), "apMessage", chatMessage, true);
            this.renderArea.addAsciiRealButton(Database.getText("apSend"), 95, y + 34, "apSend");
            const translatedSendText = Database.getTranslatedText("apSend")
            if (translatedSendText) {
                this.renderArea.drawString(translatedSendText, 95 - translatedSendText.length - 1, y + 34, true);
            }
            this.renderArea.addLinkCall(".apSend", new CallbackCollection(this.sendApMessage.bind(this)));
        }
    }

    private renderHints(y: number) {
        const apAvailableHintPoints = Database.getText("apAvailableHintPoints");
        const apHintCost = Database.getText("apHintCost")
        const apAvailableHintPointsTranslated = Database.getTranslatedText("apAvailableHintPoints");
        const apHintCostTranslated = Database.getTranslatedText("apHintCost");
        this.renderArea.drawString(apAvailableHintPoints, 0, y);
        const hintPointsY = y;
        y += 1;
        if (apAvailableHintPointsTranslated) {
            this.renderArea.drawString(apAvailableHintPointsTranslated, 0, y, true);
            y += 1;
        }
        this.renderArea.drawString(apHintCost, 0, y);
        const hintCostY = y;
        y += 1;
        if (apHintCostTranslated) {
            this.renderArea.drawString(apHintCostTranslated, 0, y, true);
            y += 1;
        }

        const pointsX = Math.max(apAvailableHintPoints.length, apHintCost.length, apAvailableHintPointsTranslated.length, apHintCostTranslated.length) + 3;
        this.renderArea.drawString(`${Archipelago.client.room.hintPoints}`, pointsX, hintPointsY);
        this.renderArea.drawString(`${Archipelago.client.room.hintCost}`, pointsX, hintCostY);

        const hintList = Archipelago.client.items.hints.filter(x => x.item.receiver.name == Archipelago.client.name || x.item.sender.name == Archipelago.client.name);

        if (hintList.length == 0) {
            this.renderArea.drawString(Database.getText("apNoHints"), 50 - Database.getText("apNoHints").length / 2, y + 1);

            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("apNoHints"), 50 - Database.getTranslatedText("apNoHints").length / 2, y + 2, true);
            }
            return;
        }
        const notFoundHints = hintList.filter(x => !x.found);
        const foundHints = hintList.filter(x => x.found);

        const drawHint = (hint: Hint, x: number, y: number, width: number) => {
            if (hint.entrance == "Vanilla") {
                this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintText", {
                    player: posessive(hint.item.receiver.name),
                    item: hint.item.name,
                    location: hint.item.locationName,
                    sender: posessive(hint.item.sender.name)
                }), x, y, width)
            } else {
                this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintTextWithEntrance", {
                    player: posessive(hint.item.receiver.name),
                    item: hint.item.name,
                    location: hint.item.locationName,
                    entrance: hint.entrance,
                    sender: posessive(hint.item.sender.name)
                }), x, y, width)
            }
        }

        if (notFoundHints.length > 0) {
            this.renderArea.drawString(Database.getText("apHintNotFound"), 0, y + 1);
            this.renderArea.addBold(0, Database.getText("apHintNotFound").length, y + 1);
            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("apHintNotFound"), Database.getText("apHintNotFound").length + 2, y + 1, true);
            }
            for (const hint of notFoundHints) {
                drawHint(hint, 2, y + 3, 98);
                y += 1;
            }
            y += 4;
        }

        if (foundHints.length > 0) {
            this.renderArea.drawString(Database.getText("apHintFound"), 0, y + 1);
            this.renderArea.addBold(0, Database.getText("apHintFound").length, y + 1);
            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("apHintFound"), Database.getText("apHintFound").length + 2, y + 1, true);
            }
            for (const hint of foundHints) {
                drawHint(hint, 2, y + 3, 98);
                y += 1;
            }
        }
    }

    private renderBackupRestore(y: number) {
        let yAdd = 0;
        this.renderArea.drawString(Database.getText("apBackupFoundText"), 0, y);
        this.renderArea.drawString(Database.getText("saveApLastSave", {
            date: new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "medium"
            }).format(ArchipelagoSaving.lastDate())
        }), 0, y+1);

        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("apBackupFoundText"), 0, y + yAdd + 3, true);
            this.renderArea.drawString(Database.getTranslatedText("saveApLastSave", {
                date: new Intl.DateTimeFormat(Saving.loadString("gameLanguage"), {
                    dateStyle: "medium",
                    timeStyle: "medium"
                }).format(ArchipelagoSaving.lastDate())
            }), 0, y+4, true);
            yAdd += 3;
        }

        this.renderArea.addAsciiRealButton(Database.getText("loadApLoadNow"), 7, y + yAdd + 3, "restoreApBackup", Database.getTranslatedText("loadApLoadNow"));
        this.renderArea.addLinkCall(".restoreApBackup", new CallbackCollection(this.restoreArchipelagoBackup.bind(this)));

        this.renderArea.drawString(Database.getText("apBackupFoundNewGame0"), 0, y + yAdd + 5)
        this.renderArea.drawString(Database.getText("apBackupFoundNewGame1"), 0, y + yAdd + 6)
        this.renderArea.drawString(Database.getText("apBackupFoundNewGame2"), 0, y + yAdd + 7)
        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("apBackupFoundNewGame0"), 0, y + yAdd + 9, true)
            this.renderArea.drawString(Database.getTranslatedText("apBackupFoundNewGame1"), 0, y + yAdd + 10, true)
            this.renderArea.drawString(Database.getTranslatedText("apBackupFoundNewGame2"), 0, y + yAdd + 11, true)
            yAdd += 4;
        }

        this.renderArea.addAsciiRealButton(Database.getText("apBackupStartNewGame"), 7, y + yAdd + 9, "startNewGame", Database.getTranslatedText("apBackupStartNewGame"));
        this.renderArea.addLinkCall(".startNewGame", new CallbackCollection(this.startNewGame.bind(this)));
    }

    private async restoreArchipelagoBackup() {
        await Saving.load(this.getGame(), MainLoadingType.ARCHIPELAGO);
        this.gameLoaded();
    }

    private async startNewGame() {
        await Saving.load(this.getGame(), MainLoadingType.LOCAL);
        this.gameLoaded();
    }

    private renderStartInterstitial(y: number) {
        let yAdd = 0;
        this.renderArea.drawString(Database.getText("apStartInterstitialText"), 0, y + yAdd)
        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("apStartInterstitialText"), 0, y + yAdd + 9, true)
            yAdd += 1;
        }

        this.renderArea.addAsciiRealButton(Database.getText("apBackupStartNewGame"), 7, y + yAdd + 2, "startNewGame", Database.getTranslatedText("apBackupStartNewGame"));
        this.renderArea.addLinkCall(".startNewGame", new CallbackCollection(this.startNewGame.bind(this)));

        if (Archipelago.apCountdown.current) {
            const countdownText = figlet.textSync(Archipelago.apCountdown.current.toString(), {
                font: "Big"
            }).split("\n");
            this.renderArea.drawArray(countdownText, 50 - countdownText[0].length / 2, y + yAdd + 4);
        }
    }

    private renderTracker(y: number) {
        let yAdd = 0;
        this.renderArea.drawString(Database.getText("apTrackerDescription"), 0, y);
        this.renderArea.drawString(Database.getText("apTrackerDescription2"), 0, y + 1);

        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("apTrackerDescription"), 0, y + 3, true);
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("apTrackerDescription2"), 0, y + 4, true);
            yAdd += 2;
        }

        this.renderArea.addAsciiRealButton(Database.getText("apTrackerOpen"), 7, y + yAdd + 3, "apTrackerOpen", Database.getTranslatedText("apTrackerOpen"));
        this.renderArea.addLinkCall(".apTrackerOpen", new CallbackCollection(this.apTrackerOpen.bind(this)));
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
        const message = messageBox.val();
        messageBox.val("")
        chatMessage = null;

        queueMicrotask(() => {
            Archipelago.sendMessage(message);
        })
    }

    private async connectToAp(event: JQuery.MouseUpEvent | JQuery.TouchEndEvent) {
        // if (event.type == "touchend") {
        //     this.getGame().setTouchControls(confirm("Enable experimental touch controls?"))
        // }

        if (!await Archipelago.connect()) {
            return;
        }

        if (!await OpfsSaving.haveSave()) {
            if (ArchipelagoSaving.haveSave()) {
                // We need to ask what the user wants to do
                Archipelago.apPage.current = "backupRestore";
                return;
            } else {
                Archipelago.apPage.current = "startInterstitial";
                return;
            }
        }

        await this.startNewGame();
    }

    private gameLoaded() {
        this.getGame().postLoad();
        Archipelago.finaliseConnection();
    }

    private disconnectFromAp() {
        window.location.reload();
    }
}