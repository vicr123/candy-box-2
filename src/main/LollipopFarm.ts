///<reference path="Place.ts"/>

// Buttons unlocked
import {Place} from "./Place";
import {Saving} from "./Saving";
import {RenderArea} from "./RenderArea";
import {PondLine} from "./PondLine";
import {PondLolligator} from "./PondLolligator";
import {Game} from "./Game";
import {Database} from "./Database";
import {Algo} from "./Algo";
import {CallbackCollection} from "./CallbackCollection";
import {RenderTransparency} from "./RenderTransparency";
import {Random} from "./Random";
import {Archipelago} from "../archipelago/Archipelago";
import {Color} from "./Color";
import { ColorType } from "./ColorType";
import pluralFormat = Algo.pluralFormat;
import {ArchipelagoLocation} from "../archipelago/ArchipelagoLocation";

Saving.registerBool("lollipopFarmPlant1LollipopButtonUnlocked", false);
Saving.registerBool("lollipopFarmPlant10LollipopsButtonUnlocked", false);
Saving.registerBool("lollipopFarmPlant100LollipopsButtonUnlocked", false);
Saving.registerBool("lollipopFarmPlant1000LollipopsButtonUnlocked", false);

// How many lollipops planted ?
Saving.registerNumber("lollipopFarmLollipopsPlanted", 0);

// The production
Saving.registerNumber("lollipopFarmTimeSinceLastProduction", 0);
Saving.registerBool("lollipopFarmIsProductionEachSecond", false);
Saving.registerNumber("lollipopFarmProduction", 0);

// The mill
Saving.registerBool("lollipopFarmConstructMillButtonUnlocked", false);
Saving.registerBool("lollipopFarmMillConstructed", false);

// The pond
Saving.registerBool("lollipopFarmDigPondButtonUnlocked", false);
Saving.registerBool("lollipopFarmPondDug", false);
Saving.registerNumber("lollipopFarmPondHowManyLolligators", 0);
Saving.registerBool("lollipopFarmPondFeedingLolligators", false);
Saving.registerNumber("lollipopFarmPondConversionRate", 0);

// The candies production
Saving.registerNumber("lollipopFarmPreviousCandiesProduction", 1);
Saving.registerNumber("lollipopFarmCurrentCandiesProduction", 1);

