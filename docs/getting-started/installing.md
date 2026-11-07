---
title: Installing
---

# Installing

Mjolnir installs into the game's folder and changes no game file. Removing one file uninstalls it.

## Install

1. Download `Mjolnir-<version>.zip` from the
   [releases](https://github.com/FibonacciFox/Mjolnir/releases). Each archive has a `.sha256` file beside it if you
   want to check the download.
2. Unpack it into the game's folder, the one with `Aska.exe`. In Steam: **ASKA → Manage → Browse local files**.
   The archive holds only `version.dll` and a `Mjolnir/` folder.
3. Start the game from Steam as usual.

At the first start Mjolnir generates the C# view of the game's code for your game build. A progress window shows it,
and it takes about half a minute. The game then starts by itself. The same happens after each game update and after
each Mjolnir update, and every other start skips it.

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

Mods that need other mods are loaded after them. A mod with a missing dependency, or one at a version it does not
accept, is skipped, and the Mods window says why.

## The Mods window

**Main menu or pause menu → Mjolnir** opens the list of installed mods: each mod's name, version, author and status.
Its row has:

- an **Off / On** selector, which applies from the next start (a note in the window's footer says a restart is
  needed);
- a **Settings** button, which opens the mod's settings page.

When you turn off a mod that others need, the window asks first. When you turn on a mod whose dependencies are off, it
offers to turn them on too. The choice is saved in `Mjolnir/Config/mod-list.json`.

The window's **Settings** button, in the footer, opens Mjolnir's own settings: the interface scale of menus and of the
HUD, and the developer console's key.

## Files Mjolnir writes

| Path | What |
|---|---|
| `Mjolnir/LogOutput.log` | The log of Mjolnir and every mod. It is appended to on each start |
| `Mjolnir/Config/<mod id>.toml` | Each mod's settings |
| `Mjolnir/Config/mjolnir.toml` | Mjolnir's own settings |
| `Mjolnir/Config/mod-list.json` | The mods you turned off |
| `Mjolnir/interop/` | The generated view of the game's code, for this game build |
| `Mjolnir/cache/` | Hashes of the game's files and the generator's log |

## Start once without mods

- Add `--no-mods` to the game's launch options (Steam: **ASKA → Properties → Launch options**), or
- create an empty file `Mjolnir/disable`.

Remove the option or the file to get the mods back.

## Uninstall

Delete `version.dll` from the game's folder. The game then starts as if Mjolnir were never there. Delete the
`Mjolnir/` folder too if you no longer want the mods, their settings and the log.

:::note
Multiplayer with mods is tested only when you host a world. Joining someone else's world while mods are on is not
supported yet.
:::
