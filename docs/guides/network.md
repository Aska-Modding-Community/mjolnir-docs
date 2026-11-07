---
title: Multiplayer
---

# Multiplayer

`Mjolnir.SDK.Net` checks every multiplayer session for matching mods and gives mods message channels between players.
The check runs whether or not a mod references the module. To send messages, reference `Mjolnir.SDK.Net.dll` and add
`using Mjolnir.SDK.Net;`.

## The mod check

When a client joins a host, both compare the mods every player needs: those whose manifest declares
`NetworkCompatibility.Everyone`, the default.

| Declared | Checked |
|---|---|
| `Everyone` | Both players have it, with the same version |
| `ClientOnly`, `ServerOnly` | Never: these mods are one player's own |
| Mjolnir itself | Same major and minor version |

- A client whose mods match joins and is announced to mods on every machine.
- A client whose mods differ does not join. It leaves the session and, in the main menu, sees which mods to turn on
  or off and which versions differ. The host removes it after 10 s if it does not leave by itself.
- A client without Mjolnir is removed after 20 s when the host has mods every player needs, and plays on otherwise.
  It never receives mod messages.
- A client of a host without Mjolnir leaves when it has mods every player needs.
- A client that gets no answer from a host with Mjolnir within 30 s leaves.

Declare `ClientOnly` for a mod that changes only what its player sees (camera, interface) and `ServerOnly` for one
that runs only on the host (rules, admin tools), so it never keeps anyone out.

## Players

| `Network` | What |
|---|---|
| `IsMultiplayer` | The local player is in a multiplayer session. Hosting counts, single player does not |
| `IsHost` | The local player hosts the session |
| `LocalPlayer` | The local player once it passed the check; `null` otherwise |
| `Players` | The players that passed the check, the local one included, by id |
| `PlayerJoined`, `PlayerLeft` | A player passed the check, or left. The local player is announced too |

A `NetPlayer` has `Id` (the game's id in this session), `IsHost` and `IsLocal`.

## Channels

`Network.Channel(name)` gives the calling mod's channel of that name, the same object for the same name. A message
reaches only the same mod's channel of the same name on other machines, reliably and in order, up to 64 KB.

```csharp title="ShoutMod.cs"
using System.Text;
using Mjolnir.SDK;
using Mjolnir.SDK.Net;
using Mjolnir.SDK.UI;

namespace ShoutMod;

[ModManifest("author.shout", "Shout", "1.0.0")]
public sealed class ShoutMod : Mod
{
    private NetChannel _shouts = null!;

    public override void OnLoad()
    {
        _shouts = Network.Channel("shouts");
        _shouts.Received += (_, e) => Notify.Message($"Player {e.Sender.Id}: {Encoding.UTF8.GetString(e.Data)}");

        DevConsole.Add("shout", "Sends a message to every player.", context =>
        {
            int sent = _shouts.SendToAll(Encoding.UTF8.GetBytes(context.GetRest(0)));
            context.Print($"Sent to {sent} player(s).");
        }, "<text>");

        Network.PlayerJoined += (_, e) =>
        {
            if (Network.IsHost && !e.Player.IsLocal) _shouts.Send(e.Player, Encoding.UTF8.GetBytes("Welcome"));
        };
    }
}
```

| `NetChannel` | What |
|---|---|
| `Send(player, data)` | To one player. `false` outside a session, to the local player, or to a player that left |
| `SendToHost(data)` | To the host. `false` on the host or outside a session |
| `SendToAll(data)` | To every other player that passed the check; returns how many |
| `Received` | A message arrived: `Sender` and `Data`, on the main thread |

Use channels on the main thread. A message sent from another thread goes out on the next frame, and its `Send`
returns `true`. Data over 64 KB throws `ArgumentException`.

Channel names are letters, digits, `_`, `-` and `.`, unique within the mod.

:::note
The check and channels are tested with a host and a client on two machines, including a mod's item and its model on
the client. What other modules do on a joined client (villagers' jobs, character modifiers) is not checked yet.
:::
