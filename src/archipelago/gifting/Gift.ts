import {GiftTrait} from "./GiftTrait";
import {CamelCasedObject} from "./CaseHelpers";

export interface NetworkGift {
    id: string
    item_name: string
    amount: number
    item_value?: number
    traits: GiftTrait[],
    sender_slot: number
    receiver_slot: number
    sender_team: number
    receiver_team: number
    is_refund: boolean
}

export type Gift = Omit<CamelCasedObject<NetworkGift>, "id"> & {
    id?: string
}