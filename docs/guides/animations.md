---
title: Animations
---

# Animations

`CharacterAnimator` plays animations on a character, the player's or a villager's alike: the game's own clips and
a mod's, over the character's own animation. It is in the main library, `Mjolnir.SDK`. The module
`Mjolnir.SDK.Animation` connects it to the game and adds animations and masks of a mod's own: reference
`Mjolnir.SDK.Animation.dll` and add `using Mjolnir.SDK.Animation;` for those.

```csharp
CharacterAnimator player = LocalPlayer.Animator;        // Mjolnir.SDK.Player
CharacterAnimator villager = Residents.All[0].Animator;  // Mjolnir.SDK.AI
```

An animator belongs to one character: take it again after a load. Without the character it is empty and plays nothing.

## Playing

```csharp
AnimationInfo? wave = Animations.Find("aska_wave");
if (wave != null)
    LocalPlayer.Animator.Play(wave, new AnimationOptions { Mask = AnimationMask.UpperBody });   // the legs walk on
```

`Animations.All` lists every clip: the game's by asset name (`aska_wave`, `peasant_male_walk`, `aska_dodge_front`…)
and the mods' by full name, `<mod id>.<name>`. `Animations.Find` takes either. The console's `anims <words>` lists
them. The game's clips are known once the game has loaded them, at its start: not yet in `OnLoad`, so look them up
when you play.

One animation plays at a time. A new one takes over and the previous fades out; the game's own animation goes on under
it and comes back as it ends.

| `AnimationOptions` | Default | What |
|---|---|---|
| `Loop` | `false` | Plays again and again until `Duration` or `Stop` |
| `Speed` | `1` | Playback speed, above 0 |
| `FadeIn`, `FadeOut` | 0.2 s | Blend in over the game's animation, and back out |
| `Duration` | the clip's length | How long it plays, fade out included; with `Loop`, until stopped |
| `Mask` | whole body | The bones it moves, such as `AnimationMask.UpperBody` |
| `RootMotion` | `false` | The clip moves the character through the game's movement, which keeps it to the ground and stops it at walls |
| `MoveSpeed` | 0 for the whole body, 1 with a mask | How much of the character's own walking goes through, from 0 to 1: the player's, or a villager's on its way |

`AnimationMask.UpperBody` is the spine, neck, head and arms; the pelvis and the legs keep the game's animation.

## The playback

`Play` returns an `AnimationPlayback`:

```csharp
AnimationInfo wave = Animations.Find("aska_wave")!;
AnimationPlayback playback = LocalPlayer.Animator.Play(wave, new AnimationOptions { Mask = AnimationMask.UpperBody })
                                         .At(System.TimeSpan.FromSeconds(0.5), () => Notify.Message("Hello"));
playback.Ended += (_, e) => Log.Info(e.WasStopped ? "Interrupted" : "Done");
```

| Member | What |
|---|---|
| `At(time, action)` | Runs the action when the clip reaches that time, at speed 1. A looping clip runs it on each round |
| `Ended` | Raised once when it played to its end or was stopped (`WasStopped`): by a mod, another animation, the character leaving |
| `IsPlaying`, `Time` | Whether it still plays (fading out counts), and how much of the clip has played |
| `Speed` | Read and changed while it plays |
| `Stop()`, `Dispose()` | Fade back to the game's animation |

`CharacterAnimator.Current` is the playback now, `Stop()` stops it. Called off the main thread, `Play` starts on the
next frame; events and `At` actions run on the main thread.

## Emotes and bones

- `PlayEmote(Emote.Sit | Wave | Cheer | Skal)` plays one of the game's emotes, as the emote wheel does. The game shows
  it to the other players. `false` without the character.
- `Bone(name)` gives a bone of the character's own skeleton, such as `Bip001 R Hand`, `Bip001 Head` or
  `Bone hand_weapon`, to put a mod's effect on. `null` without the character or such a bone.
- `Rig` names the skeleton, as the [mod kit](mod-kit.md#the-games-skeletons) does: `ragnar` or `aska` (the player's
  two characters), `peasant_male`, `peasant_female` (villagers). The bones' names are the same on all four, so a clip
  of one plays on the others; their proportions differ, so a clip made for the player may look a little off on a
  villager.

## Villagers

A whole-body animation holds a character where it is, the player and a villager alike; one through a mask lets it
walk. A villager's own mind goes on meanwhile: held on its way, it stands and then walks on; at work, it goes on working
under the animation. So:

- to take it from what it does for as long as wanted (bow, dance, cast where it stands), give it a job with a `Play`
  step. The job takes it by priority and gives it back after;
- for a short pause on its way, such as a bow to someone it meets, play a whole-body animation directly: it stops,
  plays and walks on;
- for a gesture without stopping, such as a wave while walking, play it through `AnimationMask.UpperBody`.

```csharp
Residents.AddJob("wave_back", priority: _ => 12f)
         .Play("aska_wave", duration: System.TimeSpan.FromSeconds(3));
```

`ResidentJob.Play(animation, options, duration)` takes an `AnimationInfo`, or a name looked up when the step starts, as jobs are made in `OnLoad`. The step is over when the animation ends, or when `duration` is up (a looping
animation plays until then). Another quest taking the villager stops it. See [Residents and jobs](residents.md).

## A mod's own animations

Clips are made on the game's skeletons in the [mod kit](mod-kit.md#making-animations), in Unity, Blender or from
Mixamo, and shipped in an AssetBundle. The game's own clips are played by name and never shipped.

```csharp title="BowMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Animation;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace BowMod;

[ModManifest("author.bow", "Bow", "1.0.0")]
public sealed class BowMod : Mod
{
    public override void OnLoad()
    {
        ModAnimation bow = Animations.Add("bow", "bundles/anims", "Bow");
        AnimationMask arms = AnimationMask.Add("arms", "bundles/anims", "Arms");

        HotKeys.Add(KeyGesture.Parse("F9"), () => LocalPlayer.Animator.Play(bow));
        HotKeys.Add(KeyGesture.Parse("F10"), () => LocalPlayer.Animator.Play(bow, new AnimationOptions { Mask = arms }));
    }
}
```

- `Animations.Add(name, bundle, asset)` adds the clip `asset` from the bundle file, relative to the mod's folder. The
  name is letters, digits and underscores; the full name is `<mod id>.<name>`. The clip loads at its first play.
- `AnimationMask.Add(name, bundle, asset)` adds an avatar mask whose paths are the game skeleton's from its root
  (`master/Bip001/…`); the kit makes them.
- Add both in `OnLoad`. Adding the same name again returns the one already added.

The example mod `Mjolnir.AnimationsExample` plays only the game's own clips: F9 raises a toast (`aska_idle_skal`) and
villagers within 12 m toast back through a job, F10 dodges forward with root motion (`aska_dodge_front`), F11 waves
while walking through the upper-body mask (`aska_wave`).

## Multiplayer

An animation played through `CharacterAnimator` is shown on the other players' machines where they run the same mod.
There the character's place comes from the network, so neither root motion nor the walking hold apply. Emotes go the
game's way: the character's owner plays them and the game shows them to everyone.

## Console

| Command | What |
|---|---|
| `anims [words]` | Lists the animations whose names contain the words |
| `anim <animation> [loop] [upper] [move] [villager]` | Plays an animation on the player, or on the nearest villager |
| `animstop [villager]` | Stops it |
| `emote <sit\|wave\|cheer\|skal> [villager]` | Plays one of the game's emotes |
