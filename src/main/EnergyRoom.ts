import {House} from "./House";
import {RenderArea} from "./RenderArea";
import {Game} from "./Game";
import {Database} from "./Database";
import {Archipelago, candyCalorieExchangeRate, lollipopCalorieExchangeRate} from "../archipelago/Archipelago";
import {RenderTransparency} from "./RenderTransparency";
import {CallbackCollection} from "./CallbackCollection";
import {depositEnergy, savedEnergy, savedEnergyJoules, withdrawEnergy} from "../archipelago/ArchipelagoEnergyLink";
import {Saving} from "./Saving";
import game = Saving.game;

export class EnergyRoom extends House{
    private renderArea: RenderArea = new RenderArea();

    private speech = "energyGuyWelcome"
    private energyGuy: 0 | 1 | 2 | 3 = 0;
    private runAnimation = false;
    private timeout: number;

    // Constructor
    constructor(game: Game) {
        super(game);

        this.renderArea.resizeFromArray(Database.getAscii("places/village/share/energyRoom"), 0, 3);
        this.update();

        Archipelago.events.on("energyLinkUpdated", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }

    public getRenderArea(): RenderArea{
        return this.renderArea;
    }

    willBeDisplayed() {
        this.timeout = window.setInterval(() => {
            this.animationCallback();
        }, 100)
    }

    willStopBeingDisplayed() {
        clearTimeout(this.timeout);
    }

    private animationCallback() {
        if (this.runAnimation) {
            this.energyGuy = (this.energyGuy + 1) % 4 as 0 | 1 | 2 | 3

            this.update();
            this.getGame().updatePlace();
        }
    }

    private drawActionButtons(x: number, y: number, action: string, allAction: boolean) {
        this.renderArea.addAsciiRealButton("1", x, y, `${action}1Button`);
        this.renderArea.addAsciiRealButton("10", x + 2, y, `${action}10Button`);
        this.renderArea.addAsciiRealButton("100", x + 5, y, `${action}100Button`);
        this.renderArea.addAsciiRealButton("1000", x + 9, y, `${action}1000Button`);
        this.renderArea.addAsciiRealButton("10000", x + 14, y, `${action}10000Button`);
        this.renderArea.addAsciiRealButton("Other", x + 21, y, `${action}OtherButton`);
        if (allAction) {
            this.renderArea.addAsciiRealButton("All", x + 27, y, `${action}AllButton`);
        }
    }

    private drawDepositArea() {
        const formatter = Intl.NumberFormat("en", {
            notation: "compact"
        });

        this.renderArea.drawSpeech(Database.getText(this.speech), 6, 15, 45, "energyGuySpeech", Database.getTranslatedText(this.speech));

        this.renderArea.drawString(`${Database.getText("depositCandies")} 1 = ${(candyCalorieExchangeRate * 0.75).toFixed(2)} cal`, 55, 4)
        this.drawActionButtons(57, 6, "depositCandy", true)
        this.renderArea.addLinkCall(`.depositCandy1Button`, new CallbackCollection(this.deposit.bind(this, 1, "candies")))
        this.renderArea.addLinkCall(`.depositCandy10Button`, new CallbackCollection(this.deposit.bind(this, 10, "candies")))
        this.renderArea.addLinkCall(`.depositCandy100Button`, new CallbackCollection(this.deposit.bind(this, 100, "candies")))
        this.renderArea.addLinkCall(`.depositCandy1000Button`, new CallbackCollection(this.deposit.bind(this, 1000, "candies")))
        this.renderArea.addLinkCall(`.depositCandy1000Button`, new CallbackCollection(this.deposit.bind(this, 10000, "candies")))
        this.renderArea.addLinkCall(`.depositCandyOtherButton`, new CallbackCollection(this.deposit.bind(this, -1, "candies")))
        this.renderArea.addLinkCall(`.depositCandyAllButton`, new CallbackCollection(this.deposit.bind(this, -2, "candies")))

        this.renderArea.drawString(`${Database.getText("depositLollipops")} 1 = ${(lollipopCalorieExchangeRate * 0.75).toFixed(2)} cal`, 55, 8)
        this.drawActionButtons(57, 10, "depositLollipop", true)
        this.renderArea.addLinkCall(`.depositLollipop1Button`, new CallbackCollection(this.deposit.bind(this, 1, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipop10Button`, new CallbackCollection(this.deposit.bind(this, 10, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipop100Button`, new CallbackCollection(this.deposit.bind(this, 100, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipop1000Button`, new CallbackCollection(this.deposit.bind(this, 1000, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipop1000Button`, new CallbackCollection(this.deposit.bind(this, 10000, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipopOtherButton`, new CallbackCollection(this.deposit.bind(this, -1, "lollipops")))
        this.renderArea.addLinkCall(`.depositLollipopAllButton`, new CallbackCollection(this.deposit.bind(this, -2, "lollipops")))

        this.renderArea.drawString(`${Database.getText("withdrawCandies")} ${candyCalorieExchangeRate} cal = 1`, 55, 12)
        this.drawActionButtons(57, 14, "withdrawCandy", false)
        this.renderArea.addLinkCall(`.withdrawCandy1Button`, new CallbackCollection(this.withdraw.bind(this, 1, "candies")))
        this.renderArea.addLinkCall(`.withdrawCandy10Button`, new CallbackCollection(this.withdraw.bind(this, 10, "candies")))
        this.renderArea.addLinkCall(`.withdrawCandy100Button`, new CallbackCollection(this.withdraw.bind(this, 100, "candies")))
        this.renderArea.addLinkCall(`.withdrawCandy1000Button`, new CallbackCollection(this.withdraw.bind(this, 1000, "candies")))
        this.renderArea.addLinkCall(`.withdrawCandy1000Button`, new CallbackCollection(this.withdraw.bind(this, 10000, "candies")))
        this.renderArea.addLinkCall(`.withdrawCandyOtherButton`, new CallbackCollection(this.withdraw.bind(this, -1, "candies")))

        this.renderArea.drawString(`${Database.getText("withdrawLollipops")} ${lollipopCalorieExchangeRate} cal = 1`, 55, 16)
        this.drawActionButtons(57, 18, "withdrawLollipop", false)
        this.renderArea.addLinkCall(`.withdrawLollipop1Button`, new CallbackCollection(this.withdraw.bind(this, 1, "lollipops")))
        this.renderArea.addLinkCall(`.withdrawLollipop10Button`, new CallbackCollection(this.withdraw.bind(this, 10, "lollipops")))
        this.renderArea.addLinkCall(`.withdrawLollipop100Button`, new CallbackCollection(this.withdraw.bind(this, 100, "lollipops")))
        this.renderArea.addLinkCall(`.withdrawLollipop1000Button`, new CallbackCollection(this.withdraw.bind(this, 1000, "lollipops")))
        this.renderArea.addLinkCall(`.withdrawLollipop1000Button`, new CallbackCollection(this.withdraw.bind(this, 10000, "lollipops")))
        this.renderArea.addLinkCall(`.withdrawLollipopOtherButton`, new CallbackCollection(this.withdraw.bind(this, -1, "lollipops")))

        this.renderArea.drawString(`${Database.getText("energyRemaining")} ${formatter.format(savedEnergy())} cal`, 55, 20)
        this.renderArea.drawString(`= ${formatter.format(savedEnergyJoules())} J (1 cal = 4184 J)`, 55, 23)

        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("depositCandies"), 55, 5, true)
            this.renderArea.drawString(Database.getTranslatedText("depositLollipops"), 55, 9, true)
            this.renderArea.drawString(Database.getTranslatedText("withdrawCandies"), 55, 13, true)
            this.renderArea.drawString(Database.getTranslatedText("withdrawLollipops"), 55, 17, true)
            this.renderArea.drawString(Database.getTranslatedText("energyRemaining"), 55, 21, true)
        }
    }

    private async deposit(number: number, unit: "candies" | "lollipops") {
        if (unit == "lollipops" && Saving.loadNumber("lollipopFarmLollipopsPlanted") < 11) {
            this.speech = "energyGuyLollipopDepositNotEnoughGeneration";
            this.update();
            this.getGame().updatePlace();
            return;
        }

        if (number == -1) {
            const string = unit == "candies" ? "depositCandiesCustomAmount" : "depositLollipopsCustomAmount";
            const tArgs = {
                limit: unit == "candies" ? this.getGame().getCandies().getCurrent() : this.getGame().getLollipops().getCurrent()
            }
            const response = prompt(`${Database.getText(string, tArgs)}${Database.isTranslated() ? `\n\n${Database.getTranslatedText(string, tArgs)}` : ""}`)

            const amountInt = +response;
            if (!Number.isInteger(amountInt) || amountInt <= 0 || amountInt > tArgs.limit) {
                return;
            }

            number = amountInt;
        } else if (number == -2) {
            const string = unit == "candies" ? "depositAllCandies" : "depositAllLollipops";
            const deposit = unit == "candies" ? this.getGame().getCandies().getCurrent() : this.getGame().getLollipops().getCurrent();
            const tArgs = {
                limit: deposit
            };
            const response = confirm(`${Database.getText(string, tArgs)}${Database.isTranslated() ? `\n\n${Database.getTranslatedText(string, tArgs)}` : ""}`)

            if (!response) {
                return;
            }

            number = deposit;
        }

        let energyToDeposit;
        if (unit == "candies") {
            if (this.getGame().getCandies().getCurrent() < number) return;
            energyToDeposit = number * candyCalorieExchangeRate * 0.75;
            this.getGame().getCandies().add(-number);
            this.speech = "energyGuyCandyDepositComplete";
        } else {
            if (this.getGame().getLollipops().getCurrent() < number) return;
            energyToDeposit = number * lollipopCalorieExchangeRate * 0.75;
            this.getGame().getLollipops().add(-number);
            this.speech = "energyGuyLollipopDepositComplete";
        }

        await Archipelago.interruptAfterTimeout(depositEnergy(energyToDeposit));
        this.runAnimation = false;

        this.update();
        this.getGame().updatePlace();
    }

    private async withdraw(number: number, unit: "candies" | "lollipops") {
        if (number == -1) {
            const string = unit == "candies" ? "withdrawCandiesCustomAmount" : "withdrawLollipopsCustomAmount";
            const tArgs = {
                limit: unit == "candies" ? Math.floor(savedEnergy() / candyCalorieExchangeRate) : Math.floor(savedEnergy() / lollipopCalorieExchangeRate)
            }
            const response = prompt(`${Database.getText(string, tArgs)}${Database.isTranslated() ? `\n\n${Database.getTranslatedText(string, tArgs)}` : ""}`)

            const amountInt = +response;
            if (!Number.isInteger(amountInt) || amountInt <= 0 || amountInt > tArgs.limit) {
                return;
            }

            number = amountInt;
        }

        const energyWithdrawn = await Archipelago.interruptAfterTimeout(withdrawEnergy(number * (unit == "candies" ? candyCalorieExchangeRate : lollipopCalorieExchangeRate)));
        if (unit == "candies") {
            const candiesToAdd = Math.floor(energyWithdrawn / candyCalorieExchangeRate);
            if (candiesToAdd > 0) {
                this.getGame().getCandies().add(candiesToAdd);
                this.speech = "energyGuyCandyWithdrawalComplete";
            }
        } else {
            const lollipopsToAdd = Math.floor(energyWithdrawn / lollipopCalorieExchangeRate);
            if (lollipopsToAdd > 0) {
                this.getGame().getLollipops().add(lollipopsToAdd);
                this.speech = "energyGuyLollipopWithdrawalComplete";
            }
        }
        this.runAnimation = true;
        this.update();
        this.getGame().updatePlace();
    }

    private update(): void {
        // Erase everything
        this.renderArea.resetAllButSize();

        // Back to the map button
        this.addBackToTheVillageButton(this.renderArea, "energyRoomBackToTheVillageButton", "ENERGY_ROOM");

        // Draw the house
        this.renderArea.drawArray(Database.getAscii("places/village/share/energyRoom"), 0, 3);

        switch (this.energyGuy) {
            case 0:
                this.renderArea.drawArray(Database.getAscii("places/village/share/energyGuy"), 12, 20, new RenderTransparency("x"));
                break;
            case 1:
            case 3:
                this.renderArea.drawArray(Database.getAscii("places/village/share/energyGuy3"), 12, 20, new RenderTransparency("x"));
                break;
            case 2:
                this.renderArea.drawArray(Database.getAscii("places/village/share/energyGuy2"), 12, 20, new RenderTransparency("x"));
                break;

        }

        this.drawDepositArea()
    }
}