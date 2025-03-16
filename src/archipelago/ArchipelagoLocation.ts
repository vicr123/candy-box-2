export const ArchipelagoLocation = {
    HP_BAR_UNLOCK: 1,
    VILLAGE_SHOP_TOP_LOLLIPOP: 100,
    VILLAGE_SHOP_CENTRE_LOLLIPOP: 101,
    VILLAGE_SHOP_BOTTOM_LOLLIPOP: 102,
    VILLAGE_SHOP_CHOCOLATE_BAR: 103,
    VILLAGE_SHOP_TIME_RING: 104,
    VILLAGE_SHOP_CANDY_MERCHANTS_HAT: 105,
    VILLAGE_SHOP_LEATHER_GLOVES: 106,
    VILLAGE_SHOP_LEATHER_BOOTS: 107,
    VILLAGE_HOUSE_1_LOLLIPOP_ON_BOOKSHELF: 200,
    VILLAGE_HOUSE_1_LOLLIPOP_IN_BOOKSHELF: 201,
    VILLAGE_HOUSE_1_LOLLIPOP_UNDER_RUG: 202
} satisfies Record<string, number>

export const ArchipelagoLocationRegion = {
    VILLAGE_SHOP: ArchipelagoLocation.VILLAGE_SHOP_TOP_LOLLIPOP
} satisfies Record<string, number>

export const ArchipelagoItem = {
    CANDY: 0,
    LOLLIPOP: 1,
    CHOCOLATE_BAR: 2,
    HP_BAR: 3,
    TIME_RING: 4,
    CANDY_MERCHANTS_HAT: 5,
    LEATHER_GLOVES: 6,
    LEATHER_BOOTS: 7
} satisfies Record<string, number>

export const ArchipelagoItemBaseId = 7665000