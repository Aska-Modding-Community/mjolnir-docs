---
title: Interactions
---

# Interactions

An interaction is something the player does at a building, as at the game's own well or house: the game's prompt
`E <text>` beside the building's own, the interact key held for a moment. Villagers use interactions in a
[job](residents.md). The mod's code runs when one is used. Interactions are in `Mjolnir.SDK.AI`: reference
`Mjolnir.SDK.AI.dll` and add `using Mjolnir.SDK.AI;`.

## On every building of a kind

`Interactions.AddToBuildings(building, name, setUp)` gives each building of a kind its own interaction as it stands up
in the world, built or loaded with a save. `building` is an asset name: a [mod's building](content/buildings.md)
`AssetName`, or a game structure such as `Item_Structures_WaterWellL1`. `setUp` settles each one on the main thread.

```csharp title="AltarMod.cs"
using System;
using Mjolnir.SDK;
using Mjolnir.SDK.AI;
using Mjolnir.SDK.Content;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace AltarMod;

[ModManifest("author.altar", "Altar", "1.0.0")]
public sealed class AltarMod : Mod
{
    public override void OnLoad()
    {
        ModBuilding altar = Buildings.Add("altar", icon: "items/altar.png")
                                     .WithModel("bundles/models", "Altar")
                                     .Needs("Item_Stone_Raw", 4);

        Interactions.AddToBuildings(altar.AssetName, "altar", a =>
        {
            a.WithText(Localization.Get("altar.pray")).WithHoldTime(TimeSpan.FromSeconds(1.5));
            a.Used += Prayed;
        });
    }

    private void Prayed(object? sender, InteractionUsedEventArgs e)
    {
        if (!e.IsPlayer) return;
        LocalPlayer.Stamina.Value = LocalPlayer.Stamina.Maximum;
        Notify.Message(Localization.Get("altar.prayed"));
    }
}
```

The player sees the building's card, its name and description, with the mod's prompt beside the building's own menu.
The prompt shows once the building is finished.

`Interactions.Add(gameObject, name)` puts one interaction on one object. On a building's object the player can use
it; on any other object only villagers do.

## Settings

| `ModInteraction` | Default | What |
|---|---|---|
| `Text`, `WithText` | its name | The words after the key in the prompt |
| `Icon`, `WithIcon` | the game's | A picture in the prompt |
| `HoldTime`, `WithHoldTime` | 1 s | How long the player holds the key; 0 uses it at the press |
| `Distance`, `WithDistance` | 1.5 m | How near a villager stands to use it |
| `MaxUsers`, `WithMaxUsers` | 1 | How many villagers use it at once. While it is full, the player cannot use it either |
| `IsEnabled` | `true` | A disabled one shows no prompt, and villagers pass it by |
| `PlayerCanUse` | `true` | `false` keeps it for villagers |

Settings may change at any time; the game shows them on the next frame.

| Read-only | What |
|---|---|
| `Name`, `ModId` | Its name in the mod, shared by the interactions of one kind, and the mod that added it |
| `Target`, `Position` | The object it sits on, `null` once gone, and its place |
| `IsAvailable` | Not removed, its object still in the world |
| `IsFree` | Available, enabled and not full |
| `UserCount` | The villagers using it now |

## Events

| Event | When |
|---|---|
| `Using` | Before a use: the player once the key was held, a villager when its turn comes. Set `e.Cancel` to stop it |
| `Used` | After a use: the player's at once, a villager's after its time at it |

Both carry `Interaction`, `Resident` (`null` for the player) and `IsPlayer`, and run on the main thread.

## Villagers

A job's `Use` step walks a villager up to an interaction, waits for its turn (a minute at most), turns it to the
interaction and keeps it there for a while, playing an animation if one is named. Then `Used` is raised.

```csharp
Residents.AddJob("pray", r => Interactions.Nearest(r.Position, "altar") != null ? 12f : -1f)
         .Use(r => Interactions.Nearest(r.Position, "altar"), TimeSpan.FromSeconds(5), "peasant_male_idle_skal");
```

`Interactions.Nearest(position, name, radius)` gives the calling mod's free interaction of that name nearest to a
place, or `null`. With no interaction, a removed or disabled one, or a `Using` handler cancelling, the step ends
without a use, and so it does when another quest takes the villager.

## Taking it away

`Interactions.Remove(interaction)` takes one away: its prompt goes, and villagers on their way give up. An
interaction also goes with its building. `Interactions.All` lists every mod's interactions; the console's
`interactions` prints them with their places and users.

## Multiplayer

Every player's mod makes its own interactions. The player uses one on their own machine; villagers use them on the
host, where their minds run.

:::note[Not done yet]
A joined client is not checked yet.
:::
