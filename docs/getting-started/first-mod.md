---
title: Your first mod
---

# Your first mod

A mod is a `net10.0` class library compiled against the files of an installed Mjolnir. The one below makes sprinting
cheaper, with a setting the player changes in the game.

## What you need

- ASKA with Mjolnir [installed](installing.md), started once, so that `Mjolnir/interop/` exists;
- the [.NET 10 SDK](https://dotnet.microsoft.com/download);
- any C# editor: Visual Studio, Rider or VS Code.

## The project

Create a class library and replace its `.csproj`:

```bash
dotnet new classlib -n MyFirstMod -f net10.0
```

```xml title="MyFirstMod.csproj"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <Version>1.0.0</Version>
    <!-- The game's folder: change it if your Steam library is elsewhere. -->
    <AskaDir>C:\Program Files (x86)\Steam\steamapps\common\ASKA</AskaDir>
    <MjolnirDir>$(AskaDir)\Mjolnir</MjolnirDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Always: the SDK, the runtime its Mod type implements, and the engine types its callbacks use. -->
    <Reference Include="$(MjolnirDir)\core\Mjolnir.Core.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\interop\Il2Cppmscorlib.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\interop\UnityEngine.CoreModule.dll" Private="false" />
    <!-- The modules this mod uses. -->
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.Player.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.UI.dll" Private="false" />
  </ItemGroup>

  <!-- After each build, copy the mod into the game. -->
  <Target Name="InstallMod" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(MjolnirDir)\Mods\$(AssemblyName)" />
  </Target>

</Project>
```

`Private="false"` keeps those files out of your output: the game has them, and a copy in a mod's folder is ignored. The
mod ships only its own `.dll`.

Each SDK assembly ships its XML documentation, so the editor shows what every member does.

## The mod class

Delete `Class1.cs` and add:

```csharp title="MyFirstMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Config;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace MyFirstMod;

[ModManifest("author.myfirstmod", "My First Mod", "1.0.0", Description = "Cheaper sprinting.", Author = "Author")]
public sealed class MyFirstMod : Mod
{
    public override void OnLoad()
    {
        ConfigEntry<float> cost = Config.Bind("Stamina", "CostMultiplier", 0.5f, "Part of the game's stamina cost.")
                                        .WithRange(0f, 1f)
                                        .WithDisplayName("Stamina cost");

        LocalPlayer.Stamina.Draining += (_, e) => e.Amount *= cost.Value;
        LocalPlayer.Spawned += (_, _) => Notify.Message($"Stamina costs {cost.Value:P0}");
        Log.Info("Loaded");
    }
}
```

- `[ModManifest]` gives the mod its id, name and version. The id names its config file and seeds its content ids: never
  change it after release. `Platform = ">=0.4 <0.5"` says which Mjolnir versions the mod works with; see
  [the manifest](../concepts/lifecycle.md#the-manifest).
- `OnLoad` runs once, before the game's engine is up: the place for settings, event subscriptions and content. See
  [Mod lifecycle](../concepts/lifecycle.md).
- `Config.Bind` declares a setting, saved to `Mjolnir/Config/author.myfirstmod.toml`. With a range, the Mods window
  shows it as a slider.
- `LocalPlayer.Stamina.Draining` is raised before each stamina cost of the local player. A handler changes the amount
  or cancels it.
- `Log` writes to `Mjolnir/LogOutput.log`, each line prefixed with the mod's name.

## Build and run

```bash
dotnet build
```

The build copies `MyFirstMod.dll` to `Mjolnir/Mods/MyFirstMod/`. Start the game from Steam and look in
`Mjolnir/LogOutput.log`:

```text
[2026-11-07 12:00:01.250] [Info ] [Mods] Loaded My First Mod (author.myfirstmod) 1.0.0 in 3 ms
[2026-11-07 12:00:01.251] [Info ] [My First Mod] Loaded
```

Open **Mjolnir** in the main menu: the mod is in the list, and its **Settings** page has the slider.

Build with the game closed: a running game keeps the mod's file open, and mods are never reloaded while it runs.

## Next

- [Mod lifecycle](../concepts/lifecycle.md): every callback, the manifest, dependencies and what may run when.
- [Config](../concepts/config.md) and [Localization](../concepts/localization.md).
- The guides, starting with [User interface](../guides/ui/overview.md).
