export type GiftTraitType =
    "Speed" |
    "Consumable" |
    "Food" |
    "Drink" |
    "Heal" |
    "Mana" |
    "Key" |
    "Trap" |
    "Buff" |
    "Life" |
    "Weapon" |
    "Armor" |
    "Tool" |
    "Fish" |
    "Animal" |
    "Cure" |
    "Seed" |
    "Metal" |
    "Bomb" |
    "Monster" |
    "Resource" |
    "Material" |
    "Wood" |
    "Stone" |
    "Ore" |
    "Grass" |
    "Meat" |
    "Vegetable" |
    "Fruit" |
    "Egg" |
    "Slowness" |
    "Damage" |
    "Fire" |
    "Ice" |
    "Currency" |
    "Energy" |
    "Light" |
    string;

export interface GiftTrait {
    trait: GiftTraitType;
    quality?: number;
    duration?: number;
}