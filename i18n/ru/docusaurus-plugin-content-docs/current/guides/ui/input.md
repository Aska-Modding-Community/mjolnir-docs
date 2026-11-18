---
title: Мышь, клавиатура и управление игрока
sidebar_label: Мышь и клавиатура
---

# Мышь, клавиатура и управление игрока

Мод со своим инструментом — видом сверху, кистью, режимом расстановки — забирает управление игрока, пока инструмент
включён, и сам читает мышь и клавиши. Всё это есть в `Mjolnir.SDK.UI`: подключите `Mjolnir.SDK.UI.dll` и добавьте
`using Mjolnir.SDK.UI;`. Пример ещё использует модули камеры и рельефа, чтобы найти землю под курсором.

```csharp title="MarkerMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Camera;
using Mjolnir.SDK.Terrain;
using Mjolnir.SDK.UI;
using UnityEngine;

namespace MarkerMod;

[ModManifest("author.marker", "Marker", "1.0.0")]
public sealed class MarkerMod : Mod
{
    private ControlsCapture? _tool;
    private LandscapeOutline? _brush;
    private float _radius = 3;

    public override void OnGameReady()
    {
        HotKeys.Add(KeyGesture.Parse("F6"), Toggle);
        HotKeys.Add(KeyGesture.Parse("Escape"), Stop); // пока управление забрано, Esc не открывает меню паузы
    }

    private void Toggle()
    {
        if (_tool != null)
        {
            Stop();
            return;
        }
        var tool = PlayerControls.Capture();
        tool.Ended += (_, _) =>
        {
            if (_tool == tool) Stop(); // игрок вышел из мира или мод отключён после ошибки
        };
        _tool = tool;
    }

    private void Stop()
    {
        _tool?.Dispose(); // игрок снова ходит
        _tool = null;
        _brush?.Dispose();
        _brush = null;
    }

    public override void OnUpdate()
    {
        if (_tool is not { IsActive: true }) return;

        float step = (KeyboardInput.Modifiers & KeyModifiers.Shift) != 0 ? 2f : 0.5f;
        _radius = Mathf.Clamp(_radius + MouseInput.Wheel * step, 1, 20);

        Ray ray = GameCamera.ScreenPointToRay(MouseInput.Position);
        if (MouseInput.IsOverInterface || !Landscape.TryRaycast(ray, 300, out Vector3 point)) return;

        LandscapeArea area = LandscapeArea.Circle(point, _radius);
        if (_brush == null) _brush = Landscape.ShowOutline(area, Color.cyan);
        else _brush.Area = area;

        if (MouseInput.WasPressed(MouseButton.Left))
            Notify.Message($"{point.y:0.00} m at ({point.x:0}, {point.z:0})");
    }
}
```

## Управление игрока {/* #the-players-controls */}

`PlayerControls.Capture()` забирает управление игрока в загруженном мире, пока результат не освобождён:

- персонаж стоит на месте и ничего не атакует;
- камера игры не поворачивается и не приближается;
- быстрые слоты и клавиши меню (Esc, инвентарь, карта, строительство) ничего не делают;
- виден курсор мыши.

Что работает по-прежнему: горячие клавиши (`HotKeys`), собственные окна мода, а также `MouseInput` и `KeyboardInput`,
которые читают устройства сами. Окно мода, открытое поверх захвата, забирает клавиши, пока открыто; когда оно
закрывается, захват снова держит управление. Esc в это время не открывает меню паузы, поэтому дайте игроку клавишу,
которая выключает инструмент, — хоть сам Esc, как в примере.

| `ControlsCapture` | Что |
|---|---|
| `Dispose()` | Возвращает управление в следующем кадре. Повторный вызов ничего не делает |
| `Ended` | Вызывается один раз в главном потоке, когда захват кончается, по любой причине: освобождён, игрок вышел из мира, его мод отключён после ошибки |
| `IsActive` | Держит ли он ещё управление |
| `ShowsCursor` | Виден ли курсор, пока он держит; `Capture(showCursor: false)` начинает без курсора |

`PlayerControls.IsCaptured` говорит, держит ли сейчас управление какой-нибудь мод. Захватов может быть несколько
сразу — у одного мода или у разных; управление возвращается после того, как кончится последний, а курсор виден, пока
его просит хоть один.

`Capture` можно вызывать из любого потока, держать он начинает со следующего кадра. Захват, сделанный без
загруженного мира, кончается сразу.

## Мышь {/* #the-mouse */}

`MouseInput` читает мышь, где бы ни был игрок, в том числе пока управление забрано и пока игра мышь не слушает.
Значения — этого кадра; читайте их в главном потоке (в `OnUpdate`): в других они пусты.

| `MouseInput` | Что |
|---|---|
| `Position` | Где стоит курсор на экране, в пикселях от его левого нижнего угла |
| `IsPressed(button)` | Зажата ли кнопка сейчас |
| `WasPressed(button)` | Нажата ли она в этом кадре |
| `WasReleased(button)` | Отпущена ли она в этом кадре |
| `Wheel` | Насколько повернулось колесо в этом кадре, в щелчках: больше нуля — от игрока, 0 — не поворачивалось |
| `IsOverInterface` | Стоит ли курсор над окном или меню, в том числе над окном мода. HUD не считается |
| `IsAvailable` | Есть ли у игры мышь |

`MouseButton` — это `Left`, `Right` или `Middle`. `GameCamera.ScreenPointToRay(MouseInput.Position)` — луч под
курсором; `Landscape.TryRaycast` находит, где он встречает землю ([Рельеф](../terrain.md#tools-on-the-ground)).

## Клавиатура {/* #the-keyboard */}

`KeyboardInput` читает клавиши, зажатые во времени, чего горячая клавиша сказать не может: своя камера мода, которая
движется, пока зажата W, кисть, которая работает, пока клавиша нажата. Для клавиши, которая при нажатии запускает
код, проще `HotKeys` ([Горячие клавиши](hud-and-menus.md#hotkeys)). Читайте её в главном потоке; в других все клавиши
отпущены.

| `KeyboardInput` | Что |
|---|---|
| `IsPressed(key)` | Зажата ли клавиша сейчас |
| `WasPressed(key)` | Нажата ли она в этом кадре |
| `WasReleased(key)` | Отпущена ли она в этом кадре |
| `Modifiers` | Зажатые сейчас модификаторы, флаги `KeyModifiers`: `Control`, `Shift`, `Alt`, любой стороны |
| `IsTyping` | Печатает ли игрок сейчас в текстовом поле: его клавиши — для поля |
| `IsAvailable` | Есть ли у игры клавиатура |

Клавиши называются так же, как в `KeyGesture`, по именам Unity Input System: `W`, `LeftShift`, `Digit1`, `F7`,
`Escape`. Имя, которое не клавиша, никогда не нажато, и об этом один раз пишется в журнал.

```csharp
if (!KeyboardInput.IsTyping && KeyboardInput.IsPressed("W"))
    pivot += forward * speed * Time.deltaTime;
```

:::note[Ещё не сделано]
- Геймпады: у `MouseInput` и `KeyboardInput` нет пары для геймпада, а захват проверен только с мышью и клавиатурой.
- Курсор — системная стрелка; задать ему свою картинку мод не может.
:::
