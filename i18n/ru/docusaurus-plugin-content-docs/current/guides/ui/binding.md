---
title: Привязка
---

# Привязка

У каждого свойства есть статическое поле `…Property` (`UiTextBlock.TextProperty`, `Control.IsVisibleProperty`).
`Bind` связывает его с источником.

## Источники {/* #sources */}

```csharp
var text = new UiTextBlock();

// Привязываемое значение: запись конфига, характеристика игрока, переведённый текст…
text.Bind(UiTextBlock.TextProperty, Localization.GetBindable("hud.title"));

// Функция, читаемая каждый кадр, пока элемент на экране.
text.Bind(UiTextBlock.TextProperty, () => $"{LocalPlayer.Health.Value:0} health");

// Функция, читаемая не чаще раза за интервал: для значений, которые меняются медленно или выделяют память.
text.Bind(UiTextBlock.TextProperty, () => System.DateTime.Now.ToString("HH:mm"), System.TimeSpan.FromSeconds(0.25));

// Свойство другого элемента, через GetObservable.
var slider = new UiSlider { Maximum = 1 };
var bar = new UiProgressBar { Maximum = 1 };
bar.Bind(UiProgressBar.ValueProperty, slider.GetObservable(UiSlider.ValueProperty));
```

| Источник | Направление | Обновления |
|---|---|---|
| `IBindable<T>` | По умолчанию в обе стороны | По его `Changed` |
| `IReadOnlyBindable<T>` | В одну сторону | По его `Changed` |
| `IObservable<T>` | В одну сторону | При каждом значении |
| `Func<T>` | В одну сторону | Каждый кадр или раз за интервал |
| модель представления и путь, `vm, x => x.A.B` | В обе стороны, где путь допускает запись | По `INotifyPropertyChanged` вдоль пути |

`Bind` принимает необязательный `BindingMode` (`OneWay`, `TwoWay`, `OneTime`) и функции `convert` / `convertBack`. Без
них числа преобразуются друг в друга, а всё преобразуется в строку.

Двусторонняя привязка записывает значение игрока обратно в источник, а затем снова читает источник, так что
ограничение записи конфига её диапазоном видно сразу.

```csharp
ConfigEntry<float> scale = Config.Bind("HUD", "Scale", 1f).WithRange(0.5f, 2f);
var slider = new UiSlider { Header = "Scale", Minimum = 0.5, Maximum = 2 };
slider.Bind(UiSlider.ValueProperty, scale);   // float в double и обратно
```

## Время жизни {/* #lifetime */}

`Bind` возвращает `IDisposable`; его освобождение завершает привязку. Привязка следует за источником, только пока
элемент на экране, поэтому долгоживущий источник, такой как запись конфига, никогда не удерживает закрытое окно. Пока
элемент не показан, чтение свойства читает источник напрямую.

## Модели представления {/* #view-models */}

Привязки к модели представления следуют за `INotifyPropertyChanged` вдоль пути свойств:

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

Кнопка с командой отключена, пока `CanExecute` ложно, и следует за `CanExecuteChanged`.

## Текучий слой {/* #the-fluent-layer */}

`ControlExtensions` позволяет записать дерево одним выражением. `WithBinding` привязывает и возвращает элемент; `On…`
подписывается и возвращает его:

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

Обработчик `On…`, бросивший исключение, отключает ваш мод, как и любой другой обработчик мода.

## Собственные свойства {/* #properties-of-your-own */}

Элементы управления наследуются от `MjolnirObject`, который хранит их свойства. Ваш собственный `UiUserControl`
пользуется тем же API: `GetValue`, `SetValue`, `ClearValue`, `GetObservable` и `PropertyChanged`, которое возникает,
только когда значение действительно меняется.
