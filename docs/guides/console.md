---
title: Developer console
---

# Developer console

The `` ` `` key opens a console for testing and debugging: commands from Mjolnir and from mods, with their answers.
The key is a setting on Mjolnir's own settings page (the Mods window's **Settings**). Up and Down walk the command
history, Esc or the key closes it, and the window drags by its frame.

The console is English only: its answers and the item names it takes and shows.

## Built-in commands

| Command | What |
|---|---|
| `help [command]` | Lists the commands, or describes one |
| `clear` | Clears the console |
| `give <item> [count]` | Gives the player an item: its asset name (`Item_Wood_Sticks` or `Wood_Sticks`), its English name, or a mod's item (`<mod id>.<name>`). Several matches are listed, not guessed |
| `items [words]` | Lists the items whose asset name or English name contains the words |
| `pos` | Where the player stands, `x y z` with y up |
| `tp <x> [y] <z>` | Teleports onto the ground at `x z`, or exactly to `x y z`. `~` is the player's own coordinate, `~10` ten metres from it |
| `time [day\|night\|stop\|run\|<hour>\|<hh:mm>]` | Shows the world's clock, sets the hour, stops it or runs it again |
| `stats [villager]` | Shows a character: characteristics, skills, effects. The player without a name |
| `skill [skill] [level]` | Shows the player's skills, or sets a level |
| `effects [words]` | Lists the status effects whose names contain the words |
| `effect <effect> [seconds]` | Puts a status effect on the player, for seconds or until taken off |
| `uneffect <effect>` | Takes a status effect off the player |
| `villager [count]` | Spawns villagers in front of the player |
| `villagers` | Lists the world's villagers: what they do and where |
| `anims [words]` | Lists the animations whose names contain the words |
| `anim <animation> [loop] [upper] [move] [villager]` | Plays an animation on the player, or on the nearest villager |
| `animstop [villager]` | Stops it |
| `emote <sit\|wave\|cheer\|skal> [villager]` | Plays one of the game's emotes |
| `combatants [radius]` | Lists the players, villagers, pets, creatures and dens near the player |
| `hurt <amount> [near]` | Damages the player, or strikes the nearest other combatant as the player |
| `heal [amount] [near]` | Gives the player, or the nearest other combatant, health back |
| `kill` | Kills the nearest other combatant within 30 m |

Words are split by spaces; a word containing spaces goes in double quotes: `give Item_Wood_Sticks 5` gives five
sticks.

## Commands of your own

`DevConsole.Add(name, description, run, syntax)` adds a command. Commands need only the main library, `Mjolnir.SDK`:

```csharp
DevConsole.Add("heal", "Sets the player's health to its maximum.", context =>
{
    LocalPlayer.Health.Value = LocalPlayer.Health.Maximum;
    context.Print("Healed.");
});

DevConsole.Add("wood", "Gives logs.", context =>
{
    int given = Items.Give("Item_Wood_Logs", context.GetInt(0, 10));
    context.Print($"Gave {given} logs.");
}, "[count]");
```

- A name is letters, digits, `_` and `-`, in any case. The first command with a name owns it. Every command also
  answers to its full name, `<mod id>:<name>`, so a clash never hides a mod's command.
- `syntax` describes what follows the name, for `help` and for the usage line after a wrong input.
- `Add` returns a `DevCommand`; `DevConsole.Remove(command)` takes it away.
- Commands run on the main thread. `DevConsole.Execute(line)` runs a line as if typed, from any thread.

## The context

| `DevCommandContext` | What |
|---|---|
| `Arguments`, `Line`, `Command` | The words after the name, the whole line, the command |
| `GetString(i)`, `GetInt(i)`, `GetFloat(i)` | The word at `i`, 0 being the first after the name. They throw a `DevCommandException` when it is missing or not a number |
| `GetInt(i, fallback)`, `GetFloat(i, fallback)` | The same with a value for a missing word |
| `GetRest(i)` | The words from `i` on, joined by spaces |
| `Print(text)`, `Error(text)` | An answer, plain or in the error colour |

A `DevCommandException` shows its message and the usage line; the mod stays enabled. Any other exception is
shown and disables the mod, as from any of its code.

Every console line is also written to `Mjolnir/LogOutput.log` as `[Console]`, errors as warnings.
`DevConsole.Print(text)` adds a line from anywhere.
