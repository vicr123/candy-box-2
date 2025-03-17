import { Item } from "archipelago.js";
import {Saving} from "../main/Saving";
import {Archipelago} from "./Archipelago";
import {Game} from "../main/Game";
import {ArchipelagoItem, ArchipelagoItemBaseId} from "./ArchipelagoLocation";

Saving.registerNumber("apItemSequence", 0);

Archipelago.client.items.on("itemsReceived", async (items, startingIndex) => {
    await Saving.awaitFirstLoad;

    let startingSequence = Saving.loadNumber("apItemSequence");
    for (const [item, i] of items.map((item, i): [Item, number] => [item, i + startingIndex])) {
        if (i < startingSequence) continue; // We can ignore this item because it has already been processed
        Archipelago.events.emit("itemToBeProcessed", item);
        startingSequence = i + 1;
    }
    Saving.saveNumber("apItemSequence", startingSequence);
});

export class ArchipelagoItemProcessing {
    constructor(game: Game) {
        Archipelago.events.on("itemToBeProcessed", (item: Item) => {
            if (item.receiver.name != Archipelago.client.name) return;

            switch (item.id - ArchipelagoItemBaseId) {
                case ArchipelagoItem.CANDY:
                    game.getCandies().add(1);
                    break;
                case ArchipelagoItem.LOLLIPOP:
                    game.getLollipops().add(1);
                    break;
                case ArchipelagoItem.CHOCOLATE_BAR:
                    game.getChocolateBars().add(1);
                    break;
                case ArchipelagoItem.TIME_RING:
                    game.gainItem("gridItemPossessedTimeRing");
                    break;
                case ArchipelagoItem.CANDY_MERCHANTS_HAT:
                    game.gainItem("eqItemHatMerchantHat");
                    break;
                case ArchipelagoItem.LEATHER_BOOTS:
                    game.gainItem("eqItemBootsLeatherBoots");
                    break;
                case ArchipelagoItem.LEATHER_GLOVES:
                    game.gainItem("eqItemGlovesLeatherGloves");
                    break;
                case ArchipelagoItem.PROGRESSIVE_WORLD_MAP:
                    // The world map is the first thing to be unlocked anyway
                    game.gainItem("gridItemPossessedMainMap");
                    break;
                case ArchipelagoItem.TROLLS_BLUDGEON:
                    game.gainItem("eqItemWeaponTrollBludgeon");
                    break;
                case ArchipelagoItem.DESERT_BIRD_FEATHER:
                    game.gainItem("eqItemWeaponTrollBludgeon");
                    break;
                case ArchipelagoItem.BEGINNER_GRIMOIRE:
                    game.gainItem("gridItemPossessedBeginnersGrimoire");
                    break;
                case ArchipelagoItem.ADVANCED_GRIMOIRE:
                    game.gainItem("gridItemPossessedAdvancedGrimoire");
                    break;
                case ArchipelagoItem.CAULDRON:
                    break;
                case ArchipelagoItem.SORCERESS_HAT:
                    game.gainItem("eqItemHatSorceressHat");
                    break;
                case ArchipelagoItem.OCTOPUS_KING_CROWN:
                    game.gainItem("eqItemHatOctopusKingCrown")
                    break;
                case ArchipelagoItem.MONKEY_WIZARD_STAFF:
                    game.gainItem("eqItemWeaponMonkeyWizardStaff")
                    break;
                case ArchipelagoItem.HEART_PLUG:
                    game.gainItem("gridItemPossessedHeartPlug");
                    break;
                case ArchipelagoItem.POGO_STICK:
                    game.gainItem("gridItemPossessedPogoStick");
                    break;
            }
        })
    }
}
