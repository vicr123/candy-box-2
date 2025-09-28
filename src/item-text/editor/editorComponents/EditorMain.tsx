import Styles from "./EditorMain.module.css";
import {ItemTextOccurrence} from "../../ItemText";
import {Dispatch, ReactNode, SetStateAction, useMemo, useState} from "react";
import {useEditor} from "../EditorContext";
import {RenderArea} from "../../../main/RenderArea";
import {ReactRenderArea} from "../../../react/ReactRenderArea";
import {Database} from "../../../main/Database";
import {Algo} from "../../../main/Algo";
import {RenderTransparency} from "../../../main/RenderTransparency";
import {Guide} from "./Guide";
import {KeyboardEvent} from "react";

function renderText(item: string, game: string, string: string, defaultString: string) {
    const args = {
        player: "Player1",
        item: item.slice(0, 30),
        game: game,
        count: 300
    };

    if (string) {
        let placeholderText = string;
        for (const arg in args) {
            placeholderText = placeholderText.replace(`{{${arg}}}`, args[arg]);
        }
        return placeholderText;
    } else if (!defaultString) {
        return "";
    } else {
        return Database.getText(defaultString, {
            ...args,
            player: Algo.posessive(args.player)
        });
    }
}

export const EditableOccurrences = {
    merchantPre: {
        name: "The Merchant (Before Purchase)",
        render: ({itemName, gameName, string}) => {
            const renderArea = new RenderArea();
            renderArea.resizeFromArray(Database.getAscii("places/village/secondHouse"), 0, 3)

            // Draw the house
            renderArea.drawArray(Database.getAscii("places/village/secondHouse"), 0, 3);
            renderArea.drawArray(Database.getAscii("places/village/candyMerchantItems/hat"), 53, 13);

            const speech = renderText(itemName, gameName, string, "secondHouseBuySpeech");
            const yPos = renderArea.drawSpeech(speech, 3, 30, 60, "secondHouseMerchantSpeech");

            const buyText = Database.getText("buyCandies", {
                item: itemName,
                player: "Player1",
                count: 300
            });
            renderArea.addAsciiRealButton(buyText, 45 - Math.floor(buyText.length/2), yPos + 2, "", "", true);
            return renderArea;
        },
        hasNotificationArea: false,
        placeholders: [
            "player",
            "item",
            "game",
            "count"
        ],
        examples: [
            "secondHouseLollipop1Speech",
            "secondHouseLollipop2Speech",
            "secondHouseLollipop3Speech",
            "secondHouseTimeRingSpeech",
            "secondHouseLeatherGlovesSpeech",
            "secondHouseLeatherBootsSpeech",
            "secondHouseChocolateBarSpeech",
            "secondHouseMerchantHatSpeech",
        ],
        guidance: undefined
    },
    sorceressPre: {
        name: "The Sorceress (Before Purchase)",
        render: ({itemName, gameName, string}) => {
            const speech = renderText(itemName, gameName, string, "sorceressHutClickedSpeech");

            const buyText = Database.getText("buyLollipops", {
                item: itemName,
                player: "Player1",
                count: 20000
            });

            const renderArea = new RenderArea();
            renderArea.resize(144, 48);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/background"), 0, 3);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/hat"), 14, 3, new RenderTransparency(" ", "%"));
            renderArea.drawArray(Database.getAscii("places/sorceressHut/shelves"), 73, 3);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/cauldron"), 80, 27, new RenderTransparency(" ", "%"));
            renderArea.drawArray(Database.getAscii("places/sorceressHut/broom"), 49, 18);
            renderArea.addAsciiRealButton(buyText, 73, 22, "sorceressHutBuyingButton");
            renderArea.drawSpeech(speech, 4, 43, 43 + 27, "sorceressHutSpeech");
            return renderArea;
        },
        hasNotificationArea: false,
        placeholders: [
            "player",
            "item",
            "game",
            "count"
        ],
        examples: [
            "sorceressHutClickedGrimoire",
            "sorceressHutClickedGrimoire2",
            "sorceressHutClickedCauldron",
            "sorceressHutClickedHat"
        ],
        guidance: undefined
    },
    sorceressPost: {
        name: "The Sorceress (After Purchase)",
        render: ({itemName, gameName, string}) => {
            const speech = renderText(itemName, gameName, string, "");

            const renderArea = new RenderArea();
            renderArea.resize(144, 48);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/background"), 0, 3);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/hat"), 14, 3, new RenderTransparency(" ", "%"));
            renderArea.drawArray(Database.getAscii("places/sorceressHut/shelves"), 73, 3);
            renderArea.drawArray(Database.getAscii("places/sorceressHut/cauldron"), 80, 27, new RenderTransparency(" ", "%"));
            renderArea.drawArray(Database.getAscii("places/sorceressHut/broom"), 49, 18);

            if (speech) {
                renderArea.drawSpeech(speech, 4, 43, 43 + 27, "sorceressHutSpeech");
            }
            return renderArea;
        },
        hasNotificationArea: true,
        placeholders: [
            "player",
            "item",
            "game",
        ],
        examples: [
            "sorceressHutBuyGrimoireSpeech",
            "sorceressHutBuyGrimoire2Speech",
            "sorceressHutBuyCauldronSpeech",
            "sorceressHutBuyHatSpeech"
        ],
        guidance: undefined
    },
    forgePost: {
        name: "The Forge (After Purchase)",
        render: ({itemName, gameName, string}) => {
            const speech = renderText(itemName, gameName, string, "forgeBuySpeech");

            const renderArea = new RenderArea();
            renderArea.resizeFromArray(Database.getAscii("places/village/forge"), 0, 3);
            renderArea.drawArray(Database.getAscii("places/village/forge"), 0, 3);
            renderArea.drawSpeech(speech, 13, 44, 67, "forgeSpeech");
            renderArea.addAsciiRealButton("Send The Next Item to Player2 for 300 Candies", 8, 35, "mapVillageForgeBuyWoodenSwordButton");
            return renderArea;
        },
        hasNotificationArea: true,
        placeholders: [
            "player",
            "item",
            "game",
        ],
        examples: [
            "mapVillageForgeBuyWoodenSwordSpeech",
            "mapVillageForgeBuyIronAxeSpeech",
            "mapVillageForgeBuyPolishedSilverSwordSpeech",
            "mapVillageForgeBuyLightweightBodyArmourSpeech",
            "mapVillageForgeBuyScytheSpeech"
        ],
        guidance: undefined
    },
    cyclops: {
        name: "The Cyclops (After Puzzle Solved)",
        render: ({itemName, gameName, string}) => {
            const speech = renderText(itemName, gameName, string, "lighthouseFoundStone");

            const renderArea = new RenderArea();
            renderArea.resizeFromArray(Database.getAscii("places/lighthouse/lighthouse"), 0, 4); // 4 in order to add a space below the lighthouse, so that it looks nicer
            renderArea.drawArray(Database.getAscii("places/lighthouse/lighthouse"), 0, 3);
            renderArea.drawSpeech(speech, 17, 75, 99, "lighthouseSpeech");
            return renderArea;
        },
        hasNotificationArea: true,
        placeholders: [
            "player",
            "item",
            "game",
        ],
        examples: [
            "Congratulations! You passed the test and found the stone. It's very precious, but is only useful if you have three other stones like this one. Good luck!"
        ],
        guidance: <ul>
            <li>The string should congratulate the user for passing the test.</li>
        </ul>
    },
    hoven: {
        name: "The Bakehouse (After Baked)",
        render: ({itemName, gameName, string}) => {
            const speech = renderText(itemName, gameName, string, "castleBigRoomHovenSpeechMadePainAuChocolat");

            const renderArea = new RenderArea();
            renderArea.resize(160, 30);
            renderArea.drawArray(Database.getAscii("places/castle/bigRoom/background"), 0, 3);
            renderArea.drawString("^       ^", 61, 12);
            renderArea.drawString("         ", 61, 13);
            renderArea.drawString("  '-.-'  ", 61, 14);
            renderArea.drawSpeech(speech, 10, 83, 83 + 30, "CastleBigRoomHovenSpeech");
            renderArea.addAsciiRealButton(Database.getText("castleBigRoomHovenThanks"), 83, 19, "castleBigRoomThanksButton", Database.getTranslatedText("castleBigRoomHovenThanks"), true);
            return renderArea;
        },
        hasNotificationArea: true,
        placeholders: [
            "player",
            "item",
            "game",
        ],
        examples: [
            "Yay! Thanks a lot! I used 100 candies and a chocolate bar, and I made you... a pain au chocolat! It's my favourite pastry, I hope you'll like it too!"
        ],
        guidance: <ul>
            <li>The string should mention that 100 candies and a chocolate bar were used.</li>
        </ul>
    }
} satisfies Record<ItemTextOccurrence, {
    name: string,
    render: (args: {
        itemName: string,
        gameName: string,
        string: string | undefined
    }) => RenderArea,
    hasNotificationArea: boolean,
    placeholders: string[],
    examples: string[],
    guidance?: ReactNode
}>

