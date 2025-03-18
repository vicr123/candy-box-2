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

            const itemKey = Object.keys(ArchipelagoItem).find(x => ArchipelagoItem[x] == item.id - ArchipelagoItemBaseId) as keyof typeof ArchipelagoItem;
            switch (itemKey) {
                case "CANDY":
                    game.getCandies().add(1);
                    break;
                case "LOLLIPOP":
                    game.getLollipops().add(1);
                    break;
                case "CHOCOLATE_BAR":
                    game.getChocolateBars().add(1);
                    break;
                case "TIME_RING":
                    game.gainItem("gridItemPossessedTimeRing");
                    break;
                case "CANDY_MERCHANTS_HAT":
                    game.gainItem("eqItemHatMerchantHat");
                    break;
                case "LEATHER_BOOTS":
                    game.gainItem("eqItemBootsLeatherBoots");
                    break;
                case "LEATHER_GLOVES":
                    game.gainItem("eqItemGlovesLeatherGloves");
                    break;
                case "PROGRESSIVE_WORLD_MAP":
                    // The world map is the first thing to be unlocked anyway
                    game.gainItem("gridItemPossessedMainMap");
                    break;
                case "TROLLS_BLUDGEON":
                    game.gainItem("eqItemWeaponTrollBludgeon");
                    break;
                case "DESERT_BIRD_FEATHER":
                    game.gainItem("eqItemWeaponTrollBludgeon");
                    break;
                case "BEGINNER_GRIMOIRE":
                    game.gainItem("gridItemPossessedBeginnersGrimoire");
                    break;
                case "ADVANCED_GRIMOIRE":
                    game.gainItem("gridItemPossessedAdvancedGrimoire");
                    break;
                case "CAULDRON":
                    break;
                case "SORCERESS_HAT":
                    game.gainItem("eqItemHatSorceressHat");
                    break;
                case "OCTOPUS_KING_CROWN":
                    game.gainItem("eqItemHatOctopusKingCrown")
                    break;
                case "MONKEY_WIZARD_STAFF":
                    game.gainItem("eqItemWeaponMonkeyWizardStaff")
                    break;
                case "HEART_PLUG":
                    game.gainItem("gridItemPossessedHeartPlug");
                    break;
                case "POGO_STICK":
                    game.gainItem("gridItemPossessedPogoStick");
                    break;
                case "P_STONE":
                    game.gainItem("gridItemPossessedP");
                    break;
                case "L_STONE":
                    game.gainItem("gridItemPossessedL");
                    break;
                case "A_STONE":
                    game.gainItem("gridItemPossessedA");
                    break;
                case "Y_STONE":
                    game.gainItem("gridItemPossessedY");
                    break;
                case "WOODEN_SWORD":
                    game.gainItem("eqItemWeaponWoodenSword");
                    break;
                case "IRON_AXE":
                    game.gainItem("eqItemWeaponIronAxe");
                    break;
                case "POLISHED_SILVER_SWORD":
                    game.gainItem("eqItemWeaponPolishedSilverSword");
                    break;
                case "LIGHTWEIGHT_BODY_ARMOUR":
                    game.gainItem("eqItemBodyArmoursLightweightBodyArmour");
                    break;
                case "SCYTHE":
                    game.gainItem("eqItemWeaponScythe");
                    break;
                case "RED_ENCHANTED_GLOVES":
                    game.gainItem("eqItemGlovesRedEnchantedGloves");
                    break;
                case "PINK_ENCHANTED_GLOVES":
                    game.gainItem("eqItemGlovesPinkEnchantedGloves");
                    break;
                case "SUMMONING_TRIBAL_SPEAR":
                    game.gainItem("eqItemWeaponSummoningTribalSpear");
                    break;
                case "ENCHANTED_MONKEY_WIZARD_STAFF":
                    game.gainItem("eqItemWeaponEnchantedMonkeyWizardStaff");
                    break;
                case "ENCHANTED_KNIGHT_BODY_ARMOUR":
                    game.gainItem("eqItemBodyArmoursEnchantedKnightBodyArmour");
                    break;
                case "OCTOPUS_KING_CROWN_WITH_JASPERS":
                    game.gainItem("eqItemHatOctopusKingCrownWithJaspers");
                    break;
                case "OCTOPUS_KING_CROWN_WITH_OBSIDIAN":
                    game.gainItem("eqItemHatOctopusKingCrownWithObsidian");
                    break;
                case "GIANT_SPOON_OF_DOOM":
                    game.gainItem("eqItemWeaponGiantSpoonOfDoom");
                    break;
                case "TRIBAL_SPEAR":
                    game.gainItem("eqItemWeaponTribalSpear");
                    break;
                case "GIANT_SPOON":
                    game.gainItem("eqItemWeaponGiantSpoon")
                    break;
                case "DESERT_FORTRESS_KEY":
                    game.gainItem("gridItemPossessedFortressKey");
                    break;
                case "KNIGHT_BODY_ARMOUR":
                    game.gainItem("eqItemBodyArmoursKnightBodyArmour");
                    break;
                case "XINOPHERYDON_CLAW":
                    game.gainItem("gridItemPossessedXinopherydonClaw")
                    break;
                case "UNICORN_HORN":
                    game.gainItem("gridItemPossessedUnicornHorn")
                    break;
                case "ROCKET_BOOTS":
                    game.gainItem("eqItemBootsRocketBoots");
                    break;
                case "HEART_PENDANT":
                    game.gainItem("gridItemPossessedHeartPendant");
                    break;
                case "BLACK_MAGIC_GRIMOIRE":
                    game.gainItem("gridItemPossessedBlackMagicGrimoire");
                    break;
                case "CHOCOLATE_BAR_4":
                    game.getChocolateBars().add(4);
                    break;
                case "PITCHFORK":
                    game.gainItem("gridItemPossessedPitchfork");
                    break;
                case "CANDY_20":
                    game.getCandies().add(20);
                    break;
                case "CANDY_100":
                    game.getCandies().add(100);
                    break;
                case "CANDY_500":
                    game.getCandies().add(500);
                    break;
                case "LOLLIPOP_3":
                    game.getLollipops().add(3);
                    break;
                case "CHOCOLATE_BAR_3":
                    game.getChocolateBars().add(3);
                    break;
            }
        })
    }
}
