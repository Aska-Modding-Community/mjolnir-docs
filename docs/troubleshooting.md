---
title: Troubleshooting
---

# Troubleshooting

## The log

`Mjolnir/LogOutput.log` in the game's folder holds the log of Mjolnir and every mod. It is appended to on each start
and never cleared: read from the last `Mjolnir.Native attached` line.

A healthy start logs, in order:

```text
[Info ] [Native] Mjolnir.Native attached to Aska.exe
[Info ] [Native] GameAssembly.dll loaded via LoadLibraryW("GameAssembly.dll")
[Info ] [Native] il2cpp_init detour installed
[Info ] [Core] Mjolnir.Core 0.4.0.0 on .NET 10.0.9
[Info ] [Interop] Initialising HarmonyX 2.16.1.0
[Info ] [Interop] Il2CppInterop started for Unity 6000.3.12 (503 ms)
[Info ] [Mods] Loaded My Mod (author.mymod) 1.0.0 in 12 ms     one line per mod, in load order
[Info ] [Mods] Mods loaded: 3 of 3
[Info ] [Native] Bootstrap.Start returned 0
[Info ] [PhaseB] Phase B started by Internal_ActiveSceneChanged, active scene '', frame 0 (497 ms)
```

Each line starts with its time, left out here. At the first start and after a game or Mjolnir update, `[Interop]`
lines in between report the interop generation and how long it took.

A mod's own lines carry its name: `[My Mod] …`. A mod that cannot load logs why:
`[Mods] <mod>: not loaded, <reason>`.

## Common problems

| What you see | Why, and what to do |
|---|---|
| No Mjolnir button in the menus, nothing in the log | `version.dll` is not next to `Aska.exe`, or the game was started with `--no-mods`, or `Mjolnir/disable` exists |
| The game starts without mods after the progress window | The interop generation failed or was stopped. It runs again at the next start; its log is `Mjolnir/cache/interop-gen.log` |
| A mod is "not loaded: …" in the Mods window | A dependency is missing, at a wrong version, or turned off. The reason names it |
| A mod is "disabled after an error" | It threw an exception. The log has the exception with its stack; report it to the mod's author |
| The progress window comes after every game update | Expected: the interop is generated once per game build |
| Warnings that the game build differs, after a game update | Mjolnir runs, but mods that patch the game directly may not fit the new build until they are updated |
| A setting changed in the file is back as it was | The game writes changed settings when it quits. Edit config files while the game is not running |
| "Unable to join the session" when joining a world | Your mods differ from the host's. The message lists the mods to turn on or off and the versions that differ; change them in the Mjolnir window and restart the game |
| The menu comes about two minutes late | The game waits for its online login before the main menu: the game's behavior, not Mjolnir's |
| The Mods window says another loader is installed | Two mod loaders cannot share one game. See [Another mod loader beside Mjolnir](#another-mod-loader-beside-mjolnir) |

## Another mod loader beside Mjolnir

Mjolnir and another mod loader cannot share one game. The engine loads both, but only one of them starts; the other
stops without a word of its own, and its mods simply do nothing. The game itself runs as usual — one side's mods are
just absent, with no error to find.

Mjolnir says so when it sees one: a line in `Mjolnir/LogOutput.log` and an amber line over the list in the Mods
window, naming what it found. It recognises BepInEx and Unity Doorstop (`winhttp.dll` with `doorstop_config.ini` or
`.doorstop_version` in the game's folder) and MelonLoader (its `MelonLoader` folder; its own `version.dll` is the
file Mjolnir ships, so Mjolnir has taken its place).

Keep one of the two:

- to keep Mjolnir, remove the other loader's files from the game's folder;
- to go back to the other loader, delete `version.dll`, which uninstalls Mjolnir, and reinstall it.

A mod manager may install a loader without asking: Vortex's ASKA extension installs BepInEx when it starts managing
the game, so a Mjolnir install can gain a second loader on its own.

## The game closes without a word in the log

A fatal error of the .NET runtime bypasses every handler. Look in the Windows event log: **Event Viewer → Windows
Logs → Application**, entries from `.NET Runtime` or `Application Error` at the time the game closed.

## Start without mods

To check whether a problem is Mjolnir's at all:

- launch with `--no-mods` (Steam: **ASKA → Properties → Launch options**), or
- create an empty file `Mjolnir/disable`,

then remove it. To rule out one mod, turn it off in the Mods window or move its folder out of `Mjolnir/Mods`.

## Reporting a problem

Open an issue on [GitHub](https://github.com/Aska-Modding-Community/Mjolnir/issues) with:

- `Mjolnir/LogOutput.log`, from the last `Mjolnir.Native attached` line;
- the Mjolnir version (the Mods window's title shows it) and the mods installed;
- whether it happens in single player, when hosting, or when joining.
