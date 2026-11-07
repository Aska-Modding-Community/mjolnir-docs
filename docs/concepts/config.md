---
title: Config
---

# Config

Each mod has a TOML file, `Mjolnir/Config/<mod id>.toml`, behind its `Config` property. Every setting a mod binds also
appears on the mod's page in the game's Mods window, where the player can change it without touching the file.

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

The file starts like this on the first start. Each setting gets its description, default and range as comments:

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

Enum settings list their allowed names, key settings explain the key syntax, and settings marked
`WithRestartRequired` say that a change takes effect after a restart. Edit the file while the game is not running:
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

Each builder returns the entry, so they chain after `Bind`:

| Builder | Effect |
|---|---|
| `WithRange(min, max)` | Clamps the value, the file's value included, and makes the control a slider |
| `WithDisplayName(text)` | The row's name. The key stays the name in the file |
| `WithOrder(n)` | Position within its section: lower first, equal ones in binding order |
| `WithRestartRequired()` | The row says a change applies after a restart, and the settings page shows a note while such a value differs from what it was when the page opened |

Section and row names, descriptions and enum names can be translated in the mod's `lang` files. See
[Localization](localization.md#the-mods-window).

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

`ConfigEntry<T>` is an `IBindable<T>`, so a control can be bound to it in both directions:

```csharp
var toggle = new UiToggleSwitch { Header = "Show the HUD line" };
toggle.Bind(UiToggleSwitch.IsCheckedProperty, Config.Bind("HUD", "Show", true));

// Or the same row the Mods window would build:
HeaderedControl row = SettingControls.For(Config.Bind("Stamina", "Multiplier", 1f).WithRange(0f, 5f));
```

See [Bindables and events](bindables-and-events.md) and [Binding](../guides/ui/binding.md).
