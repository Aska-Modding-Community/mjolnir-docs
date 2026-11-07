---
title: Status effects
---

# Status effects

`Effects.Add(name, basedOn, icon)` adds a mod's own status effect, a copy of a game effect (`Effect_Leisure` by
default). The base gives the kind, stacking rules and visual effects; the mod gives a name, an id, texts, a picture
and, optionally, its own attribute changes, which replace the base's.

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

| Builder | What |
|---|---|
| `Modifies(stat, amount, kind)` | While the effect is on, changes a sum attribute, such as `Attribute_Strength`. `kind` is `Add`, `Multiply` or `Percent` |
| `PerSecond(pool, amount)` | While the effect is on, adds to a pool every second, such as `VariableAttribute_Health`. A negative amount subtracts |

```toml title="lang/english.toml"
[effect.blessing]
name = "Blessing"
description = "Stronger, and wounds close by themselves."
added = "You feel blessed."
removed = "The blessing fades."
```

`added` and `removed` are the messages shown when the effect starts and ends.

## Applying effects

A mod's effect is an `EffectInfo` like the game's and applies to any character through its sheet:
`LocalPlayer.Sheet.Effects`, or a villager's `Resident.Sheet.Effects`. See
[Characters and stats](../characters.md#effects).

- `Apply(effect, duration)` applies it for a time, or, without a duration, until it is removed. An effect already on
  takes a new stack or restarts, as its own rules say.
- A save keeps it with its remaining time. A mod that applies an effect whenever the character appears should check
  `Has` first, or the effect stacks up over loads.

## Ids

An effect's id comes from the mod id and its name, like an item's, but the network carries effect ids in 16 bits, so
two effects can collide. Then the effect added later is left out of the game, a log error names both, and `Apply`
returns `false` for it. The mod keeps running; another name gives another id.
