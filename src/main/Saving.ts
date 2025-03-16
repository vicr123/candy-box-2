import {MainLoadingType} from "./MainLoadingType";
import {Game} from "./Game";
import {LocalSaving} from "./LocalSaving";
import {Bugs} from "./Bugs";
import {Random} from "./Random";
import {Archipelago} from "../archipelago/Archipelago";
import {ArchipelagoLocation} from "../archipelago/ArchipelagoLocation";

export module Saving {
    var bools: { [s: string]: boolean; } = {};
    var numbers: { [s: string]: number; } = {};
    var strings: { [s: string]: string; } = {};
    var apLocations: { [s: string]: keyof typeof ArchipelagoLocation; } = {};

    // Can we register?
    export var canRegister: boolean = true;

    export var game: Game;

    let saving = false;

    let triggerFirstLoadDone: (value: unknown) => void;
    export let awaitFirstLoad = new Promise((res) => {
        triggerFirstLoadDone = res;
    });

    // Special public functions : used to load or the actual save
    export async function load(game: Game, loadingType: MainLoadingType): Promise<void>{
        if (saving) return;
        saving = true;

        try {
            // Depending on the loading type, do different things
            switch (loadingType) {
                // We don't load anything
                case MainLoadingType.NONE:
                    // You can uncomment the lines below to start your game with everything unlocked (useful for testing purposes)
                    /*
                    Saving.saveNumber("aTreeStep", 2);

                    Saving.saveBool("mainMapDoneDesert", true);
                    Saving.saveBool("mainMapDoneBridge", true);
                    Saving.saveBool("mainMapDoneCaveEntrance", true);
                    Saving.saveBool("mainMapDonePier", true);
                    Saving.saveBool("mainMapDoneForest", true);
                    Saving.saveBool("mainMapDoneCastleEntrance", true);

                    Saving.saveBool("gridItemPossessedMainMap", true);
                    Saving.saveBool("gridItemPossessedTimeRing", true);
                    Saving.saveBool("gridItemPossessedThirdHouseKey", true);
                    Saving.saveBool("gridItemPossessedBeginnersGrimoire", true);

                    Saving.saveBool("gridItemPossessedFeather", true);
                    Saving.saveBool("gridItemPossessedPogoStick", true);
                    Saving.saveBool("gridItemPossessedHeartPlug", true);
                    Saving.saveBool("gridItemPossessedAdvancedGrimoire", true);

                    Saving.saveBool("gridItemPossessedSponge", true);
                    Saving.saveBool("gridItemPossessedShellPowder", true);
                    Saving.saveBool("gridItemPossessedHeartPendant", true);
                    Saving.saveBool("gridItemPossessedBlackMagicGrimoire", true);

                    Saving.saveBool("gridItemPossessedFortressKey", true);
                    Saving.saveBool("gridItemPossessedUnicornHorn", true);
                    Saving.saveBool("gridItemPossessedXinopherydonClaw", true);
                    Saving.saveBool("gridItemPossessedPitchfork", true);

                    Saving.saveBool("gridItemPossessedRedSharkFin", true);
                    Saving.saveBool("gridItemPossessedGreenSharkFin", true);
                    Saving.saveBool("gridItemPossessedPurpleSharkFin", true);

                    Saving.saveBool("gridItemPossessedTalkingCandy", true);

                    Saving.saveBool("gridItemPossessedP", true);
                    Saving.saveBool("gridItemPossessedL", true);
                    Saving.saveBool("gridItemPossessedA", true);
                    Saving.saveBool("gridItemPossessedY", true);

                    Saving.saveBool("eqItemGlovesRedEnchantedGloves", true);
                    Saving.saveBool("eqItemGlovesPinkEnchantedGloves", true);
                    //Saving.saveBool("eqItemWeaponWoodenSword", true);
                    Saving.saveBool("eqItemWeaponTrollBludgeon", true);
                    Saving.saveBool("eqItemWeaponTribalSpear", true);
                    Saving.saveBool("eqItemWeaponSummoningTribalSpear", true);
                    Saving.saveBool("eqItemWeaponMonkeyWizardStaff", true);
                    Saving.saveBool("eqItemWeaponGiantSpoon", true);
                    Saving.saveBool("eqItemHatOctopusKingCrown", true);

                    Saving.saveBool("eqItemBootsBootsOfIntrospection", true);

                    Saving.saveBool("eqItemBootsRocketBoots", true);

                    Saving.saveBool("eqItemWeaponGiantSpoonOfDoom", true);

                    Saving.saveBool("eqItemBodyArmoursEnchantedKnightBodyArmour", true);

                    Saving.saveNumber("gameCandiesEatenCurrent", 500000000);
                    Saving.saveNumber("gameCandiesEatenMax", 500000000);

                    Saving.saveNumber("playerHp", 1000);

                    Saving.saveBool("questPlayerSpellHealthPotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellTurtlePotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellAntiGravityPotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellBerserkPotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellCloningPotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellPPotionHasSpell", true);
                    Saving.saveBool("questPlayerSpellXPotionHasSpell", true);

                    Saving.saveNumber("questPlayerSpellHealthPotionQuantity", 0);
                    Saving.saveNumber("questPlayerSpellTurtlePotionQuantity", 64084);
                    Saving.saveNumber("questPlayerSpellAntiGravityPotionQuantity", 47542);
                    Saving.saveNumber("questPlayerSpellBerserkPotionQuantity", 99549);
                    Saving.saveNumber("questPlayerSpellCloningPotionQuantity", 10050);
                    Saving.saveNumber("questPlayerSpellPPotionQuantity", 10085250);
                    Saving.saveNumber("questPlayerSpellXPotionQuantity", 10050999);

                    //Saving.saveBool("gameDebug", true);

                    Saving.saveNumber("gameCandiesCurrent", 5000000);
                    Saving.saveNumber("gameCandiesMax", 5000000);

                    Saving.saveNumber("gameLollipopsCurrent", 5000000000);
                    Saving.saveNumber("gameLollipopsMax", 500000000000);

                    Saving.saveNumber("gameChocolateBarsCurrent", 7);
                    Saving.saveNumber("gameChocolateBarsMax", 7);

                    Saving.saveNumber("gamePainsAuChocolatCurrent", 7);
                    Saving.saveNumber("gamePainsAuChocolatMax", 7);

                    Saving.saveBool("lonelyHouseTakeTheBoxDone", true);

                    Saving.saveNumber("lollipopFarmPondHowManyLolligators", 0);

                    Saving.saveBool("statusBarUnlocked", true);
                    Saving.saveBool("statusBarUnlockedCfg", true);
                    Saving.saveBool("statusBarUnlockedSave", true);
                    Saving.saveBool("statusBarUnlockedMap", true);
                    Saving.saveBool("statusBarUnlockedInventory", true);
                    Saving.saveBool("statusBarUnlockedLollipopFarm", true);
                    Saving.saveBool("statusBarUnlockedCauldron", true);
                    Saving.saveBool("statusBarUnlockedHealthBar", true);
                    Saving.saveBool("statusBarUnlockedInsideYourBox", true);
                    Saving.saveBool("statusBarUnlockedTheComputer", true);
                    Saving.saveBool("statusBarUnlockedTheArena", true);

                    Saving.saveBool("castleKilledNougatMonster", true);

                    Saving.saveBool("dragonDone", true);
                    Saving.saveBool("dragonUnlockedCyclops", true);

                    Saving.saveBool("castleTowerFirstVisitDone", true);

                    Saving.saveString("gameLanguage", "fr");
                    */
                    break;
                case MainLoadingType.LOCAL:
                    LocalSaving.load();
                    break;
                case MainLoadingType.FILE:
                    break;
            }

            // Apply the loaded variables to various things by calling the load() methods of various objects
            await game.load(); // Various variables owned by the game object
            game.getPlayer().load(); // The player

            triggerFirstLoadDone("");
        } finally {
            saving = false;
        }
    }

