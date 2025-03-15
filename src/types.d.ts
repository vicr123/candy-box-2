import {Game} from "./main/Game";

declare global {
    interface Window {
        game: Game;
    }
}