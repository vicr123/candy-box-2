import {Place} from "../main/Place";
import {Game} from "../main/Game";
import {Archipelago} from "./Archipelago";
import {Saving} from "../main/Saving";
import {StatusBarTabType} from "../main/StatusBarTabType";
import {Database} from "../main/Database";
import {Color} from "../main/Color";
import {ColorType} from "../main/ColorType";
import {CallbackCollection} from "../main/CallbackCollection";
import {RenderArea} from "../main/RenderArea";
import {ArchipelagoPlace} from "./ArchipelagoPlace";
import {OpfsSaving} from "../main/OpfsSaving";
import {Save} from "../main/Save";
import {Bar} from "../main/Bar";
import { BarType } from "../main/BarType";

interface SaveFile {
    name: string;
    dateString: string;
    date: number;
    candies: number,
    lollipops: number,
}

export class SaveManagementPlace extends Place {
    // The render area
    private renderArea: RenderArea = new RenderArea();
    private saveFiles: SaveFile[] = [];
    private usage: Bar;
    private quotas: StorageEstimate;

    // Constructor
    constructor(game: Game){
        super(game);

        this.usage = new Bar(BarType.HEALTH)
        this.usage.resize(100, 1);

        // Update
        this.updateSaveFiles();
    }

    public getRenderArea(): RenderArea{
        return this.renderArea;
    }

    private resize(): void{
        this.renderArea.resize(100, this.saveFiles.length + 20);
    }

    private update(): void{
        // Erase everything
        this.renderArea.resetAllButSize();

        this.renderArea.drawArray(Database.getAscii("text/SaveManagement"), 7, 0);

        const formatter = Intl.NumberFormat("en", {
            notation: "compact",
            style: "unit",
            unit: "byte",
            unitDisplay: "narrow"
        });

        let y = 8;

        this.renderArea.addAsciiRealButton(Database.getText("back"), 0, y, "backButton", Database.getTranslatedText("back"));
        this.renderArea.addLinkCall(".backButton", new CallbackCollection(this.quitSaves.bind(this)));

        this.usage.update(1 - this.quotas.usage / this.quotas.quota, Database.getTranslatedTextWithFallback("saveManagementQuota", {
            storage: formatter.format(this.quotas.quota - this.quotas.usage).replace("BB", "GB")
        }));
        this.renderArea.drawArea(this.usage, 0, y+2);
        y += 3

        this.renderArea.drawString(Database.getText("saveManagementDescription"), 0, y+2);
        if (Database.isTranslated()) {
            this.renderArea.drawString(Database.getTranslatedText("saveManagementDescription"), 0, y+3, true);
            y++;
        }

        if (this.saveFiles.length > 0) {
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("saveManagementId"), 0, y + 4);
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("saveManagementDate"), 40, y + 4);
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("candies"), 65, y + 4);
            this.renderArea.drawString(Database.getTranslatedTextWithFallback("lollipops"), 75, y + 4);
            this.renderArea.addBold(0, 99, y + 4)

            for (const saveFile of this.saveFiles) {
                this.renderArea.drawString(saveFile.name, 0, y + 5);
                this.renderArea.drawString(saveFile.dateString, 40, y + 5);
                this.renderArea.drawString(saveFile.candies.toString(), 65, y + 5);
                this.renderArea.drawString(saveFile.lollipops.toString(), 75, y + 5);
                this.renderArea.addAsciiRealButton(Database.getText("saveManagementErase"), 90, y + 5, `eraseButton-${saveFile.name}`, Database.getTranslatedText("saveManagementErase"));
                this.renderArea.addLinkCall(`.eraseButton-${saveFile.name}`, new CallbackCollection(async () => {
                    const translationString = Archipelago.localSaveSlot == saveFile.name ? "eraseDialog" : "eraseSlotDialog";
                    if (confirm([Database.getText(translationString, {
                        saveSlot: saveFile.name
                    }), ...(Database.isTranslated() ? ["", Database.getTranslatedText(translationString, {
                        saveSlot: saveFile.name
                    })] : [])].join("\n"))) {
                        await OpfsSaving.eraseFile(saveFile.name);
                        if (Archipelago.localSaveSlot == saveFile.name) {
                            window.location.reload();
                        }

                        await this.updateSaveFiles();
                    }
                }));

                y++;
            }

            this.renderArea.addAsciiRealButton(Database.getText("eraseAllSavesButton"), 7, y+6, "eraseAllSave", Database.getTranslatedText("eraseAllSavesButton"));
            this.renderArea.addLinkCall(".eraseAllSave", new CallbackCollection(this.eraseAllSave.bind(this)));
        } else {
            this.renderArea.drawString(Database.getText("saveManagementNoFiles"), 0, y+4);
            if (Database.isTranslated()) {
                this.renderArea.drawString(Database.getTranslatedText("saveManagementNoFiles"), 0, y+5, true);
                y++;
            }
        }

    }

    private eraseAllSave() {
        if (confirm([Database.getText("eraseAllDialog"), ...(Database.isTranslated() ? ["", Database.getTranslatedText("eraseAllDialog")] : [])].join("\n"))) {
            void Saving.eraseAll();
        }
    }

    private quitSaves() {
        if (Archipelago.connectionStatus.current == "disconnected") {
            this.getGame().setPlace(new ArchipelagoPlace(this.getGame()));
        } else {
            this.getGame().setPlace(new Save(this.getGame()));
        }
    }

    private async updateSaveFiles() {
        const saveFileNames = await OpfsSaving.getSaveFiles();
        const saveFiles = await Promise.all(saveFileNames.map(async fileName => {
            const saveFile = await OpfsSaving.loadSaveFile(fileName);

            return {
                name: fileName,
                dateString: saveFile.date,
                date: saveFile.dateTime,
                candies: saveFile.numbers["gameCandiesCurrent"],
                lollipops: saveFile.numbers["gameLollipopsCurrent"]
            } satisfies SaveFile;
        }));
        this.saveFiles = saveFiles.sort((a, b) => b.date - a.date);

        this.quotas = await navigator.storage.estimate();

        this.resize();
        this.update();
        this.getGame().updatePlace();
    }
}