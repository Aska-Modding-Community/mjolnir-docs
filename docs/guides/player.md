---
title: The player
---

# The player

`Mjolnir.SDK.Player` is the player on this computer: their character in the loaded world, its stats and its place.
Reference `Mjolnir.SDK.Player.dll` and add `using Mjolnir.SDK.Player;`.

Outside a world, in the main menu, there is no character: `LocalPlayer.IsSpawned` is false and every stat reads 0.
Events are raised on the main thread, with a `null` sender since they are static.

## Spawn and death

| Event | When |
|---|---|
| `LocalPlayer.Spawned` | The character is in a world: a save was loaded, a session was hosted |
| `LocalPlayer.Despawned` | It left the world: the world was unloaded or the session ended. Stats read 0 again |
| `LocalPlayer.Died` | It died |
| `LocalPlayer.Revived` | It came back to life |

`IsSpawned`, `IsDead` and `Name` (the player's platform name, or `null`) tell the state at any time.

The game fills in the saved values during the frame of `Spawned` and the next few: food and water first read 100,
stamina's limit grows two frames later. Follow a stat with `Changed` or a binding rather than reading it once in
`Spawned`.

## Stats

`Health`, `Stamina`, `Food`, `Water` and `Warmth` are `PlayerStat`s:

| Member | What |
|---|---|
| `Value` | Read and write. A write from another thread is applied on the next frame |
| `Maximum` | The limit; health's is the character's maximum health |
| `Fraction` | `Value / Maximum`, from 0 to 1 |
| `Changed` | Raised on each change, with the old and new values |

A `PlayerStat` follows the local character: after a new spawn it is the new character's, after a despawn it reads 0.
It is an `IBindable<float>`, so a HUD bar can follow it:

```csharp
var bar = new UiProgressBar { ShowProgressText = true, ProgressTextFormat = "Health {0:0}/{3:0}" };
bar.Bind(UiProgressBar.ValueProperty, LocalPlayer.Health);
bar.Bind(UiProgressBar.MaximumProperty, () => LocalPlayer.Health.Maximum, System.TimeSpan.FromSeconds(0.5));
Hud.Add(bar, HudAnchor.BottomLeft);
```

Food and water change every frame. The SDK watches the game for a stat only while a mod listens to it.

`LocalPlayer.Sheet` is the character's whole [character sheet](characters.md): characteristics, skills and effects.

## Stamina costs

`LocalPlayer.Stamina.Draining` is raised each time the local player is about to spend stamina, with the amount before
the game's own discounts for harvesting and combat. A handler can change `Amount` (never below 0) or set `Cancel`:

```csharp
LocalPlayer.Stamina.Draining += (_, e) =>
{
    switch (e.Use)
    {
        case StaminaUse.Harvest: e.Amount *= 0.5f; break;   // half while chopping and mining
        case StaminaUse.Combat: e.Cancel = true; break;     // free in a fight
    }
};
```

`Use` is `Default` (sprinting, rolling and the rest), `Harvest` or `Combat`. Handlers run in the order they were added,
each seeing what the one before left. While sprinting it is raised several times a second. Villagers' costs are not
reported.

## Position and teleport

| Member | What |
|---|---|
| `Position` | The character's place in metres, y up; zero without a character |
| `Teleport(position)` | Moves the character there at its next physics step. Far away the world streams in within a second or so, and a character above the ground falls onto it |
| `TeleportToGroundAsync(x, z)` | Moves the character onto the ground at x, z as soon as the world there has streamed in. In the sea the ground is the bottom, and the character swims up |

`TeleportToGroundAsync` gives `true` once the character is sent there, and `false` without a character, when it
despawns or another teleport comes first, or when no ground turns up within ten seconds.

```csharp
var here = LocalPlayer.Position;
bool landed = await LocalPlayer.TeleportToGroundAsync(here.x + 300, here.z);
```

The console's `pos` and `tp` commands use the same calls. See [Developer console](console.md).

:::note
The player module is tested in single player and when hosting. A client that joined someone else's world is not
checked yet.
:::