export function EditorMain({
    selectedItem,
    selectedOccurrence,
    setSelectedOccurrence
}: {
    selectedItem: string | undefined;
    selectedOccurrence: ItemTextOccurrence;
    setSelectedOccurrence: Dispatch<SetStateAction<ItemTextOccurrence>>
}) {
    const {store} = useEditor();
    const [showExample, setShowExample] = useState(false);
    const [exampleNumber, setExampleNumber] = useState(0);

    const string = store.store?.[selectedItem]?.[selectedOccurrence] ?? "";
    const game = store.gameName;

    const occurrence = useMemo(() => {
        return EditableOccurrences[selectedOccurrence];
    }, [selectedOccurrence]);

    const normalisedExampleNumber = useMemo(() => {
        if (exampleNumber < 0) {
            return occurrence.examples.length - Math.abs(exampleNumber) % occurrence.examples.length - 1;
        }
        return exampleNumber % occurrence.examples.length;
    }, [exampleNumber, occurrence]);

    const renderArea = useMemo(() => {
        let s = string;
        if (showExample) {
            const example = occurrence.examples[normalisedExampleNumber];
            s = Database.getText(example);
            if (!s) {
                s = example;
            }
        }

        return occurrence.render({
            itemName: selectedItem ?? "",
            gameName: game,
            string: s
        });
    }, [occurrence, selectedItem, game, string, showExample, normalisedExampleNumber]);

    const onChange = (e) => {
        store.edit(selectedItem, selectedOccurrence, e.target.value)
    }

    const onBlur = () => {
        store.save()
    }

    const notificationArea = occurrence.hasNotificationArea &&
        <div className={Styles.sentNotification}>{selectedItem} was sent to Player1!</div>;

    const remainingPlaceholders = useMemo(() => {
        return occurrence.placeholders.filter(placeholder => !string.includes(`{{${placeholder}}}`));
    }, [occurrence, string]);

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setShowExample(true);
        } else if (e.key == "ArrowLeft" && showExample) {
            setExampleNumber(n => n - 1);
        } else if (e.key == "ArrowRight" && showExample) {
            setExampleNumber(n => n + 1);
        }
    }

    const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key == "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setShowExample(false);
        }
    }

    if (!selectedItem) {
        return <div className={Styles.main}>
            Choose an item to edit its text
        </div>
    }

    if (selectedItem == "__instructions") {
        return <div className={Styles.main}>
            <Guide />
        </div>
    }

    return <div className={Styles.main} onKeyUp={onKeyUp} onKeyDown={onKeyDown}>
        <div className={Styles.editorHeader}>
            <div>
                Occurrence: <select value={selectedOccurrence} onChange={(e) => setSelectedOccurrence(e.target.value as ItemTextOccurrence)}>
                {Object.entries(EditableOccurrences).map(([key, item]) => (
                    <option key={key} value={key}>{item.name}</option>
                ))}
                </select>
            </div>
            <div className={Styles.textRow}>
                String: <input type={"text"} value={string} onChange={onChange} onBlur={onBlur} />
            </div>
            <div>
                Remaining placeholders:{" "}
                <div className={Styles.placeholderList}>
                    {remainingPlaceholders.map(placeholder => <span className={Styles.placeholder}>{`{{${placeholder}}}`}</span>)}
                </div>
            </div>
            {occurrence.guidance && <div className={Styles.guidance}>
                Guidance: {occurrence.guidance}
            </div>}
        </div>
        <div className={Styles.preview}>
            <b>{showExample ? `EXAMPLE (${normalisedExampleNumber + 1}/${occurrence.examples.length})` : "PREVIEW"}</b>
            <ReactRenderArea renderArea={renderArea} notificationArea={notificationArea} />
        </div>
    </div>
}