///<reference path="CandyMerchantItem.ts"/>

import {CandyMerchantItem} from "./CandyMerchantItem";

export class CandyMerchantItem_ChocolateBar extends CandyMerchantItem{
    // When we buy, we get one chocolate bar
    public buy(): void{
        super.buy();
        this.getGame().getChocolateBars().add(1);
    }
}