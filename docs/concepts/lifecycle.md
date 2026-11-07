---
title: Mod lifecycle
---

# Mod lifecycle

A mod assembly contains exactly one non-abstract class that derives from `Mod`, carries a `[ModManifest]` and has a
public parameterless constructor. Mjolnir creates that class and calls its virtual methods. An assembly without such a
class is a library: it can sit in a mod's folder and be referenced by the mod.

## The manifest

```csharp
[ModManifest("author.mymod", "My Mod", "1.2.0",
             Description = "What it does, in one line.",
             Author = "Author",
             Network = NetworkCompatibility.Everyone,
             Icon = "art/icon.png")]
[ModDependency("author.library", ">=1.0 <2.0")]
[ModDependency("author.extras", "*", Optional = true)]
public sealed class MyMod : Mod
{
}
```

| Field | Meaning |
|---|---|
| id | The mod's stable identity: its config file's name, what other mods depend on, the seed of its content ids. Letters, digits, `.`, `_` and `-`, starting with a letter or digit, compared without case. `author.mod` by convention. `mjolnir` is reserved |
| name | What the player sees. An empty name falls back to the id |
| version | `Major[.Minor[.Patch[.Revision]]]`. A `-prerelease` or `+build` suffix is allowed and ignored when comparing |
| `Description` | One line under the mod's name in the Mods window |
| `Author` | Shown next to the version |
| `Network` | Who needs the mod in multiplayer: `Everyone` (the default), `ClientOnly` or `ServerOnly` |
| `Icon` | A PNG or JPG relative to the folder of the mod's `.dll`. Without it, an `icon.png` there is used. Without that, the window shows the name's first letter |

A mod with an invalid id or version is not loaded; the log gives the reason.

:::note
Every multiplayer session compares the `Everyone` mods of a joining client with the host's. See
[Multiplayer](../guides/network.md#the-mod-check).
:::

### Dependencies

`[ModDependency(id, versionRange)]` loads your mod after the other one, and not at all without it.

- A range is a list of bounds that must all hold, separated by spaces or commas: `>=`, `>`, `<=`, `<`, `=`.
- A bare version is a minimum: `"1.2"` means `>=1.2.0`.
- `*` or an empty range accepts any version. Missing components count as 0.
- `Optional = true` loads your mod without the other one. When the other one is present, your mod loads after it,
  and its version must still be in the range.

A mod is not loaded when a required dependency is missing, turned off by the player, or itself not loaded, or when any
dependency that is present is outside its range. The rule applies down the whole chain; mods in a dependency cycle are
skipped too. Each skip is logged with its reason and shown in the Mods window.

Mods are sorted topologically, ties by id, so the order is the same on every start. Of two mods with one id, the first
found wins.

`ModRegistry` lists the loaded mods:

```csharp
if (ModRegistry.TryGet("author.extras", out ModManifest extras))
    Log.Info($"Extras {extras.VersionText} is here");
```

## Callbacks

| Callback | When | Typical use |
|---|---|---|
| constructor, `OnLoad()` | Once, at startup, in dependency order | Config, Harmony patches, event subscriptions, content registration |
| `OnGameReady()` | Once, when the engine is up | Anything that needs Unity objects: textures, sprites, windows made ahead |
| `OnSceneLoaded(scene, mode)` | Each scene load: the loader scene, the main menu, each world | Reacting to a world being loaded |
| `OnUpdate()` | Every frame | Per-frame work |
| `OnLateUpdate()` | Every frame, after all `Update`s | Following something that moved this frame |
| `OnFixedUpdate()` | Every physics step | Physics |

Only overridden callbacks are subscribed: a callback you do not override costs nothing.

```csharp title="LifecycleMod.cs"
using Mjolnir.SDK;
using UnityEngine.SceneManagement;

namespace LifecycleMod;

[ModManifest("author.lifecycle", "Lifecycle", "1.0.0")]
public sealed class LifecycleMod : Mod
{
    public override void OnLoad() => Log.Info("Phase A: no Unity objects yet");

    public override void OnGameReady() => Log.Info("Phase B: the engine is up");

    public override void OnSceneLoaded(Scene scene, LoadSceneMode mode) => Log.Info($"Scene {scene.name}");
}
```

## Two phases

The engine starts after `OnLoad` runs.

| Phase | When | Allowed |
|---|---|---|
| A | Inside the game's runtime start, before the Unity engine is up. The constructor and `OnLoad` run here | Logging, config, Harmony patches, registering things. **No Unity objects** |
| B | From the engine's first scene callback, about a second and a half later | Everything. `OnGameReady` marks the start, then the per-frame callbacks run |

Whatever the SDK registers in phase A waits for the game by itself: HUD elements, menu entries, tabs, items, recipes,
jobs, console commands. A texture, a sprite or a `GameObject` cannot be created in phase A: build windows that need
pictures on first use, or in `OnGameReady`.

## What every mod has

| Member | What |
|---|---|
| `Manifest` | Its id, name, version, dependencies, the path of its `.dll` (`Location`) and whether it was disabled after an error (`IsDisabled`) |
| `Log` | `Debug`, `Info`, `Warn`, `Error`, written to `Mjolnir/LogOutput.log` with the mod's name as prefix |
| `Config` | Its settings file, created on first use. See [Config](config.md) |
| `Harmony` | A HarmonyX instance whose id is the mod's id, created on first use. See [Harmony patches](harmony.md) |

All four work in the constructor: Mjolnir injects them before constructing the mod.

## Faults

An exception from any callback, or from a handler the mod gave the SDK (an event, a command, a job), disables that
mod only:

- its callbacks and handlers stop being called;
- it is marked in the Mods window as disabled after an error, and the exception is in the log;
- its Harmony patches stay, because they cannot be reliably undone.

The game and the other mods keep running. Mjolnir itself is never disabled this way.

## The mod's folder

```text
Mjolnir/Mods/MyMod/
├─ MyMod.dll        the mod, and any libraries it brings
├─ icon.png         its picture in the Mods window
├─ lang/            texts in the player's language: english.toml, russian.toml…
├─ items/           pictures of its items and effects (PNG)
└─ bundles/         its AssetBundles (models)
```

Each first-level folder in `Mjolnir/Mods` gets its own assembly load context, so two mods can bring different
versions of one library. Mjolnir's assemblies and the game's interop always come from one shared copy, whatever a
mod's folder holds, so mods can pass game objects and SDK types to one another.

Mods are never unloaded while the game runs. Turning a mod off in the Mods window applies from the next start.
