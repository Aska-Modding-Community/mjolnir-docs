---
title: Camera
---

# Camera

`Mjolnir.SDK.Camera` gives mods the player's camera: where it is and what it sees, changes to the game's own cameras,
and cameras of a mod's own over them. Reference `Mjolnir.SDK.Camera.dll` and add `using Mjolnir.SDK.Camera;`.

Mods share the camera. Modifiers run in the order of their priority, and of the mods' cameras the one with the highest
priority is shown. Whatever a mod adds goes away when it disposes it or the mod is disabled after an error, and the
game's camera comes back. The camera is the local player's only: nothing of it goes over the network.

```csharp title="OverheadMod.cs"
using System;
using Mjolnir.SDK;
using Mjolnir.SDK.Camera;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;
using UnityEngine;

namespace OverheadMod;

[ModManifest("author.overhead", "Overhead", "1.0.0")]
public sealed class OverheadMod : Mod
{
    private ModCamera? _above;

    public override void OnGameReady()
    {
        // A wider view while walking, on top of whatever the game and other mods set.
        GameCamera.AddModifier(view =>
        {
            if (view.Mode == CameraMode.Normal) view.FieldOfView += 15;
        });

        HotKeys.Add(KeyGesture.Parse("F8"), ToggleAbove);
    }

    private void ToggleAbove()
    {
        if (_above is { IsActive: true })
        {
            _above.Dispose();   // the view blends back to the game's camera
            _above = null;
            return;
        }
        if (!GameCamera.IsAvailable) return;
        _above = GameCamera.Take(priority: 10, blend: TimeSpan.FromSeconds(1));
    }

    public override void OnUpdate()
    {
        if (_above is not { IsActive: true }) return;
        Vector3 player = LocalPlayer.Position;
        _above.Position = player + new Vector3(0, 20, -8);
        _above.Rotation = Quaternion.LookRotation(player - _above.Position);
    }
}
```

## Reading

| `GameCamera` | What |
|---|---|
| `IsAvailable` | Whether there is a player's camera: a world with the local player. `false` in the main menu |
| `Position`, `Rotation`, `Forward` | Where the camera the screen shows stands and looks |
| `FieldOfView` | Its vertical field of view in degrees, as drawn now |
| `Mode`, `ModeChanged` | The game's camera chosen now, and its change: the player aims, builds, goes into a cave. Not raised as a world loads or is left |
| `ShownCamera` | The mod's camera the screen shows now, or `null` for the game's |
| `WorldToScreen(world)` | A point of the world on the screen, in pixels from the bottom left corner. `z` is how far in front of the camera it is, negative behind it |
| `ScreenPointToRay(screen)` | The ray from the camera through a point of the screen |
| `TryRaycast(maxDistance, out point, out target)` | What the middle of the screen looks at, where the game's crosshair is. The local player is left out |

Read the camera on the main thread; another thread gets what it showed there last.

### Modes

The game has a camera for each thing the player does, each with its own field of view, distance and offset:

| `CameraMode` | When |
|---|---|
| `Normal` | Walking about: behind the shoulder, zoomed with the wheel |
| `Aim` | Aiming a bow: closer, narrower |
| `Climbing` | Climbing |
| `LockOn` | Locked on to a target in combat |
| `Build` | Building: farther back and higher |
| `Inside` | Inside a building |
| `Cave` | In a cave |
| `Fly` | Flying as the raven |
| `Lookout` | On a lookout tower |
| `Boat` | On a boat |

## Modifiers

`GameCamera.AddModifier(modify, priority)` changes the game's cameras every frame. `modify` gets each camera as a
`CameraView`, with the values the game set and the lower-priority modifiers left, and changes it in place:

| `CameraView` | What |
|---|---|
| `Mode` | Which of the game's cameras this is |
| `IsCurrent` | Whether it is the one the game chose now |
| `FieldOfView` | The vertical field of view, 1 to 179 degrees. The walking camera's is 45 |
| `Distance` | How far behind the player the camera stands. The game's zoom moves the walking camera from 2.1 to 10.8 m; `0` is a view from the head |
| `ShoulderOffset` | The camera's pivot from the player's, in the player's space: x right, y up, z forward. The walking camera's is (-0.5, 0, 0), over the left shoulder |

- Modifiers add up: two mods widening the view both count. A higher priority runs later, so it has the last word.
- The game's own values come back every frame before the modifiers run, so a change never compounds and the game's
  zoom works on its own numbers.
- Dispose the returned `CameraModifier` to take the change away; the game's values come back the next frame.
- A `CameraView` is valid only while the modifier runs: do not keep it.
- A modifier that throws disables its mod.

## A camera of the mod's own

`GameCamera.Take(priority, blend)` shows a camera of the mod's own over the game's, starting where the player's
camera is, until it is disposed. The view goes over to it and back over `blend`; the default is at once.

| `ModCamera` | What |
|---|---|
| `Position`, `Rotation` | Where it stands and looks. Move it each frame, or let it follow and look at a thing |
| `FieldOfView` | 1 to 179 degrees; at first the player's camera's |
| `Follow`, `FollowOffset` | A `Transform` it stands at each frame, plus an offset in the world's axes. `null`: it stays |
| `LookAt` | A `Transform` it looks at each frame. `null`: it keeps `Rotation` |
| `Priority`, `Blend` | As given to `Take` |
| `IsActive` | Not disposed, its mod not disabled, the world not left |
| `IsShown` | Whether the screen shows it now |
| `Ended` | Raised once when it ends, whatever the reason |

- The screen shows the mods' camera with the highest priority, and of two alike the newer one. The game's camera comes
  back when none is left.
- The player still walks, aims and builds as ever: the game reads input whatever the screen shows.
- A camera ends when it is disposed, its mod is disabled or the world is left. Taken in the main menu, it ends on the
  next frame.

:::note[Not done yet]
- A mod's camera stays when the player dies.
- Height and zoom limits in a modifier.
- First person with the head hidden, a free camera, camera shake and a photo mode.
:::
