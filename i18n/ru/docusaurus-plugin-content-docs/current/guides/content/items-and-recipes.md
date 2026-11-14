---
title: Предметы и рецепты
---

# Предметы и рецепты

`Mjolnir.SDK.Content` добавляет собственные предметы, рецепты, постройки и эффекты состояния мода. Подключите
`Mjolnir.SDK.Content.dll` и добавьте `using Mjolnir.SDK.Content;`. Всё добавляется в `OnLoad`.

Мод со своим контентом нужен каждому игроку сетевой сессии: Mjolnir помечает его так, когда он добавляет первый
предмет, и игрок, чьи моды отличаются от модов хоста, при подключении получает отказ. См.
[Мультиплеер](../network.md).

Ассеты игры указываются по имени ассета: `Item_Wood_Sticks`, `Item_Materials_BasicRope`,
`Item_Structures_WorkshopL0`. Их перечисляет команда консоли `items <words>`; см.
[Консоль разработчика](../console.md).

## Предметы {/* #items */}

Предмет — копия предмета игры. Он сохраняет модель основы в мире, её вид, размер и звуки; мод даёт ему имя, картинку,
размер стопки и тексты. Основа — предмет игры, названный в `basedOn`, или простой предмет одного из
[видов](#kinds-of-items).

```csharp title="TwineMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Content;

namespace TwineMod;

[ModManifest("author.twine", "Twine", "1.0.0")]
public sealed class TwineMod : Mod
{
    public override void OnLoad()
    {
        ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope", icon: "items/twine.png", stackSize: 20);

        // Две палки и верёвка дают две бечёвки, вручную и в мастерской, где делается верёвка.
        Recipes.Add(twine, quantity: 2)
               .Needs("Item_Wood_Sticks", 2)
               .Needs("Item_Materials_BasicRope", 1);

        // Катушка из пяти бечёвок и палки, только в мастерской.
        ModItem spool = Items.Add("twine_spool", basedOn: "Item_Materials_BasicRope", icon: "items/twine_spool.png", stackSize: 10);
        Recipes.Add(spool)
               .Needs(twine, 5)
               .Needs("Item_Wood_Sticks", 1)
               .MadeAt("Item_Structures_WorkshopL0");
    }
}
```

`Items.Add(name, basedOn, icon, stackSize)`:

- `name` — буквы, цифры и подчёркивания, уникально в пределах мода. То же имя ещё раз возвращает уже добавленный
  предмет; то же имя с другой основой выбрасывает исключение.
- `icon` — PNG или JPG относительно папки мода. Без него — картинка основы.
- `stackSize` — сколько помещается в слот. Без него — как у основы.

Тексты берутся из файлов `lang` мода:

```toml title="lang/english.toml"
[item.twine]
name = "Twine"
description = "Thin cord twisted from rope fibres."
lore = "Coiled so it does not tangle."
```

Пропущенные описание или лор ничего не показывают. См. [Локализация](../../concepts/localization.md).

## Виды предметов {/* #kinds-of-items */}

Предмет опирается на предмет игры одним из двух способов:

| Вызов | Основа | Для чего |
|---|---|---|
| `Items.Add(name, basedOn, icon, stackSize)` | Названный предмет игры | Предмет, похожий на конкретный предмет игры: железный топор, длинный лук, верёвку |
| `Items.Add(name, kind, icon, stackSize)` | Простой предмет игры вида `ItemKind` | Оружие, часть брони, еда или материал без имени предмета игры |

Вид определяет, куда предмет попадает в инвентаре, как его носят, держат или надевают и что он делает. У предмета
картинка, облик, звуки и числа основы, пока мод не задаст свои. `ModItem.Kind` — вид, с которым он добавлен, `null`
для предмета, созданного через `basedOn`.

```csharp
ModItem sword = Items.Add("rune_sword", ItemKind.OneHandedWeapon, icon: "items/rune_sword.png").WithDamage(14, 18);
ModItem hood = Items.Add("rune_hood", ItemKind.Helmet).WithArmor(60);
ModItem cake = Items.Add("honey_cake", ItemKind.Food, stackSize: 5);
```

| `ItemKind` | Что это | Основа | Принимает, кроме `WithArmor`, `WithDurability`, `WithAttribute` |
|---|---|---|---|
| `Material` | Небольшой материал для крафта, много в одной ячейке | Верёвка | |
| `LargeMaterial` | Длинный или тяжёлый материал, который носят на спине | Доска | |
| `Food` | Съедается из инвентаря | Ягоды | `AppliesWhenEaten` |
| `OneHandedWeapon` | В правой руке, рядом можно держать щит | Железный меч | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `TwoHandedWeapon` | В обеих руках | Двуручный железный меч | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `Shield` | В левой руке | Грубый круглый щит | `WithDamage`, `AppliesOnHit`, `AppliesWhileEquipped` |
| `Bow` | В обеих руках, стреляет стрелами | Простой лук | `WithDamage`, `AppliesWhileEquipped` |
| `Arrow` | В колчане | Деревянные стрелы | `WithDamage`, `AppliesWhileEquipped` |
| `Helmet`, `Chest`, `Pants`, `Boots`, `Gloves`, `Cape` | Надеваются | Тканевый комплект | `AppliesWhileEquipped` |

Метод, который вид не принимает, бросает `InvalidOperationException`. У предмета, созданного через `basedOn`, решает
собственный вид основы, а неподходящий метод пишет предупреждение в лог. Что делает каждый метод — в
[Оружии, броне и еде](equipment.md).

## Id и сохранения {/* #ids-and-saves */}

Id предмета — хеш id мода и имени предмета. Он всегда отрицательный (id игры такими не бывают) и одинаков на каждой
машине и при каждом запуске, какие бы другие моды ни были установлены. Имя ассета — `Item_<mod id>_<name>`.

Игра сохраняет предметы по id, поэтому сохранение загружает предметы мода обратно. Без мода игра молча отбрасывает их,
и следующее сохранение пишется без них. После релиза не переименовывайте предмет и не меняйте id мода: id изменится,
и сохранённые предметы пропадут.

## Рецепты {/* #recipes */}

`Recipes.Add(result, quantity, basedOn)` добавляет рецепт, который делает `quantity` штук предмета мода.
`Needs(item, count)` добавляет ингредиент, по имени ассета или как `ModItem`, в заданном порядке. Один рецепт на
результат; второй `Add` для того же предмета возвращает первый.

Рецепт — копия рецепта игры, по умолчанию рецепта верёвки (`Item_Binders_BasicRope`). Он берёт вид и раздел меню этого
рецепта и делается там же, где он: верёвка — вручную и в мастерской любого уровня.

### Где делается рецепт {/* #where-a-recipe-is-made */}

`MadeAt(place)` заменяет места основы. Вызывайте его по разу на каждое место:

| Место | Значение |
|---|---|
| `ModRecipe.ByHand` | Крафт в меню строительства |
| имя ассета сооружения | Его столы крафта и столы каждого сооружения, до которого оно улучшается: `Item_Structures_WorkshopL0` покрывает все уровни мастерской. Подходит и пристройка, например `Item_Addons_Weaver` |

- Ручной рецепт известен с самого начала: игрок новой игры начинает с ним, игрок старого сохранения получает его при
  загрузке мира.
- Станция знает рецепты своих столов крафта независимо от того, что знает игрок. Игрок крафтит их за её столом; её
  жители делают их по запросу.
- Станции берут рецепты при постройке или загрузке: задавайте места в `OnLoad`.

## Выдача предметов {/* #giving-items */}

```csharp
ModItem twine = Items.Add("twine", basedOn: "Item_Materials_BasicRope");   // тот же предмет, что выше

int given = Items.Give(twine, 10);              // предмет мода
int sticks = Items.Give("Item_Wood_Sticks", 5);  // предмет игры по имени ассета
```

`Give` возвращает, сколько попало в инвентарь локального игрока: 0 не в главном потоке, вне мира или без места.
`Items.CanGive` сообщает, можно ли выдавать предметы сейчас.

:::note[Ещё не сделано]
Рецепт, добавленный после того, как станция уже стоит, доходит до неё только при следующей загрузке.
:::
