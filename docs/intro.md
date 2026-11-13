---
slug: /
title: Overview
sidebar_label: Overview
---

# Mjolnir

Mjolnir is a mod loader and C# SDK for **ASKA** (Unity 6000.3, IL2CPP, HDRP). Mods target .NET 10 and run on
CoreCLR inside the game process. The SDK exposes the game as C# events, bindable values and builders; HarmonyX covers
the rest.

:::note[Status: 0.x]
The public API can change between minor versions; the repository's `PublicAPI.*.txt` files declare every change.
Tested: single player, hosting a world, and the mod check between a host and a client on two machines.
:::

## Where to start

| You want to | Read |
|---|---|
| Play with mods | [Installing](getting-started/installing.md), then [Troubleshooting](troubleshooting.md) |
| Write your first mod | [Your first mod](getting-started/first-mod.md) |
| Understand what a mod is and when its code runs | [Mod lifecycle](concepts/lifecycle.md) |
| Give a mod settings or texts in the player's language | [Config](concepts/config.md), [Localization](concepts/localization.md) |
| Build windows, HUD elements or menu entries | [User interface](guides/ui/overview.md) |
| Add items, recipes or effects | [Items and recipes](guides/content/items-and-recipes.md) |
| Add weapons, armour or food | [Weapons, armour and food](guides/content/equipment.md) |
| Add buildings, and things to do at them | [Buildings](guides/content/buildings.md), [Interactions](guides/interactions.md) |
| Play animations on the player or villagers | [Animations](guides/animations.md) |
| Deal or change damage, follow deaths | [Combat](guides/combat.md) |
| Raise, level or paint the ground, and read what grows on it | [Terrain](guides/terrain.md) |
| Change the camera, or show one of the mod's own | [Camera](guides/camera.md) |
| Make models, animations and masks | [The mod kit](guides/mod-kit.md) |
| Send data between players | [Multiplayer](guides/network.md) |
| Know how the loader works | [Architecture](architecture.md) |
| Build Mjolnir itself | [Building from source](contributing/building.md) |

## The SDK

A mod references the main library `Mjolnir.SDK` and only the modules it uses, each its own assembly.

| Assembly | Namespace | What it gives |
|---|---|---|
| `Mjolnir.SDK` | `Mjolnir.SDK` | `Mod` and its lifecycle, manifests and dependencies, TOML config, localization, bindable values, the main-thread `Dispatcher`, character sheets, animators and combatants, console commands |
| `Mjolnir.SDK.UI` | `Mjolnir.SDK.UI` | Windows, dialogs, HUD elements and markers, notifications, menu entries, tabs in the game's own windows, hotkeys, controls cloned from the game's interface |
| `Mjolnir.SDK.Player` | `Mjolnir.SDK.Player` | The local player: spawn and death, health, stamina, food, water, warmth, stamina costs, position and teleport |
| `Mjolnir.SDK.Content` | `Mjolnir.SDK.Content` | Items, weapons, armour and food, recipes, buildings, status effects, models from AssetBundles, the item catalog |
| `Mjolnir.SDK.Animation` | `Mjolnir.SDK.Animation` | Animations and masks of a mod's own from its AssetBundle; connects `CharacterAnimator` to the game |
| `Mjolnir.SDK.Net` | `Mjolnir.SDK.Net` | The players of a session and message channels between their mods. Every session checks that a joining player's mods match the host's |
| `Mjolnir.SDK.AI` | `Mjolnir.SDK.AI` | The settlement's villagers, jobs of a mod's own, interactions at buildings for the player and villagers |
| `Mjolnir.SDK.World` | `Mjolnir.SDK.World` | The world's clock |
| `Mjolnir.SDK.Terrain` | `Mjolnir.SDK.Terrain` | The ground: its height, kind and biome, changes to it, snapshots and outlines, the world's trees and stones, the villagers' levelling fields |
| `Mjolnir.SDK.Camera` | `Mjolnir.SDK.Camera` | The player's camera: reading it, the screen and the world, modifiers of the game's cameras, cameras of a mod's own |
| `Mjolnir.SDK.Stats` | (none) | Connects `CharacterSheet` to the game; it has no public types |
| `Mjolnir.SDK.Combat` | (none) | Connects `Combatant` and `Combatants` to the game: blows before and after they land, deaths and their killer; it has no public types |

Module public signatures use only .NET, Unity and TextMeshPro types, never the game's. A game rename is fixed in the
SDK, and mods keep working.

## Examples

`examples/` in the repository holds complete mods, one area each:

| Mod | Shows |
|---|---|
| `Mjolnir.InfiniteStamina` | Config and raw Harmony patches |
| `Mjolnir.UiExample` | Every UI control, a window in MVVM style, menu levels, tabs in the game's windows, localization |
| `Mjolnir.PlayerExample` | HUD bars bound to the player's stats, cheaper stamina |
| `Mjolnir.ItemsExample` | Items with models of their own, recipes by hand and at a workshop, a building, a console command |
| `Mjolnir.StatsExample` | Experience and an effect of the mod's own |
| `Mjolnir.EquipmentExample` | A sword, a hood and a cake of the mod's own: damage, armour and effects |
| `Mjolnir.VillagersExample` | A job villagers take |
| `Mjolnir.AltarExample` | A building of its own: a model, a build menu tab, levelled ground, supplies, and a prayer the player says at it |
| `Mjolnir.AnimationsExample` | The game's clips on the player and villagers: root motion, the upper-body mask, a job |
| `Mjolnir.CheatInventory` | The item catalog in a searchable window |
