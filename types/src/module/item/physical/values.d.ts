declare const PHYSICAL_ITEM_TYPES: Set<"armor" | "shield" | "consumable" | "book" | "backpack" | "equipment" | "treasure" | "weapon">;
declare const PRECIOUS_MATERIAL_TYPES: Set<"abysium" | "adamantine" | "dawnsilver" | "djezet" | "duskwood" | "inubrix" | "noqual" | "orichalcum" | "siccatite" | "silver" | "cold-iron" | "dragonhide" | "grisantian-pelt" | "keep-stone" | "peachwood" | "sisterstone" | "sisterstone-dusk" | "sisterstone-scarlet" | "sovereign-steel" | "warpglass">;
declare const PRECIOUS_MATERIAL_GRADES: Set<"low" | "standard" | "high">;
declare const DENOMINATIONS: readonly ["pp", "gp", "sp", "cp"];
export { DENOMINATIONS, PHYSICAL_ITEM_TYPES, PRECIOUS_MATERIAL_GRADES, PRECIOUS_MATERIAL_TYPES };
