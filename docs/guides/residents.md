---
title: Villagers and jobs
description: The settlement's villagers (Resident in the SDK) and jobs of a mod's own.
keywords: [villager, villagers, Villager, SSSGame.Villager, resident, Resident, Residents, job, ResidentJob]
---

# Villagers and jobs

`Mjolnir.SDK.AI` gives mods the settlement's villagers and jobs of their own, which villagers take by priority among
the game's own tasks. Reference `Mjolnir.SDK.AI.dll` and add `using Mjolnir.SDK.AI;`.

A villager of the game is a `Resident` in the SDK. The game's own type is `SSSGame.Villager`; a different name keeps
the two apart in a mod that uses both.

## Residents

| Member | What |
|---|---|
| `Residents.All` | The villagers of the loaded world, in the order they came; empty outside a world |
| `Residents.Added`, `Removed` | A villager came (spawned, loaded with a save) or left (died, left, its world unloaded) |
| `Residents.Spawn(position)` | Asks the game for a new villager on walkable ground within 3 m, with the game's welcome. `false` outside a world |

A `Resident` is one villager, the same object while it lives:

| `Resident` | What |
|---|---|
| `Name`, `Position` | As the game shows them. A villager that left keeps its last ones |
| `IsAlive` | Whether it is still in the world |
| `Activity` | What it does: a mod job's full name `<mod id>.<job>`, else the game's own quest (`WorkstationIdleQuest`, `VillagerSocialQuest`…) |
| `ModJob` | The mod job it does now, or `null` |
| `Sheet` | Its [character sheet](characters.md) |
| `Animator` | Its [animator](animations.md) |
| `Combatant` | It in [combat](combat.md): health, damage, death |

Read residents on the main thread: in callbacks, a job's steps, or the events.

## Jobs

A job has steps, run in order, and a priority function asked for each villager:

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

    // Asked about once a second for every villager: keep it quick.
    private float Wants(Resident villager)
    {
        if (!LocalPlayer.IsSpawned) return -1f;
        if (_greeted.TryGetValue(villager, out float at) && Time.time - at < 180f) return -1f;
        return Vector3.Distance(villager.Position, LocalPlayer.Position) <= 25f ? 12f : -1f;
    }
}
```

| Step | What |
|---|---|
| `MoveTo(place, distance)` | Walks to the place, asked when the step starts, until within `distance` metres. It gives up after a minute, and ends after 3 s standing still near the place, since villagers walking to one spot stop each other short |
| `Wait(duration)` | Stays where it is |
| `Do(action)` | Runs the action once, on the main thread |
| `Play(animation, options, duration)` | Plays an animation where the villager stands; over when it ends, or when `duration` is up. See [Animations](animations.md#villagers) |
| `Use(interaction, duration, animation, options)` | Walks up to an [interaction](interactions.md#villagers), waits for its turn and stays at it, then raises its `Used` |

After its last step the job ends and the villager picks again. To keep a job from running again at once, lower its
priority yourself with a cooldown or a done flag, as above.

## Priorities

A villager takes the job within a second or so once its priority is higher than every other quest of the villager's.
Return `-1` or less when the job is not for this villager now. In a working settlement the game's own quests ask:

| Priority | The game's quest |
|---|---|
| 21 | Sleep, at its hour |
| 15 | Work |
| 13 | Complain about a workplace |
| 11 | Idle at a workplace |
| 2 | A cave collapsing |
| 1 | Complain |
| 0 | Talk to others |
| -1 | Not wanted |

A job that asks 12 takes only villagers with nothing to do; one that asks 16 takes a worker from its work. The
villager leaves its quest in its own time: an idle one within a second, a fisherman at sea may take a while. Do not
expect a job to start at once.

The priority function runs under the mod's fault isolation: if it throws, the mod is disabled and the job is never
taken again.

:::note
Villagers' minds run on the host of a world, which in single player is the player. A joined client is not checked yet.
Decisions of a mod's own and assigning villagers to workplaces are not in the SDK yet.
:::
