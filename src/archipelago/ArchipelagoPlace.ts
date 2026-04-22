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
import {i18n} from "../i18n";
import {lastTag} from "../../versioning";
import {Cfg} from "../main/Cfg";
import {QuestLogMessage} from "../main/QuestLogMessage";
import {sanitiseText} from "../utils";

declare const __COMMITS_SINCE_LAST_TAG: string;

figlet.parseFont("Big", big)

let chatMessage = "";

// HACK: This should be in archipelago.js but it is not exported
const hintStatuses = {
    /** The receiving player has not set a status. */
    unspecified: 0,
    /** The receiving player has specified this item is unnecessary. */
    noPriority: 10,
    /** The receiving player has specified this item is detrimental. */
    avoid: 20,
    /** The receiving player has specified this item is required/important. */
    priority: 30,
    /** The receiving player has received this item. */
    found: 40,
} as const;

export class ArchipelagoPlace extends Place {
    // The render area
    private renderArea: RenderArea = new RenderArea();

    private isBetaWarningAcknowledged = false;
    private isAcknowledgementRequiredError = false;

    private hintError = "";

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

    kickoff() {
        // Kickoff automatic login
        const url = new URL(window.location.href);
        if (url.searchParams.has("go", "LS")) {
            if (!url.searchParams.has("hostport") || !url.searchParams.has("name")) {
                alert(Database.getText("kickoffError"));
                return;
            }

            this.connectToAp();
        }
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
                if (OpfsSaving.isSupported()) {
                    this.renderArea.addAsciiRealButton(Database.getText("apSaveManagement"), 7, y + 25, "apSaveManagement", Database.getTranslatedText("apSaveManagement"));
                    this.renderArea.addLinkCall(".apSaveManagement", new CallbackCollection(this.apSaveManagement.bind(this)));
                }

                this.renderArea.addAsciiRealButton(Database.getText("apTrackerOpen"), 7, y + 27, "apTrackerOpen", Database.getTranslatedText("apTrackerOpen"));
                this.renderArea.addLinkCall(".apTrackerOpen", new CallbackCollection(this.apTrackerOpen.bind(this)));

                this.renderArea.addAsciiRealButton(Database.getText("dialogueEditorOpen"), 7, y + 29, "dialogueEditorOpen", Database.getTranslatedText("dialogueEditorOpen"));
                this.renderArea.addLinkCall(".dialogueEditorOpen", new CallbackCollection(this.dialogueEditorOpen.bind(this)));

                this.renderArea.addAsciiRealButton(Database.getText("configuration"), 7, y + 31, "configurationOpen", Database.getTranslatedText("configuration"));
                this.renderArea.addLinkCall(".configurationOpen", new CallbackCollection(this.configurationOpen.bind(this)));
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

    private async dialogueEditorOpen() {
        const {setupDialogueEditor} = await import("../item-text/editor/EditorRoot");
        setupDialogueEditor();
    }

    private loadCorrectVersion() {
        window.location.pathname = `/${Archipelago.expectedClientVersion.current}`
    }

    private configurationOpen() {
        this.getGame().setPlace(new Cfg(this.getGame()));
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

        this.renderArea.addAsciiRealButton(Database.getText("apHintRequestNewHint"), pointsX + 6, hintPointsY, "requestNewHintButton");
        this.renderArea.addLinkCall(".requestNewHintButton", new CallbackCollection(this.requestHint.bind(this)));
        this.renderArea.drawScrollingString(this.hintError, pointsX + 6, hintCostY, 99 - pointsX + 6, false, false);
        this.renderArea.addColor(pointsX + 5, 100, hintCostY, new Color(ColorType.HEALTH_RED));

        const seenHints = new Set();
        const hintList = Archipelago.client.items.hints
            .filter(x => {
                const hintDescriptor = JSON.stringify([x.item.locationId, x.item.sender.team, x.item.sender.slot]);
                return seenHints.has(hintDescriptor) ? false : seenHints.add(hintDescriptor);
            })
            .filter(x => x.item.receiver.name == Archipelago.client.name || x.item.sender.name == Archipelago.client.name);

        if (hintList.length == 0) {
            this.renderArea.drawString(Database.getText("apNoHints"), 50 - Database.getText("apNoHints").length / 2, y + 1);

            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("apNoHints"), 50 - Database.getTranslatedText("apNoHints").length / 2, y + 2, true);
            }
            return;
        }
        const notFoundHints = hintList.filter(x => !x.found);
        const foundHints = hintList.filter(x => x.found);

