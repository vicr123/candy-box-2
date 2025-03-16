import { Item } from "archipelago.js";
import {Saving} from "../main/Saving";
import {Archipelago} from "./Archipelago";

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
