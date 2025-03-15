///<reference path="GridItem.ts"/>

import {Player} from "./Player";
import {GridItem} from "./GridItem";
import {Quest} from "./Quest";
import {QuestEntity} from "./QuestEntity";
import {QuestEntityDamageReason} from "./QuestEntityDamageReason";

export class XinopherydonClaw extends GridItem{
    public hit(player: Player, quest: Quest, questEntity: QuestEntity, damage: number, reason: QuestEntityDamageReason): number{
        return damage*2;
    }
}