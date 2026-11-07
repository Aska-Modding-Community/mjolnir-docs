---
title: Конфиг
---

# Конфиг

`Config` мода — его TOML-файл `Mjolnir/Config/<mod id>.toml`. Каждая привязанная настройка появляется и на странице
мода в окне модов, где игрок меняет её, не правя файл.

## Привязка настроек {/* #binding-settings */}

Привязывайте каждую настройку один раз, обычно в `OnLoad`. `Bind(section, key, default, description)` возвращает
`ConfigEntry<T>` со значением из файла или значением по умолчанию, если ключа нет или он неверен.

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

При первом запуске файл выглядит так; у каждой настройки в комментариях её описание, значение по умолчанию и диапазон:

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

У настройки-перечисления перечислены допустимые имена, у настройки клавиши объяснён синтаксис клавиш, а настройка с
`WithRestartRequired` сообщает, что изменение вступит в силу после перезапуска. Правьте файл, пока игра не запущена:
при выходе игра записывает в него свои значения.

## Типы и их элементы управления {/* #types-and-their-controls */}

| Тип | Хранится как | Окно модов показывает |
|---|---|---|
| `bool` | `true` / `false` | Переключатель Выкл / Вкл |
| `int`, `long`, `float`, `double` с `WithRange` | число | Ползунок |
| то же без диапазона | число | Текстовое поле |
| `string` | строка | Текстовое поле |
| перечисление до 6 имён | его имя | Переключатель |
| перечисление с бо́льшим числом имён | его имя | Выпадающий список |
| `KeyGesture` | `"Ctrl+Shift+F8"` | Клавиша, которую записывает игрок: Esc отменяет, Backspace очищает |

Для любого другого типа `Bind` бросает `NotSupportedException`.

## Настройка окна модов {/* #shaping-the-mods-window */}

Построители возвращают запись и идут цепочкой после `Bind`:

| Построитель | Действие |
|---|---|
| `WithRange(min, max)` | Ограничивает значение, в том числе значение из файла, и делает элемент управления ползунком |
| `WithDisplayName(text)` | Имя строки. В файле именем остаётся ключ |
| `WithOrder(n)` | Место внутри раздела: меньшие первыми, равные — в порядке привязки |
| `WithRestartRequired()` | Строка сообщает, что изменение применится после перезапуска, а страница настроек показывает заметку, пока такое значение отличается от того, что было при открытии страницы |

Имена разделов и строк, описания и имена значений перечислений можно перевести в файлах `lang` мода. См.
[Локализация](localization.md#the-mods-window).

## Чтение и запись {/* #reading-and-writing */}

- `entry.Value` читает текущее значение. Присваивание ограничивает его диапазоном, помечает конфиг изменённым и
  вызывает `Changed` со старым и новым значениями.
- `Changed` выполняется в потоке, который задал значение. Изменения из окна модов приходят в главном потоке.
- Файл перезаписывается, только если привязанного ключа не было или он был неверен, если значение было задано или
  вызван `Config.Save()`. Иначе комментарии и ручные правки игрока остаются как есть. Ключи, которые мод больше не
  привязывает, сохраняются.
- Изменённые значения сохраняются после `OnLoad` и при выходе из игры. Чтобы записать сразу, вызовите `Config.Save()`.
- Файл с синтаксической ошибкой TOML никогда не перезаписывается: пока файл не исправлен, мод получает значения по
  умолчанию, а ошибка с номером строки есть в логе.

## Привязка UI к настройкам {/* #binding-ui-to-settings */}

`ConfigEntry<T>` — это `IBindable<T>`: элемент управления привязывается к нему в обе стороны:

```csharp
var toggle = new UiToggleSwitch { Header = "Show the HUD line" };
toggle.Bind(UiToggleSwitch.IsCheckedProperty, Config.Bind("HUD", "Show", true));

// Или та же строка, которую построило бы окно модов:
HeaderedControl row = SettingControls.For(Config.Bind("Stamina", "Multiplier", 1f).WithRange(0f, 5f));
```

См. [Привязываемые значения и события](bindables-and-events.md) и [Привязка](../guides/ui/binding.md).
