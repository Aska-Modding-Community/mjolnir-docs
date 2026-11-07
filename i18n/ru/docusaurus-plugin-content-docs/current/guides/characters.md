---
title: Персонажи и характеристики
---

# Персонажи и характеристики

`CharacterSheet` — то, из чего состоит персонаж, игрока и жителя одинаково: его базовые характеристики и все прочие
атрибуты, его навыки и его эффекты состояния. Он в основной библиотеке `Mjolnir.SDK` и не требует дополнительной
ссылки; модуль `Mjolnir.SDK.Stats` связывает его с игрой.

```csharp
CharacterSheet player = LocalPlayer.Sheet;     // Mjolnir.SDK.Player
CharacterSheet villager = Residents.All[0].Sheet;   // Mjolnir.SDK.AI
```

Лист принадлежит одному персонажу. Без персонажа или когда его не стало, лист пуст и всё читается как 0: берите его
снова после загрузки (`LocalPlayer.Spawned`). `IsAvailable` говорит, в мире ли его персонаж.

Используйте лист в главном потоке. Другой поток читает значения, в последний раз видимые там, а его изменения
применяются в следующем кадре.

## Атрибуты {/* #attributes */}

| Член | Что |
|---|---|
| `Vitality` | Максимальное здоровье |
| `Strength` | Урон в ближнем бою и скорость добычи |
| `Dexterity` | Дальний бой и крафт |
| `Intelligence` | Некоторые навыки и магия |
| `MaxStamina` | Максимальная выносливость |
| `StaminaRegeneration` | Как быстро восстанавливается выносливость |
| `Stats` | Все атрибуты персонажа, скрытые тоже (`Attribute_Armor`, `VariableAttribute_Food`…) |
| `Find(assetName)` | Один атрибут по имени ассета или `null` |

Команда консоли `stats` перечисляет все атрибуты игрока с их именами ассетов.

Каждый — это `CharacterStat`, привязываемое значение `IBindable<float>`, и либо **сумма**, либо **запас**:

| | Сумма | Запас |
|---|---|---|
| Примеры | сила, броня, уровень навыка | здоровье, еда, опыт |
| `Value` | базовое значение плюс модификаторы | текущее значение |
| `BaseValue` | значение до модификаторов | то же, что `Value` |
| `Minimum`, `Maximum`, `Fraction` | 0 | его пределы и значение как их доля |
| `AddModifier` | да | бросает исключение |

`IsPool` их различает; `AssetName`, `DisplayName` и `Description` называют атрибут. `Changed` вызывается при каждом
изменении: игрой, записью или когда модификатор появляется или уходит.

## Модификаторы {/* #modifiers */}

```csharp
StatModifier strong = LocalPlayer.Sheet.Strength.AddModifier(5);                       // +5
StatModifier faster = LocalPlayer.Sheet.StaminaRegeneration.AddModifier(0.2f, ModifierKind.Percent);   // +20 %

strong.Amount = 10;     // сразу меняет атрибут
strong.Dispose();       // снимает его
```

| Вид | Как считается |
|---|---|
| `Add` | Прибавляет своё количество |
| `Multiply` | Умножает на него: 1.25 — на четверть больше |
| `Percent` | Прибавляет в конце долю суммы: 0.2 — это 20 %. Игра складывает такие доли |

Игра не сохраняет модификаторы, и модификатор заканчивается вместе со своим персонажем: добавляйте его снова после
каждой загрузки.

## Навыки {/* #skills */}

`Skill(kind)` даёт один навык, `Skills` — все в порядке `SkillKind`: добыча дерева и камня, крафт, собирательство,
строительство, поддержание огня, охота, свежевание, рыбалка, кузнечное дело, плотницкое дело, земледелие, ближний и
дальний бой, готовка, шаманство и бой собак.

| `Skill` | Что |
|---|---|
| `Level`, `Experience`, `ExperienceMultiplier` | Собственные `CharacterStat` |
| `Rank` | `Novice` ниже 25, `Apprentice` от 25, `Adept` от 50, `Master` от 75 |
| `AddExperience(amount)` | Даёт опыт, как настоящая работа, поэтому вместе с ним приходят множитель, повышения уровня и баннер игры |

Статическое событие `Skill.ExperienceGaining` вызывается до того, как игра даст опыт любому персонажу. Измените
`Amount` или задайте `Cancel`:

```csharp
Skill.ExperienceGaining += (_, e) =>
{
    if (e.Sheet == LocalPlayer.Sheet) e.Amount *= 1.5f;
};
```

Количество — то, что приносит действие, до собственного `ExperienceMultiplier` персонажа.

## Эффекты {/* #effects */}

`Effects.All` перечисляет все эффекты состояния игры, включая эффекты модов; `Effects.Find(assetName)` находит один.
Каждый — это `EffectInfo`: `Id`, `AssetName`, `DisplayName`, `Description` и `Kind` (список, в котором игра его
показывает: `Buff`, `Debuff`, `Perk`, `Cure`…; бонус сытости — это `Debuff`). На каждый эффект один объект, поэтому
эффекты сравниваются через `==`.

`Sheet.Effects` — то, что действует на одного персонажа:

```csharp
CharacterEffects effects = LocalPlayer.Sheet.Effects;
EffectInfo? energized = Effects.Find("Effect_Energized");

if (energized != null && !effects.Has(energized))
    effects.Apply(energized, System.TimeSpan.FromMinutes(2));

effects.Added += (_, e) => Log.Info($"{e.Effect.DisplayName}, {e.Stacks} stack(s)");

foreach (ActiveEffect active in effects.Active)
    Log.Info($"{active.Effect.AssetName}: {active.TimeLeft?.TotalSeconds:0} s left");
```

| Член | Что |
|---|---|
| `Active` | Действующие сейчас эффекты, каждый со `Stacks`, `Duration` и `TimeLeft` (`null` у бессрочного) |
| `Has(effect)` | Действует ли он |
| `Apply(effect, duration)` | Накладывает его на время или, без времени, пока не снимут. `false`, когда персонажа нет или игра отказывает |
| `Remove(effect)` | Снимает его |
| `Added`, `Removed` | Вызываются, когда эффект или его стак появляется или уходит |

Игра сохраняет эффекты вместе с персонажем, каждый с оставшимся временем, поэтому мод, накладывающий эффект при
каждом появлении персонажа, сначала проверяет `Has`. Чтобы добавить свой эффект, см. [Эффекты состояния](content/effects.md).

:::note
Модификаторы локальны для машины, а эффекты идут через сетевой компонент игры. Подключившийся клиент ещё не проверен.
Собственный набор движений (moveset) или навык мода пока не поддерживаются.
:::
