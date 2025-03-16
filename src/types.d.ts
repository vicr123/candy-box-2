import {Game} from "./main/Game";
import {Archipelago} from "./archipelago/Archipelago";

declare global {
    interface Window {
        game: Game;
        archipelago: Archipelago;
    }
}