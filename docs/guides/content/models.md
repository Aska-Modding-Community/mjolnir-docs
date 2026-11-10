---
title: Item models
---

# Item models

A mod's item can use a model of its own: a prefab from an AssetBundle the mod ships, built with the
[mod kit](../mod-kit.md) for the game's Unity version, **6000.3.12f1**, Windows and **HDRP**. A bundle built with
another Unity version does not load.

## An item with a model

```csharp
ModItem spool = Items.Add("twine_spool", basedOn: "Item_Materials_BasicRope", icon: "items/twine_spool.png")
                     .WithModel("bundles/models", "TwineSpool");
```

`WithModel(bundle, asset)` takes the bundle file, relative to the mod's folder, and the prefab's name in it. In the
world the item behaves as its base: it is picked up, carried, thrown and sent over the network the same way. Only its
look changes:

- the prefab replaces the base's meshes;
- the base's box colliders are fitted round the model with the same clearance they had round the base's look, so it
  rests on the ground, a path or a shelf as the base does. The prefab's own colliders are left out;
- the game's picking highlight finds the model's renderers.

A model that fails to load is logged, and the item keeps its base's look.

```text
Mjolnir/Mods/TwineMod/
├─ TwineMod.dll
├─ items/twine_spool.png
└─ bundles/models
```

## Making the model

- A model's pivot is the item's origin.
- On load, materials take the game's shader of the same name, so use the game's shaders by name, such as `HDRP/Lit`.
- Scripts are left out of bundles: the game cannot run a mod's `MonoBehaviour` from a bundle.
- **Mjolnir → Items → Render Item Icons** draws the selected prefab into a 256 × 256 picture for the item's icon.

See [The mod kit](../mod-kit.md) for building and copying bundles.

:::note[Not done yet]
Models for buildings: a building is a network object, and a mod's building looks like its base for now.
:::
