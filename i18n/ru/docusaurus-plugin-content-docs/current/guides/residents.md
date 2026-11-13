---
title: Жители и работы
description: Жители поселения (Resident в SDK) и собственные работы мода.
keywords: [житель, жители, villager, Villager, SSSGame.Villager, resident, Resident, Residents, работа, ResidentJob]
---

# Жители и работы

`Mjolnir.SDK.AI` даёт модам жителей поселения и собственные работы, которые жители берут по приоритету среди задач
самой игры. Подключите `Mjolnir.SDK.AI.dll` и добавьте `using Mjolnir.SDK.AI;`.

Житель игры в SDK — это `Resident`. Собственный тип игры — `SSSGame.Villager`; другое имя не даёт им смешаться в
моде, который использует оба.

## Жители {/* #residents */}

| Свойство или метод | Что |
|---|---|
| `Residents.All` | Жители загруженного мира в порядке появления; пусто вне мира |
| `Residents.Added`, `Removed` | Житель пришёл (появился, загружен с сохранением) или ушёл (умер, ушёл, его мир выгружен) |
| `Residents.Spawn(position)` | Просит у игры нового жителя на проходимой земле в пределах 3 м; он появляется с обычным приветствием игры. Вне мира — `false` |

`Resident` — один житель, один и тот же объект, пока он жив:

| `Resident` | Что |
|---|---|
| `Name`, `Position` | Как их показывает игра. Ушедший житель сохраняет последние |
| `IsAlive` | В мире ли он ещё |
| `Activity` | Чем он занят: полное имя работы мода `<mod id>.<job>`, иначе собственный квест игры (`WorkstationIdleQuest`, `VillagerSocialQuest`…) |
| `ModJob` | Работа мода, которую он выполняет сейчас, или `null` |
| `Sheet` | Его [лист персонажа](characters.md) |
| `Animator` | Его [аниматор](animations.md) |
| `Combatant` | Он же в [бою](combat.md): здоровье, урон, смерть |

Читайте жителей в главном потоке: в колбэках, шагах работы или событиях.

## Работы {/* #jobs */}

У работы есть шаги, выполняемые по порядку, и функция приоритета, которую спрашивают для каждого жителя:

```csharp title="GreetMod.cs"
using System;
using System.Collections.Generic;
using Mjolnir.SDK;
using Mjolnir.SDK.AI;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;
using UnityEngine;

namespace GreetMod;

[ModManifest("author.greet", "Greet", "1.0.0")]
public sealed class GreetMod : Mod
{
    private readonly Dictionary<Resident, float> _greeted = [];

    public override void OnLoad()
    {
        Residents.AddJob("greet", priority: Wants)
                 .MoveTo(_ => LocalPlayer.Position, distance: 3f)
                 .Wait(TimeSpan.FromSeconds(2))
                 .Do(villager =>
                 {
                     _greeted[villager] = Time.time;
                     Notify.Message($"{villager.Name} says hello");
                 });

        Residents.Removed += (_, e) => _greeted.Remove(e.Resident);
    }

    // Спрашивается примерно раз в секунду для каждого жителя: держите её быстрой.
    private float Wants(Resident villager)
    {
        if (!LocalPlayer.IsSpawned) return -1f;
        if (_greeted.TryGetValue(villager, out float at) && Time.time - at < 180f) return -1f;
        return Vector3.Distance(villager.Position, LocalPlayer.Position) <= 25f ? 12f : -1f;
    }
}
```

| Шаг | Что |
|---|---|
| `MoveTo(place, distance)` | Идёт к месту, которое спрашивается в начале шага, пока не окажется в пределах `distance` метров. Сдаётся через минуту и заканчивается после 3 с стояния на месте рядом с целью, так как жители, идущие в одну точку, не дают друг другу дойти |
| `Wait(duration)` | Остаётся на месте |
| `Do(action)` | Выполняет действие один раз, в главном потоке |
| `Play(animation, options, duration)` | Проигрывает анимацию там, где стоит житель; шаг закончен, когда она кончилась или вышло `duration`. См. [Анимации](animations.md#villagers) |
| `Use(interaction, duration, animation, options)` | Подходит к [взаимодействию](interactions.md#villagers), ждёт своей очереди и остаётся у него, затем вызывает его `Used` |

После последнего шага работа заканчивается, и житель выбирает снова. Чтобы работа не запускалась сразу снова,
понижайте её приоритет сами — перезарядкой или флагом «сделано», как выше.

## Приоритеты {/* #priorities */}

Житель берёт работу примерно в течение секунды, когда её приоритет выше любого другого его квеста. Возвращайте `-1`
или меньше, когда работа сейчас не для этого жителя. В работающем поселении собственные квесты игры просят:

| Приоритет | Квест игры |
|---|---|
| 21 | Сон, в свой час |
| 15 | Работа |
| 13 | Жалоба на рабочее место |
| 11 | Безделье на рабочем месте |
| 2 | Обрушение пещеры |
| 1 | Жалоба |
| 0 | Разговор с другими |
| -1 | Не нужен |

Работа, просящая 12, берёт только жителей без дела; просящая 16 забирает работника с его работы. Житель уходит с
квеста не мгновенно: праздный — за секунду, а рыбаку в море нужно время. Не рассчитывайте, что работа
начнётся сразу.

Функция приоритета выполняется под изоляцией ошибок мода: если она бросит исключение, мод отключается и работу больше
никогда не берут.

:::note
Разум жителей работает на хосте мира, которым в одиночной игре является игрок. Подключившийся клиент ещё не проверен.
Собственные решения мода и назначение жителей на рабочие места пока не входят в SDK.
:::
