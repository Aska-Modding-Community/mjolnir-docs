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
a picture, a stack size and texts.

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
- A client joining a host: the network sends an item as its index in the game's list, so every peer needs the same
  mods' items. The handshake that will check this is not done yet.
- A recipe added after a station is up reaches it only at the next load.
:::
