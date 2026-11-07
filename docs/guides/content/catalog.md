---
title: The item catalog
---

# The item catalog

`Items.All` lists every item a player can carry, mods' items included, in the game's order. Blueprints, the world's
trees and stones, and map marks are left out. Each item is one `ItemDefinition` object.

| `ItemDefinition` | What |
|---|---|
| `Id`, `AssetName` | The game's id and name |
| `DisplayName`, `Description` | Texts in the player's language |
| `Icon` | Its picture, a `Sprite` |
| `StackSize` | How many fit in a slot |
| `Category` | Its `ItemCategory` |
| `ModId` | The mod that added it, `null` for the game's |

`Items.Categories` are the top categories (Armor, Bags, Resources, Tools, Weapons, Decorations), each with the
categories under it. An `ItemCategory` has `Id`, `AssetName`, `DisplayName`, `Parent`, `Root`, `Children` and
`Contains(category)`, true for the category itself and every one under it.

```csharp
foreach (ItemDefinition item in Items.All.Where(i => i.Category?.AssetName == "Categ_Resources_Food"))
    Log.Info($"{item.DisplayName} ({item.AssetName}), {item.StackSize} a slot");

ItemDefinition? rope = Items.Find("Item_Materials_BasicRope");
if (rope != null && Items.CanGive) Items.Give(rope, 3);
```

- The list is empty until the game builds its item database, which already exists in the main menu.
- Read it on the main thread; another thread gets the list last read there.
- `Find` takes an asset name in any case and returns `null` for none.

The example mod `Mjolnir.CheatInventory` shows the catalog in a searchable window, one tab per category.
