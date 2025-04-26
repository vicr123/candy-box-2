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

        // Archipelago.client.deathLink.on("deathReceived", (source, time, cause) => {
        //     this.queueNotification(new ArchipelagoNotification("deathlink", cause ?? "", source));
        // })
        // Archipelago.events.on("itemToBeProcessed",(item: Item) => {
        //     if (item.sender.name == Archipelago.client.name && item.receiver.name == Archipelago.client.name) {
        //         this.queueNotification(new ArchipelagoNotification("selfgive", item.name, item.receiver.name));
        //     } else if (item.receiver.name == Archipelago.client.name) {
        //         this.queueNotification(new ArchipelagoNotification("get", item.name, item.sender.name));
        //     }
        // })
        // Archipelago.client.messages.on("itemSent", (_, item) => {
        //     if (item.sender.name == Archipelago.client.name && item.receiver.name != Archipelago.client.name) {
        //         this.queueNotification(new ArchipelagoNotification("give", item.name, item.receiver.name));
        //     }
        // })

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
                renderArea.drawString(Database.getTranslatedTextWithFallback("apArchipelagoUpdate"), 31, 1);
                renderArea.addBold(31, 31 + Database.getTranslatedTextWithFallback("apArchipelagoUpdate").length, 1);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apReceive", {
                    item: notification.item
                }), 31, 2);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apReceive2", {
                    sender: notification.obtainer
                }), 31, 3);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "give":
                renderArea.drawString(Database.getTranslatedTextWithFallback("apArchipelagoUpdate"), 31, 1);
                renderArea.addBold(31, 31 + Database.getTranslatedTextWithFallback("apArchipelagoUpdate").length, 1);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apSent", {
                    item: notification.item
                }), 31, 2);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apSent2", {
                    receiver: notification.obtainer
                }), 31, 3);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "selfgive":
                renderArea.drawString(Database.getTranslatedTextWithFallback("apArchipelagoUpdate"), 31, 1);
                renderArea.addBold(31, 31 + Database.getTranslatedTextWithFallback("apArchipelagoUpdate").length, 1);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apReceiveSelf", {
                    item: notification.item
                }), 31, 2);
                renderArea.addBackgroundColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 1, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 78, 2, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                renderArea.addBackgroundColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION));
                renderArea.addColor(30, 77, 3, new Color(ColorType.ARCHIPELAGO_NOTIFICATION_FOREGROUND));
                break;
            case "deathlink":
                renderArea.drawString(Database.getTranslatedTextWithFallback("apArchipelagoUpdate"), 31, 1);
                renderArea.addBold(31, 31 + Database.getTranslatedTextWithFallback("apArchipelagoUpdate").length, 1);
                renderArea.drawString(Database.getTranslatedTextWithFallback("apDeathlink", {
                    sender: notification.obtainer
                }), 31, 2);
                renderArea.drawString(notification.item, 31, 3);
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
    public progression: boolean;
    public useful: boolean;
    public trap: boolean;

    constructor(type: ArchipelagoNotificationType, item: string, obtainer: string, progression?: boolean, useful?: boolean, trap?: boolean) {
        this.type = type;
        this.item = item;
        this.obtainer = obtainer;
        this.progression = progression ?? false;
        this.useful = useful ?? false;
        this.trap = trap ?? false;
    }
}

export class ArchipelagoNotificationDrawer {
    private drawer: HTMLElement;
    private drawerItemParent: HTMLElement;
    private queue: ArchipelagoNotification[] = [];
    private visibleNotifications: ArchipelagoNotificationView[] = [];
    private archipelagoUpdate: HTMLElement;
    private notificationDismiss: HTMLElement;

    constructor() {
        this.drawer = document.getElementById("notificationDrawer");
        this.drawerItemParent = document.getElementById("archipelagoNotificationDrawer");
        this.archipelagoUpdate = document.getElementById("archipelagoUpdateText");
        this.notificationDismiss = document.getElementById("notificationDismissText");

        Archipelago.client.deathLink.on("deathReceived", (source, time, cause) => {
            this.enqueueNotification(new ArchipelagoNotification("deathlink", cause ?? "", source));
        })
        Archipelago.events.on("itemToBeProcessed",(item: Item) => {
            if (item.sender.name == Archipelago.client.name && item.receiver.name == Archipelago.client.name) {
                this.enqueueNotification(new ArchipelagoNotification("selfgive", item.name, item.receiver.name));
            } else if (item.receiver.name == Archipelago.client.name) {
                this.enqueueNotification(new ArchipelagoNotification("get", item.name, item.sender.name));
            }
        })
        Archipelago.client.messages.on("itemSent", (_, item) => {
            if (item.sender.name == Archipelago.client.name && item.receiver.name != Archipelago.client.name) {
                this.enqueueNotification(new ArchipelagoNotification("give", item.name, item.receiver.name, item.progression, item.useful, item.trap));
            }
        })

        window.addEventListener("keypress", event => {
            if (event.key == "`") {
                this.dismissFirst();
            }
        })

        this.updateArchipelagoUpdate()
    }

