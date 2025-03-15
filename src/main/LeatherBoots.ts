///<reference path="EqItem.ts"/>

import {EqItem} from "./EqItem";

export class LeatherBoots extends EqItem{
    // Constructor
    constructor(){
        super("eqItemBootsLeatherBoots",
              "eqItemBootsLeatherBootsName",
              "eqItemBootsLeatherBootsDescription",
              "eqItems/boots/leatherBoots");
    }
}