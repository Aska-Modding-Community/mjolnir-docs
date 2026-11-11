---
title: Buildings
---

# Buildings

`Buildings.Add(name, basedOn, icon)` adds a building of the mod's own to the build menu. It is built as the game's
buildings are: placed, its ground levelled first if it asks for that, then each stage supplied and worked with a
hammer. In the world it is the mod's object, with its own name, id, texts, picture, model, cost and network prefab.

```csharp
ModBuilding altar = Buildings.Add("altar", icon: "items/altar.png")
                             .WithModel("bundles/models", "Altar")
                             .WithCategory("Categ_Blueprints_Totems")
                             .WithGroundLevelling()
                             .Needs("Item_Stone_Raw", 4);
```

```toml title="lang/english.toml"
[building.altar]
name = "Altar"
description = "A place of prayer"
lore = "An old runestone on a slab of stone."
```

- `description` is the line under the building's name in the build menu, `lore` the text below.
- The player knows the building from the start, in a new game and an older save alike.
- A placed building is saved by its id: a hash of the mod id and `<name>`, the same on every machine.
- A building cannot take the name of one of its mod's items: items and buildings share names.
- Add buildings in `OnLoad`. Every player registers the mods' buildings in the same order, and a building added later
  may break it.

## The base

Every building is carried by a game structure, whose stages and function it takes. Its look is hidden and its name,
id and texts are replaced.

| `basedOn` | The building gets |
|---|---|
| (none) | `ModBuilding.DefaultBase`, the game's decorative birch: one stage, no function of its own |
| A game structure, such as `Item_StoneLantern` | That structure's stages and function: a lantern's fire, a storage's room, a house's three stages |
| A mod's building, its `AssetName` | Its base, and its look, cost and settings unless given again |

A building without `WithModel` shows its base's look.

## Look

| Method | What |
|---|---|
| `WithModel(bundle, asset)` | The building's model: a prefab from the mod's AssetBundle, built with the [mod kit](../mod-kit.md). Its origin stands on the building's place |
| `WithConstructionModel(bundle, asset)` | A look for the stages under way, such as scaffolding or a frame. Without it the model stands for them |

While a stage is under way, the model shows in the game's construction material and tint: yellow while supplies are
missing, green while it waits for the hammer. Once finished it shows as made. The game outlines the model under the
player's look and shows the building's card. Its solid colliders are the model's own, and the building's footprint
and the boxes the player's look finds are fitted around it. The placement preview carries the model too.

Materials take the game's shader of the same name, so use the game's shaders by name, such as `HDRP/Lit`.

## Stages and cost

| Method | What |
|---|---|
| `Needs(item, count)` | Adds to the first stage's supplies: a game item by asset name, or a `ModItem` |
| `Needs(item, count, stage)` | Adds to a stage's supplies, `0` the first |
| `PartsAt(stage)`, `Parts` | What a stage costs, and what the building costs in all |
| `StagesWithParts` | The number of stages it has supplies for |

Without `Needs`, a building costs what its base costs. With `Needs`, it costs only what its parts say; a stage without
parts is only built. The stages are the base's: a stage the base lacks is left out, with a warning in the log.
Dismantling gives back what the game gives back of the supplies.

```csharp
ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope", icon: "items/twine.png");

Buildings.Add("twine_arch", basedOn: "Item_Decoration_ArchFlimsy", icon: "items/twine_arch.png")
         .Needs("Item_Wood_Sticks", 5)
         .Needs(twine, 4);
```

## Build menu and work

| Method | What |
|---|---|
| `WithCategory(category)` | The build menu's tab, by the game's asset name: `Categ_Blueprints_Decoration`, `Categ_Blueprints_Structures`, `Categ_Blueprints_Storage`, `Categ_Blueprints_Furniture`, `Categ_Blueprints_Totems`, `Categ_Blueprints_ExteriorLights`. The base's without it |
| `WithGroundLevelling(levels)` | Without an argument or with `true`, places a plan the player digs with a hoe first, as the game's lanterns and houses. `false` starts the first stage as soon as the building is placed, as the game's decorations. Without the call, the building does what its base does |
| `WithBuildEffort(effort)` | The hammer work each stage takes. The game's stages take `ModBuilding.DefaultBuildEffort`, 10 |

To let the player or villagers use a building, put an [interaction](../interactions.md) on it.

## Placing a model without a building

`Models.Spawn(bundle, asset, position, rotation)` places a prefab of the mod's bundle in the world and returns it, or
`null` when the bundle or the prefab is missing. The game does not save it, and it goes with its world.

```csharp
GameObject? stone = Models.Spawn("bundles/models", "Altar", LocalPlayer.Position, Quaternion.identity);
```

:::note[Not done yet]
- A function of its own: a building based on a crafting station has its base's recipes, one based on a storage its
  base's room.
- A client joined to a host is not checked yet.
:::