const LollipopFarmChecks = [
    [1, "LOLLIPOP_FARM_EXTRA_1"],
    [2, "LOLLIPOP_FARM_EXTRA_2"],
    [3, "LOLLIPOP_FARM_EXTRA_3"],
    [4, "LOLLIPOP_FARM_EXTRA_4"],
    [5, "LOLLIPOP_FARM_EXTRA_5"],
    [6, "LOLLIPOP_FARM_EXTRA_6"],
    [7, "LOLLIPOP_FARM_EXTRA_7"],
    [8, "LOLLIPOP_FARM_EXTRA_8"],
    [9, "LOLLIPOP_FARM_EXTRA_9"],
    [10, "LOLLIPOP_FARM_EXTRA_10"],
    [11, "LOLLIPOP_FARM_EXTRA_11"],
    [12, "LOLLIPOP_FARM_EXTRA_12"],
    [13, "LOLLIPOP_FARM_EXTRA_13"],
    [14, "LOLLIPOP_FARM_EXTRA_14"],
    [15, "LOLLIPOP_FARM_EXTRA_15"],
    [16, "LOLLIPOP_FARM_EXTRA_16"],
    [17, "LOLLIPOP_FARM_EXTRA_17"],
    [18, "LOLLIPOP_FARM_EXTRA_18"],
    [19, "LOLLIPOP_FARM_EXTRA_19"],
    [20, "LOLLIPOP_FARM_EXTRA_20"],
    [21, "LOLLIPOP_FARM_EXTRA_21"],
    [22, "LOLLIPOP_FARM_EXTRA_22"],
    [23, "LOLLIPOP_FARM_EXTRA_23"],
    [24, "LOLLIPOP_FARM_EXTRA_24"],
    [25, "LOLLIPOP_FARM_EXTRA_25"],
    [26, "LOLLIPOP_FARM_EXTRA_26"],
    [27, "LOLLIPOP_FARM_EXTRA_27"],
    [28, "LOLLIPOP_FARM_EXTRA_28"],
    [29, "LOLLIPOP_FARM_EXTRA_29"],
    [30, "LOLLIPOP_FARM_EXTRA_30"],
    [31, "LOLLIPOP_FARM_EXTRA_31"],
    [32, "LOLLIPOP_FARM_EXTRA_32"],
    [33, "LOLLIPOP_FARM_EXTRA_33"],
    [34, "LOLLIPOP_FARM_EXTRA_34"],
    [35, "LOLLIPOP_FARM_EXTRA_35"],
    [36, "LOLLIPOP_FARM_EXTRA_36"],
    [37, "LOLLIPOP_FARM_EXTRA_37"],
    [38, "LOLLIPOP_FARM_EXTRA_38"],
    [39, "LOLLIPOP_FARM_EXTRA_39"],
    [40, "LOLLIPOP_FARM_EXTRA_40"],
    [41, "LOLLIPOP_FARM_EXTRA_41"],
    [42, "LOLLIPOP_FARM_EXTRA_42"],
    [43, "LOLLIPOP_FARM_EXTRA_43"],
    [44, "LOLLIPOP_FARM_EXTRA_44"],
    [45, "LOLLIPOP_FARM_EXTRA_45"],
    [46, "LOLLIPOP_FARM_EXTRA_46"],
    [47, "LOLLIPOP_FARM_EXTRA_47"],
    [48, "LOLLIPOP_FARM_EXTRA_48"],
    [49, "LOLLIPOP_FARM_EXTRA_49"],
    [50, "LOLLIPOP_FARM_EXTRA_50"],
    [51, "LOLLIPOP_FARM_EXTRA_51"],
    [52, "LOLLIPOP_FARM_EXTRA_52"],
    [53, "LOLLIPOP_FARM_EXTRA_53"],
    [54, "LOLLIPOP_FARM_EXTRA_54"],
    [55, "LOLLIPOP_FARM_EXTRA_55"],
    [56, "LOLLIPOP_FARM_EXTRA_56"],
    [57, "LOLLIPOP_FARM_EXTRA_57"],
    [58, "LOLLIPOP_FARM_EXTRA_58"],
    [59, "LOLLIPOP_FARM_EXTRA_59"],
    [60, "LOLLIPOP_FARM_EXTRA_60"],
    [61, "LOLLIPOP_FARM_EXTRA_61"],
    [62, "LOLLIPOP_FARM_EXTRA_62"],
    [63, "LOLLIPOP_FARM_EXTRA_63"],
    [64, "LOLLIPOP_FARM_EXTRA_64"],
    [65, "LOLLIPOP_FARM_EXTRA_65"],
    [66, "LOLLIPOP_FARM_EXTRA_66"],
    [67, "LOLLIPOP_FARM_EXTRA_67"],
    [68, "LOLLIPOP_FARM_EXTRA_68"],
    [69, "LOLLIPOP_FARM_EXTRA_69"],
    [70, "LOLLIPOP_FARM_EXTRA_70"],
    [71, "LOLLIPOP_FARM_EXTRA_71"],
    [72, "LOLLIPOP_FARM_EXTRA_72"],
    [73, "LOLLIPOP_FARM_EXTRA_73"],
    [74, "LOLLIPOP_FARM_EXTRA_74"],
    [75, "LOLLIPOP_FARM_EXTRA_75"],
    [76, "LOLLIPOP_FARM_EXTRA_76"],
    [77, "LOLLIPOP_FARM_EXTRA_77"],
    [78, "LOLLIPOP_FARM_EXTRA_78"],
    [79, "LOLLIPOP_FARM_EXTRA_79"],
    [80, "LOLLIPOP_FARM_EXTRA_80"],
    [81, "LOLLIPOP_FARM_EXTRA_81"],
    [82, "LOLLIPOP_FARM_EXTRA_82"],
    [83, "LOLLIPOP_FARM_EXTRA_83"],
    [84, "LOLLIPOP_FARM_EXTRA_84"],
    [85, "LOLLIPOP_FARM_EXTRA_85"],
    [86, "LOLLIPOP_FARM_EXTRA_86"],
    [87, "LOLLIPOP_FARM_EXTRA_87"],
    [88, "LOLLIPOP_FARM_EXTRA_88"],
    [89, "LOLLIPOP_FARM_EXTRA_89"],
    [90, "LOLLIPOP_FARM_EXTRA_90"],
    [91, "LOLLIPOP_FARM_EXTRA_91"],
    [92, "LOLLIPOP_FARM_EXTRA_92"],
    [93, "LOLLIPOP_FARM_EXTRA_93"],
    [94, "LOLLIPOP_FARM_EXTRA_94"],
    [95, "LOLLIPOP_FARM_EXTRA_95"],
    [96, "LOLLIPOP_FARM_EXTRA_96"],
    [97, "LOLLIPOP_FARM_EXTRA_97"],
    [98, "LOLLIPOP_FARM_EXTRA_98"],
    [99, "LOLLIPOP_FARM_EXTRA_99"],
    [100, "LOLLIPOP_FARM_EXTRA_100"],
    [1000, "LOLLIPOP_FARM_EXTRA_101"],
    [2000, "LOLLIPOP_FARM_EXTRA_102"],
    [3000, "LOLLIPOP_FARM_EXTRA_103"],
    [4000, "LOLLIPOP_FARM_EXTRA_104"],
    [5000, "LOLLIPOP_FARM_EXTRA_105"],
    [6000, "LOLLIPOP_FARM_EXTRA_106"],
    [7000, "LOLLIPOP_FARM_EXTRA_107"],
    [8000, "LOLLIPOP_FARM_EXTRA_108"],
    [9000, "LOLLIPOP_FARM_EXTRA_109"],
    [10000, "LOLLIPOP_FARM_EXTRA_110"],
    [11000, "LOLLIPOP_FARM_EXTRA_111"],
    [12000, "LOLLIPOP_FARM_EXTRA_112"],
    [13000, "LOLLIPOP_FARM_EXTRA_113"],
    [14000, "LOLLIPOP_FARM_EXTRA_114"],
    [15000, "LOLLIPOP_FARM_EXTRA_115"],
    [16000, "LOLLIPOP_FARM_EXTRA_116"],
    [17000, "LOLLIPOP_FARM_EXTRA_117"],
    [18000, "LOLLIPOP_FARM_EXTRA_118"],
    [19000, "LOLLIPOP_FARM_EXTRA_119"],
    [20000, "LOLLIPOP_FARM_EXTRA_120"],
    [21000, "LOLLIPOP_FARM_EXTRA_121"],
    [22000, "LOLLIPOP_FARM_EXTRA_122"],
    [23000, "LOLLIPOP_FARM_EXTRA_123"],
    [24000, "LOLLIPOP_FARM_EXTRA_124"],
    [25000, "LOLLIPOP_FARM_EXTRA_125"],
    [26000, "LOLLIPOP_FARM_EXTRA_126"],
    [27000, "LOLLIPOP_FARM_EXTRA_127"],
    [28000, "LOLLIPOP_FARM_EXTRA_128"],
    [29000, "LOLLIPOP_FARM_EXTRA_129"],
    [30000, "LOLLIPOP_FARM_EXTRA_130"],
    [31000, "LOLLIPOP_FARM_EXTRA_131"],
    [32000, "LOLLIPOP_FARM_EXTRA_132"],
    [33000, "LOLLIPOP_FARM_EXTRA_133"],
    [34000, "LOLLIPOP_FARM_EXTRA_134"],
    [35000, "LOLLIPOP_FARM_EXTRA_135"],
    [36000, "LOLLIPOP_FARM_EXTRA_136"],
    [37000, "LOLLIPOP_FARM_EXTRA_137"],
    [38000, "LOLLIPOP_FARM_EXTRA_138"],
    [39000, "LOLLIPOP_FARM_EXTRA_139"],
    [40000, "LOLLIPOP_FARM_EXTRA_140"],
    [41000, "LOLLIPOP_FARM_EXTRA_141"],
    [42000, "LOLLIPOP_FARM_EXTRA_142"],
    [43000, "LOLLIPOP_FARM_EXTRA_143"],
    [44000, "LOLLIPOP_FARM_EXTRA_144"],
    [45000, "LOLLIPOP_FARM_EXTRA_145"],
    [46000, "LOLLIPOP_FARM_EXTRA_146"],
    [47000, "LOLLIPOP_FARM_EXTRA_147"],
    [48000, "LOLLIPOP_FARM_EXTRA_148"],
    [49000, "LOLLIPOP_FARM_EXTRA_149"],
    [50000, "LOLLIPOP_FARM_EXTRA_150"],
    [51000, "LOLLIPOP_FARM_EXTRA_151"],
    [52000, "LOLLIPOP_FARM_EXTRA_152"],
    [53000, "LOLLIPOP_FARM_EXTRA_153"],
    [54000, "LOLLIPOP_FARM_EXTRA_154"],
    [55000, "LOLLIPOP_FARM_EXTRA_155"],
    [56000, "LOLLIPOP_FARM_EXTRA_156"],
    [57000, "LOLLIPOP_FARM_EXTRA_157"],
    [58000, "LOLLIPOP_FARM_EXTRA_158"],
    [59000, "LOLLIPOP_FARM_EXTRA_159"],
    [60000, "LOLLIPOP_FARM_EXTRA_160"],
    [61000, "LOLLIPOP_FARM_EXTRA_161"],
    [62000, "LOLLIPOP_FARM_EXTRA_162"],
    [63000, "LOLLIPOP_FARM_EXTRA_163"],
    [64000, "LOLLIPOP_FARM_EXTRA_164"],
    [65000, "LOLLIPOP_FARM_EXTRA_165"],
    [66000, "LOLLIPOP_FARM_EXTRA_166"],
    [67000, "LOLLIPOP_FARM_EXTRA_167"],
    [68000, "LOLLIPOP_FARM_EXTRA_168"],
    [69000, "LOLLIPOP_FARM_EXTRA_169"],
    [70000, "LOLLIPOP_FARM_EXTRA_170"],
    [71000, "LOLLIPOP_FARM_EXTRA_171"],
    [72000, "LOLLIPOP_FARM_EXTRA_172"],
    [73000, "LOLLIPOP_FARM_EXTRA_173"],
    [74000, "LOLLIPOP_FARM_EXTRA_174"],
    [75000, "LOLLIPOP_FARM_EXTRA_175"],
    [76000, "LOLLIPOP_FARM_EXTRA_176"],
    [77000, "LOLLIPOP_FARM_EXTRA_177"],
    [78000, "LOLLIPOP_FARM_EXTRA_178"],
    [79000, "LOLLIPOP_FARM_EXTRA_179"],
    [80000, "LOLLIPOP_FARM_EXTRA_180"],
    [81000, "LOLLIPOP_FARM_EXTRA_181"],
    [82000, "LOLLIPOP_FARM_EXTRA_182"],
    [83000, "LOLLIPOP_FARM_EXTRA_183"],
    [84000, "LOLLIPOP_FARM_EXTRA_184"],
    [85000, "LOLLIPOP_FARM_EXTRA_185"],
    [86000, "LOLLIPOP_FARM_EXTRA_186"],
    [87000, "LOLLIPOP_FARM_EXTRA_187"],
    [88000, "LOLLIPOP_FARM_EXTRA_188"],
    [89000, "LOLLIPOP_FARM_EXTRA_189"],
    [90000, "LOLLIPOP_FARM_EXTRA_190"],
    [91000, "LOLLIPOP_FARM_EXTRA_191"],
    [92000, "LOLLIPOP_FARM_EXTRA_192"],
    [93000, "LOLLIPOP_FARM_EXTRA_193"],
    [94000, "LOLLIPOP_FARM_EXTRA_194"],
    [95000, "LOLLIPOP_FARM_EXTRA_195"],
    [96000, "LOLLIPOP_FARM_EXTRA_196"],
    [97000, "LOLLIPOP_FARM_EXTRA_197"],
    [98000, "LOLLIPOP_FARM_EXTRA_198"],
    [99000, "LOLLIPOP_FARM_EXTRA_199"],
    [100000, "LOLLIPOP_FARM_EXTRA_200"],
] satisfies [number, keyof typeof ArchipelagoLocation][]

