---
title: The mod kit
---

# The mod kit

`unity/Mjolnir.ModKit` in the repository is a Unity project for a mod's assets: item models, animations and masks,
built into AssetBundles for the game. It runs on the game's own Unity version, **6000.3.12f1**, with **HDRP** 17.3.0,
the game's render pipeline.

## Setting up

1. Install Unity **6000.3.12f1** through Unity Hub and open `unity/Mjolnir.ModKit` with it. The first import takes a
   while: HDRP compiles its shaders.
2. **Mjolnir → Kit Window** opens by itself the first time. It lists what the kit needs, each missing step with the
   button that fixes it: the right Unity version, HDRP in linear colour, the game found, Mjolnir installed in it, the
   game's skeletons imported. It also lists your mods and their bundles, and the kit's tools.

The kit sets HDRP on every quality level and the linear colour space as it opens (**Mjolnir → Set Up the Kit** does it
again), so colours and textures look as they will in the game. It finds the game from `MJOLNIR_GAME_DIR`, a folder
picked before, or Steam's records, and asks when it finds none.

## A mod's bundles

- **Mjolnir → New Mod…** makes `Assets/Mods/<mod>/<bundle>/`. Name the mod's folder as in the game's `Mjolnir/Mods`.
  Each bundle folder becomes one AssetBundle with everything in it.
- **Mjolnir → Build Bundles** builds them into `Build/Bundles/<mod>/<bundle>`. Each bundle is built under its mod's
  name, so two mods' bundles of one folder name, such as `models`, load in the game together. Rebuild bundles made
  by an older kit.
- **Mjolnir → Build and Copy to Game** also copies each bundle into `Mjolnir/Mods/<mod>/bundles/` of an installed mod,
  and rendered item icons into its `items/`. A file the running game keeps open is named instead of failing the build.
- **Mjolnir → Check Mods** warns of what will not work in the game: a shader that is not `HDRP/…`, a script on a
  prefab, a pivot away from its model, a clip's or a mask's bone that no skeleton of the game has, bundles the game
  would not load together. It also runs before
  every build. A click on its line in the Console shows the asset.

The asset tools are on the Project window's context menu too, under **Mjolnir**: Preview Animation, Render Item Icons,
New Mask from Clip and Keep Every Bone act on the selected asset.

`tools/build-bundles.ps1` in the repository runs the kit in batch mode. Unity locks an open project: close the editor
first, or build from its menu and run the script with `-SkipBuild`.

## The game's skeletons

Animations and masks are made on the game's own skeletons:

1. Start the game with Mjolnir once. It writes the characters' skeletons (bone names and their pose, nothing else of
   the game) to `Mjolnir/ModKit/rigs/`.
2. Run **Mjolnir → Rigs → Import from the Game**. It makes `Assets/Mjolnir/Rigs/<rig>.prefab`, each with an Animator
   and a generic avatar:

| Rig | Characters |
|---|---|
| `ragnar`, `aska` | The player's male and female characters |
| `peasant_male`, `peasant_female` | Villagers |

The bones' names are the same on all four, so a clip made on one plays on the others; their proportions differ.
`CharacterAnimator.Rig` names a character's skeleton in the game.

Two settings on Mjolnir's settings page in the game (the Mjolnir window's **Settings**) bring more of the game into the
kit. Both are off by default:

| Setting | What the game writes to `Mjolnir/ModKit` | In the kit |
|---|---|---|
| Characters' models for the kit | The people's meshes and their colour, normal and mask maps, about 160 MB | Import dresses the skeletons in them, the default hair and beard on |
| The game's animations for the kit | Every clip that moves the people's skeleton, some 730 | Preview Animation lists them to play on the characters |

What the game writes there is its own: it stays on your computer, out of git and out of every bundle.

**Mjolnir → Rigs → Export as FBX** writes each skeleton with a stick figure skinned to it into
`Build/Rigs/<rig>.fbx`, for animating in another program.

## Previewing animations

- **Mjolnir → Animation → Open Preview Stage** opens a stage with the game's characters standing at rest: a ground of
  metre squares, a sun and a sky.
- **Mjolnir → Animation → Preview Animation** plays a clip on them: Play, Pause, Stop, Loop, In place (root motion held
  over the spot), speed from ×0.1 to ×2, the time and frame. **Choose…** lists your mods' clips by mod and bundle and
  the game's by skeleton; it also follows the clip selected in the Project window. The scene is never changed.
- For a game clip, **Save as Asset** keeps a copy in the kit for the Animation window.

## Making animations

A clip for a mod comes one of three ways.

**In Unity.** Animate an imported skeleton in the Animation window.

**From Blender** (also the way for Maya, 3ds Max and Cascadeur; only Blender is checked):

1. **Mjolnir → Rigs → Export as FBX**.
2. In Blender, **File → Import → FBX** with its defaults. The skeleton's top bone `master` becomes the armature object:
   animate the bones in Pose mode, and move the armature object for root motion. One action is one clip, named after
   the action.
3. **File → Export → FBX** with its defaults into the mod's bundle folder.

The kit fits the file to the game's skeleton as it imports it, and the bundle takes the file's clips, each under its
action's name. Blender writes every bone, the untouched ones at rest; the kit leaves a bone that stays at rest all
through the clip to the game's own animation, so a clip that raises an arm moves only the arm and the character walks
under it. **Mjolnir → Animation → Keep Every Bone** on the file keeps them all, for a pose that must hold the rest.

**From Mixamo** or another humanoid source:

1. Download the animation as FBX, Without Skin, 30 fps, no keyframe reduction; for a walk, In Place off to keep its
   movement.
2. Put it into the mod's bundle folder. The kit sees a skeleton that is not the game's and makes the file a humanoid
   source: it stays out of the bundle, and its clip is named after the file.
3. **Mjolnir → Animation → Bake Humanoid Clips to Rig…** records it bone by bone on a game skeleton, with the feet kept
   on the ground by the clip's own foot targets. In Place leaves the forward movement out.

Mixamo's licence lets you use its animations in a game, not share the files: keep them out of a public repository.

## Masks

- **Mjolnir → Animation → New Mask from Clip** makes `<clip>Mask.mask` beside a clip: exactly the bones the clip moves.
  Played through it, the clip leaves every other bone to the game.
- **Mjolnir → Animation → New Mask…** makes an empty mask over the game's skeleton to fill by hand.

A mask's paths are the skeleton's from its root (`master/Bip001/…`). In the mod:

```csharp
ModAnimation wave = Animations.Add("wave", "bundles/anims", "Wave");             // the bundle, the clip's name
AnimationMask waveMask = AnimationMask.Add("wave", "bundles/anims", "WaveMask");  // New Mask from Clip
LocalPlayer.Animator.Play(wave, new AnimationOptions { Mask = waveMask });       // the arm waves, the player walks on
```

See [Animations](animations.md).

## The game's assets stay out

A mod plays the game's own clips by name (`Animations.Find("aska_wave")`) and never ships them. The kit refuses to
build a bundle that would take in a game clip or a copy of one, a character's model or skeleton, or anything labelled
as the game's, and Check Mods names it.
