///<reference path="QuestEntityWeapon.ts"/>

import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Random} from "./Random";

export class PlayerBludgeon extends QuestEntityWeapon{
    // Public methods
    public getRealDamage(): number{
        return Random.between(12, 16);
    }
    
    public getRealDamageText(): string{
        return "12-16";
    }
}