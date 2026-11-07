---
title: Building from source
---

# Building from source

## Requirements

- Windows with ASKA installed through Steam;
- the .NET 10 SDK;
- Visual Studio or its Build Tools with the C++ x64 compiler (MSVC) and CMake, for the native proxy;
- for models only: Unity 6000.3.12f1 through Unity Hub.

The scripts find the game in your Steam libraries, and Unity 6000.3.12f1 in Unity Hub's install folders, by themselves
(`tools/locations.ps1`). To point them elsewhere, pass `-GameDir` (`deploy.ps1`, `gen-interop.ps1`) or `-Unity`
(`build-bundles.ps1`), or set `MJOLNIR_GAME_DIR` / `MJOLNIR_UNITY` once for all of them.

## The layout

| Path | Contents |
|---|---|
| `src/Mjolnir.Native` | The proxy DLL (C++, CMake, MinHook) |
| `src/Mjolnir.Core` | The runtime |
| `src/Mjolnir.SDK`, `src/Mjolnir.SDK.*` | The SDK's main library and its modules |
| `tests/` | Unit tests, one project per assembly, and test mods that run in the game |
| `examples/` | Example mods |
| `tools/` | Build, deploy and packaging scripts, the interop generator, a code map of the game's binary |
| `unity/Mjolnir.ModKit` | The Unity project for mods' AssetBundles |

`Mjolnir.slnx` groups the projects by module, with every test project in one `tests` folder.

## Interop for compiling

The projects compile against interop assemblies generated from your copy of the game into `build/interop`. Generate
them once, and again after a game update:

```bash
powershell -File tools/gen-interop.ps1
```

It reads the Unity version from the game, downloads the matching Unity base libraries once into `build/unity-libs`,
builds the generator in `tools/Mjolnir.InteropGen` and runs it. The game's folder is not touched.

## Build and install into the game

```bash
powershell -File tools/deploy.ps1 -Examples
```

`deploy.ps1` builds the native proxy, Core, the SDK with its modules and the interop generator, and copies them into
the game: `version.dll`, `Mjolnir/core`, `Mjolnir/interopgen` and a private .NET runtime in `Mjolnir/dotnet`. The
game generates its own `Mjolnir/interop` at its next start. Configs in `Mjolnir/Config` are kept.

| Flag | What |
|---|---|
| `-Examples` | Also builds and installs the example mods; without it their folders are removed from the game |
| `-SmokeMod`, `-UiLab` | The same for the test mods |
| `-SkipBuild` | Installs the outputs already built |
| `-Uninstall` | Removes only `version.dll` |

The native proxy alone builds with `tools/build-native.cmd x64-release`, which sets up the compiler's environment
itself.

## Tests

```bash
dotnet test tests/Mjolnir.Core.Tests
```

There is one unit-test project per assembly under `tests/`, and none needs the game. Everything else is checked in the
game, with the test mods and `Mjolnir/LogOutput.log`.

## The public API

Every SDK assembly declares its public API in `PublicAPI.Shipped.txt` and `PublicAPI.Unshipped.txt` next to its
project. A public member that is not declared is a build warning. Declare additions in `PublicAPI.Unshipped.txt`, and
record a removed or renamed shipped member there with a `*REMOVED*` line. A release moves the unshipped lines into the
shipped file.

The SDK's own tests also check that no public signature exposes a game or Core type, and that every event follows the
[event convention](../concepts/bindables-and-events.md#the-event-convention).

## Packaging a release

```bash
powershell -File tools/package.ps1
```

It builds everything in Release and writes `artifacts/package/Mjolnir-<version>.zip` with its `.sha256`. The archive's
root holds only `version.dll` and `Mjolnir/` (`core`, `interopgen`, `dotnet`, an empty `Mods`, `licenses`, the license
and a README). Never in it: the interop assemblies, the test mods, the examples, configs or logs. Every third-party
component's license goes into `Mjolnir/licenses`, with `THIRD-PARTY-NOTICES.txt` listing them; a package without a
license or a known source stops the script.

## The documentation site

This documentation lives in its own repository,
[mjolnir-docs](https://github.com/Aska-Modding-Community/mjolnir-docs): Markdown pages in `docs/`, readable on GitHub as
they are, and a Docusaurus site around them.

```bash
npm install
npm start
```

`npm run build` writes the static site to `build/`.

## License

Mjolnir is MIT-licensed. Its dependencies keep their own licenses, listed in the release archive.
