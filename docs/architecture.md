---
title: Architecture
---

# Architecture

Mjolnir has three parts: a native proxy that gets it into the game process, a closed .NET runtime that loads mods,
and the SDK, the only API mods see.

```text
Aska.exe
 └─ UnityPlayer.dll ── imports ──► version.dll            Mjolnir.Native (C++): a proxy of the system library
                                    │ detours il2cpp_init
                                    ▼
                                  CoreCLR (Mjolnir/dotnet)
                                    │
                                    ▼
                                  Mjolnir.Core             closed runtime: interop, Harmony, mod loading, fault isolation
                                    │ loads mods through internal contracts
                                    ▼
                                  Mjolnir.SDK + modules    the only API mods see
                                    │
                                    ▼
                                  Mjolnir/Mods/<mod>/*.dll
```

## The boot chain

1. **The proxy is loaded.** `UnityPlayer.dll` imports `version.dll`, which is not one of Windows' known DLLs, so the
   copy in the game's folder is loaded first. It forwards every real `version.dll` export to the system's copy. It
   does nothing in any process other than `Aska.exe`, and nothing when the game is started with `--no-mods` or a file
   `Mjolnir/disable` exists.
2. **It waits for the game's runtime.** Under Windows' loader lock the proxy only patches `UnityPlayer.dll`'s imports
   of `LoadLibrary*` and `GetProcAddress`. When Unity loads `GameAssembly.dll`, the proxy resolves `il2cpp_init` by
   name and detours it. No native address is hardcoded.
3. **.NET starts.** After the game's own `il2cpp_init` returns, the detour starts CoreCLR from Mjolnir's private
   .NET 10 in `Mjolnir/dotnet` and calls Core.
4. **Core prepares the game's interop** (below), starts Il2CppInterop and HarmonyX, and loads the mods.
5. **Phase B** starts at the engine's first scene callback. Core registers its own component with the game's runtime
   and pumps the game's frame events to the SDK and the mods.

Any failure along the way is logged to `Mjolnir/LogOutput.log`, and the game continues without mods: a loader failure
must never take the game down. The game's executable is never touched: everything goes through `UnityPlayer.dll`,
`version.dll` and `GameAssembly.dll`, and the game is always started through Steam.

## Two phases

| Phase | When | Allowed |
|---|---|---|
| A | Inside `il2cpp_init`, before the engine is up | Logging, config, interop, Harmony patches, registrations: the mods' `OnLoad` |
| B | From the engine's first scene callback, about 1.5 s later | Unity objects, from `OnGameReady` on, then the per-frame callbacks |

What this means for a mod: [Mod lifecycle](concepts/lifecycle.md#two-phases).

## Interop assemblies

IL2CPP compiles the game to native code, so there are no .NET assemblies of its code to reference. Its metadata keeps
every name, unencrypted. From it a generator (Cpp2IL and Il2CppInterop's generator) makes **interop assemblies**: .NET
assemblies whose types and methods call into the native game by name.

They are generated on the player's machine, never shipped:

- Core keeps a stamp in `Mjolnir/interop/mjolnir-interop.json`: the game's build (hashes of `GameAssembly.dll` and
  `global-metadata.dat`), the Il2CppInterop runtime's version and the generator's.
- When the stamp differs (at the first start, after a game update, after a Mjolnir update), Core runs the generator,
  `Mjolnir/interopgen`, as a separate process with a progress window, before anything else loads, and waits. It takes
  about 30 seconds; the memory it uses is the generator's, not the game's.
- The output goes into a new folder that takes the old one's place only when complete. A failure, or the player's
  **Start without mods**, keeps the old folder, runs the game without mods and tries again at the next start. The
  generator's log is `Mjolnir/cache/interop-gen.log`.

## Loading mods

- Each first-level folder in `Mjolnir/Mods` is loaded into its own `AssemblyLoadContext`, for dependency resolution.
  Native DLLs are skipped.
- Anything present in `Mjolnir/core` (Core, the SDK, Il2CppInterop, HarmonyX…) or `Mjolnir/interop` always resolves
  from the one shared context, so every mod sees the same platform and game types. A copy of such an assembly in a
  mod's folder is ignored.
- Core finds each mod's entry class and reads its manifest from metadata, so scanning never runs the mod's unrelated
  attributes.
- The dependency graph is resolved and sorted (see [Dependencies](concepts/lifecycle.md#dependencies)), and the mods
  the player turned off are skipped with their dependents.
- Each mod is constructed and its `OnLoad` called, in order. Then the SDK subscribes the callbacks it overrides to the
  game's frame events.
- Mods are never unloaded: Harmony patches and types injected into the game's runtime cannot be reliably reverted.

## Fault isolation

Every call into mod code goes through one path in Core. An exception there disables the mod that threw: its callbacks
and handlers are no longer called; its Harmony patches stay. Mjolnir's own code is never disabled. The SDK calls mods'
event handlers, commands, jobs and bindings through the same path, so a mod that throws inside an SDK event disables
itself, never the SDK.

## Core and the SDK

| Assembly | Role | References |
|---|---|---|
| `Mjolnir.Core` | Bootstrap, interop, Harmony, scanning, dependency resolution, isolation. Closed: mods never use its API | the engine's `Il2Cppmscorlib` and `UnityEngine.CoreModule` only |
| `Mjolnir.SDK` | The main library: `Mod`, manifests, config, localization, bindables, the dispatcher, character sheets, the console | Core |
| `Mjolnir.SDK.<Area>` | One module per area of the game: UI, Player, Content, AI, World, Stats | the main library and the game's interop |

- Modules reach Core only through the main library, and never each other. What every module needs (threads,
  localization, character sheets, the console's registry) lives in the main library.
- The SDK finds its modules by an assembly attribute and starts each once, so the Mods window exists even when no mod
  is loaded.
- A module's public signatures use only .NET, Unity and TextMeshPro types. When the game renames something, the
  module changes and mods keep working.
- Each SDK assembly declares its public API in `PublicAPI.Shipped.txt` and `PublicAPI.Unshipped.txt`, so every
  addition and every breaking change is on record.
- SDK modules patch the game with hidden Harmony patches of their own and raise plain C# events. Mods keep raw
  HarmonyX for anything the SDK does not cover.

## Content ids

Ids of what mods add (items, recipes, buildings, effects) are hashes of the mod's id and the content's name, never
derived from load order. They are the same on every machine and every start, as saves and multiplayer require.

## Multiplayer

The game's networking is Photon Fusion. Mjolnir is tested in single player and when hosting a world. Not done yet:

- clients joining a host with mods;
- the mod-compatibility handshake, which will compare the mods of a host and a client, using each mod's `Network`
  declaration;
- messages of a mod's own between peers.
