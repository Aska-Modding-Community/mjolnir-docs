---
title: Combat
---

# Combat

A `Combatant` is anything in the world that takes damage: the player, a villager, a tamed animal, an animal or enemy
of the world, a den. `Combatants` lists them and reports every blow and death. Both are in the main library,
`Mjolnir.SDK`; the module `Mjolnir.SDK.Combat` connects them to the game and has no public types.

```csharp
Combatant player = LocalPlayer.Combatant;          // Mjolnir.SDK.Player
Combatant villager = Residents.All[0].Combatant;   // Mjolnir.SDK.AI
```

There is one object per character or creature; after a load, take it again. Without it, gone or with no combat module,
it reads 0 and takes no damage.

## Combatants

| `Combatant` | What |
|---|---|
| `Kind` | `Player`, `Resident`, `Pet`, `Creature` (animals and enemies) or `Den` |
| `Name` | The game's name of its kind: `CharacterRagnar`, `CharacterVillagerFemale`, `DeerDataSheet`… |
| `DisplayName` | What the player sees: a player's or villager's name, a creature's kind in the player's language |
| `Faction` | Its side: `Vikings` (players, villagers, pets), `Undead`, `Critters` (animals), `Danger`… |
| `Team`, `IsFriendly` | The game's team number, and whether it is on the local player's team. One team does not hurt itself |
| `IsAvailable`, `IsAlive` | Whether it is in the world, and in it and not dead |
| `Health`, `MaxHealth` | Its health and maximum |
| `Position` | Where it is |
| `Sheet` | Its [character sheet](characters.md); a creature's is empty for now |

| `Combatants` | What |
|---|---|
| `All` | Everything that takes damage in the loaded world |
| `Near(position, radius)` | Those within a radius |

## Dealing damage

```csharp
foreach (Combatant wolf in Combatants.Near(LocalPlayer.Position, 30).Where(c => c.Kind == CombatantKind.Creature && !c.IsFriendly))
    wolf.Damage(25, LocalPlayer.Combatant);   // the player's blow, as the game strikes it

LocalPlayer.Combatant.Heal(50);
```

| Method | What |
|---|---|
| `Damage(amount, attacker)` | With an attacker: a blow of the game's own, struck with the attacker's fighting. Armour, blocking and teams count, and the game sends it over the network. Without one: taken from the health as it is, as for a fall or a trap. Returns the health taken |
| `Heal(amount)` | Gives health back up to the maximum; returns how much |
| `Kill(killer)` | Kills it as the game does at no health: a villager leaves its body and loot, a creature its carcass |

`Damage` returns 0 when the target is dead or gone, the attacker has nothing to strike with, or a handler cancelled the
blow. Since one team never hurts itself, a villager's blow takes nothing from the player.

Use combatants on the main thread. On another thread they read what was last seen there, and `Damage`, `Heal` and
`Kill` run on the next frame and return 0.

## Events

```csharp
Combatants.Damaging += (_, e) =>
{
    if (e.Target.Kind == CombatantKind.Resident) e.Amount *= 0.5f;   // villagers take half
};
Combatants.Died += (_, e) => Log.Info($"{e.Target.DisplayName} died{(e.Killer != null ? $", killed by {e.Killer.DisplayName}" : "")}");
```

| Event | When | Arguments |
|---|---|---|
| `Damaging` | Before any blow lands, the game's or a mod's | `Target`, `Attacker`, `Amount` before armour (settable), `Kinds`, `Position`, `Direction`, `Cancel` |
| `Damaged` | After damage was taken | `Target`, `Attacker`, `Amount` taken, `Health` left, `IsFatal`, `Kinds` |
| `Died` | When anyone dies | `Target`, `Killer`: the last to strike it within 5 s, or the mod's killer |

`Kinds` marks the blow: `Heavy`, `Melee`, `Critical`, `Unblockable`, `Undodgeable`, `Blocked`, `Dodged`, `Staggered`,
`KnockedDown`.

A player or villager is reported dead whatever killed it: a blow, a mod, the cold, hunger. A creature is reported when a
blow or a mod killed it; the bodies a save holds, which the game marks dead again after a load, are not.

## Console

| Command | What |
|---|---|
| `combatants [radius]` | Lists the players, villagers, pets, creatures and dens near the player |
| `hurt <amount> [near]` | Damages the player, or strikes the nearest other combatant as the player |
| `heal [amount] [near]` | Gives the player, or the nearest other combatant, health back; all of it without an amount |
| `kill` | Kills the nearest other combatant within 30 m |

:::note
Tested when hosting on a real settlement: blows by the player and without an attacker, a handler halving or cancelling
damage, healing, kills and their killer. Not checked yet: a blow from a hostile creature, a joined client, the player's
death.
:::