    export function erase() {
        saving = true; // Stop saving anything from here on out
        return LocalSaving.erase();
    }

    export function eraseAll() {
        saving = true; // Stop saving anything from here on out
        return LocalSaving.eraseAll();
    }
    
    export function save(game: Game, savingType: MainLoadingType): boolean{
        if (saving) return true;
        if (Archipelago.localSaveSlot == "") return false;
        saving = true;

        try {
            // Save some special variables by calling the save() methods of various objects
            game.save(); // Various variables owned by the game object
            game.getPlayer().save(); // The player

            // Do different things depending on the saving type
            switch (savingType) {
                case MainLoadingType.LOCAL:
                    return LocalSaving.save();
                    break;
                case MainLoadingType.FILE:
                    return false;
                    break;
            }
        } finally {
            saving = false;
        }
    }
    
    // Public conversion functions (useful because we sometimes only want to store strings, either locally or online, but in fact we also work with numbers and bools)
    export function boolToString(b: boolean): string{
        if(b)
            return "true";
        return "false";
    }
    
    export function numberToString(n: number): string{
        return n.toString();
    }
    
    export function stringToBool(s: string): boolean{
        if(s == "true")
            return true;
        else if(s == "false")
            return false;
        console.log("Error : trying to convert a string to a bool but the string value is " + s + ".");
    }
    
