---
title: HUD, menus and notifications
---

# HUD, menus and notifications

Everything here can be registered in `OnLoad`. The SDK puts it into the game's interface whenever that interface
exists: a HUD element appears in each world, a menu button in each new main menu.

## HUD

```csharp
var line = new UiTextBlock { FontSize = 18 };
line.Bind(UiTextBlock.TextProperty, () => $"{LocalPlayer.Stamina.Value:0} stamina", System.TimeSpan.FromSeconds(0.2));
Hud.Add(line, HudAnchor.TopRight);
```

| Member | What |
|---|---|
| `Hud.Add(element, anchor)` | An element in a corner of the HUD: `TopLeft`, `TopCenter`, `TopRight`, `BottomLeft`, `BottomRight` |
| `Hud.AddAt(element, () => position, offset)` | An element over a point in the world, which it follows. It hides while the point is behind the camera or off the screen |
| `Hud.AddAt(element, transform, worldOffset, offset)` | The same over a Unity object |
| `Hud.Remove(element)` | Takes it off at once |
| `Hud.Ready` | Raised when a world's HUD comes up |
| `Hud.Root` | The HUD's `RectTransform` while it exists |

The HUD's elements are scaled with the game's own HUD scale setting, times the player's HUD scale in Mjolnir's
settings.

## Notifications

They look like the game's own by default.

| Call | What |
|---|---|
| `Notify.Message(text)` | The game's notification with its green tick |
| `Notify.Message(text, icon)` | The same with a picture, as the game shows a crop |
| `Notify.Counter(key, text, amount, icon)` | A notification that adds up while it shows, as the game counts pickups: "x5". A negative amount shows red |
| `Notify.Banner(title, text, seconds)` | A large notification at the top centre, like the game's season and discovery messages |

```csharp
Notify.Counter("logs", "Logs", 1);   // "Logs x1", then "x2"… while it is on screen
```

## Dialogs

The game's own confirm, message and text dialogs. Button texts default to the player's language.

```csharp
bool sure = await Dialog.ConfirmAsync("Reset", "Start the settlement over?");
await Dialog.MessageAsync("Done", "The settlement was reset.");
string? name = await Dialog.PromptAsync("Name", "What is the village called?", text: "Hrafnsey", maxLength: 24);
```

Each also has a callback form: `Dialog.Confirm(title, message, onConfirm, onCancel)`. When a dialog cannot be shown,
the awaited forms complete at once with `false` or `null`.

## The main and pause menus

`Menus.Main` and `Menus.Pause` take buttons and menu items:

```csharp
Menus.Pause.Add(new UiButton { Content = "My mod" }).OnClick(() => Notify.Message("Hello"));
```

A `UiMenuItem` with `Items` opens a level of its own, as deep as you like, with the game's **Back** and Esc going up a
level. In the main menu it is a page of the game's own kind; in the pause menu it takes the menu's place.

```csharp
Menus.Main.Add(new UiMenuItem
{
    Header = "My mod",
    Items =
    {
        new UiMenuItem { Header = "Open the window" }.OnClick(() => Notify.Message("Window")),
        new UiMenuItem
        {
            Header = "More",
            Items = { new UiMenuItem { Header = "Say hello" }.OnClick(() => Notify.Message("Hello")) },
        },
    },
});
```

`Menus.Main.Remove(item)` takes it away again. `MenuButtons.Opened` is raised when the menu opens.

## Tabs in the game's windows

`Menus.Settings` and `Menus.Journal` add a tab of the mod's own after the game's tabs in the settings menu and the
journal. The tab has the window's icon look, with its header and the mod's name in the hover card. Q and E reach it
like the game's tabs.

```csharp
UiTabItem tab = Menus.Settings.Add(new UiTabItem
{
    Header = "My mod",
    Content = new UiStackPanel { Children = { SettingControls.For(Config.Bind("General", "Enabled", true)) } },
});
```

Without an `Icon` the tab shows its header's first letter. Set the icon in `OnGameReady` or later, since pictures need
the running game. A change of the item's `Header`, `Icon`, `IsVisible` or `Content` reaches tabs already shown.

## Hotkeys

```csharp
ConfigEntry<KeyGesture> key = Config.Bind("Keys", "Window", KeyGesture.Parse("F7"), "Opens the window.");
System.IDisposable hotkey = HotKeys.Add(key, () => Notify.Message("F7"));
```

`HotKeys.Add` takes a `KeyGesture` or a bindable one, such as a config entry the player rebinds in the Mods window. A
gesture fires only with exactly its modifiers, and never while the player types in a text field. Dispose the result
to remove the hotkey.

Key names are Unity Input System's: `F8`, `A`, `Digit1`, `Backquote`, `Space`, with `Ctrl`, `Shift` and `Alt`
joined by `+`: `"Ctrl+Shift+F8"`. `KeyGesture.None` is no key.

## Interface scale

`InterfaceScale.Menus` and `InterfaceScale.Hud` are the player's scale settings in Mjolnir's settings page, as
bindable factors from 0.75 to 1.5. `Menus` scales mod windows over the whole range and the game's menus only down to
75 %, since they are laid out to fill the screen. `Hud` multiplies the game's own HUD scale. Change them only when your
player asks to.