    enqueueNotification(notification: ArchipelagoNotification) {
        this.queue.push(notification);
        if (this.visibleNotifications.length < 5) {
            this.dequeueNotification();
        }
    }

    dequeueNotification() {
        const notification = this.queue.shift();
        if (!notification) {
            return;
        }

        const view = new ArchipelagoNotificationView(this, notification);
        this.visibleNotifications.push(view);
        this.updateArchipelagoUpdate();
    }

    finishNotification(notification: ArchipelagoNotificationView) {
        this.visibleNotifications.splice(this.visibleNotifications.indexOf(notification), 1);
        this.updateArchipelagoUpdate();
        this.dequeueNotification();
    }

    addToDrawer(element: HTMLElement) {
        this.drawerItemParent.appendChild(element);
    }

    updateArchipelagoUpdate() {
        this.archipelagoUpdate.innerText = Database.getTranslatedTextWithFallback("apArchipelagoUpdate")
        this.notificationDismiss.innerText = Database.getTranslatedTextWithFallback("notificationDrawerDismiss")
        if (this.visibleNotifications.length == 0) {
            this.archipelagoUpdate.style.opacity = "0";
            this.notificationDismiss.style.opacity = "0";
        } else {
            this.archipelagoUpdate.style.opacity = "1";
            this.notificationDismiss.style.opacity = "1";
        }
    }

    dismissFirst() {
        const notification = this.visibleNotifications[0];
        if (notification) {
            notification.dismiss();
        }
    }
}

export class ArchipelagoNotificationView {
    private root: HTMLElement;
    private notification: ArchipelagoNotification;
    private drawer: ArchipelagoNotificationDrawer;
    private timeout: number

    constructor(drawer: ArchipelagoNotificationDrawer, notification: ArchipelagoNotification) {
        this.drawer = drawer;
        this.notification = notification;

        this.root = document.createElement("div");
        this.root.style.display = "flex";
        this.root.style.flexDirection = "row-reverse";
        this.root.style.animation = "0.2s notification-slide-in ease-out"

        const pre = document.createElement("pre");
        pre.style.padding = "3px";
        pre.style.margin = "0px";

        const pre2 = document.createElement("pre");
        pre2.style.padding = "3px";
        pre2.style.margin = "0px";

        switch (notification.type) {
            case "get":
                pre.style.color = "white"
                pre.style.backgroundColor = "#0000FF"
                pre.innerText = Database.getTranslatedTextWithFallback("apReceive", {
                    item: notification.item,
                    sender: notification.obtainer
                });
                break;
            case "give":
                pre.style.color = "white"
                pre.style.backgroundColor = "#0000FF"
                pre.innerText = Database.getTranslatedTextWithFallback("apSent", {
                    item: notification.item,
                    receiver: notification.obtainer
                });

                if (notification.trap) {
                    pre2.innerText = Database.getTranslatedTextWithFallback("itemTrap");
                    pre2.style.color = "white";
                    pre2.style.backgroundColor = "#FF0000";
                } else if (notification.progression && notification.useful) {
                    pre2.innerText = Database.getTranslatedTextWithFallback("itemProgUseful");
                    pre2.style.color = "white";
                    pre2.style.backgroundColor = "#9c6400";
                } else if (notification.useful) {
                    pre2.innerText = Database.getTranslatedTextWithFallback("itemUseful");
                    pre2.style.color = "white";
                    pre2.style.backgroundColor = "#009600";
                }
                break;
            case "selfgive":
                pre.style.color = "white"
                pre.style.backgroundColor = "#0000FF"
                pre.innerText = Database.getTranslatedTextWithFallback("apReceiveSelf", {
                    item: notification.item
                });
                break;
            case "deathlink":
                pre.style.color = "white"
                pre.style.backgroundColor = "#FF0000"
                pre.innerText = Database.getTranslatedTextWithFallback("apDeathlink", {
                    sender: notification.obtainer
                });
                pre2.innerText = notification.item;
                pre2.style.color = "white";
                pre2.style.backgroundColor = "#960000";
                break;
        }

        if (pre2.innerText) {
            this.root.appendChild(pre2);
        }
        this.root.appendChild(pre);

        this.drawer.addToDrawer(this.root);

        this.timeout = window.setTimeout(() => this.dismiss(), 5000);
    }

    dismiss() {
        window.clearTimeout(this.timeout);
        this.drawer.finishNotification(this);
        this.root.style.animation = "0.2s notification-slide-out ease-in"
        window.setTimeout(() => {
            this.root.style.animation = "0.2s notification-fold ease-in-out"
            window.setTimeout(() => {
                this.root.remove();
            }, 200)
        }, 200)
    }
}
