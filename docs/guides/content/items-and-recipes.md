---
title: Items and recipes
---

# Items and recipes

`Mjolnir.SDK.Content` adds items, recipes, buildings and status effects of a mod's own. Reference
`Mjolnir.SDK.Content.dll` and add `using Mjolnir.SDK.Content;`. Everything here is added in `OnLoad`.

The game's assets are named by their asset names: `Item_Wood_Sticks`, `Item_Materials_BasicRope`,
`Item_Structures_WorkshopL0`. The console's `items <words>` command lists them; see
[Developer console](../console.md).

## Items

An item is made from one of the game's items. It keeps the base's model in the world, its kind, size and sounds, and
the mod gives it a name, a picture, a stack size and texts.

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

- `name` is letters, digits and underscores, unique in the mod. Adding the same name again returns the item already
  added; the same name with another base throws.
- `icon` is a PNG or JPG relative to the mod's folder. Without it the item shows its base's picture.
- `stackSize` is how many fit in one slot. Without it, the base's.

The item's texts come from the mod's `lang` files:

```toml title="lang/english.toml"
[item.twine]
name = "Twine"
description = "Thin cord twisted from rope fibres."
lore = "Coiled so it does not tangle."
```

A description or lore left out shows nothing. See [Localization](../../concepts/localization.md).

## Ids and saves

An item's id is a hash of the mod's id and the item's name, always negative, which the game's ids never are. It is the
same on every machine and every start, whatever other mods are installed. Its asset name is
`Item_<mod id>_<name>`.

The game saves items by id, so a save with a mod's items loads them back. Without the mod, the game drops them quietly,
and the next save is written without them. Never rename an item or change your mod's id after release: the id would
change and saved items would be lost.

## Recipes

`Recipes.Add(result, quantity, basedOn)` adds a recipe that makes `quantity` of a mod's item. `Needs(item, count)`
adds an ingredient, by asset name or as a `ModItem`, in the order given. One recipe per result; adding another for
the same item returns the first.

A recipe is made from one of the game's recipes, the rope's (`Item_Binders_BasicRope`) by default. It takes that
recipe's kind and section of the menus, and is made where that recipe is made: the rope by hand and at the workshop
of every level.

### Where a recipe is made

`MadeAt(place)` replaces the base's places. Call it again for each further place:

| Place | Means |
|---|---|
| `ModRecipe.ByHand` | The build menu's crafting |
| a structure's asset name | Its crafting tables, and those of every structure it is upgraded to: `Item_Structures_WorkshopL0` covers the workshop's every level. An add-on works too, such as `Item_Addons_Weaver` |

- A recipe made by hand is known from the start: a new game's player starts with it, and a player of an older save
  gets it when the world loads.
- A station knows the recipes of its crafting tables whatever the player knows. The player crafts them at its table,
  and its villagers make them when asked to.
- Stations take their recipes as they are built or loaded, so give the places in `OnLoad`.

## Giving items

```csharp
ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope");   // the same item as above

int given = Items.Give(twine, 10);              // a mod's item
int sticks = Items.Give("Item_Wood_Sticks", 5);  // a game item by asset name
```

`Give` returns how many went into the local player's inventory: 0 off the main thread, outside a world, or without
room. `Items.CanGive` says whether items can be given now.

:::note[Not done yet]
- A client joining a host: the network sends an item as its index in the game's list, so every peer must have the
  same mods' items. The handshake that will check this is not done yet.
- A recipe added after a station is up reaches it only at the next load.
:::
