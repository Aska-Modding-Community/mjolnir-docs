---
title: Buildings
---

# Buildings

`Buildings.Add(name, basedOn, icon)` adds a building to the build menu, made from one of the game's structures. Its
model, size, placement, construction stages and function are the base's; the mod gives it a name, an id, a picture,
texts and, with `Needs`, a cost of its own.

```csharp
ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope", icon: "items/twine.png");

Buildings.Add("twine_arch", basedOn: "Item_Decoration_ArchFlimsy", icon: "items/twine_arch.png")
         .Needs("Item_Wood_Sticks", 5)
         .Needs(twine, 4);
```

```toml title="lang/english.toml"
[building.twine_arch]
name = "Twine arch"
description = "Decoration"
lore = "Two posts and a bent top, bound with twine."
```

- `description` is the line under the building's name in the build menu, `lore` the text below.
- The building stands in the build menu beside its base, and the player knows it from the start, in a new game and an
  older save alike.
- A building put up stays in the save by its id: a hash of the mod id and `<name>`, the same on every machine.
- A mod's items and buildings share names: a building cannot take the name of one of the mod's items.

## Cost

Without `Needs`, a building costs what its base costs. With `Needs`, the whole cost goes on the first construction
stage; the other stages need nothing and are only built.

:::note[Not done yet]
- A model of the mod's own: a building looks like its base.
- A function of its own: a copy of a crafting station has its base's recipes, a copy of a storage its base's room.
:::
