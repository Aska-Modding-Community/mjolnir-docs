---
title: Binding
---

# Binding

Every property has a static `…Property` field (`UiTextBlock.TextProperty`, `Control.IsVisibleProperty`). `Bind`
connects it to a source.

## Sources

```csharp
var text = new UiTextBlock();

// A bindable value: a config entry, a player stat, a translated text…
text.Bind(UiTextBlock.TextProperty, Localization.GetBindable("hud.title"));

// A function, read every frame while the element is on screen.
text.Bind(UiTextBlock.TextProperty, () => $"{LocalPlayer.Health.Value:0} health");

// A function read at most once per interval: for values that change slowly or allocate.
text.Bind(UiTextBlock.TextProperty, () => System.DateTime.Now.ToString("HH:mm"), System.TimeSpan.FromSeconds(0.25));

// Another element's property, through GetObservable.
var slider = new UiSlider { Maximum = 1 };
var bar = new UiProgressBar { Maximum = 1 };
bar.Bind(UiProgressBar.ValueProperty, slider.GetObservable(UiSlider.ValueProperty));
```

| Source | Direction | Updates |
|---|---|---|
| `IBindable<T>` | Both ways by default | On its `Changed` |
| `IReadOnlyBindable<T>` | One way | On its `Changed` |
| `IObservable<T>` | One way | On each value |
| `Func<T>` | One way | Every frame, or once per interval |
| a view model and a path, `vm, x => x.A.B` | Both ways where the path can be written | On `INotifyPropertyChanged` along the path |

`Bind` takes an optional `BindingMode` (`OneWay`, `TwoWay`, `OneTime`) and `convert` / `convertBack` functions. Without them,
numbers convert to one another and anything converts to a string.

A two-way binding writes the player's value back to the source, then reads the source again, so a config entry's
clamp to its range shows at once.

```csharp
ConfigEntry<float> scale = Config.Bind("HUD", "Scale", 1f).WithRange(0.5f, 2f);
var slider = new UiSlider { Header = "Scale", Minimum = 0.5, Maximum = 2 };
slider.Bind(UiSlider.ValueProperty, scale);   // float to double and back
```

## Lifetime

`Bind` returns an `IDisposable`; disposing it ends the binding. A binding follows its source only while the element
is on screen, so a long-lived source such as a config entry never keeps a closed window alive. While the element is
not shown, reading the property reads the source directly.

## View models

Bindings to a view model follow `INotifyPropertyChanged` along a property path:

```csharp title="CounterViewModel.cs"
using System.ComponentModel;
using System.Runtime.CompilerServices;
using Mjolnir.SDK.UI;

namespace CounterMod;

public sealed class CounterViewModel : INotifyPropertyChanged
{
    private int _clicks;

    public CounterViewModel()
    {
        CountCommand = new Command(() => Clicks++);
        ResetCommand = new Command(() => Clicks = 0, () => Clicks > 0);
    }

    public event PropertyChangedEventHandler? PropertyChanged;

    public int Clicks
    {
        get => _clicks;
        set
        {
            if (_clicks == value) return;
            _clicks = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(Clicks)));
            ResetCommand.RaiseCanExecuteChanged();
        }
    }

    public Command CountCommand { get; }

    public Command ResetCommand { get; }
}

internal sealed class CounterView : UiUserControl
{
    public CounterView(CounterViewModel vm)
    {
        var clicks = new UiTextBlock { Header = "Clicks" };
        clicks.Bind(UiTextBlock.TextProperty, vm, x => x.Clicks);

        Content = new UiStackPanel
        {
            Children =
            {
                clicks,
                new UiButton { Content = "Click me", Command = vm.CountCommand },
                new UiButton { Content = "Reset", Command = vm.ResetCommand },
            },
        };
    }
}
```

A button with a command is disabled while `CanExecute` is false, and follows `CanExecuteChanged`.

## The fluent layer

`ControlExtensions` lets a tree be written as one expression. `WithBinding` binds and returns the element; `On…`
subscribes and returns it:

```csharp
var panel = new UiStackPanel
{
    Children =
    {
        new UiTextBlock().WithBinding(UiTextBlock.TextProperty, Localization.GetBindable("hud.title")),
        new UiToggleSwitch { Header = "Enabled" }.OnIsCheckedChanged(on => Log.Info($"Enabled: {on}")),
        new UiButton { Content = "Save" }.OnClick(() => Config.Save()),
    },
};
```

An `On…` handler that throws disables your mod, like any other handler of the mod.

## Properties of your own

Controls derive from `MjolnirObject`, which stores their properties. A `UiUserControl` of your own uses the same API:
`GetValue`, `SetValue`, `ClearValue`, `GetObservable`, and `PropertyChanged`, raised only when the value actually
changes.
