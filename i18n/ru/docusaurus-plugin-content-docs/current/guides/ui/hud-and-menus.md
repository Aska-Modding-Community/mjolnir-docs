---
title: HUD, меню и уведомления
---

# HUD, меню и уведомления

Всё на этой странице можно зарегистрировать в `OnLoad`. SDK вставляет это в интерфейс игры, когда тот существует:
элемент HUD появляется в каждом мире, кнопка меню — в каждом новом главном меню.

## HUD {/* #hud */}

```csharp
var line = new UiTextBlock { FontSize = 18 };
line.Bind(UiTextBlock.TextProperty, () => $"{LocalPlayer.Stamina.Value:0} stamina", System.TimeSpan.FromSeconds(0.2));
Hud.Add(line, HudAnchor.TopRight);
```

| Свойство или метод | Что |
|---|---|
| `Hud.Add(element, anchor)` | Элемент в углу HUD: `TopLeft`, `TopCenter`, `TopRight`, `BottomLeft`, `BottomRight` |
| `Hud.AddAt(element, () => position, offset)` | Элемент над точкой мира, за которой он следует. Скрывается, пока точка позади камеры или за пределами экрана |
| `Hud.AddAt(element, transform, worldOffset, offset)` | То же над объектом Unity |
| `Hud.AddInPlaceOf(element, part)` | Элемент на место части HUD игры, во всех мирах с этого момента: часть игры скрывается, её скрипты продолжают работать, и она возвращается, когда элемент убирают. `HudPart.QuickBar` — это ряд слотов 1–0 внизу |
| `Hud.Remove(element)` | Убирает элемент сразу |
| `Hud.Ready` | Возникает, когда появляется HUD мира |
| `Hud.Root` | `RectTransform` HUD, пока он существует |

Элементы HUD масштабируются настройкой масштаба HUD игры, умноженной на масштаб HUD игрока в настройках Mjolnir.

Ряд `UiQuickSlot` на месте быстрой панели — это собственный инструмент мода с режимами по цифрам:

```csharp
var bar = new UiStackPanel { Orientation = Orientation.Horizontal, Spacing = 20 };
bar.Children.Add(new UiQuickSlot { Icon = flatten, Key = "1", IsSelected = true });
bar.Children.Add(new UiQuickSlot { Icon = smooth, Key = "2" });
Hud.AddInPlaceOf(bar, HudPart.QuickBar);
```

## Палитра в виде меню строительства {/* #a-palette-in-the-build-menus-look */}

`BuildPalette` — собственная палитра мода, нарисованная как меню строительства игры: категории ромбами в два ряда,
название выбранной под ними, её элементы плитками над ними и ✕. Само меню строительства игры не трогается — палитра
копирует его вид и показывается на его месте, пока открыта.

```csharp
var palette = new BuildPalette();
var trees = new PaletteCategory("Trees", treesIcon);
trees.Items.Add(new PaletteItem("Willow", willowPicture) { Tag = "tree_willow" });
palette.Categories.Add(trees);
palette.ItemChosen += (_, e) => Place((string)e.Item.Tag!);
palette.Open();
```

| `BuildPalette` | Что |
|---|---|
| `Categories` | Список `PaletteCategory`: `DisplayName`, значок ромба `Icon` (у игры 40 × 40) и `Items` |
| `SelectedCategory`, `SelectCategory(step)` | Показанная категория и переход между ними, как по Q и E |
| `SelectedItem`, `ItemChosen` | Выбранная плитка: `PaletteItem` со своими `DisplayName`, `Picture` (примерно 4 : 3) и `Tag` |
| `Open()`, `Close()`, `Toggle()`, `IsOpen`, `Closed` | Показ палитры и её закрытие |
| `Refresh()` | Перерисовывает категории и плитки после их изменения |
| `Dispose()` | Убирает палитру |

Палитра сама берёт мышь, в том числе когда управление игрока захвачено: ромб выбирает категорию, плитка выбирает
элемент и закрывает палитру, колесо прокручивает плитки, Q и E переключают категории. Пока она открыта,
`MouseInput.IsOverInterface` над ней истинно.

## Уведомления {/* #notifications */}

По умолчанию они выглядят как собственные уведомления игры.

