---
title: Threads and the main thread
---

# Threads and the main thread

The game's objects belong to its main thread. All of a mod's callbacks, and the SDK's events, run there unless a page
says otherwise. Work on another thread (a download, a long calculation) must come back to the main thread before it
touches the game.

## Dispatcher

`Dispatcher.MainThread` (`Mjolnir.SDK.Threading`) is that thread:

| Member | What |
|---|---|
| `Post(action)` | Runs the action on the main thread at the start of the next frame, also when called from it |
| `CheckAccess()` | Whether the caller is on the main thread. During `OnLoad`, before the game is ready, every thread counts as main |
| `VerifyAccess()` | Throws unless the caller is on the main thread |

```csharp
_ = System.Threading.Tasks.Task.Run(() =>
{
    // Off the main thread: file I/O, no game objects.
    string folder = System.IO.Path.GetDirectoryName(Manifest.Location)!;   // Location is the mod's .dll
    string notes = System.IO.File.ReadAllText(System.IO.Path.Combine(folder, "notes.txt"));
    Dispatcher.MainThread.Post(() => Notify.Message(notes));
});
```

An exception from a posted action disables the mod that posted it, as from any handler.

## await

The main thread's synchronization context posts to the dispatcher: an `await` on the main thread continues there, at
the start of a later frame:

```csharp
Menus.Pause.Add(new UiButton { Content = "Reset" }).OnClick(async () =>
{
    if (await Dialog.ConfirmAsync("Reset", "Start over?"))
        Notify.Message("Reset");   // back on the main thread
});
```

## What is safe from other threads

- **UI elements.** A control's properties can be set from any thread. The model changes at once; the screen follows on
  the next frame. A panel's `Children` must be changed on the main thread, or in `Post`.
- **Stats.** Reading `PlayerStat` or `CharacterStat` from another thread gives the value last seen on the main thread;
  writing one is applied on the next frame.
- **Console.** `DevConsole.Execute` and `Print` work from any thread; commands run on the main thread.
- **Localization.** `Localization.Get` finds mods' strings anywhere, and the game's only on the main thread.
- **Everything else** that touches the game, its Unity objects and Il2CppInterop wrappers, needs the main thread.
