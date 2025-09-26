import {Item} from "archipelago.js";
import {Database} from "../main/Database";
import {Algo} from "../main/Algo";
import posessive = Algo.posessive;

export interface ItemText {
    /**
     * At the Candy Merchant's store, after you click on the item
     */
    merchantPre?: string;

    /**
     * At the forge, after you buy the item
     */
    forgePost?: string;

    /**
     * At the Sorceress' Hut, after you click on the item
     */
    sorceressPre?: string;

    /**
     * At the Sorceress' Hut, after you buy the item
     */
    sorceressPost?: string;

    /**
     * At the Castle Bakehouse, once the item is baked
     */
    hoven?: string;

    /**
     * At the Lighthouse, once you solve the Cyclops' puzzle
     */
    cyclops?: string;
}

export type GameItemText = Record<string, ItemText>;

export type ItemTextOccurrence = keyof ItemText;

export const LoadedItemText: Record<string, GameItemText> = {};

interface GameMeta {
    strings: string[],
    matureGame: boolean
}

let itemTextMeta: Record<string, GameMeta> | null = null;

export async function loadGameItemText(game: string) {
    if (!itemTextMeta) {
        const response = await fetch("/item-text/meta.json", {

        });
        itemTextMeta = await response.json();
    }

    const gameMeta = itemTextMeta[game];
    if (gameMeta) {
        const strings = await Promise.all(gameMeta.strings.map(async stringsUrl => {
            const response = await fetch(stringsUrl);
            const json = await response.json() as GameItemText;
            return Object.entries(json);
        }))
        LoadedItemText[game] = Object.fromEntries(strings.flat());
    }
}

export function getItemString(occurrence: ItemTextOccurrence, item: Item, cost?: number) {
    const args = {
        player: item.receiver.alias,
        item: item.name.slice(0, 30),
        game: item.game,
        count: cost ?? 0
    }
    let placeholderText = LoadedItemText[item.game]?.[item.name]?.[occurrence];
    if (!placeholderText) {
        args.player = posessive(item.receiver.alias);
        switch (occurrence) {
            case "merchantPre":
                return Database.getText("secondHouseBuySpeech", args);
            case "forgePost":
                return Database.getText("forgeBuySpeech", args);
            case "sorceressPre":
                return Database.getText("sorceressHutClickedSpeech", args);
            case "sorceressPost":
                // Special case: the Sorceress doesn't have anything to say after you buy normally
                return "";
            case "hoven":
                return Database.getText("castleBigRoomHovenSpeechMadePainAuChocolat", args);
            case "cyclops":
                return Database.getText("lighthouseFoundStone", args);
        }
    }

    for (const arg in args) {
        placeholderText = placeholderText.replace(`{{${arg}}}`, args[arg]);
    }
    return placeholderText;
}

export async function fetchGameItemText(game: string) {
    await loadGameItemText(game);
    return LoadedItemText[game];
}