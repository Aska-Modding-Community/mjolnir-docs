---
title: Привязываемые значения и события
---

# Привязываемые значения и события

Меняющиеся значения — настройка конфига, здоровье игрока, переведённый текст — имеют одну форму: один и тот же код
читает их, следит за ними и привязывает к ним UI.

## Привязываемые значения {/* #bindable-values */}

| Интерфейс | Что в нём | Примеры |
|---|---|---|
| `IReadOnlyBindable<T>` | `Value` (чтение), `Changed` | `TranslatedText`, односторонний `Map` |
| `IBindable<T>` | `Value` (чтение и запись), `Changed` | `ConfigEntry<T>`, `PlayerStat`, `CharacterStat`, `InterfaceScale.Menus`, `BindableValue<T>` из UI |

`Changed` передаёт `ValueChangedEventArgs<T>` с `OldValue` и `NewValue`.

```csharp
LocalPlayer.Health.Changed += (_, e) =>
{
    if (e.NewValue < e.OldValue) Log.Info($"Lost {e.OldValue - e.NewValue:0} health");
};
```

SDK обращается к игре, только пока на событие кто-то подписан. Еда и вода игрока меняются каждый кадр, так что
подписка не бесплатна: отписывайтесь, когда она больше не нужна.

### Map {/* #map */}

`Map` превращает одно привязываемое значение (bindable) в другое: с обратным преобразованием результат доступен для
записи, без него — только для чтения.

```csharp
ConfigEntry<int> percent = Config.Bind("UI", "Scale", 100).WithRange(50, 200);

// В обе стороны: множитель из процентов и обратно.
IBindable<double> factor = percent.Map(p => p / 100.0, f => (int)System.Math.Round(f * 100));

// В одну сторону: текст из числа.
IReadOnlyBindable<string> label = percent.Map(p => $"{p} %");
```

Элемент управления, привязанный к `IReadOnlyBindable<T>`, следует за ним и никогда в него не пишет.

## Соглашение о событиях {/* #the-event-convention */}

Все события SDK и его модулей следуют этим правилам; их проверяют тесты SDK:

- Тип обработчика — `EventHandler` или `EventHandler<TArgs>`, никогда не `Action`. Отправитель — сам объект или
  `null` для статического события (`LocalPlayer.Spawned`, `Hud.Ready`).
- В именах нет префикса `On`. `On…` называет методы: те, что мод переопределяет (`OnLoad`), и fluent-помощники UI
  (`OnClick`).
- Событие, названное по свойству, `…Changed`, передаёт `ValueChangedEventArgs<T>` или производный от него тип
  (`RangeValueChangedEventArgs`, `TextChangedEventArgs`).
- Событие, вызываемое до того, как что-то произойдёт, `…ing`, передаёт `CancelEventArgs` или производный от него тип.
  Обработчик задаёт `Cancel` или меняет значения, которые открывает тип:

```csharp
LocalPlayer.Stamina.Draining += (_, e) =>
{
    if (e.Use == StaminaUse.Harvest) e.Amount *= 0.5f;   // половина расхода при сборе
};

Skill.ExperienceGaining += (_, e) =>
{
    if (e.Skill.Kind == SkillKind.Fishing) e.Cancel = true;   // без опыта рыбалки
};
```

Обработчики выполняются в порядке подписки. Моды подписываются в `OnLoad` в порядке загрузки, поэтому обработчики
мода-зависимости срабатывают раньше, чем обработчики тех, кто от него зависит.

## Имена во всём SDK {/* #naming-across-the-sdk */}

Каждое слово означает одно и то же в каждом модуле:

| Слово | Значение |
|---|---|
| `Name` | Id в коде: предмета, работы, команды |
| `DisplayName` | Текст, который видит игрок |
| `AssetName` | Собственное имя ассета в игре, например `Item_Wood_Sticks` |
| `ModId` | Мод, которому что-то принадлежит |
| `Minimum`, `Maximum` | Границы |
| `…Fraction` | Доля целого, от 0 до 1 |
| `With…` | Построитель, задающий одно значение |
| глагол (`Needs`, `MadeAt`, `MoveTo`) | Построитель, добавляющий часть или шаг |
| `Add`, `Remove` | То, что мод добавляет и убирает, на одном и том же хосте |
| `Find` | Возвращает `null`, если ничего не нашлось |

Подписка без собственного объекта, например горячая клавиша или привязка, заканчивается, когда вы освобождаете
(dispose) то, что вернули `Add` или `Bind`.