export class LollipopFarm extends Place{
    // Render area
    private renderArea: RenderArea = new RenderArea();
    
    // Pond lines
    private pondLines: PondLine[] = [];
    
    // Pond lolligators
    private pondLolligators: PondLolligator[] = [];
    
    // Constructor
    constructor(game: Game){
        super(game);
        
        // Resize the area
        this.renderArea.resizeFromArray(Database.getAscii("places/lollipopFarm/lollipopFarm"), 0, 14);
        
        // Update
        this.update();
        
        // Add pond lines to the pond lines array
        this.addPondLine(new PondLine(8, 37)); // first line, index 0 but at y position 3 on the pond
        this.addPondLine(new PondLine(9, 38)); // second line, index 1, y position 4
        this.addPondLine(new PondLine(9, 40)); // etc
        this.addPondLine(new PondLine(8, 43));
        this.addPondLine(new PondLine(8, 46));
        this.addPondLine(new PondLine(3, 47));
        this.addPondLine(new PondLine(4, 48));
        this.addPondLine(new PondLine(9, 45));
        this.addPondLine(new PondLine(12, 44));

        Archipelago.client.room.on("locationsChecked", () => {
            this.update();
            this.getGame().updatePlace();
        });
    }

    public static get welcomeMessage() {
        return "You go to the lollipop farm."
    }
    
