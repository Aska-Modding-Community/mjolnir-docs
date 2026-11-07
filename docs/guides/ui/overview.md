---
title: User interface
sidebar_label: Overview and windows
---

# User interface

`Mjolnir.SDK.UI` builds mod interfaces in code from clones of the game's windows, setting rows, buttons, bars and
slots, so a mod looks like the game without drawing anything of its own. It also places mod elements in the game's
interface: the HUD, the main and pause menus, the settings menu and the journal.

Reference `Mjolnir.SDK.UI.dll` from `Mjolnir/core` and add `using Mjolnir.SDK.UI;`.

## How it works

A mod builds a tree of **elements**: controls such as `UiButton` and panels such as `UiStackPanel`. The tree is the
source of truth. When it is shown, the SDK makes live Unity copies of it and keeps them in step as properties change.

- Elements can be created and changed at any time, from any thread, also before the game is up. The screen follows on
  the next frame.
- The game often destroys and recreates its interface (the HUD with each world, the pause menu, the settings menu on
  each open). The SDK rebuilds the copies each time from the same tree.
- Pictures and textures need the running game: build windows that show pictures on first use, not in `OnLoad`.
- On a dedicated server without graphics, every UI call is a no-op.

## Hosts

An element tree goes on screen through a host:

| Host | What |
|---|---|
| `UiWindow` | A window of the mod's own, a real game menu: it frees the cursor, blocks the player's input, closes with Esc |
| `Hud.Add`, `Hud.AddAt` | The HUD of a loaded world, in a corner or over a point in the world |
| `Menus.Main.Add`, `Menus.Pause.Add` | Buttons and menu items in the main and pause menus |
| `Menus.Settings.Add`, `Menus.Journal.Add` | Tabs of the mod's own in the game's settings menu and journal |
| `Dialog`, `Notify` | The game's dialogs and notifications |

Hosts other than windows: [HUD, menus and notifications](hud-and-menus.md).

## Windows

Derive from `UiWindow`, build the elements in the constructor and set `Content`:

```csharp title="NotesWindow.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.UI;

namespace NotesMod;

internal sealed class NotesWindow : UiWindow
{
    public NotesWindow()
    {
        Title = "Notes";
        Width = 720;
        Height = 480;

        var note = new UiTextBox { Header = "Note", PlaceholderText = "Write something", MaxLength = 120 };
        var save = new UiButton { Content = "Save" };
        save.Click += (_, _) => Notify.Message($"Saved: {note.Text}");

        Content = new UiStackPanel
        {
            Children =
            {
                new UiSectionHeader { Text = "Today" },
                note,
                save,
            },
        };

        Footer = new UiButton { Content = Localization.Get("common.close") }.OnClick(Close);
    }
}

[ModManifest("author.notes", "Notes", "1.0.0")]
public sealed class NotesMod : Mod
{
    private NotesWindow? _window;

    public override void OnLoad() =>
        Menus.Pause.Add(new UiButton { Content = "Notes" }).OnClick(() => (_window ??= new NotesWindow()).Show());
}
```

| Member | What |
|---|---|
| `Show()`, `Close()`, `IsOpen` | Open and close it. It is open while it is on the game's menu stack |
| `Opened`, `Closed` | Raised as it opens and closes, by code, Esc or its X |
| `Title` | The title on the window's header plate |
| `Content` | What the window holds. Taller content scrolls |
| `Footer` | A bar along the bottom that never scrolls, for buttons and notes |
| `Width`, `Height` | Its size in reference pixels (see Sizes) |
| `MinWidth`, `MaxWidth`, `MinHeight`, `MaxHeight` | Limits. A minimum wins over a maximum |
| `SizeToContent` | `Height` makes the window as tall as its content, within its limits |
| `WindowStyle` | `Menu` or `Dialog`, set before it is first shown |
| `Dispose()` | Closes it and destroys its objects. Until then it stays live and its bindings follow their sources |

### Styles

- **`WindowStyle.Menu`**, the default, is the look of the game's main windows such as the settings menu and the
  inventory: a dark frame with carved corners, an X, the world blurred behind it, and the title on a plate on the top
  edge. When `Content` is a `UiTabControl` with its tabs on top, the tabs take the plate's place, as in the settings
  menu.
- **`WindowStyle.Dialog`** is the look of the game's dialogs and inner panels: a plain dark panel with the title
  inside and nothing blurred.

### Sizes

Sizes are reference pixels of a 1920×1080 screen, scaled to the real screen as the game's own menus are. The
player's **interface scale** (Mjolnir's settings, 75 to 150 %) then scales every mod window. A window always stays
inside the screen, whatever its size and scale.

## Elements in common

Every element derives from `Control`:

| Property | What |
|---|---|
| `Name` | The Unity object's name, for finding it in a hierarchy |
| `IsVisible`, `IsEnabled` | A disabled element disables and dims everything in it |
| `Width`, `Height`, `Min…`, `Max…` | Sizes. Elements stretch across their panel by default; one with a size of its own is centred |
| `Margin`, `Padding` | Room outside and inside, as a `Thickness` |
| `HorizontalAlignment`, `VerticalAlignment` | Placement within the room the panel gives |
| `FontSize` | Inherited by everything inside, unless set there |
| `Opacity` | From 0 to 1 |
| `ToolTip` | A string shows the game's hover card, its first line as the title; an element is shown in the card |
| `Loaded` | Raised with the Unity `RectTransform` once a live copy exists |

Rows (`HeaderedControl`: text boxes, toggles, sliders, steppers, combo boxes, buttons and text blocks) also take
`Header` and `Description`. With a header, the control is drawn as a game settings row: name and description on the
left, the control on the right. Without one, it is the bare control. `Icon` puts a picture at the row's left;
`ContentWidth` sets the width of its right part.