| Вызов | Что |
|---|---|
| `Notify.Message(text)` | Уведомление игры с зелёной галочкой |
| `Notify.Message(text, icon)` | То же с картинкой, как игра показывает урожай |
| `Notify.Counter(key, text, amount, icon)` | Уведомление, которое суммируется, пока показано, как игра считает подобранное: «x5». Отрицательное количество показывается красным |
| `Notify.Banner(title, text, seconds)` | Крупное уведомление вверху по центру, как сообщения игры о сезонах и открытиях |

```csharp
Notify.Counter("logs", "Logs", 1);   // «Logs x1», затем «x2»… пока оно на экране
```

## Диалоги {/* #dialogs */}

Собственные диалоги игры: подтверждение, сообщение и ввод текста. Тексты кнопок по умолчанию на языке игрока.

```csharp
bool sure = await Dialog.ConfirmAsync("Reset", "Start the settlement over?");
await Dialog.MessageAsync("Done", "The settlement was reset.");
string? name = await Dialog.PromptAsync("Name", "What is the village called?", text: "Hrafnsey", maxLength: 24);
```

У каждого есть и форма с колбэками: `Dialog.Confirm(title, message, onConfirm, onCancel)`. Когда диалог нельзя показать,
ожидаемые формы сразу завершаются с `false` или `null`.

## Главное меню и меню паузы {/* #the-main-and-pause-menus */}

`Menus.Main` и `Menus.Pause` принимают кнопки и пункты меню:

```csharp
Menus.Pause.Add(new UiButton { Content = "My mod" }).OnClick(() => Notify.Message("Hello"));
```

`UiMenuItem` с `Items` открывает собственный уровень любой вложенности; **Назад** игры и Esc поднимаются на уровень
выше. В главном меню уровень — страница того же вида, что у игры; в меню паузы он занимает место меню.

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

`Menus.Main.Remove(item)` убирает пункт. `MenuButtons.Opened` возникает при открытии меню.

## Вкладки в окнах игры {/* #tabs-in-the-games-windows */}

`Menus.Settings` и `Menus.Journal` добавляют вкладку мода после вкладок игры в меню настроек и журнале. Это
вкладка-значок в стиле окна, с её заголовком и названием мода во всплывающей карточке. Q и E доходят до неё, как до
вкладок игры.

```csharp
UiTabItem tab = Menus.Settings.Add(new UiTabItem
{
    Header = "My mod",
    Content = new UiStackPanel { Children = { SettingControls.For(Config.Bind("General", "Enabled", true)) } },
});
```

Без `Icon` вкладка показывает первую букву своего заголовка. Задавайте значок в `OnGameReady` или позже: картинкам
нужна запущенная игра. Изменения `Header`, `Icon`, `IsVisible` или `Content` элемента доходят до уже показанных
вкладок.

## Горячие клавиши {/* #hotkeys */}

```csharp
ConfigEntry<KeyGesture> key = Config.Bind("Keys", "Window", KeyGesture.Parse("F7"), "Opens the window.");
System.IDisposable hotkey = HotKeys.Add(key, () => Notify.Message("F7"));
```

`HotKeys.Add` принимает `KeyGesture` или привязываемое значение с ним, например настройку конфига, которую игрок
переназначает в окне модов. Сочетание срабатывает только ровно со своими модификаторами и никогда — пока игрок печатает
в текстовом поле. Чтобы убрать горячую клавишу, освободите результат.

Имена клавиш — из Unity Input System: `F8`, `A`, `Digit1`, `Backquote`, `Space`, с `Ctrl`, `Shift` и `Alt`, соединёнными
через `+`: `"Ctrl+Shift+F8"`. `KeyGesture.None` — отсутствие клавиши.

## Масштаб интерфейса {/* #interface-scale */}

`InterfaceScale.Menus` и `InterfaceScale.Hud` — настройки масштаба игрока на странице настроек Mjolnir, в виде
привязываемых множителей от 0,75 до 1,5. `Menus` масштабирует окна модов во всём диапазоне, а меню игры — только вниз
до 75 %, поскольку они разложены так, чтобы заполнять экран. `Hud` умножает собственный масштаб HUD игры. Меняйте их
только по просьбе игрока.
