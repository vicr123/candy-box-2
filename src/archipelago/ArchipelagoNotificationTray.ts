import {RenderArea} from "../main/RenderArea";
import {Database} from "../main/Database";
import {RenderTransparency} from "../main/RenderTransparency";
import {Color} from "../main/Color";
import {ColorType} from "../main/ColorType";
import {StatusBar} from "../main/StatusBar";
import {CallbackCollection} from "../main/CallbackCollection";
import {Game} from "../main/Game";
import {Archipelago} from "./Archipelago";
import {Item} from "archipelago.js";
import {san} from "../utils";

export class ArchipelagoNotificationTray {
    private statusBar: StatusBar;
    private queuedNotifications: ArchipelagoNotification[] = [];
    private game: Game;
    private timeUntilNextNotification: number;

    constructor(statusBar: StatusBar, game: Game) {
        this.statusBar = statusBar;
        this.game = game;

        Archipelago.client.deathLink.on("deathReceived", (source, time, cause) => {
            this.queueNotification(new ArchipelagoNotification("deathlink", cause ?? "", source));
        })
        Archipelago.events.on("itemToBeProcessed",(item: Item) => {
            if (item.sender.name == Archipelago.client.name && item.receiver.name == Archipelago.client.name) {
                this.queueNotification(new ArchipelagoNotification("selfgive", item.name, item.receiver.name));
            } else if (item.receiver.name == Archipelago.client.name) {
                this.queueNotification(new ArchipelagoNotification("get", item.name, item.sender.name));
            }
        })
        Archipelago.client.messages.on("itemSent", (_, item) => {
            if (item.sender.name == Archipelago.client.name) {
                this.queueNotification(new ArchipelagoNotification("give", item.name, item.receiver.name));
            }
        })

        setInterval(this.countdown.bind(this), 1000);
    }

    public render(renderArea: RenderArea) {
        if (this.queuedNotifications.length == 0) {
            return;
        }

        // Draw the notification box and clear the background
        renderArea.drawArray(Database.getAscii("general/archipelagoNotification"), 30, 1, new RenderTransparency(""));

        const notification = this.queuedNotifications[0];
        switch (notification.type) {
            case "get":
                renderArea.drawString(`Archipelago Update:`, 31, 1);
                renderArea.drawString(san`Got ${notification.item} from ${notification.obtainer}!`, 31, 2);
                renderArea.addBold(30 + 5, 30 + 5 + notification.item.length, 2);
                renderArea.addBold(30 + 5 + notification.item.length + 6, 30 + 5 + notification.item.length + 6 + notification.obtainer.length, 2);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "give":
                renderArea.drawString(`Archipelago Update:`, 31, 1);
                renderArea.drawString(san`Sent ${notification.item} to ${notification.obtainer}!`, 31, 2);
                renderArea.addBold(30 + 6, 30 + 6 + notification.item.length, 2);
                renderArea.addBold(30 + 6 + notification.item.length + 4, 30 + 6 + notification.item.length + 4 + notification.obtainer.length, 2);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "selfgive":
                renderArea.drawString(`Archipelago Update:`, 31, 1);
                renderArea.drawString(san`Got ${notification.item}!`, 31, 2);
                renderArea.addBold(30 + 5, 30 + 5 + notification.item.length, 2);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "deathlink":
                renderArea.drawString(`Archipelago Update:`, 31, 1);
                renderArea.drawString(san`Death granted by ${notification.obtainer}!`, 31, 2);
                renderArea.drawString(notification.item, 31, 3);
                renderArea.addBold(30 + 18, 30 + 18 + notification.obtainer.length, 2);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_DEATHLINK, false));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND, false));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_DEATHLINK, false));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND, false));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_DEATHLINK, false));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND, false));
                break;
        }

        if (this.queuedNotifications.length > 1) {
            const moreString = `+${this.queuedNotifications.length - 1} more...`;
            renderArea.drawString(moreString, 77 - moreString.length, 3);
        }

        renderArea.addAsciiRealButton("Dismiss", 90, 2, "apNotificationDismiss");
        renderArea.addLinkCall(".apNotificationDismiss", new CallbackCollection(this.dismissLastNotification.bind(this)));
        renderArea.addBackgroundColor(90, 90 + this.timeUntilNextNotification, 3, new Color(ColorType.HEALTH_GREEN));
        renderArea.drawString(`(${this.timeUntilNextNotification})`, 92, 3);
    }

    public dismissLastNotification() {
        this.queuedNotifications.shift();
        this.game.updateStatusBar(false);
        this.timeUntilNextNotification = 7;
    }

    public queueNotification(notification: ArchipelagoNotification) {
        if (this.queuedNotifications.length == 0) {
            this.timeUntilNextNotification = 7;
        }
        this.queuedNotifications.push(notification);
        this.game.updateStatusBar(false);
    }

    public get currentlyDisplayingNotification() {
        return this.queuedNotifications.length != 0;
    }

    private countdown() {
        if (this.queuedNotifications.length > 0) {
            this.timeUntilNextNotification--;
            if (this.timeUntilNextNotification == 0) {
                this.dismissLastNotification();
            }
            this.game.updateStatusBar(false);
        }
    }
}

type ArchipelagoNotificationType = "get" | "give" | "selfgive" | "deathlink";

export class ArchipelagoNotification {
    public type: ArchipelagoNotificationType;
    public item: string;
    public obtainer: string;

    constructor(type: ArchipelagoNotificationType, item: string, obtainer: string) {
        this.type = type;
        this.item = item;
        this.obtainer = obtainer;
    }
}