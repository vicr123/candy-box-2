///<reference path="./../../main/Spikes.ts"/>

import {Spikes} from "../../main/Spikes";

export class HardcorePlatformer_Spikes extends Spikes{
    // Public methods
    public update(): void{
        // If the player is too close, we disappear!!
        if(this.getQuest().getGame().getPlayer().getGlobalPosition().x > this.getGlobalPosition().x - 5)
            this.setDead(true);
        
        // Call the mother class update method
        super.update();
    }
}