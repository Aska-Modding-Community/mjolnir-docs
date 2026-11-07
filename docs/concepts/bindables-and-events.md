---
title: Bindables and events
---

# Bindables and events

Values that change, such as a config setting, a player's health or a translated text, share one shape: the same code
reads them, follows them and binds UI to them.

## Bindable values

| Interface | Members | Examples |
|---|---|---|
| `IReadOnlyBindable<T>` | `Value` (get), `Changed` | `TranslatedText`, a one-way `Map` |
| `IBindable<T>` | `Value` (get and set), `Changed` | `ConfigEntry<T>`, `PlayerStat`, `CharacterStat`, `InterfaceScale.Menus`, the UI's `BindableValue<T>` |

`Changed` carries `ValueChangedEventArgs<T>` with `OldValue` and `NewValue`.

```csharp
LocalPlayer.Health.Changed += (_, e) =>
{
    if (e.NewValue < e.OldValue) Log.Info($"Lost {e.OldValue - e.NewValue:0} health");
};
```

The SDK watches the game only while a mod listens. A player's food and water change every frame, so a subscription has
a cost: unsubscribe when it is no longer needed.

### Map

`Map` turns one bindable into another: writable with a way back, read-only without one.

```csharp
ConfigEntry<int> percent = Config.Bind("UI", "Scale", 100).WithRange(50, 200);

// Two ways: a factor from a percent, and back.
IBindable<double> factor = percent.Map(p => p / 100.0, f => (int)System.Math.Round(f * 100));

// One way: a text from a number.
IReadOnlyBindable<string> label = percent.Map(p => $"{p} %");
```

A control bound to an `IReadOnlyBindable<T>` follows it and never writes to it.

## The event convention

Every event of the SDK and its modules follows these rules, enforced by the SDK's tests:

- The handler type is `EventHandler` or `EventHandler<TArgs>`, never `Action`. The sender is the object, or `null`
  for a static event (`LocalPlayer.Spawned`, `Hud.Ready`).
- Names have no `On` prefix. `On…` names methods: the ones a mod overrides (`OnLoad`) and the fluent UI helpers
  (`OnClick`).
- An event named after a property, `…Changed`, carries `ValueChangedEventArgs<T>` or a type derived from it
  (`RangeValueChangedEventArgs`, `TextChangedEventArgs`).
- An event raised before something happens, `…ing`, carries `CancelEventArgs` or a type derived from it. A handler sets
  `Cancel` or changes the values the type exposes:

```csharp
LocalPlayer.Stamina.Draining += (_, e) =>
{
    if (e.Use == StaminaUse.Harvest) e.Amount *= 0.5f;   // half the cost while harvesting
};

Skill.ExperienceGaining += (_, e) =>
{
    if (e.Skill.Kind == SkillKind.Fishing) e.Cancel = true;   // no fishing experience
};
```

Handlers run in the order they subscribed. Mods subscribing in `OnLoad` do so in load order, so a mod that depends on
another sees the other's changes first.

## Naming across the SDK

Each word means one thing in every module:

| Word | Meaning |
|---|---|
| `Name` | An id in code: an item's, a job's, a command's |
| `DisplayName` | The text the player sees |
| `AssetName` | The game's own name of an asset, such as `Item_Wood_Sticks` |
| `ModId` | The mod that owns something |
| `Minimum`, `Maximum` | Limits |
| `…Fraction` | A part of a whole, from 0 to 1 |
| `With…` | A builder that sets one value |
| a verb (`Needs`, `MadeAt`, `MoveTo`) | A builder that adds a part or a step |
| `Add`, `Remove` | What a mod adds and takes away, on the same host |
| `Find` | Returns `null` when nothing matches |

A subscription with no object of its own, such as a hotkey or a binding, ends when you dispose what `Add` or `Bind`
returned.
