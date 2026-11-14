---
title: Coming from BepInEx
---

# Coming from BepInEx

Mjolnir is a loader of its own, with its own runtime and its own API: a BepInEx plugin does not run under Mjolnir, and
a Mjolnir mod does not run under BepInEx. Most of what you know carries over — the same C#, the same Harmony — and
porting a plugin is mostly deleting code: what it had to patch for itself, the SDK already has.

## What stays the same

- C# compiled against the game, running on CoreCLR inside the game's process, with Il2CppInterop wrappers over the
  IL2CPP types.
- [HarmonyX](https://github.com/BepInEx/HarmonyX): the same `[HarmonyPatch]` attributes, prefixes and postfixes, the
  same `PatchAll()`. See [Harmony patches](../concepts/harmony.md).
- One assembly per mod, its settings in a file, its lines in a shared log.

## What changes

| | BepInEx 6 IL2CPP | Mjolnir |
|---|---|---|
| Gets into the process | `winhttp.dll` and Doorstop | `version.dll` beside `Aska.exe`; `il2cpp_init` is resolved by name, no address is hardcoded |
| Runtime | .NET 6 | .NET 10, private, in `Mjolnir/dotnet` |
| The game's C# view | `BepInEx/interop`, generated at the first start | `Mjolnir/interop`, generated for the game's build and again after each game update |
| Where a mod goes | `BepInEx/plugins` | `Mjolnir/Mods/<mod>/`, each in a load context of its own |
| Entry point | `[BepInPlugin]` on a `BasePlugin`, `Load()` | `[ModManifest]` on a `Mod`, `OnLoad()` and then the lifecycle callbacks |
| Unity objects | yours to inject and hold | `OnGameReady` and the frame callbacks, after the engine is up |
| Settings | `Config.Bind(section, key, value, description)` | the same call, plus a range and a display name; the in-game window edits it |
| Log | `Log.LogInfo(...)` | `Log.Info(...)` |
| The game's own types | patched by each mod for itself | an SDK facade per area; a game rename is fixed there, not in mods |

## What the platform adds

- **Fault isolation.** Every call into a mod goes through the platform: the first exception disables that mod alone,
  its dependents are not loaded, and the game and the other mods carry on. A loader failure never takes the game down
  — it is logged and the game starts without mods.
- **Mods are declared, not guessed.** A manifest gives a mod its id, version and dependencies with version ranges;
  they are resolved and ordered before anything loads, and every skip is logged with its reason.
- **An API instead of the game's internals.** The [SDK](../intro.md#the-sdk) covers the player, the interface,
  content, villagers, combat, animations, the world's clock, the terrain, the camera and the network. Its public
  signatures use only .NET, Unity and TextMeshPro types, so a game rename is absorbed in the SDK and mods keep
  working.
- **Multiplayer that knows about mods.** A joining player's mods are checked against the host's, and mods talk over
  [channels](../guides/network.md) of their own. Content ids are derived from the mod's id and the content's name, so
  they match on every machine.
- **One window for the player.** Mods are listed, turned on and off, and configured in the game's own menu, from the
  settings a mod declared: no separate configuration plugin.
- **The player's language.** Mod strings and overrides of the game's own texts go through
  [localization](../concepts/localization.md).

## Porting a plugin

```csharp title="BepInEx plugin"
[BepInPlugin("author.lightfoot", "Lightfoot", "1.0.0")]
public class Plugin : BasePlugin
{
    public override void Load()
    {
        var cost = Config.Bind("Stamina", "CostMultiplier", 0.5f, "Part of the game's stamina cost.");
        new Harmony("author.lightfoot").PatchAll();
        Log.LogInfo("Loaded");
    }
}
```

```csharp title="Mjolnir mod"
[ModManifest("author.lightfoot", "Lightfoot", "1.0.0")]
public sealed class Lightfoot : Mod
{
    public override void OnLoad()
    {
        ConfigEntry<float> cost = Config.Bind("Stamina", "CostMultiplier", 0.5f, "Part of the game's stamina cost.")
                                        .WithRange(0f, 1f);

        // The patch this plugin carried is an event here.
        LocalPlayer.Stamina.Draining += (_, e) => e.Amount *= cost.Value;
        Log.Info("Loaded");
    }
}
```

Step by step:

1. **The project.** A `net10.0` class library referencing the files of an installed Mjolnir, not the BepInEx packages:
   [Your first mod](first-mod.md) has the `.csproj`.
2. **The class.** `BasePlugin` becomes [`Mod`](../concepts/lifecycle.md), `[BepInPlugin]` becomes `[ModManifest]`, and
   `Load()` becomes `OnLoad()`. Keep the same id: it names the config file and seeds the mod's content ids.
3. **Unity work moves out of `OnLoad`.** `OnLoad` runs before the engine is up. Anything that touches a `GameObject`
   belongs in `OnGameReady`, `OnSceneLoaded` or the frame callbacks; work from another thread goes through the
   [dispatcher](../concepts/threading.md).
4. **Settings.** `Config.Bind` keeps its shape and writes `Mjolnir/Config/<mod id>.toml`. Add `WithRange` and
   `WithDisplayName` and the setting becomes a slider in the Mods window.
5. **Drop the patches the SDK covers.** The player's vitals and stamina costs, the interface, items, recipes,
   buildings, villagers and their jobs, combat, animations, the camera and the terrain are facades with events: see
   the guides. Raw Harmony stays available through `Mod.Harmony` for everything else.
6. **Multiplayer.** A mod is `ClientOnly` until it says otherwise, and one that adds content of its own is raised to
   `Everyone`: a session with mismatched mods is then refused with a list of what differs, instead of breaking
   later. Declare the mod's [compatibility](../guides/network.md) yourself for anything else every player must have.
7. **Ship it.** One folder under `Mjolnir/Mods/`, holding the mod's `.dll` and its own files. Nothing of the
   platform is copied there: a copy of an SDK assembly in a mod's folder is ignored.

## One loader at a time

Mjolnir and BepInEx each start their own .NET runtime and their own Il2CppInterop in the game's process. The two have
not been tested together, so install one at a time: to go back to BepInEx, delete `version.dll`; to start without
either loader, launch the game with `--no-mods`.

## What BepInEx still gives you

BepInEx runs on hundreds of games and is installed by mod managers such as Thunderstore Mod Manager and r2modman.
Mjolnir is for ASKA alone, is installed by unpacking an archive into the game's folder, and its ecosystem is as old
as this documentation. Pick it for what the platform adds, not because a plugin cannot be written without it.
