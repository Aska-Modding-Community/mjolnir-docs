---
title: Items and recipes
---

# Items and recipes

`Mjolnir.SDK.Content` adds a mod's own items, recipes, buildings and status effects. Reference
`Mjolnir.SDK.Content.dll` and add `using Mjolnir.SDK.Content;`. Add everything in `OnLoad`.

Game assets are referred to by asset name: `Item_Wood_Sticks`, `Item_Materials_BasicRope`,
`Item_Structures_WorkshopL0`. The console command `items <words>` lists them; see
[Developer console](../console.md).

## Items

An item is a copy of a game item. It keeps the base's world model, kind, size and sounds; the mod gives it a name,
a picture, a stack size and texts. The base is a game item named with `basedOn`, or a plain one of a
[kind](#kinds-of-items).

```csharp title="TwineMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Content;

namespace TwineMod;

[ModManifest("author.twine", "Twine", "1.0.0")]
public sealed class TwineMod : Mod
{
    public override void OnLoad()
    {
        ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope", icon: "items/twine.png", stackSize: 20);

        // Two sticks and a rope make two twine, by hand and at the workshop, where the rope is made.
        Recipes.Add(twine, quantity: 2)
               .Needs("Item_Wood_Sticks", 2)
               .Needs("Item_Materials_BasicRope", 1);

        // A spool of five twine and a stick, only at the workshop.
        ModItem spool = Items.Add("twine_spool", basedOn: "Item_Materials_BasicRope", icon: "items/twine_spool.png", stackSize: 10);
        Recipes.Add(spool)
               .Needs(twine, 5)
               .Needs("Item_Wood_Sticks", 1)
               .MadeAt("Item_Structures_WorkshopL0");
    }
}
```

`Items.Add(name, basedOn, icon, stackSize)`:

- `name`: letters, digits and underscores, unique in the mod. The same name again returns the item already added;
  the same name with another base throws.
- `icon`: a PNG or JPG relative to the mod's folder. Without it, the base's picture.
- `stackSize`: items per slot. Without it, the base's.

Texts come from the mod's `lang` files:

```toml title="lang/english.toml"
[item.twine]
name = "Twine"
description = "Thin cord twisted from rope fibres."
lore = "Coiled so it does not tangle."
```

An omitted description or lore shows nothing. See [Localization](../../concepts/localization.md).

## Kinds of items

An item stands on a game item in one of two ways:

| Call | Stands on | Use it for |
|---|---|---|
| `Items.Add(name, basedOn, icon, stackSize)` | The game item you name | An item like one particular game item: an iron axe, a longbow, a rope |
| `Items.Add(name, kind, icon, stackSize)` | A plain game item of the `ItemKind` | A weapon, a piece of armour, food or a material, without naming a game item |

The kind decides where the item goes in the inventory, how it is carried, held or worn, and what it does. The item
has its base's picture, look, sounds and numbers until the mod gives its own. `ModItem.Kind` is the kind it was added
with, `null` for one made with `basedOn`.

```csharp
ModItem sword = Items.Add("rune_sword", ItemKind.OneHandedWeapon, icon: "items/rune_sword.png").WithDamage(14, 18);
ModItem hood = Items.Add("rune_hood", ItemKind.Helmet).WithArmor(60);
ModItem cake = Items.Add("honey_cake", ItemKind.Food, stackSize: 5);
```

| `ItemKind` | What it is | Stands on | Takes besides `WithArmor`, `WithDurability`, `WithAttribute` |
|---|---|---|---|
| `Material` | A small crafting material, many to a slot | The rope | |
| `LargeMaterial` | A long or heavy material carried on the back | The plank | |
| `Food` | Eaten from the inventory | Berries | `AppliesWhenEaten` |
| `OneHandedWeapon` | Held in the right hand, with a shield beside it | The iron sword | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `TwoHandedWeapon` | Held in both hands | The two-handed iron sword | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `Shield` | Held in the left hand | The crude round shield | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `Bow` | Held in both hands, shoots arrows | The simple bow | `WithDamage`, `AppliesWhileEquipped` |
| `Arrow` | Worn in the quiver | Wooden arrows | `WithDamage`, `AppliesWhileEquipped` |
| `Helmet`, `Chest`, `Pants`, `Boots`, `Gloves`, `Cape` | Worn | The cloth set | `AppliesWhileEquipped` |

A method a kind does not take throws `InvalidOperationException`. On an item made with `basedOn`, the base's own kind
decides, and a method that does not fit writes a warning to the log. What each method does is in
[Weapons, armour and food](equipment.md).

## Ids and saves

An item's id is a hash of the mod id and the item name. It is always negative (game ids never are) and the same on
every machine and every start, whatever other mods are installed. The asset name is `Item_<mod id>_<name>`.

The game saves items by id, so a save loads a mod's items back. Without the mod, the game drops them silently and the
next save omits them. After release, never rename an item or change the mod id: the id changes and saved items are
lost.

## Recipes

`Recipes.Add(result, quantity, basedOn)` adds a recipe that makes `quantity` of a mod's item. `Needs(item, count)`
adds an ingredient, by asset name or as a `ModItem`, in the order given. One recipe per result; a second `Add` for the
same item returns the first.

A recipe is a copy of a game recipe, by default the rope's (`Item_Binders_BasicRope`). It takes that recipe's kind and
menu section, and is made where that recipe is made: for the rope, by hand and at the workshop of every level.

### Where a recipe is made

`MadeAt(place)` replaces the base's places. Call it once per place:

| Place | Means |
|---|---|
| `ModRecipe.ByHand` | The build menu's crafting |
| a structure's asset name | Its crafting tables, and those of every structure it is upgraded to: `Item_Structures_WorkshopL0` covers the workshop's every level. An add-on works too, such as `Item_Addons_Weaver` |

- A hand recipe is known from the start: a new game's player starts with it, an older save's player gets it when the
  world loads.
- A station knows its crafting tables' recipes regardless of what the player knows. The player crafts them at its
  table; its villagers make them on request.
- Stations take their recipes when built or loaded: set the places in `OnLoad`.

## Giving items

```csharp
ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope");   // the same item as above

int given = Items.Give(twine, 10);              // a mod's item
int sticks = Items.Give("Item_Wood_Sticks", 5);  // a game item by asset name
```

`Give` returns the count placed in the local player's inventory: 0 off the main thread, outside a world, or without
room. `Items.CanGive` tells whether items can be given now.

:::note[Not done yet]
A recipe added after a station is up reaches it only at the next load.
:::
