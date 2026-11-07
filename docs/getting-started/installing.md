---
title: Installing
---

# Installing

Mjolnir installs into the game's folder and changes no game file. Removing one file uninstalls it.

## Install

1. Download `Mjolnir-<version>.zip` from the
   [releases](https://github.com/FibonacciFox/Mjolnir/releases). The `.sha256` file beside each archive checks the
   download.
2. Unpack it into the game's folder, the one with `Aska.exe`. In Steam: **ASKA → Manage → Browse local files**.
   The archive holds only `version.dll` and a `Mjolnir/` folder.
3. Start the game from Steam as usual.

At the first start Mjolnir generates the C# view of the game's code for your game build: about half a minute, under a
progress window. The game then starts by itself. This repeats after each game update and each Mjolnir update; other
starts skip it.

The progress window's button stops the generation and starts the game without mods. The generation runs again at the
next start.

## Add mods

Put each mod into a folder of its own under `Mjolnir/Mods/`:

```text
ASKA/
├─ Aska.exe
├─ version.dll
└─ Mjolnir/
   └─ Mods/
      ├─ SomeMod/
      │  └─ SomeMod.dll
      └─ AnotherMod/
         ├─ AnotherMod.dll
         └─ lang/
```

A mod loads after the mods it needs. A mod whose dependency is missing, or at a version it does not accept, is skipped;
the Mods window says why.

## The Mods window

**Main menu or pause menu → Mjolnir** lists the installed mods with their name, version, author and status. Each row
has:

- an **Off / On** selector, which applies from the next start (a note in the window's footer says a restart is
  needed);
- a **Settings** button, which opens the mod's settings page.

Turning off a mod that others need asks first. Turning on a mod whose dependencies are off offers to turn them on too.
The choice is saved in `Mjolnir/Config/mod-list.json`.

The **Settings** button in the window's footer opens Mjolnir's own settings: the interface scale of menus and of the
HUD, and the developer console's key.

## Files Mjolnir writes

| Path | What |
|---|---|
| `Mjolnir/LogOutput.log` | The log of Mjolnir and every mod, appended to on each start |
| `Mjolnir/Config/<mod id>.toml` | Each mod's settings |
| `Mjolnir/Config/mjolnir.toml` | Mjolnir's own settings |
| `Mjolnir/Config/mod-list.json` | The mods you turned off |
| `Mjolnir/interop/` | The generated view of the game's code, for this game build |
| `Mjolnir/rigs/` | The characters' skeletons, for the mod kit |
| `Mjolnir/cache/` | Hashes of the game's files and the generator's log |

## Start once without mods

- Add `--no-mods` to the game's launch options (Steam: **ASKA → Properties → Launch options**), or
- create an empty file `Mjolnir/disable`.

Remove the option or the file to get the mods back.

## Uninstall

Delete `version.dll` from the game's folder; the game then starts as if Mjolnir were never there. Delete `Mjolnir/`
too to remove the mods, their settings and the log.

:::note
To join a world, turn on the same mods as the host, at the same versions. Otherwise the game does not let you in and
the main menu lists which mods to turn on or off. Mods that change only your own game, such as the camera or the
interface, never count.
:::
