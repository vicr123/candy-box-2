import {Game} from "./main/Game";
import {Archipelago} from "./archipelago/Archipelago";

declare global {
    interface Window {
        game: Game;
        archipelago: Archipelago;
    }
}

declare module 'virtual:ascii-art' {
    const AsciiArt: {
        name: string;
        height: number;
        width: number;
        art: string[];
    }
}

declare module "*.module.css";