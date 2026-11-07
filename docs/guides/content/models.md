---
title: Models and the mod kit
---

# Models and the mod kit

A mod's item can look like something of its own: a prefab from an AssetBundle the mod ships. Bundles must be built
with the game's Unity version, **6000.3.12f1**, for Windows, with **HDRP**. A bundle built with another Unity does not
load in the game.

## The mod kit

The repository's `unity/Mjolnir.ModKit` is a Unity project set up for this: Unity 6000.3.12f1 with HDRP 17.3.0, the
game's own pipeline.

1. Install Unity **6000.3.12f1** through Unity Hub, and open `unity/Mjolnir.ModKit` with it. The kit sets HDRP on
   every quality level when it opens (**Mjolnir → Set Up HDRP** does it again).
2. Put a mod's assets into `Assets/Mods/<mod>/<bundle>/`. Each such folder is one bundle with everything in it.
3. **Mjolnir → Build Bundles** builds every bundle into `Build/Bundles/<mod>/<bundle>`.
4. Copy the bundle file into your mod's folder, for example `bundles/models`.

Scripts are left out of bundles: the game cannot run a mod's `MonoBehaviour` from a bundle.

Materials take the game's own shader of the same name when they load, so use the game's shaders by name, such as
`HDRP/Lit`. A model's pivot is the item's origin.

## An item with a model

```csharp
ModItem spool = Items.Add("twine_spool", basedOn: "Item_Materials_BasicRope", icon: "items/twine_spool.png")
                     .WithModel("bundles/models", "TwineSpool");
```

`WithModel(bundle, asset)` takes the bundle's file relative to the mod's folder and the prefab's name in it. The item
stays what its base is in the world: picked up, carried, thrown and sent over the network as the base is. Only its look
is the model:

- the base's meshes are replaced by the prefab;
- the base's box colliders are fitted round the model, with the room they left round the base's look, so it lies on
  the ground, a path or a shelf as the base does. The prefab's own colliders are left out;
- the game's picking highlight finds the model's renderers.

A model that fails to load is logged, and the item keeps its base's look.

```text
Mjolnir/Mods/TwineMod/
├─ TwineMod.dll
├─ items/twine_spool.png
└─ bundles/models
```

## Batch builds

`tools/build-bundles.ps1` in the repository runs the kit in batch mode and copies the examples' bundles into
`examples/<mod>/bundles/`. It finds Unity 6000.3.12f1 in Unity Hub's install folders; `-Unity <path>` or the
environment variable `MJOLNIR_UNITY` point it elsewhere. Unity locks an open project, so close the editor first, or
build from its menu and run the script with `-SkipBuild`.

:::note[Not done yet]
Models for buildings: a building is a network object, and a mod's building looks like its base for now.
:::