        this.renderArea.addTooltip("hintSetNoPriorityTooltip", `${Database.getText("apHintSetNoPriorityDescription")}${Database.isTranslated() ? `<br><br><i>${Database.getTranslatedText("apHintSetNoPriorityDescription")}</i>` : ""}`);
        this.renderArea.addTooltip("hintSetPriorityTooltip", `${Database.getText("apHintSetPriorityDescription")}${Database.isTranslated() ? `<br><br><i>${Database.getTranslatedText("apHintSetPriorityDescription")}</i>` : ""}`);
        this.renderArea.addTooltip("hintSetAvoidTooltip", `${Database.getText("apHintSetAvoidDescription")}${Database.isTranslated() ? `<br><br><i>${Database.getTranslatedText("apHintSetAvoidDescription")}</i>` : ""}`);

        const drawHint = (hint: Hint, x: number, y: number, width: number, index: number) => {

            let hintStatus = "apHintStatusUnspecified";
            switch (hint.status) {
                case hintStatuses.unspecified:
                    hintStatus = "apHintStatusUnspecified";
                    break;
                case hintStatuses.noPriority:
                    hintStatus = "apHintStatusNoPriority";
                    break;
                case hintStatuses.avoid:
                    hintStatus = "apHintStatusAvoid";
                    break;
                case hintStatuses.priority:
                    hintStatus = "apHintStatusPriority";
                    break;
                case hintStatuses.found:
                    hintStatus = "apHintStatusFound";
                    break;
            }

            this.renderArea.drawString("|", 0, y + 1);
            this.renderArea.drawScrollingString(hint.item.receiver.alias, 2,  y + 1, 14);
            this.renderArea.drawString("|", 16,  y + 1);
            this.renderArea.drawScrollingString(hint.item.name, 18,  y + 1, 14);
            this.renderArea.drawString("|", 31,  y + 1);
            this.renderArea.drawScrollingString(hint.item.sender.name, 33,  y + 1, 14);
            this.renderArea.drawString("|", 47,  y + 1);
            if (hint.entrance == "Vanilla") {
                this.renderArea.drawScrollingString(hint.item.locationName, 49,  y + 1, 30);
            } else {
                this.renderArea.drawScrollingString(`${hint.item.locationName} (${hint.entrance})`, 49,  y + 1, 30);
            }
            this.renderArea.drawString("|", 78,  y + 1);
            this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback(hintStatus), 80,  y + 1, 15);
            this.renderArea.drawString("|", 99,  y + 1);

