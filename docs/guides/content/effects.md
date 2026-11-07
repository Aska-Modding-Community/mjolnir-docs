---
title: Status effects
---

# Status effects

`Effects.Add(name, basedOn, icon)` adds a status effect of the mod's own, made from one of the game's effects
(`Effect_Leisure` by default). The base gives its kind, stacking rules and visual effects; the mod gives it a name,
an id, texts, a picture and, if it likes, its own changes to attributes, which replace the base's.

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
| `Modifies(stat, amount, kind)` | While the effect is on, changes an attribute that is a sum, such as `Attribute_Strength`. `kind` is `Add`, `Multiply` or `Percent` |
| `PerSecond(pool, amount)` | While it is on, adds to a pool every second, such as `VariableAttribute_Health`. A negative amount takes away |

```toml title="lang/english.toml"
[effect.blessing]
name = "Blessing"
description = "Stronger, and wounds close by themselves."
added = "You feel blessed."
removed = "The blessing fades."
```

`added` and `removed` are the messages shown when the effect comes and goes.

## Applying effects

A mod's effect is an `EffectInfo` like the game's, and goes onto any character through its sheet:
`LocalPlayer.Sheet.Effects`, or a villager's `Resident.Sheet.Effects`. See
[Characters and stats](../characters.md#effects).

- `Apply(effect, duration)` puts it on for a time, or with no duration until it is removed. An effect already on takes
  a new stack or starts over, as its own rules say.
- A save keeps it with the time it has left. A mod that applies an effect whenever the character appears should ask
  `Has` first, or the effect stacks up over loads.

## Ids

An effect's id comes from the mod's id and its name, like an item's, but the network carries effect ids in 16 bits,
so two effects can meet on one. When that happens, the effect added later is left out of the game, an error in the log
names both, and `Apply` returns `false` for it. The mod keeps running; another name gives another id.
