///<reference path="GridItem.ts"/>

import {GridItem} from "./GridItem";
import {Player} from "./Player";
import {Quest} from "./Quest";

export class UnicornHorn extends GridItem{
    public update(player: Player, quest: Quest): void{
        player.heal(3);
    }
}