    export function stringToNumber(s: string): number{
        return parseFloat(s); // We need to use parseFloat to avoid problems with scientific notations
    }
    
    // Public functions
    export function getAllBools(): { [s: string]: boolean; }{
        return bools;
    }
    
    export function getAllNumbers(): { [s: string]: number; }{
        return numbers;
    }
    
    export function getAllStrings(): { [s: string]: string; }{
        return strings;
    }
    
    export function loadBool(key: string): boolean{
        // BUGS
        if(Bugs.getUltimateBugLevel() >= 2)
            saveBool(key, Random.flipACoin());

        if (key in apLocations)
            return Archipelago.isChecked(apLocations[key])
        
        if(key in bools)
            return bools[key];
        console.log("Error : trying to load the unknown bool " + key + ".");
    }
    
    export function loadNumber(key: string): number{
        // BUGS
        if(Bugs.getUltimateBugLevel() >= 3 && Random.oneChanceOutOf(2))
            saveNumber(key, Random.between(0, 10000) - 5000);
        
        if(key in numbers)
            return numbers[key];
        console.log("Error : trying to load the unknown number " + key + ".");
    }
    
    export function loadString(key: string): string{
        // BUGS
        if(Bugs.getUltimateBugLevel() >= 4 && Random.oneChanceOutOf(5))
            saveString(key, "bug");
        
        if(key in strings)
            return strings[key];
        console.log("Error : trying to load the unknown string " + key + ".");
    }
    
    export function registerBool(key: string, b: boolean): void{
        if(canRegister){
            if(key in bools || key in numbers || key in strings || key in apLocations)
                console.log("Error : trying to register the key " + key + " as bool, but this key is already registered.");
            this.saveBool(key, b, true);
        }
    }

    export function registerApLocation(key: string, location: keyof typeof ArchipelagoLocation) {
        if(canRegister){
            if(key in bools || key in numbers || key in strings || key in apLocations)
                console.log("Error : trying to register the key " + key + " as apLocation, but this key is already registered.");
            apLocations[key] = location;
        }
    }
    
    export function registerNumber(key: string, n: number): void{
        if(canRegister){
            if(key in bools || key in numbers || key in strings || key in apLocations)
                console.log("Error : trying to register the key " + key + " as number, but this key is already registered.");
            this.saveNumber(key, n, true);
        }
    }
    
    export function registerString(key: string, s: string): void{
        if(canRegister){
            if(key in bools || key in numbers || key in strings || key in apLocations)
                console.log("Error : trying to register the key " + key + " as string, but this key is already registered.");
            this.saveString(key, s, true);
        }
    }
    
    export function saveBool(key: string, b: boolean, registering: boolean = false): void{
        if (key in apLocations) {
            if (b) {
                // Check off this location in AP
                Archipelago.check(apLocations[key]);
            }
            return;
        }

        if(key in bools || registering){
            bools[key] = b;
            if (Saving.game)
                Saving.save(Saving.game, MainLoadingType.LOCAL);
            return;
        }
        console.log("Error : trying to save the unknown bool " + key + ".");
    }
    
    export function saveNumber(key: string, n: number, registering: boolean = false): void{
        if(key in numbers || registering){
            numbers[key] = n;
            if (Saving.game)
                Saving.save(Saving.game, MainLoadingType.LOCAL);
            return;
        }
        console.log("Error : trying to save the unknown number " + key + ".");
    }
    
    export function saveString(key: string, s: string, registering: boolean = false): void{
        if(key in strings || registering){
            strings[key] = s;
            if (Saving.game)
                Saving.save(Saving.game, MainLoadingType.LOCAL);
            return;
        }
        console.log("Error : trying to save the unknown string " + key + ".");
    }
}
