---
title: Buildings
---

# Buildings

`Buildings.Add(name, basedOn, icon)` adds a copy of a game structure to the build menu. Model, size, placement,
construction stages and function are the base's; the mod gives a name, an id, a picture, texts and, with `Needs`, a
cost of its own.

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
- The building appears in the build menu beside its base and is known from the start, in a new game and an older save
  alike.
- A placed building is saved by its id: a hash of the mod id and `<name>`, the same on every machine.
- A building cannot take the name of one of its mod's items: items and buildings share names.

## Cost

Without `Needs`, a building costs what its base costs. With `Needs`, the whole cost goes on the first construction
stage; the other stages cost nothing and are only built.

:::note[Not done yet]
- A model of the mod's own: a building looks like its base.
- A function of its own: a copy of a crafting station has its base's recipes, a copy of a storage its base's room.
:::
