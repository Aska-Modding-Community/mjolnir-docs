---
title: HUD, меню и уведомления
---

# HUD, меню и уведомления

Всё здесь можно зарегистрировать в `OnLoad`. SDK помещает это в интерфейс игры всякий раз, когда этот интерфейс
существует: элемент HUD появляется в каждом мире, кнопка меню — в каждом новом главном меню.

## HUD {/* #hud */}

```csharp
var line = new UiTextBlock { FontSize = 18 };
line.Bind(UiTextBlock.TextProperty, () => $"{LocalPlayer.Stamina.Value:0} stamina", System.TimeSpan.FromSeconds(0.2));
Hud.Add(line, HudAnchor.TopRight);
```

| Член | Что |
|---|---|
| `Hud.Add(element, anchor)` | Элемент в углу HUD: `TopLeft`, `TopCenter`, `TopRight`, `BottomLeft`, `BottomRight` |
| `Hud.AddAt(element, () => position, offset)` | Элемент над точкой мира, за которой он следует. Скрывается, пока точка позади камеры или за пределами экрана |
| `Hud.AddAt(element, transform, worldOffset, offset)` | То же над объектом Unity |
| `Hud.Remove(element)` | Убирает элемент сразу |
| `Hud.Ready` | Возникает, когда появляется HUD мира |
| `Hud.Root` | `RectTransform` HUD, пока он существует |

Элементы HUD масштабируются собственной настройкой масштаба HUD игры, умноженной на масштаб HUD игрока в настройках
Mjolnir.

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

`UiMenuItem` с `Items` открывает собственный уровень любой глубины; **Назад** игры и Esc поднимаются на уровень выше. В
главном меню это страница того же вида, что у игры; в меню паузы уровень занимает место меню.

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

`Menus.Main.Remove(item)` убирает пункт обратно. `MenuButtons.Opened` возникает при открытии меню.

## Вкладки в окнах игры {/* #tabs-in-the-games-windows */}

`Menus.Settings` и `Menus.Journal` добавляют собственную вкладку мода после вкладок игры в меню настроек и журнале.
Вкладка выглядит как вкладка-значок окна, с её заголовком и названием мода во всплывающей карточке. Q и E доходят до
неё, как до вкладок игры.

```csharp
UiTabItem tab = Menus.Settings.Add(new UiTabItem
{
    Header = "My mod",
    Content = new UiStackPanel { Children = { SettingControls.For(Config.Bind("General", "Enabled", true)) } },
});
```

Без `Icon` вкладка показывает первую букву своего заголовка. Задавайте значок в `OnGameReady` или позже, поскольку
картинкам нужна запущенная игра. Изменение `Header`, `Icon`, `IsVisible` или `Content` элемента доходит до уже
показанных вкладок.

## Горячие клавиши {/* #hotkeys */}

```csharp
ConfigEntry<KeyGesture> key = Config.Bind("Keys", "Window", KeyGesture.Parse("F7"), "Opens the window.");
System.IDisposable hotkey = HotKeys.Add(key, () => Notify.Message("F7"));
```

`HotKeys.Add` принимает `KeyGesture` или привязываемое значение (bindable) с ним, например запись конфига, которую игрок
переназначает в окне модов. Сочетание срабатывает только ровно со своими модификаторами и никогда — пока игрок печатает
в текстовом поле. Освободите результат, чтобы убрать горячую клавишу.

Имена клавиш — из Unity Input System: `F8`, `A`, `Digit1`, `Backquote`, `Space`, с `Ctrl`, `Shift` и `Alt`, соединёнными
через `+`: `"Ctrl+Shift+F8"`. `KeyGesture.None` — отсутствие клавиши.

## Масштаб интерфейса {/* #interface-scale */}

`InterfaceScale.Menus` и `InterfaceScale.Hud` — настройки масштаба игрока на странице настроек Mjolnir, в виде
привязываемых множителей от 0,75 до 1,5. `Menus` масштабирует окна модов во всём диапазоне, а меню игры — только вниз
до 75 %, поскольку они разложены так, чтобы заполнять экран. `Hud` умножает собственный масштаб HUD игры. Меняйте их,
только когда об этом просит ваш игрок.
