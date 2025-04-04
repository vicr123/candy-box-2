import {GiftTraitType} from "./GiftTrait";
import {CamelCasedObject} from "./CaseHelpers";

export interface NetworkGiftBox {
    is_open: boolean;
    accepts_any_gift: boolean;
    desired_traits: GiftTraitType[];
    maximum_gift_data_version: number
    minimum_gift_data_version: number
}

export type GiftBox = CamelCasedObject<NetworkGiftBox>