    // Public methods
    public willBeDisplayed(): void{
        // We check lollipops
        this.checkLollipops();
        
        // We add the lollipops callback
        this.getGame().getLollipops().getCallbackCollection().addCallback(this.checkLollipops.bind(this));
        
        // We add the one second callback for the pond
        this.getGame().getOneSecondCallbackCollection().addCallback(this.handlePond.bind(this));
    }
    
    // getRenderArea()
    public getRenderArea(): RenderArea{
        return this.renderArea;
    }
    
    // Private methods
    private addPondLine(pondLine: PondLine): void{
        this.pondLines.push(pondLine);
    }
    
    private addPondLolligator(pondLolligator: PondLolligator): void{
        this.pondLolligators.push(pondLolligator);
    }
    
    private beginFeedingLolligators(): void{
        // We set the bool
        Saving.saveBool("lollipopFarmPondFeedingLolligators", true);
        
        // We update
        this.update();
        this.getGame().updatePlace();
    }
    
    private buyLolligator(): void{
        if(this.getGame().getCandies().getCurrent() >= 1200){
            this.getGame().getCandies().add(-1200);
            // Update the number of lolligators
            Saving.saveNumber("lollipopFarmPondHowManyLolligators", Saving.loadNumber("lollipopFarmPondHowManyLolligators") + 1);
            // Update the conversion rate
            this.updatePondConversionRate();
            // Update the place
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private checkLollipops(): void{
        // We possibly unlock some buttons used for planting lollipops
        if(Saving.loadBool("lollipopFarmPlant1LollipopButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 1){
            Saving.saveBool("lollipopFarmPlant1LollipopButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
        if(Saving.loadBool("lollipopFarmPlant10LollipopsButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 10){
            Saving.saveBool("lollipopFarmPlant10LollipopsButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
        if(Saving.loadBool("lollipopFarmPlant100LollipopsButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 100){
            Saving.saveBool("lollipopFarmPlant100LollipopsButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
        if(Saving.loadBool("lollipopFarmPlant1000LollipopsButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 1000){
            Saving.saveBool("lollipopFarmPlant1000LollipopsButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
        
        // We possibly unlock the button used to construct the mill
        if(Saving.loadBool("lollipopFarmConstructMillButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 10000){
            Saving.saveBool("lollipopFarmConstructMillButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
        
        // We possibly unlock the button used to dig the pond
        if(Saving.loadBool("lollipopFarmDigPondButtonUnlocked") == false && this.getGame().getLollipops().getMax() >= 100000){
            Saving.saveBool("lollipopFarmDigPondButtonUnlocked", true);
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private constructMill(): void{
        if(this.getGame().getLollipops().getCurrent() >= 10000){
            this.getGame().getLollipops().add(-10000);
            Saving.saveBool("lollipopFarmMillConstructed", true);
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private digPond(): void{
        if(this.getGame().getLollipops().getCurrent() >= 100000){
            this.getGame().getLollipops().add(-100000);
            Saving.saveBool("lollipopFarmPondDug", true);
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private drawFieldStuff(x: number, y: number): void{
        // A variable useful later
        var plantingButtonsXPos: number;
        
        // How many lollipops planted
        this.renderArea.drawString("Lollipops planted : " + Algo.numberToStringButNicely(Saving.loadNumber("lollipopFarmLollipopsPlanted")), x, y);
        
        // Button(s) to plant lollipops
            // If the first button is unlocked but not the second
            if(Saving.loadBool("lollipopFarmPlant1LollipopButtonUnlocked") == true && Saving.loadBool("lollipopFarmPlant10LollipopsButtonUnlocked") == false){
                this.renderArea.addAsciiRealButton("Plant 1 lollipop", x, y+2, "lollipopFarmPlant1LollipopButton");
                this.renderArea.addLinkCall(".lollipopFarmPlant1LollipopButton", new CallbackCollection(this.plantLollipops.bind(this, 1)));
            }
            // Else, if the second is unlocked
            else if(Saving.loadBool("lollipopFarmPlant10LollipopsButtonUnlocked") == true){
                // We set the x position to 0
                plantingButtonsXPos = 0;
                // We draw the first text
                this.renderArea.drawString("Plant", x, y+2);
                plantingButtonsXPos += 6;
                // We add the button to plant 1
                this.renderArea.addAsciiRealButton("1", x + plantingButtonsXPos, y+2, "lollipopFarmPlant1LollipopButton");
                this.renderArea.addLinkCall(".lollipopFarmPlant1LollipopButton", new CallbackCollection(this.plantLollipops.bind(this, 1)));
                plantingButtonsXPos += 2;
                // We add the button to plant 10
                this.renderArea.addAsciiRealButton("10", x + plantingButtonsXPos, y+2, "lollipopFarmPlant10LollipopsButton");
                this.renderArea.addLinkCall(".lollipopFarmPlant10LollipopsButton", new CallbackCollection(this.plantLollipops.bind(this, 10)));
                plantingButtonsXPos += 3;
                // We possibly add the button to plant 100
                if(Saving.loadBool("lollipopFarmPlant100LollipopsButtonUnlocked") == true){
                    this.renderArea.addAsciiRealButton("100", x + plantingButtonsXPos, y+2, "lollipopFarmPlant100LollipopsButton");
                    this.renderArea.addLinkCall(".lollipopFarmPlant100LollipopsButton", new CallbackCollection(this.plantLollipops.bind(this, 100)));
                    plantingButtonsXPos += 4;
                }
                // We possibly add the button to plant 100
                if(Saving.loadBool("lollipopFarmPlant1000LollipopsButtonUnlocked") == true){
                    this.renderArea.addAsciiRealButton("1000", x + plantingButtonsXPos, y+2, "lollipopFarmPlant1000LollipopsButton");
                    this.renderArea.addLinkCall(".lollipopFarmPlant1000LollipopsButton", new CallbackCollection(this.plantLollipops.bind(this, 1000)));
                    plantingButtonsXPos += 5;
                }
                // We add the final text
                this.renderArea.drawString("lollipops", x + plantingButtonsXPos, y+2);
            }

        // The production
        if(Saving.loadNumber("lollipopFarmLollipopsPlanted") > 0){
            const productionString = "Production : " + this.getProductionAsString()
            this.renderArea.drawString(productionString, x, y+4);
            if (Archipelago.slotData.multipliers.lollipops > 1) {
                const productionMultiplicationString = ` ×${Archipelago.slotData.multipliers.lollipops} (Archipelago) `
                this.renderArea.drawString(productionMultiplicationString, x + productionString.length + 1, y + 4);
                this.renderArea.addBackgroundColor(x + productionString.length + 1, x + productionString.length + 1 + productionMultiplicationString.length, y + 4, new Color(ColorType.HEALTH_GREEN));
            }
        }

        for (const [requirement, location] of LollipopFarmChecks) {
            if (Archipelago.hasLocation(location) && !Archipelago.isChecked(location)) {
                this.renderArea.drawString(`Next check at ${Algo.numberToStringButNicely(requirement)} lollipops`, x, y + 6);
                break;
            }
        }
    }
    
    private drawMillStuff(x: number, y: number): void{
        // Button to construct the mill (show if the button is unlocked and the mill isn't constructed yet)
        if(Saving.loadBool("lollipopFarmConstructMillButtonUnlocked") == true && Saving.loadBool("lollipopFarmMillConstructed") == false){
            this.renderArea.addAsciiRealButton(Database.getText("lollipopFarmConstructMill"), x+30, y+2, "lollipopFarmConstructMillButton", Database.getTranslatedText("lollipopFarmConstructMill"), true, -1, null, false);
            this.renderArea.addLinkCall(".lollipopFarmConstructMillButton", new CallbackCollection(this.constructMill.bind(this)));
        }
        
        // If the mill is constructed
        if(Saving.loadBool("lollipopFarmMillConstructed") == true){
            // Draw the mill ascii art
            this.renderArea.drawArray(Database.getAscii("places/lollipopFarm/mill"), x, y);
            
            // Draw the button to feed the mill
            this.renderArea.addAsciiRealButton(Database.getText("lollipopFarmFeedMill") + " (" + Algo.numberToStringButNicely(this.getNumberOfLollipopsToFeedTheMill()) + " lollipops)", x+30, y, "lollipopFarmFeedMillButton", Database.getTranslatedText("lollipopFarmFeedMill"), true, -1, null, false);
            this.renderArea.addLinkCall(".lollipopFarmFeedMillButton", new CallbackCollection(this.feedMill.bind(this)));
        
            // Draw the current candies production if it's different from one
            if(Saving.loadNumber("lollipopFarmCurrentCandiesProduction") != 1){
                // this.renderArea.drawString(Database.getTranslatedText("lollipopFarmCurrentCandiesProduction"), x+30, y+4, true);


                const productionString = Database.getText("lollipopFarmCurrentCandiesProduction") + " : " + Saving.loadNumber("lollipopFarmCurrentCandiesProduction").toString() + " each second"
                this.renderArea.drawString(productionString, x+30, y+3);
                if (Archipelago.slotData.multipliers.candies > 1) {
                    const productionMultiplicationString = ` ×${Archipelago.slotData.multipliers.candies} (Archipelago) `
                    this.renderArea.drawString(productionMultiplicationString, x + 30 + productionString.length + 1, y + 3);
                    this.renderArea.addBackgroundColor(x + 30 + productionString.length + 1, x + 30 + productionString.length + 1 + productionMultiplicationString.length, y + 3, new Color(ColorType.HEALTH_GREEN));
                }
            }
        }
    }
    
    private drawPondStuff(x: number, y: number): void{
        // Y position used because some things need to be moved when the player uses a non-english language
        var yPos: number;
        
        // Button to dig the pond (show if the button is unlocked and the pond isn't constructed yet)
        if(Saving.loadBool("lollipopFarmDigPondButtonUnlocked") == true && Saving.loadBool("lollipopFarmPondDug") == false){
            this.renderArea.addAsciiRealButton(Database.getText("lollipopFarmDigPond"), x+10, y+2, "lollipopFarmDigPondButton", Database.getTranslatedText("lollipopFarmDigPond"), true, -1, null, false);
            this.renderArea.addLinkCall(".lollipopFarmDigPondButton", new CallbackCollection(this.digPond.bind(this)));
        }
        
        // If the pond is constructed
        if(Saving.loadBool("lollipopFarmPondDug") == true){
            // Init the y position
            yPos = y;
            
            // Draw the pond ascii art
            this.renderArea.drawArray(Database.getAscii("places/lollipopFarm/pond"), x, yPos, new RenderTransparency(" "));
            
            // Draw the lolligators
            yPos += 3;
            for(var i = 0; i < this.pondLolligators.length; i++){
                this.pondLolligators[i].draw(this.renderArea, x, yPos);
            }
            
            // Add the button to buy a lolligator
            yPos += 13;
            this.renderArea.addAsciiRealButton(Database.getText("lollipopFarmBuyLolligator"), x, yPos, "lollipopFarmBuyLolligatorButton", Database.getTranslatedText("lollipopFarmBuyLolligator"), true, -1, null, false);
            this.renderArea.addLinkCall(".lollipopFarmBuyLolligatorButton", new CallbackCollection(this.buyLolligator.bind(this)));
            
            // Add 1 to yPos if translated
            if(Database.isTranslated()) yPos += 1;
            
            // If we have at least one lolligator
            if(Saving.loadNumber("lollipopFarmPondHowManyLolligators") > 0){
                // Draw how many lolligators we have (if we have at least one)
                yPos += 2;
                this.renderArea.drawString("There " + (Saving.loadNumber("lollipopFarmPondHowManyLolligators") > 1? "are":"is") + " " + Algo.pluralFormat(Saving.loadNumber("lollipopFarmPondHowManyLolligators"), " lolligator", " lolligators") + " in the pond.", x, yPos);
        
                // Draw the checkbox to feed the lolligators
                yPos += 2;
                this.renderArea.addCheckbox(x, yPos, new CallbackCollection(this.beginFeedingLolligators.bind(this)), new CallbackCollection(this.stopFeedingLolligators.bind(this)), "lollipopFarmPondCheckbox", Saving.loadBool("lollipopFarmPondFeedingLolligators"));
                if(Saving.loadNumber("lollipopFarmPondHowManyLolligators") == 1) this.renderArea.drawString("Feed it with candies", x+3, yPos);
                else this.renderArea.drawString("Feed them with candies", x+4, yPos);
                
                // If we're feeding lolligators
                if(Saving.loadBool("lollipopFarmPondFeedingLolligators")){
                    // Draw the conversion text
                    yPos += 2;
                    this.renderArea.drawString(Database.getText("lollipopFarmLolligatorsConversionText"), x, yPos);
                    if(Database.isTranslated()){
                        yPos += 1;
                        this.renderArea.drawString(Database.getTranslatedText("lollipopFarmLolligatorsConversionText"), x, yPos, true);
                    }
                    
                    // Draw the conversion rate
                    yPos += 1;
                    this.renderArea.drawString("Conversion rate : " + Saving.loadNumber("lollipopFarmPondConversionRate") + "/sec", x, yPos);
                }
            }
        }
    }
    
    private feedMill(): void{
        if(this.getGame().getLollipops().getCurrent() >= this.getNumberOfLollipopsToFeedTheMill()){
            // Pay the lollipops
            this.getGame().getLollipops().add(-this.getNumberOfLollipopsToFeedTheMill());
            
            // Increase the candies production step
            var oldCurrent: number = Saving.loadNumber("lollipopFarmCurrentCandiesProduction");
            Saving.saveNumber("lollipopFarmCurrentCandiesProduction", Saving.loadNumber("lollipopFarmCurrentCandiesProduction") + Saving.loadNumber("lollipopFarmPreviousCandiesProduction"));
            Saving.saveNumber("lollipopFarmPreviousCandiesProduction", oldCurrent);
            
            // Update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private getNumberOfLollipopsToFeedTheMill(): number{
        return Math.pow(Saving.loadNumber("lollipopFarmCurrentCandiesProduction") * 120, 2);
    }
    
    private getProductionAsString(): string{
        // We create the string
        var str: string;
        
        // If we produce x lollipops each second
        if(Saving.loadBool("lollipopFarmIsProductionEachSecond")){
            str = Algo.pluralFormat(Saving.loadNumber("lollipopFarmProduction"), " lollipop", " lollipops") + " each second";
        }
        else{
            const numberOfLollipopsPerTimeUnit = (Saving.loadBool("gridItemPossessedShellPowder")? 3:1)*
                (Saving.loadBool("gridItemPossessedPitchfork")? 3:1)*
                (Saving.loadBool("gridItemPossessedGreenSharkFin")? 5:1);
            str = pluralFormat(numberOfLollipopsPerTimeUnit, " lollipop every ", " lollipops every ");
            // If the production is every hour
            if(Saving.loadNumber("lollipopFarmProduction") >= 3600){
                if(Math.floor(Saving.loadNumber("lollipopFarmProduction")/3600) == 1)
                    str += "hour";
                else
                    str += Math.floor(Saving.loadNumber("lollipopFarmProduction")/3600).toString() + " hours";
            }
            // Else, if the production is every minute
            else if(Saving.loadNumber("lollipopFarmProduction") >= 60){
                if(Math.floor(Saving.loadNumber("lollipopFarmProduction")/60) == 1)
                    str += "minute";
                else
                    str += Math.floor(Saving.loadNumber("lollipopFarmProduction")/60).toString() + " minutes";
            }
            // Else, the production is every second
            else{
                if(Saving.loadNumber("lollipopFarmProduction") == 1)
                    str += "second";
                else
                    str += Saving.loadNumber("lollipopFarmProduction").toString() + " seconds";
            }
            str += " (on average)"
        }
        
        // We return the string
        return str;
    }
    
    private handlePond(): void{
        // Used later
        var lineIndex: number;
        
        // If the pond is dug
        if(Saving.loadBool("lollipopFarmPondDug") == true){
            // Move all the lolligators
            for(var i = 0; i < this.pondLolligators.length; i++){
                this.pondLolligators[i].move();
            }
            
            // Delete lolligators which need to be deleted
            for(var i = 0; i < this.pondLolligators.length; i++){
                // If this lolligator should be deleted, then we delete it
                if(this.pondLolligators[i].shouldBeDeleted()){
                    // Warn that it will be deleted
                    this.pondLolligators[i].willBeDeleted();
                    
                    // Delete it
                    this.pondLolligators.splice(i, 1);
                    
                    // Reduce i
                    i--;
                }
            }
            
            // Possibly add a lolligator if there wouldn't be more lolligators than we actually have (the more lollipops we have the more chance there is that one will be added)
            if(Random.oneChanceOutOf(Math.ceil(20*(1/Saving.loadNumber("lollipopFarmPondHowManyLolligators")))) && this.pondLolligators.length < Saving.loadNumber("lollipopFarmPondHowManyLolligators")){
                // Choose a line
                lineIndex = Random.between(0, this.pondLines.length-1);
                
                // If the line isn't used and the line above (if there is one) isn't used either
                if(this.pondLines[lineIndex].getIsUsed() == false && (lineIndex == 0 || this.pondLines[lineIndex-1].getIsUsed() == false)){
                    // Add a lolligator here
                    this.addPondLolligator(new PondLolligator(this.pondLines, lineIndex));
                }
            }
            
            // We update
            this.update();
            this.getGame().updatePlace();
        }
    }
    
    private plantLollipops(howMany: number): void{
        // If we have enough lollipops
        if(this.getGame().getLollipops().getCurrent() >= howMany){
            this.getGame().getLollipops().add(-howMany);
            Saving.saveNumber("lollipopFarmLollipopsPlanted", Saving.loadNumber("lollipopFarmLollipopsPlanted") + howMany);
            this.getGame().calcLollipopFarmProduction();
            this.update();
            this.getGame().updatePlace();

            for (const [requirement, location] of LollipopFarmChecks) {
                this.checkLollipopFarmLocation(requirement, location);
            }
        }
    }

    private checkLollipopFarmLocation(lollipopRequirement: number, location: keyof typeof ArchipelagoLocation) {
        if (Saving.loadNumber("lollipopFarmLollipopsPlanted") >= lollipopRequirement && Archipelago.hasLocation(location) && !Archipelago.isChecked(location)) {
            Archipelago.check(location);
        }
    }
    
    private stopFeedingLolligators(): void{
        // We set the bool
        Saving.saveBool("lollipopFarmPondFeedingLolligators", false);
        
        // We update
        this.update();
        this.getGame().updatePlace();
    }
    
    private update(): void{
        // Reset
        this.renderArea.resetAllButSize();
    
        // Draw the farm
        this.renderArea.drawArray(Database.getAscii("places/lollipopFarm/lollipopFarm"), 0, 5);
        
        // Draw the field stuff
        this.drawFieldStuff(1, 34);
        
        // Draw the mill stuff
        this.drawMillStuff(7, 0);
        
        // Draw the pond stuff
        this.drawPondStuff(50, 14);
    }
    
    private updatePondConversionRate(): void{
        Saving.saveNumber("lollipopFarmPondConversionRate", Math.ceil(Saving.loadNumber("lollipopFarmPondHowManyLolligators") * 3 + Math.pow(1.3, Saving.loadNumber("lollipopFarmPondHowManyLolligators"))));
    }
}
