---
title: Взаимодействия
---

# Взаимодействия

Взаимодействие — то, что игрок делает у постройки, как у колодца или дома игры: подсказка игры `E <текст>` рядом с
собственной подсказкой постройки, и клавиша взаимодействия, которую держат мгновение. Жители пользуются взаимодействиями
в [работе](residents.md). Когда взаимодействием пользуются, выполняется код мода. Взаимодействия находятся в
`Mjolnir.SDK.AI`: подключите `Mjolnir.SDK.AI.dll` и добавьте `using Mjolnir.SDK.AI;`.

## На каждой постройке одного вида {/* #on-every-building-of-a-kind */}

`Interactions.AddToBuildings(building, name, setUp)` даёт каждой постройке одного вида собственное взаимодействие,
когда она появляется в мире — построенная или загруженная с сохранением. `building` — имя ассета: `AssetName`
[постройки мода](content/buildings.md) или сооружение игры, например `Item_Structures_WaterWellL1`. `setUp`
настраивает каждое взаимодействие в главном потоке.

```csharp title="AltarMod.cs"
using System;
using Mjolnir.SDK;
using Mjolnir.SDK.AI;
using Mjolnir.SDK.Content;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace AltarMod;

[ModManifest("author.altar", "Altar", "1.0.0")]
public sealed class AltarMod : Mod
{
    public override void OnLoad()
    {
        ModBuilding altar = Buildings.Add("altar", icon: "items/altar.png")
                                     .WithModel("bundles/models", "Altar")
                                     .Needs("Item_Stone_Raw", 4);

        Interactions.AddToBuildings(altar.AssetName, "altar", a =>
        {
            a.WithText(Localization.Get("altar.pray")).WithHoldTime(TimeSpan.FromSeconds(1.5));
            a.Used += Prayed;
        });
    }

    private void Prayed(object? sender, InteractionUsedEventArgs e)
    {
        if (!e.IsPlayer) return;
        LocalPlayer.Stamina.Value = LocalPlayer.Stamina.Maximum;
        Notify.Message(Localization.Get("altar.prayed"));
    }
}
```

Игрок видит карточку постройки — её название и описание — и подсказку мода рядом с собственным меню постройки.
Подсказка появляется, когда постройка достроена.

`Interactions.Add(gameObject, name)` ставит одно взаимодействие на один объект. На объекте постройки им может
пользоваться игрок; на любом другом объекте — только жители.

## Настройки {/* #settings */}

| `ModInteraction` | По умолчанию | Что |
|---|---|---|
| `Text`, `WithText` | его имя | Слова после клавиши в подсказке |
| `Icon`, `WithIcon` | игры | Картинка в подсказке |
| `HoldTime`, `WithHoldTime` | 1 с | Сколько игрок держит клавишу; 0 — срабатывает при нажатии |
| `Distance`, `WithDistance` | 1,5 м | Насколько близко житель подходит, чтобы им воспользоваться |
| `MaxUsers`, `WithMaxUsers` | 1 | Сколько жителей пользуются им одновременно. Пока оно занято, игрок тоже не может им воспользоваться |
| `IsEnabled` | `true` | Выключенное не показывает подсказку, и жители проходят мимо |
| `PlayerCanUse` | `true` | `false` оставляет его только жителям |

Настройки можно менять когда угодно; игра покажет их в следующем кадре.

| Только чтение | Что |
|---|---|
| `Name`, `ModId` | Его имя в моде, общее для взаимодействий одного вида, и мод, который его добавил |
| `Target`, `Position` | Объект, на котором оно стоит (`null`, когда его нет), и его место |
| `IsAvailable` | Не убрано, и его объект ещё в мире |
| `IsFree` | Доступно, включено и не занято |
| `UserCount` | Жители, которые пользуются им сейчас |

## События {/* #events */}

| Событие | Когда |
|---|---|
| `Using` | Перед использованием: игроком — когда клавиша удержана, жителем — когда подошла его очередь. `e.Cancel` его отменяет |
| `Used` | После использования: игроком — сразу, жителем — после его времени у взаимодействия |

Оба передают `Interaction`, `Resident` (`null` для игрока) и `IsPlayer` и выполняются в главном потоке.

## Жители {/* #villagers */}

Шаг работы `Use` подводит жителя к взаимодействию, ждёт его очереди (не больше минуты), поворачивает его к
взаимодействию и держит там какое-то время, проигрывая анимацию, если она названа. Затем вызывается `Used`.

```csharp
Residents.AddJob("pray", r => Interactions.Nearest(r.Position, "altar") != null ? 12f : -1f)
         .Use(r => Interactions.Nearest(r.Position, "altar"), TimeSpan.FromSeconds(5), "peasant_male_idle_skal");
```

`Interactions.Nearest(position, name, radius)` даёт свободное взаимодействие вызывающего мода с этим именем,
ближайшее к месту, или `null`. Без взаимодействия, с убранным или выключенным, или когда обработчик `Using`
отменяет использование, шаг заканчивается без использования; так же — когда жителя забирает другой квест.

## Как убрать {/* #taking-it-away */}

`Interactions.Remove(interaction)` убирает взаимодействие: его подсказка исчезает, а жители на пути к нему
отказываются от него. Взаимодействие уходит и вместе со своей постройкой. `Interactions.All` перечисляет
взаимодействия всех модов; команда консоли `interactions` выводит их с местами и пользователями.

## Мультиплеер {/* #multiplayer */}

Мод каждого игрока создаёт собственные взаимодействия. Игрок пользуется ими на своей машине; жители — на хосте, где
работает их разум.

:::note[Ещё не сделано]
Подключившийся клиент ещё не проверен.
:::
