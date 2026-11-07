---
title: The world's clock
---

# The world's clock

`Mjolnir.SDK.World` reads and sets the clock of the loaded world. Reference `Mjolnir.SDK.World.dll` and add
`using Mjolnir.SDK.World;`.

| `WorldTime` | What |
|---|---|
| `IsAvailable` | Whether a world is loaded. `false` in the main menu |
| `Hour` | The hour of the day, from 0 (midnight) up to 24: 9.5 is half past nine. Setting it moves the clock at once and keeps the day; 25 wraps to 1 |
| `IsNight` | Whether it is night, as the game counts it |
| `DaysPassed` | The days since the world began |
| `IsRunning` | Whether the clock runs. Stopping it holds the hour, the sun and the villagers' schedules; nothing else stops |

```csharp
if (WorldTime.IsAvailable && WorldTime.IsNight)
    WorldTime.Hour = 9;   // morning: the villagers go to work
```

A game hour lasts a minute. Villagers follow the clock through their schedules: a working hour sends them to work
within seconds, night sends them to bed.

The clock is the host's. Changes go through the game's own message, the one its debug commands use: a client's change
reaches the host and comes back with the world. The new hour shows on the next read. Read the clock on the main
thread; another thread gets the value last seen there, and its changes run on the next frame.

The console's `time` command uses the same calls: `time day`, `time night`, `time 14:30`, `time stop`, `time run`.
