---
title: Weapons, armour and food
---

# Weapons, armour and food

`Items.Add(name, kind, icon, stackSize)` adds an item of a kind: a weapon, a piece of armour, food or a material. It
stands on a plain game item of that kind, so the mod needs no game item's name, and takes that item's picture, look,
sounds and numbers until the mod gives its own.

```csharp title="EquipmentMod.cs"
using System;
using Mjolnir.SDK;
using Mjolnir.SDK.Content;

namespace EquipmentMod;

[ModManifest("author.equipment", "Equipment", "1.0.0")]
public sealed class EquipmentMod : Mod
{
    public override void OnLoad()
    {
        Items.Add("rune_sword", ItemKind.OneHandedWeapon, icon: "items/rune_sword.png")
             .WithDamage(14, 18)
             .WithDurability(800)
             .AppliesOnHit("Effect_Burning", TimeSpan.FromSeconds(4), chance: 0.25f);

        Items.Add("rune_hood", ItemKind.Helmet)
             .WithArmor(60)
             .WithAttribute("Attribute_ColdResistance", 50)
             .AppliesWhileEquipped("Effect_Energized");

        Items.Add("honey_cake", ItemKind.Food, stackSize: 5)
             .AppliesWhenEaten("Effect_Energized", TimeSpan.FromMinutes(2));
    }
}
```

Texts, pictures, models and recipes work as for any [item](items-and-recipes.md). For an item like one particular
game item, such as an iron axe or a longbow, use `Items.Add(name, basedOn: …)` and the methods below still apply.

## Kinds

| `ItemKind` | What it is | Stands on |
|---|---|---|
| `Material` | A small crafting material, many to a slot | The rope |
| `LargeMaterial` | A long or heavy material carried on the back | The plank |
| `Food` | Eaten from the inventory | Berries |
| `OneHandedWeapon` | Held in the right hand, with a shield beside it | The iron sword |
| `TwoHandedWeapon` | Held in both hands | The two-handed iron sword |
| `Shield` | Held in the left hand | The crude round shield |
| `Bow` | Held in both hands, shoots arrows | The simple bow |
| `Arrow` | Worn in the quiver | Wooden arrows |
| `Helmet`, `Chest`, `Pants`, `Boots`, `Gloves`, `Cape` | Worn | The cloth set |

## Numbers

| Method | Kinds | What |
|---|---|---|
| `WithDamage(minimum, maximum)` | Weapons, shields, bows, arrows | A blow's damage before the game's own sums: the attack, the wielder's strength and skill, the target's armour. An iron sword deals 9 to 11, a bow 3 to 6 |
| `WithArmor(armor)` | Any | Armour for whoever wears or holds it. Cloth gives none, a chain shirt 400, a plate helmet 160 |
| `WithDurability(durability)` | Any | How long it lasts. An iron sword 550, a chain shirt 2800 |
| `WithAttribute(attribute, value)` | Any | A game attribute by asset name, such as `Attribute_ColdResistance`, `Attribute_RainProtection` or `Attribute_WindProtection`. A worn or held item's attributes count for its wearer. `0` takes one of the base's away |

The base's other attributes stay. An attribute the game lacks is left out, with a warning in the log.

## Effects

| Method | Kinds | What |
|---|---|---|
| `AppliesOnHit(effect, duration, chance)` | One- and two-handed weapons, shields | A blow may put the effect on what it hits, with a `chance` from 0 to 1, as the game's torch sets on fire |
| `AppliesWhileEquipped(effect)` | Anything held or worn | The effect stays on whoever holds or wears it, the player or a villager, and goes when it is taken off. A weapon on the back does not count |
| `AppliesWhenEaten(effect, duration)` | Food | The effect comes beside what the base's food gives |

An effect is the game's, by asset name, or a mod's own [`ModEffect`](effects.md). The game knows its effects only once
it runs, so an item added in `OnLoad` names them. An effect the game lacks is left out, with a warning in the log.

A method on a kind that cannot take it throws `InvalidOperationException`; on an item made from a named game item it
writes a warning to the log.

## Example

`examples/Mjolnir.EquipmentExample` adds the sword, the hood and the cake above. Its console command `equipment` gives
the player one of each.

:::note[Not done yet]
- Worn models of the mod's own: a piece of armour looks like its base when worn.
- Sounds and attack animations of the mod's own.
- A client joined to a host is not checked yet.
:::
