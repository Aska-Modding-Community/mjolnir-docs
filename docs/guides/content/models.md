---
title: Models and the mod kit
---

# Models and the mod kit

A mod's item can use a model of its own: a prefab from an AssetBundle the mod ships. Build bundles with the game's
Unity version, **6000.3.12f1**, for Windows, with **HDRP**. A bundle built with another Unity version does not load.

## The mod kit

`unity/Mjolnir.ModKit` in the repository is a Unity project set up for this: Unity 6000.3.12f1 with HDRP 17.3.0, the
game's pipeline.

1. Install Unity **6000.3.12f1** through Unity Hub, and open `unity/Mjolnir.ModKit` with it. The kit sets HDRP on
   every quality level when it opens (**Mjolnir → Set Up HDRP** does it again).
2. Put a mod's assets into `Assets/Mods/<mod>/<bundle>/`. Each such folder becomes one bundle with all its contents.
3. Run **Mjolnir → Build Bundles**. It builds every bundle into `Build/Bundles/<mod>/<bundle>`.
4. Copy the bundle file into your mod's folder, for example `bundles/models`.

Scripts are left out of bundles: the game cannot run a mod's `MonoBehaviour` from a bundle.

On load, materials take the game's shader of the same name, so use the game's shaders by name, such as `HDRP/Lit`.
A model's pivot is the item's origin.

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

## Animations

Clips and masks for [animations](../animations.md#a-mods-own-animations) are made on the game's own skeletons:

1. Start the game with Mjolnir once and load a world with villagers. Mjolnir writes each character's skeleton (bone
   names and bind pose, nothing else of the game) to `Mjolnir/rigs/<rig>.rig` as the character appears.
2. In the kit, run **Mjolnir → Import Rigs**. It reads them into `Assets/Mjolnir/Rigs/<rig>.prefab` (`aska` for the
   player, `peasant_male` and `peasant_female` for villagers), each with an Animator and a generic avatar, and makes
   Mjolnir's masks again. The kit finds the game's folder from `MJOLNIR_GAME_DIR`, a folder picked before, or Steam's
   records, and asks when it finds none. The imported folder is the game's, so it stays out of git.
3. Animate a rig in the Animation window, or give imported clips its avatar. Put the clips and masks into
   `Assets/Mods/<mod>/<bundle>/` and build the bundles as for models.

## Batch builds

`tools/build-bundles.ps1` in the repository runs the kit in batch mode and copies the examples' bundles into
`examples/<mod>/bundles/`. It finds Unity 6000.3.12f1 in Unity Hub's install folders; `-Unity <path>` or the
environment variable `MJOLNIR_UNITY` overrides that. Unity locks an open project: close the editor first, or build
from its menu and run the script with `-SkipBuild`.

:::note[Not done yet]
Models for buildings: a building is a network object, and a mod's building looks like its base for now.
:::
