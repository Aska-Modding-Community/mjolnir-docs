---
title: Characters and stats
---

# Characters and stats

A `CharacterSheet` is what a character is made of, the player's and a villager's alike: its characteristics and every
other attribute, its skills and its status effects. It is in the main library, `Mjolnir.SDK`, so no extra reference
is needed to use it; the `Mjolnir.SDK.Stats` module connects it to the game.

```csharp
CharacterSheet player = LocalPlayer.Sheet;     // Mjolnir.SDK.Player
CharacterSheet villager = Residents.All[0].Sheet;   // Mjolnir.SDK.AI
```

A sheet belongs to one character. Without it, or once it is gone, the sheet is empty and everything reads 0: take it
again after a load (`LocalPlayer.Spawned`). `IsAvailable` says whether its character is in the world.

Use a sheet on the main thread. Another thread reads what was last seen there, and its changes are made on the next
frame.

## Attributes

| Member | What |
|---|---|
| `Vitality` | Maximum health |
| `Strength` | Melee damage and gathering speed |
| `Dexterity` | Ranged combat and crafting |
| `Intelligence` | Some skills and magic |
| `MaxStamina` | Maximum stamina |
| `StaminaRegeneration` | How fast stamina comes back |
| `Stats` | Every attribute the character has, the hidden ones too (`Attribute_Armor`, `VariableAttribute_Food`…) |
| `Find(assetName)` | One attribute by its asset name, or `null` |

The console's `stats` command lists every attribute of the player with its asset name.

Each is a `CharacterStat`, an `IBindable<float>`, and either a **sum** or a **pool**:

| | Sum | Pool |
|---|---|---|
| Examples | strength, armor, a skill's level | health, food, experience |
| `Value` | the base value plus modifiers | the current value |
| `BaseValue` | the value before modifiers | the same as `Value` |
| `Minimum`, `Maximum`, `Fraction` | 0 | its limits, and the value as a part of them |
| `AddModifier` | yes | throws |

`IsPool` tells them apart. `AssetName`, `DisplayName` and `Description` name it. `Changed` is raised on each change:
by the game, by a write, or as a modifier comes or goes.

## Modifiers

```csharp
StatModifier strong = LocalPlayer.Sheet.Strength.AddModifier(5);                       // +5
StatModifier faster = LocalPlayer.Sheet.StaminaRegeneration.AddModifier(0.2f, ModifierKind.Percent);   // +20 %

strong.Amount = 10;     // changes the attribute at once
strong.Dispose();       // takes it off
```

| Kind | Counts as |
|---|---|
| `Add` | Adds its amount |
| `Multiply` | Multiplies by it: 1.25 is a quarter more |
| `Percent` | Adds a part of the sum at the end: 0.2 is 20 %. The game adds such parts up |

The game saves no modifier, and a modifier ends with its character: add it again after each load.

## Skills

`Skill(kind)` gives one skill, `Skills` all of them in `SkillKind` order: wood and stone harvesting, crafting,
gathering, building, firekeeping, hunting, skinning, fishing, blacksmithing, carpentry, farming, melee and ranged
combat, cooking, shamanism and dog combat.

| `Skill` | What |
|---|---|
| `Level`, `Experience`, `ExperienceMultiplier` | `CharacterStat`s of their own |
| `Rank` | `Novice` below 25, `Apprentice` from 25, `Adept` from 50, `Master` from 75 |
| `AddExperience(amount)` | Gives experience as real work would, so the multiplier, level-ups and the game's banner come with it |

`Skill.ExperienceGaining`, a static event, is raised before the game gives experience to any character. Change
`Amount` or set `Cancel`:

```csharp
Skill.ExperienceGaining += (_, e) =>
{
    if (e.Sheet == LocalPlayer.Sheet) e.Amount *= 1.5f;
};
```

The amount is what the action earns before the character's own `ExperienceMultiplier`.

## Effects

`Effects.All` lists every status effect of the game, mods' included, and `Effects.Find(assetName)` gives one. Each is
an `EffectInfo`: `Id`, `AssetName`, `DisplayName`, `Description` and `Kind` (the list the game shows it in: `Buff`,
`Debuff`, `Perk`, `Cure`…; a well-fed bonus is a `Debuff`). There is one object per effect, so effects compare with
`==`.

`Sheet.Effects` is what is on one character:

```csharp
CharacterEffects effects = LocalPlayer.Sheet.Effects;
EffectInfo? energized = Effects.Find("Effect_Energized");

if (energized != null && !effects.Has(energized))
    effects.Apply(energized, System.TimeSpan.FromMinutes(2));

effects.Added += (_, e) => Log.Info($"{e.Effect.DisplayName}, {e.Stacks} stack(s)");

foreach (ActiveEffect active in effects.Active)
    Log.Info($"{active.Effect.AssetName}: {active.TimeLeft?.TotalSeconds:0} s left");
```

| Member | What |
|---|---|
| `Active` | The effects on now, each with `Stacks`, `Duration` and `TimeLeft` (`null` for one that never runs out) |
| `Has(effect)` | Whether it is on |
| `Apply(effect, duration)` | Puts it on for a time, or until removed without one. `false` when the character is gone or the game refuses it |
| `Remove(effect)` | Takes it off |
| `Added`, `Removed` | Raised when an effect or a stack of it comes or goes |

The game saves effects with the character, each with the time it has left. A mod that applies one whenever the
character appears asks `Has` first. To add an effect of your own, see [Status effects](content/effects.md).

:::note
Modifiers are local to the machine, and effects go through the game's network component. A joined client is not
checked yet. A moveset or a skill of a mod's own is not supported yet.
:::
