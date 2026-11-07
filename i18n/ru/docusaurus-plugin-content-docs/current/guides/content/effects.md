---
title: Эффекты состояния
---

# Эффекты состояния

`Effects.Add(name, basedOn, icon)` добавляет собственный эффект состояния мода, сделанный из одного из эффектов игры
(по умолчанию `Effect_Leisure`). Основа даёт вид, правила стаков и визуальные эффекты; мод даёт ему имя, id, тексты,
картинку и, если захочет, собственные изменения атрибутов, которые заменяют изменения основы.

```csharp title="BlessingMod.cs"
using System;
using Mjolnir.SDK;
using Mjolnir.SDK.Content;
using Mjolnir.SDK.Player;

namespace BlessingMod;

[ModManifest("author.blessing", "Blessing", "1.0.0")]
public sealed class BlessingMod : Mod
{
    private ModEffect _blessing = null!;

    public override void OnLoad()
    {
        _blessing = Effects.Add("blessing", icon: "items/blessing.png")
                           .Modifies("Attribute_Strength", 3)
                           .PerSecond("VariableAttribute_Health", 1);

        DevConsole.Add("bless", "Blesses the player for a minute.", _ =>
        {
            if (!LocalPlayer.Sheet.Effects.Has(_blessing))
                LocalPlayer.Sheet.Effects.Apply(_blessing, TimeSpan.FromMinutes(1));
        });
    }
}
```

| Метод | Что делает |
|---|---|
| `Modifies(stat, amount, kind)` | Пока эффект действует, меняет атрибут-сумму, например `Attribute_Strength`. `kind` — `Add`, `Multiply` или `Percent` |
| `PerSecond(pool, amount)` | Пока он действует, каждую секунду прибавляет к запасу, например `VariableAttribute_Health`. Отрицательное значение отнимает |

```toml title="lang/english.toml"
[effect.blessing]
name = "Blessing"
description = "Stronger, and wounds close by themselves."
added = "You feel blessed."
removed = "The blessing fades."
```

`added` и `removed` — сообщения, которые показываются, когда эффект появляется и проходит.

## Наложение эффектов {/* #applying-effects */}

Эффект мода — такой же `EffectInfo`, как эффекты игры, и накладывается на любого персонажа через его лист:
`LocalPlayer.Sheet.Effects` или `Resident.Sheet.Effects` жителя. См.
[Персонажи и характеристики](../characters.md#effects).

- `Apply(effect, duration)` накладывает его на время, а без длительности — пока его не снимут. Уже действующий эффект
  получает новый стак или начинается заново, как велят его собственные правила.
- Сохранение хранит его вместе с оставшимся временем. Мод, который накладывает эффект при каждом появлении персонажа,
  должен сначала спросить `Has`, иначе эффект будет копиться от загрузки к загрузке.

## Id {/* #ids */}

Id эффекта берётся из id мода и его имени, как у предмета, но сеть передаёт id эффектов в 16 битах, поэтому два
эффекта могут совпасть по id. Тогда эффект, добавленный позже, не попадает в игру, ошибка в логе называет оба, а
`Apply` возвращает для него `false`. Мод продолжает работать; другое имя даёт другой id.