            if (hint.status == hintStatuses.priority) {
                this.renderArea.addColor(80, 94, y + 1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_PRIORITY));
            } else if (hint.status == hintStatuses.avoid) {
                this.renderArea.addColor(80, 94, y + 1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_AVOID));
            }

            if (hint.item.receiver.slot == Archipelago.client.players.self.slot && hint.item.receiver.team == Archipelago.client.players.self.team) {
                this.renderArea.addColor(1, 15, y + 1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_SELF));

                if (!hint.found) {
                    this.renderArea.addAsciiRealButton("i", 95, y + 1, `hintSetNoPriority-${index}`);
                    this.renderArea.addAsciiRealButton("!", 96, y + 1, `hintSetPriority-${index}`, "", false, -1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_PRIORITY));
                    this.renderArea.addAsciiRealButton("X", 97, y + 1, `hintSetAvoid-${index}`, "", false, -1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_AVOID));

                    this.renderArea.addLinkCall(`.hintSetNoPriority-${index}`, new CallbackCollection(() => {
                        hint.updateStatus(hintStatuses.noPriority);
                    }))
                    this.renderArea.addLinkCall(`.hintSetPriority-${index}`, new CallbackCollection(() => {
                        hint.updateStatus(hintStatuses.priority);
                    }))
                    this.renderArea.addLinkCall(`.hintSetAvoid-${index}`, new CallbackCollection(() => {
                        hint.updateStatus(hintStatuses.avoid);
                    }))
                    this.renderArea.addLinkOnHoverShowTooltip(`.hintSetNoPriority-${index}`, ".hintSetNoPriorityTooltip");
                    this.renderArea.addLinkOnHoverShowTooltip(`.hintSetPriority-${index}`, ".hintSetPriorityTooltip");
                    this.renderArea.addLinkOnHoverShowTooltip(`.hintSetAvoid-${index}`, ".hintSetAvoidTooltip");
                }
            }

            if (hint.item.sender.slot == Archipelago.client.players.self.slot && hint.item.sender.team == Archipelago.client.players.self.team) {
                this.renderArea.addColor(33, 47, y + 1, new Color(ColorType.ARCHIPELAGO_HINT_CLIENT_SELF));
            }
        }

        this.renderArea.drawString("|", 0, y + 1);
        this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintClientReceiver"), 2,  y + 1, 14);
        this.renderArea.drawString("|", 16,  y + 1);
        this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintClientItem"), 18,  y + 1, 14);
        this.renderArea.drawString("|", 31,  y + 1);
        this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintClientFinder"), 33,  y + 1, 14);
        this.renderArea.drawString("|", 47,  y + 1);
        this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintClientLocation"), 49,  y + 1, 30);
        this.renderArea.drawString("|", 78,  y + 1);
        this.renderArea.drawScrollingString(Database.getTranslatedTextWithFallback("apHintClientStatus"), 80,  y + 1, 19);
        this.renderArea.drawString("|", 99,  y + 1);

        y += 2;

        let index = 0;
        if (notFoundHints.length > 0) {
            this.renderArea.drawString(Database.getText("apHintNotFound"), 0, y + 1);
            this.renderArea.addBold(0, Database.getText("apHintNotFound").length, y + 1);
            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("apHintNotFound"), Database.getText("apHintNotFound").length + 2, y + 1, true);
            }
            for (const hint of notFoundHints) {
                drawHint(hint, 2, y + 2, 98, index++);
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
                drawHint(hint, 2, y + 2, 98, index++);
                y += 1;
            }
        }
    }

    private requestHint() {
        const response = prompt([Database.getText("apHintRequestNewHintPrompt"), ...(Database.isTranslated() ? ["", Database.getTranslatedText("apHintRequestNewHintPrompt")] : [])].join("\n"));
        if (response) {
            queueMicrotask(() => {
                const callback = (message) => {
                    this.hintError = message;
                    Archipelago.client.messages.off("userCommand", callback);
                }
                Archipelago.client.messages.on("userCommand", callback);

                Archipelago.sendMessage(`!hint ${response}`);
            })
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
        if (__COMMITS_SINCE_LAST_TAG != "0" && !this.isBetaWarningAcknowledged && Archipelago.apPage.current == "startInterstitial") {
            this.isAcknowledgementRequiredError = true;
            this.update();
            this.getGame().updatePlace();
            return;
        }

        await Saving.load(this.getGame(), MainLoadingType.LOCAL);
        this.gameLoaded();
    }

    private renderStartInterstitial(y: number) {
        let yAdd = 0;


        if (__COMMITS_SINCE_LAST_TAG != "0" && !Archipelago.slotData.expectedClientVersion.endsWith("+")) {
            this.renderArea.drawString(" &lt;!&gt; WARNING", 0, y + yAdd)
            this.renderArea.drawString("You are using a beta of the client to play a stable version of the game.", 0, y + yAdd + 1)
            this.renderArea.drawString("If you did not mean to do this, please visit https://candybox2-ap.vicr123.com/ and log in again.", 0, y + yAdd + 2)
            this.renderArea.drawString("Otherwise, you need to bookmark the \"permalink to this version\" in the bottom left corner of ", 0, y + yAdd + 3)
            this.renderArea.drawString("this page NOW, and use this version every time you play on this world.", 0, y + yAdd + 4)

            this.renderArea.addBackgroundColor(1, 10, y + yAdd, new Color(ColorType.HEALTH_ORANGE));
            this.renderArea.addColor(11, 18, y + yAdd, new Color(ColorType.HEALTH_ORANGE));
            this.renderArea.addBold(11, 18, y + yAdd);
            this.renderArea.addBackgroundColor(10, 13, y + yAdd + 4, new Color(ColorType.HEALTH_RED));
            this.renderArea.addBold(10, 13, y + yAdd + 4)

            this.renderArea.addBold(0, 99, y + yAdd + 5);
            this.renderArea.addBold(0, 25, y + yAdd + 6);
            this.renderArea.addHtmlLink(45, y + yAdd + 2, `https://candybox2-ap.vicr123.com/`, "https://candybox2-ap.vicr123.com/");

            this.renderArea.addCheckbox(0, y + yAdd + 10, new CallbackCollection(() => this.isBetaWarningAcknowledged = true), new CallbackCollection(() => this.isBetaWarningAcknowledged = false), "betaWarningAcknowledged", this.isBetaWarningAcknowledged);
            this.renderArea.drawString("I have read the above warning.", 4, y + yAdd + 10);

            this.renderArea.addAsciiRealButton(Database.getText("apBackupStartNewGame"), 11, y + yAdd + 12, "startNewGame", Database.getTranslatedText("apBackupStartNewGame"));
            this.renderArea.addLinkCall(".startNewGame", new CallbackCollection(this.startNewGame.bind(this)));

            if (this.isAcknowledgementRequiredError) {
                this.renderArea.drawString("Please read and acknowledge the above before starting.", 0, y + yAdd + 14)
                this.renderArea.addColor(0, 54, y + yAdd + 14, new Color(ColorType.HEALTH_RED));
            }

            if (Archipelago.apCountdown.current) {
                const countdownText = figlet.textSync(Archipelago.apCountdown.current.toString(), {
                    font: "Big"
                }).split("\n");
                this.renderArea.drawArray(countdownText, 50 - countdownText[0].length / 2, y + yAdd + 16);
            }
            return;
        }

        if (__COMMITS_SINCE_LAST_TAG != "0") {
            this.renderArea.drawString(" &lt;!&gt; WARNING", 0, y + yAdd)
            this.renderArea.drawString("Before you start playing on this world, please be aware that you have generated this world on a beta.", 0, y + yAdd + 1)
            this.renderArea.drawString("If you intend to play this version long-term, you need to bookmark the \"permalink to this version\"", 0, y + yAdd + 2)
            this.renderArea.drawString("in the bottom left corner of this page NOW, and use this version every time you play on this world.", 0, y + yAdd + 3)
            this.renderArea.drawString("However, please consider using the stable version of the apworld and generating a new world if you", 0, y + yAdd + 5)
            this.renderArea.drawString("intend to play long-term. You can find the latest stable apworld here.", 0, y + yAdd + 6)
            this.renderArea.drawString("If you decide to continue on this world, the automatic version redirection feature may not work.", 0, y + yAdd + 8)

            this.renderArea.addBackgroundColor(1, 10, y + yAdd, new Color(ColorType.HEALTH_ORANGE));
            this.renderArea.addColor(11, 18, y + yAdd, new Color(ColorType.HEALTH_ORANGE));
            this.renderArea.addBold(11, 18, y + yAdd);
            this.renderArea.addBackgroundColor(39, 42, y + yAdd + 3, new Color(ColorType.HEALTH_RED));
            this.renderArea.addBold(39, 42, y + yAdd + 3)

            this.renderArea.addBold(0, 99, y + yAdd + 5);
            this.renderArea.addBold(0, 25, y + yAdd + 6);
            this.renderArea.addHtmlLink(65, y + yAdd + 6, `https://github.com/vicr123/Archipelago/releases/latest`, "here");

            this.renderArea.addCheckbox(0, y + yAdd + 10, new CallbackCollection(() => this.isBetaWarningAcknowledged = true), new CallbackCollection(() => this.isBetaWarningAcknowledged = false), "betaWarningAcknowledged", this.isBetaWarningAcknowledged);
            this.renderArea.drawString("I have read the above warning.", 4, y + yAdd + 10);

            this.renderArea.addAsciiRealButton(Database.getText("apBackupStartNewGame"), 11, y + yAdd + 12, "startNewGame", Database.getTranslatedText("apBackupStartNewGame"));
            this.renderArea.addLinkCall(".startNewGame", new CallbackCollection(this.startNewGame.bind(this)));

            if (this.isAcknowledgementRequiredError) {
                this.renderArea.drawString("Please read and acknowledge the above before starting.", 0, y + yAdd + 14)
                this.renderArea.addColor(0, 54, y + yAdd + 14, new Color(ColorType.HEALTH_RED));
            }

            if (Archipelago.apCountdown.current) {
                const countdownText = figlet.textSync(Archipelago.apCountdown.current.toString(), {
                    font: "Big"
                }).split("\n");
                this.renderArea.drawArray(countdownText, 50 - countdownText[0].length / 2, y + yAdd + 16);
            }
            return;
        }

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

    private async connectToAp(event?: JQuery.MouseUpEvent | JQuery.TouchEndEvent) {
        // if (event.type == "touchend") {
        //     this.getGame().setTouchControls(confirm("Enable experimental touch controls?"))
        // }

        if (!await Archipelago.connect()) {
            return;
        }

        if ((OpfsSaving.isSupported() && !await OpfsSaving.haveSave()) || (!OpfsSaving.isSupported() && !LocalSaving.haveSave())) {
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