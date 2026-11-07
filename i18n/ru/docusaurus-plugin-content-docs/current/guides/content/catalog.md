---
title: Каталог предметов
---

# Каталог предметов

`Items.All` перечисляет все предметы, которые игрок может носить, включая предметы модов, в порядке игры. Чертежи,
деревья и камни мира и отметки на карте в него не входят. Каждый предмет — один объект `ItemDefinition`.

| `ItemDefinition` | Что |
|---|---|
| `Id`, `AssetName` | Id и имя в игре |
| `DisplayName`, `Description` | Тексты на языке игрока |
| `Icon` | Его картинка, `Sprite` |
| `StackSize` | Сколько помещается в слот |
| `Category` | Его `ItemCategory` |
| `ModId` | Мод, который его добавил, `null` для предметов игры |

`Items.Categories` — верхние категории (Armor, Bags, Resources, Tools, Weapons, Decorations), каждая с категориями под
ней. У `ItemCategory` есть `Id`, `AssetName`, `DisplayName`, `Parent`, `Root`, `Children` и `Contains(category)`,
истинный для самой категории и каждой под ней.

```csharp
foreach (ItemDefinition item in Items.All.Where(i => i.Category?.AssetName == "Categ_Resources_Food"))
    Log.Info($"{item.DisplayName} ({item.AssetName}), {item.StackSize} a slot");

ItemDefinition? rope = Items.Find("Item_Materials_BasicRope");
if (rope != null && Items.CanGive) Items.Give(rope, 3);
```

- Список пуст, пока игра не построит базу предметов; в главном меню она уже есть.
- Читайте его в главном потоке; другой поток получает список, прочитанный там последним.
- `Find` принимает имя ассета в любом регистре и возвращает `null`, если такого нет.

Пример мода `Mjolnir.CheatInventory` показывает каталог в окне с поиском, по вкладке на категорию.
