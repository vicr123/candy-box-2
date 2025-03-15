///<reference path="QuestEntityWeapon.ts"/>

import {QuestEntityWeapon} from "./QuestEntityWeapon";
import {Random} from "./Random";

export class Bludgeon extends QuestEntityWeapon{
    // Public methods
    public getRealDamage(): number{
        return Random.between(15, 25);
    }
    
    public getRealDamageText(): string{
        return "15-25";
    }
}