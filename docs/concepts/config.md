---
title: Config
---

# Config

A mod's `Config` is its TOML file, `Mjolnir/Config/<mod id>.toml`. Every bound setting also appears on the mod's page in
the Mods window, where the player changes it without editing the file.

## Binding settings

Bind each setting once, usually in `OnLoad`. `Bind(section, key, default, description)` returns a `ConfigEntry<T>`
holding the file's value, or the default when the key is missing or invalid.

```csharp title="Settings.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Config;

namespace SettingsMod;

public enum Difficulty
{
    Easy,
    Normal,
    Hard,
}

internal sealed class Settings(ModConfig config)
{
    public ConfigEntry<bool> ShowHud { get; } =
        config.Bind("HUD", "Show", true, "Show the mod's HUD line.").WithDisplayName("Show the HUD line");

    public ConfigEntry<float> Multiplier { get; } =
        config.Bind("Stamina", "Multiplier", 1f, "What stamina costs are multiplied by.").WithRange(0f, 5f);

    public ConfigEntry<Difficulty> DifficultyLevel { get; } =
        config.Bind("General", "Difficulty", Difficulty.Normal, "How hard it gets.");

    public ConfigEntry<KeyGesture> WindowKey { get; } =
        config.Bind("Keys", "Window", KeyGesture.Parse("Ctrl+F7"), "Opens the mod's window.");

    public ConfigEntry<int> Seed { get; } =
        config.Bind("World", "Seed", 0, "Read once at start.").WithRestartRequired();
}

[ModManifest("author.settings", "Settings Mod", "1.0.0")]
public sealed class SettingsMod : Mod
{
    private Settings _settings = null!;

    public override void OnLoad()
    {
        _settings = new Settings(Config);
        _settings.Multiplier.Changed += (_, e) => Log.Info($"Multiplier {e.OldValue} -> {e.NewValue}");
    }
}
```

On the first start the file reads as below, each setting with its description, default and range as comments:

```toml title="Mjolnir/Config/author.settings.toml"
# Settings Mod (author.settings) 1.0.0 - config written by Mjolnir.
# Edit values while the game is not running. Keys the mod does not use are kept.

[HUD]

# Show the mod's HUD line.
# Default: true
Show = true

[Stamina]

# What stamina costs are multiplied by.
# Default: 1
# Range: 0 .. 5
Multiplier = 1.0
```

An enum setting lists its allowed names, a key setting explains the key syntax, and a `WithRestartRequired` setting
says that a change takes effect after a restart. Edit the file while the game is not running:
the game writes its own values back when it quits.

## Types and their controls

| Type | Stored as | The Mods window shows |
|---|---|---|
| `bool` | `true` / `false` | An Off / On selector |
| `int`, `long`, `float`, `double` with `WithRange` | a number | A slider |
| the same without a range | a number | A text field |
| `string` | a string | A text field |
| an enum with up to 6 names | its name | A selector |
| an enum with more names | its name | A dropdown list |
| `KeyGesture` | `"Ctrl+Shift+F8"` | A key the player records: Esc cancels, Backspace clears |

Any other type throws `NotSupportedException` from `Bind`.

## Shaping the Mods window

The builders return the entry and chain after `Bind`:

| Builder | Effect |
|---|---|
| `WithRange(min, max)` | Clamps the value, the file's value included, and makes the control a slider |
| `WithDisplayName(text)` | The row's name. The key stays the name in the file |
| `WithOrder(n)` | Position within its section: lower first, equal ones in binding order |
| `WithRestartRequired()` | The row says a change applies after a restart, and the settings page shows a note while such a value differs from what it was when the page opened |

Section and row names, descriptions and enum names can be translated in the mod's `lang` files. See
[Localization](localization.md#the-mods-window).

## Your own settings page

The page behind the Settings button is built from the config: a header per section, a control per setting. That is
the right page for most mods. When the settings need more shape than a flat list, `ModSettings.SetPage` puts your own
control there instead:

```csharp
using Mjolnir.SDK.UI;

public override void OnGameReady()
{
    ConfigEntry<float> speed = Config.Bind("Movement", "Speed", 1f).WithRange(0.5f, 3f);

    ModSettings.SetPage(() => new UiStackPanel
    {
        Children =
        {
            new UiSectionHeader { Text = "Movement" },
            SettingControls.For(speed),
            new UiButton { Header = "Advanced", Content = "Open" }.OnClick(() => OpenAdvanced()),
        },
    });
}
```

Everything around the page stays the platform's: the title, the footer's Reset and Close, the note about settings that
need a restart, and the save when the page closes. So a control from `SettingControls.For` behaves exactly as it does
on the built page, and `Reset` still puts every setting of the config back to its default.

- The builder runs once, the first time the player opens the page, on the main thread.
- `ModSettings.ClearPage()` gives the built page back.
- A row that opens a page of its own is an ordinary `UiWindow` you `Show()` from its click.
- A mod with no settings at all has no Settings button, and a page set for it is never reached.

`ModSettings` is in `Mjolnir.SDK.UI`, so a mod that uses it references that module and needs Mjolnir 0.4.9 or later.

## Reading and writing

- `entry.Value` reads the current value. Setting it clamps to the range, marks the config changed and raises
  `Changed` with the old and new values.
- `Changed` runs on the thread that set the value. Changes from the Mods window come on the main thread.
- The file is rewritten only when a bound key was missing or invalid, a value was set, or `Config.Save()` is called.
  Otherwise the player's comments and hand edits stay as they are. Keys the mod no longer binds are kept.
- Changed values are saved after `OnLoad` and when the game quits. Call `Config.Save()` to write at once.
- A file with a TOML syntax error is never overwritten: the mod gets its defaults until the file is fixed, and the
  error with its line is in the log.

## Binding UI to settings

`ConfigEntry<T>` is an `IBindable<T>`: a control binds to it both ways:

```csharp
var toggle = new UiToggleSwitch { Header = "Show the HUD line" };
toggle.Bind(UiToggleSwitch.IsCheckedProperty, Config.Bind("HUD", "Show", true));

// Or the same row the Mods window would build:
HeaderedControl row = SettingControls.For(Config.Bind("Stamina", "Multiplier", 1f).WithRange(0f, 5f));
```

See [Bindables and events](bindables-and-events.md) and [Binding](../guides/ui/binding.md).
