---
title: Mouse, keyboard and the player's controls
sidebar_label: Mouse and keyboard
---

# Mouse, keyboard and the player's controls

A mod with a tool of its own — a view from above, a brush, a placement mode — takes the player's controls while the
tool is on and reads the mouse and the keys itself. Everything here is in `Mjolnir.SDK.UI`: reference
`Mjolnir.SDK.UI.dll` and add `using Mjolnir.SDK.UI;`. The example also uses the camera and terrain modules to find the
ground under the cursor.

```csharp title="MarkerMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Camera;
using Mjolnir.SDK.Terrain;
using Mjolnir.SDK.UI;
using UnityEngine;

namespace MarkerMod;

[ModManifest("author.marker", "Marker", "1.0.0")]
public sealed class MarkerMod : Mod
{
    private ControlsCapture? _tool;
    private LandscapeOutline? _brush;
    private float _radius = 3;

    public override void OnGameReady()
    {
        HotKeys.Add(KeyGesture.Parse("F6"), Toggle);
        HotKeys.Add(KeyGesture.Parse("Escape"), Stop); // Esc opens no pause menu while the controls are taken
    }

    private void Toggle()
    {
        if (_tool != null)
        {
            Stop();
            return;
        }
        var tool = PlayerControls.Capture();
        tool.Ended += (_, _) =>
        {
            if (_tool == tool) Stop(); // the world left, or the mod disabled after an error
        };
        _tool = tool;
    }

    private void Stop()
    {
        _tool?.Dispose(); // the player walks again
        _tool = null;
        _brush?.Dispose();
        _brush = null;
    }

    public override void OnUpdate()
    {
        if (_tool is not { IsActive: true }) return;

        float step = (KeyboardInput.Modifiers & KeyModifiers.Shift) != 0 ? 2f : 0.5f;
        _radius = Mathf.Clamp(_radius + MouseInput.Wheel * step, 1, 20);

        Ray ray = GameCamera.ScreenPointToRay(MouseInput.Position);
        if (MouseInput.IsOverInterface || !Landscape.TryRaycast(ray, 300, out Vector3 point)) return;

        LandscapeArea area = LandscapeArea.Circle(point, _radius);
        if (_brush == null) _brush = Landscape.ShowOutline(area, Color.cyan);
        else _brush.Area = area;

        if (MouseInput.WasPressed(MouseButton.Left))
            Notify.Message($"{point.y:0.00} m at ({point.x:0}, {point.z:0})");
    }
}
```

## The player's controls

`PlayerControls.Capture()` takes the player's controls in a loaded world until the result is disposed:

- the character stands still and attacks nothing;
- the game's camera does not turn or zoom;
- the quick slots and the menu keys (Esc, inventory, map, build) do nothing;
- the mouse cursor shows.

What still works: hotkeys (`HotKeys`), the mod's own windows, and `MouseInput` and `KeyboardInput`, which read the
devices themselves. A mod window opened over a capture takes the keys while it is open; when it closes, the capture
holds again. Esc opens no pause menu meanwhile, so give the player a key that ends the tool — Esc itself, as in the
example.

| `ControlsCapture` | What |
|---|---|
| `Dispose()` | Gives the controls back, on the next frame. Calling it again does nothing |
| `Ended` | Raised once on the main thread when it ends, whatever the reason: disposed, the world left, its mod disabled after an error |
| `IsActive` | Whether it still holds |
| `ShowsCursor` | Whether the cursor shows while it holds; `Capture(showCursor: false)` starts without it |

`PlayerControls.IsCaptured` says whether any mod holds the controls now. Several captures may be held at once, by one
mod or several; the controls come back after the last one ends, and the cursor shows while any of them asks for it.

`Capture` may be called from any thread and holds from the next frame. Taken while no world is loaded, it ends at once.

## The mouse

`MouseInput` reads the mouse wherever the player is, also while the controls are captured and while the game ignores
the mouse. Its values are this frame's; read them on the main thread (in `OnUpdate`): elsewhere they are empty.

| `MouseInput` | What |
|---|---|
| `Position` | Where the cursor stands on the screen, in pixels from its bottom left corner |
| `IsPressed(button)` | Whether the button is held down now |
| `WasPressed(button)` | Whether it went down this frame |
| `WasReleased(button)` | Whether it came up this frame |
| `Wheel` | How far the wheel turned this frame, in notches: positive away from the player, 0 when it did not turn |
| `IsOverInterface` | Whether the cursor is over a window or a menu, the mod's own included. The HUD does not count |
| `IsAvailable` | Whether the game has a mouse |

`MouseButton` is `Left`, `Right` or `Middle`. `GameCamera.ScreenPointToRay(MouseInput.Position)` is the ray under the
cursor; `Landscape.TryRaycast` finds where it meets the ground ([Terrain](../terrain.md#tools-on-the-ground)).

## The keyboard

`KeyboardInput` reads keys held over time, which a hotkey cannot tell: a camera of the mod's own moved while W is held,
a brush that works while a key is down. For a key that runs code when pressed, `HotKeys` is simpler
([Hotkeys](hud-and-menus.md#hotkeys)). Read it on the main thread; elsewhere every key is up.

| `KeyboardInput` | What |
|---|---|
| `IsPressed(key)` | Whether the key is held down now |
| `WasPressed(key)` | Whether it went down this frame |
| `WasReleased(key)` | Whether it came up this frame |
| `Modifiers` | The modifiers held now, `KeyModifiers` flags: `Control`, `Shift`, `Alt`, either side |
| `IsTyping` | Whether the player types in a text field now; their keys are meant for it |
| `IsAvailable` | Whether the game has a keyboard |

Keys are named as in a `KeyGesture`, by the Unity Input System's names: `W`, `LeftShift`, `Digit1`, `F7`, `Escape`. A
name that is no key is never down, and is logged once.

```csharp
if (!KeyboardInput.IsTyping && KeyboardInput.IsPressed("W"))
    pivot += forward * speed * Time.deltaTime;
```

:::note[Not done yet]
- Gamepads: `MouseInput` and `KeyboardInput` have no gamepad counterpart, and a capture is checked with the mouse
  and the keyboard only.
- The cursor's look is the system's arrow; a mod cannot give it a picture of its own.
:::
