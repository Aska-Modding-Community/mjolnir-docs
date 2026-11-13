---
title: Terrain
---

# Terrain

`Mjolnir.SDK.Terrain` gives mods the ground of the world: its height, its kind, its biome and the water over it;
changes to it; the trees, stones and bushes standing on it; and the levelling fields the villagers work. Reference
`Mjolnir.SDK.Terrain.dll` and add `using Mjolnir.SDK.Terrain;`.

A change is made as the game makes its own — the player's hoe, a villager's shovel, a building's footprint — so it is
applied, saved with the world, sent to the other players, clears the grass and lets the villagers walk the new ground.
It stays in the save after the mod is gone.

Three limits hold for everything on this page:

- **Only the loaded part of the world**, the 512 metres the game streams around the player. Elsewhere the reads give
  nothing and the changes answer `NotLoaded`.
- **The main thread.** From another thread the reads give nothing and a change is made at the start of the next frame
  (`Queued`).
- **One machine.** In a multiplayer game every player's game sends its own changes to the others and nobody's game
  checks them, so a mod that changes the ground on every machine makes the change several times over. Change it on one
  machine — the host's, by default.

```csharp title="YardMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.Terrain;
using Mjolnir.SDK.UI;
using UnityEngine;

namespace YardMod;

[ModManifest("author.yard", "Yard", "1.0.0")]
public sealed class YardMod : Mod
{
    private LandscapeOutline? _preview;
    private LandscapeSnapshot? _before;

    public override void OnGameReady()
    {
        HotKeys.Add(KeyGesture.Parse("F7"), TogglePreview);
        HotKeys.Add(KeyGesture.Parse("F8"), Flatten);
        HotKeys.Add(KeyGesture.Parse("F9"), Undo);

        // Nobody digs the yard away once it is laid.
        Landscape.GroundChanging += (_, e) =>
        {
            if (e.Source == LandscapeSource.Player && e.Operation == LandscapeOperation.Lower
                && _before is { } kept && e.Area.Overlaps(kept.Area.Bounds))
                e.Cancel = true;
        };
    }

    private static LandscapeArea Yard() => LandscapeArea.Circle(LocalPlayer.Position, radius: 6, blend: 2);

    private void TogglePreview()
    {
        if (_preview is { } shown)
        {
            shown.Dispose();
            _preview = null;
            return;
        }
        _preview = Landscape.ShowOutline(Yard(), Color.yellow);
    }

    private void Flatten()
    {
        LandscapeArea yard = Yard();
        LandscapeHeights heights = Landscape.Measure(yard);
        if (!heights.IsKnown) return;

        _before = Landscape.Capture(yard);        // an undo of the mod's own
        LandscapeResult result = Landscape.Level(yard, heights.Average, new LandscapeOptions
        {
            Kind = GroundKind.Path,               // a path, not the game's bare earth
            Objects = LandscapeObjects.Settle,    // the trees stay, standing on the new ground
        });
        Notify.Message(result == LandscapeResult.Done
            ? $"The yard is level at {heights.Average:0.##} m"
            : $"No yard here: {result}");
    }

    private void Undo()
    {
        if (_before is not { } kept) return;
        kept.Restore();
        _before = null;
    }
}
```

## Reading the ground

| `Landscape` | What |
|---|---|
| `IsAvailable` | Whether a world is loaded. `false` in the main menu |
| `IsLoaded(x, z)` | Whether the point is in the loaded part of the world, so its ground can be read and changed |
| `HeightAt(x, z)` | The height of the ground in metres; `NaN` where it is not known |
| `TryGetHeight(x, z, out height)` | The same, saying whether it is known |
| `NormalAt(x, z)` | Which way the ground faces, length 1; `(0, 0, 0)` where it is not known |
| `KindAt(x, z)` | What the ground is there |
| `IsCleared(x, z)` | Whether the grass and bushes there were cleared by a change of the ground |
| `WaterLevel`, `IsUnderwater(x, z)` | The height of the sea (the world has one), and whether the ground lies under it |
| `Measure(area)` | The lowest, highest and average height over an area, every half metre |

Heights are the world's, in metres, from 0 to `Landscape.MaximumHeight` (160).

### What the ground is

The game keeps a kind for every half metre of the world:

| `GroundKind` | What |
|---|---|
| `Natural` | As the world was made: grass, moss, rock, sand, whatever its place grows |
| `Dirt` | Bare earth: what the ground becomes where it was dug, raised or levelled |
| `Bedrock` | Rock under the earth |
| `Path` | A path, as the road maker lays it on dirt |
| `Road` | A road, as a road plan lays it |

## Areas

A change goes over a `LandscapeArea`: a shape on the ground whose edge blends into the ground around it. Only the x
and z of a point count.

| Area | What |
|---|---|
| `LandscapeArea.Rectangle(center, width, depth, rotation, blend, falloff)` | A rectangle, turned about its middle in degrees |
| `LandscapeArea.Circle(center, radius, blend, falloff)` | A circle |
| `LandscapeArea.Polygon(points, blend, falloff)` | A polygon through 3 to 256 corners in order, the last joined to the first |
| `LandscapeArea.Mask(center, weights, width, depth, rotation)` | A mask of the mod's own: a `float[,]` of weights from 0 to 1, rows along z and columns along x, spread over the metres given and turned |
| `LandscapeArea.Point(center, brush)` | One of the game's brushes at a point, as its tools use them |

Sides are at most `MaximumSide` (64 m), a blend at most `MaximumBlend` (16 m), a mask at most `MaximumMaskSamples`
(1024) samples along a side. An area out of range throws `ArgumentOutOfRangeException`. `Bounds` is the rectangle it
touches, blend and turn included, with x the world's x and y the world's z.

A rectangle's and a brush's raise, lower, level, paint and clearing are made by the game's own tool, with the game's
own edge. Every other area, and every other change, the SDK writes itself sample by sample — every half metre, each
sample moved as far as the area's weight there says: 1 inside the shape, falling over the blend, 0 outside.

| `LandscapeFalloff` | How a change the SDK writes fades over the blend |
|---|---|
| `Smooth` | Gently at both ends of the blend, steepest in its middle: no crease where the change meets the ground |
| `Linear` | Evenly over the blend: a straight bank |

| `LandscapeBrush` | What |
|---|---|
| `Small` | About 2.5 m across: a hoe's dig |
| `Medium` | About 3.5 m across, with a hard edge: a hoe's levelling |
| `Soft` | About 3.5 m across, with a soft edge: a shovel's or a road maker's |
| `Large` | The game's largest brush |

## Changing the ground

Every change answers a `LandscapeResult` and takes `LandscapeOptions`.

| `Landscape` | What |
|---|---|
| `Raise(area, height, options)` | The ground goes up by the metres given, at most `MaximumStep` (10 m) at once |
| `Lower(area, depth, options)` | The ground is dug down, likewise |
| `Level(area, height, options)` | The ground goes to one world height, its edge blending into the ground around |
| `Paint(area, kind, options)` | The ground's kind changes; its height stays |
| `ClearVegetation(area, options)` | The grass, bushes and saplings go, as the game's rake clears them |
| `RestoreVegetation(area, options)` | The ground becomes `Natural` again and is no longer marked cleared, so the grass of its biome grows back at once. Its height stays, and the bushes a change took do not come back |
| `Smooth(area, strength, options)` | Each point moves towards the average of the ground about a metre round it, by `strength` (0 to 1). Done again, it smooths further |
| `Slope(area, from, to, options)` | A ramp between two points' heights: each point takes the height of the line between them where it lies across it |
| `Shape(area, height, options)` | The heights a function of the mod's gives: it is asked for every point with its offset from the area's middle along x and z and the height there now, and answers the height wanted (`NaN` leaves the point alone) |
| `Check(area, operation)` | What a change would answer, without making it |

```csharp
// A crater 8 m across: deepest in the middle, its rim left as the ground was.
var area = LandscapeArea.Circle(center, radius: 4, blend: 1.5f);
Landscape.Shape(area, (dx, dz, now) =>
{
    float r = Mathf.Sqrt(dx * dx + dz * dz) / 4f;
    return now - 2.5f * (1f - r * r);
});
```

| `LandscapeResult` | What |
|---|---|
| `Done` | The ground changed; it shows within a frame or two |
| `Queued` | Asked from another thread: it is made on the main thread at the start of the next frame |
| `NotAvailable` | No world is loaded |
| `NotLoaded` | The area is not all in the loaded part of the world |
| `Blocked` | A building stands in the area, or the game will not change the ground there |
| `TooSteep` | The ground there is too steep for the game |
| `TooHigh` | The ground would go higher than the game allows |
| `Underwater` | The area is under water |
| `Cancelled` | A handler of `GroundChanging` cancelled it |
| `Failed` | The game failed to make the change; the reason is in the log |

### Options

| `LandscapeOptions` | What |
|---|---|
| `Kind` | The kind the ground becomes where its height changes; `null` for the game's own `Dirt` |
| `KeepKind` | The ground keeps its kind instead: a meadow stays a meadow, a road a road. With `ClearVegetation` false the grass stays too — a gentle smoothing of a natural slope, a hill shaped in a meadow |
| `ClearVegetation` | Whether the grass, bushes and saplings in the area go. The game clears them on every change of height; a change of kind keeps them |
| `OnlyOn` | The only kind of ground the change touches: with `Natural`, a raise, a smoothing or a biome leaves the roads, paths and dug earth in the area as they are |
| `Objects` | What becomes of the natural objects standing where the ground changes |
| `KeepOffBuildings` | Whether a building standing in the area refuses the change (`Blocked`). The game's own check does not look at buildings; the SDK does, unless this is false |
| `UpdateNavigation` | Whether the villagers' and creatures' paths are worked out again for the new ground, as the game does |

Each option has the game's own behaviour by default; `LandscapeOptions.Default` is what a change made without any
uses. A change limited by `OnlyOn`, or keeping its objects, is always written by the SDK, whatever its area.

:::warning[One change per frame over the same ground]
A rectangle's or a brush's raise, lower, level, paint or clearing is applied by the game later in the frame. A second
change over the same ground in that frame reads the ground as it was before and writes that back — a road painted and
then raised with `OnlyOn` in one frame rises with everything else. Make the next change a frame later, in the next
`OnUpdate` or posted with `Dispatcher.MainThread.Post`.
:::

## Snapshots

`Landscape.Capture(area)` keeps the ground of an area as it is now, every half metre: its heights, its kind, its
vegetation and its biome. It lives in the mod's memory, not in the save, and the world's objects are not part of it.

| `LandscapeSnapshot` | What |
|---|---|
| `Area`, `CenterHeight` | What was kept, and the height of the ground at its middle then |
| `HeightAt(x, z)` | The kept height at a point; `NaN` outside what was kept |
| `Restore(options)` | Puts the ground back exactly as it was kept, wherever the area reaches: an undo |
| `PasteAt(center, rotation, heightOffset, options)` | Lays the same ground down elsewhere, turned and moved up or down. Its heights blend in by the area's weight; where the area is at least half, its kind and vegetation come with them, and the place keeps its own biome |

Pass `heightOffset: Landscape.HeightAt(x, z) - snapshot.CenterHeight` to lay the kept ground relative to the ground
where it goes. Putting a 28 m lawn of 613 points back took 19 ms in game, with no kind, mark or biome differing.

## The biome

A biome is what grows on the ground — the trees, bushes and grass — and how it looks. The game keeps one for every
`Landscape.BiomeCellSize` (4 m) of the world.

A biome is a number, not a name: each part of the world grows its own plants on it, so the same number is a birch
forest in the Greenlands and a cypress forest in the marshes. `LandscapeBiome.Name` is therefore what grows on it in
the part of the world the player is in, and two biomes are equal by `Id` alone.

| `Landscape` | What |
|---|---|
| `Biomes` | The biomes the part of the world the player is in grows plants of its own on, in the game's order |
| `BiomeAt(x, z)` | The biome of the ground at a point; `null` where it is not known |
| `FindBiome(name)` | One of `Biomes` by its name in any case (`"BirchForest"`); `null` for none |
| `PaintBiome(area, biome, options)` | Makes it the ground's biome, so what grows there changes to it at once |

```csharp
// Grow a birch forest round the settlement, on natural ground only.
if (Landscape.FindBiome("BirchForest") is { } birches)
    Landscape.PaintBiome(LandscapeArea.Circle(center, 24), birches,
        new LandscapeOptions { OnlyOn = GroundKind.Natural });
```

A cell takes the new biome where its middle lies in the area, its weight there at least a half, so an area smaller
than a cell may change none and a blend only widens it. The ground's height, its kind and the mark of cleared grass
stay, and the trees, bushes and stones standing there stay too. Painting 10 × 10 m took 6 ms in game.

## An area's outline

`Landscape.ShowOutline(area, color)` draws the area on the ground, following its heights: a preview of where a change
will go, or a brush under the cursor. It is drawn on this machine only, in no save, and hidden while no world is
loaded.

| `LandscapeOutline` | What |
|---|---|
| `Area` | The area outlined; setting it moves the outline |
| `Color` | The line's colour |
| `IsVisible` | Whether it is shown; a hidden outline keeps its area and colour |
| `Dispose()` | Takes it off the ground for good |

The edge is one line, and the outer edge of a rectangle's or a circle's blend a thinner one. Properties may be set
from any thread and are applied on the next frame. An outline goes when it is disposed or its mod is disabled after an
error.

## Events

```csharp
Landscape.GroundChanging += (_, e) =>
{
    // The villagers may not dig in the grove.
    if (e.Source == LandscapeSource.Resident && e.Area.Overlaps(grove)) e.Cancel = true;
};

Landscape.GroundChanged += (_, e) => Log.Info($"{e.Operation} at {e.Area} by {e.Source}");
```

`GroundChanging` is raised on this machine before the ground changes, by anyone: a player's tool, a villager, a
building, a mod or the game. A handler may cancel it, and the game then answers as it does a refused placement.
`GroundChanged` is raised once the ground changed, here or on another player's machine, as its new heights show.

| Both event arguments | What |
|---|---|
| `Area` | The ground it touches, about: x is the world's x, y the world's z |
| `Operation` | What is done. `null` on `GroundChanged` for a change that came over the network |
| `Source` | Who makes it |
| `ModId` | The mod making it through `Landscape`, or `null` when the game does |

`LandscapeChangedEventArgs` adds `IsRemote`, true for a change from another player's machine. Changes that come over
the network are reported by `GroundChanged` only — the game that made them raised `GroundChanging` itself. A road
plan's levelling is likewise reported by `GroundChanged` only.

| `LandscapeSource` | Who |
|---|---|
| `Player` | A player, with a tool in their hands |
| `Resident` | A villager at work |
| `Building` | A building: its footprint levelled as it stands up, a field ploughed, a levelling or road plan worked on |
| `Mod` | A mod, through `Landscape`; `ModId` says which |
| `Remote` | Another player's game, over the network (`GroundChanged` only) |
| `Other` | Anything else of the game |

| `LandscapeOperation` | What |
|---|---|
| `Raise`, `Lower`, `Level` | The ground goes up, down, or to one height |
| `Paint` | Its kind changes; its height stays |
| `ClearVegetation`, `RestoreVegetation` | Its grass and bushes go, or its own kind and grass come back |
| `Smooth`, `Slope`, `Shape` | Evened out, made a ramp, or given a mod's own heights |
| `Restore`, `Paste` | A snapshot put back, or laid down elsewhere |
| `PaintBiome` | Its biome changes, and with it what grows there |

## The world's objects

`NaturalObjects` gives the trees, stones, bushes, nests and mushrooms the world grew, and the items lying on the
ground, nearest first.

| `NaturalObjects` | What |
|---|---|
| `In(area)` | Every object whose place is at least half in the area |
| `Around(center, radius)` | Within the metres given, at most `MaximumRadius` (64 m) |
| `Nearest(center, radius)` | The nearest one, or `null` |

| `NaturalObject` | What |
|---|---|
| `AssetName` | The game's name of what it is (`"Harvest_Wood_birch1"`) |
| `Kind` | What kind of thing it is |
| `ResourceName` | The game's name of the item gathering it gives (`"Item_Wood_birch1"`), or `""` |
| `Position`, `HeightOverGround` | Where it stands, and how far above or below the ground under it |
| `Health`, `Quantity` | What is left of it as the game counts a tree's or a deposit's, and how much of its resource is left |
| `IsRemovable` | Whether a change of the ground takes it: a bush or a small stone does, a tree or a boulder does not |
| `IsHarvestable`, `GatherCount` | Whether the player can gather or fell it, and how many items are left to gather by hand |
| `IsGone` | Whether it is no longer in the world. Ask for the objects again rather than keeping one for long |
| `Gather(charges)` | Gathers from it as a player picking by hand does: the items fall on the ground beside it, its quantity goes down, and the game tells the other players. Answers how many items it gave |
| `Remove()` | Takes it out of the world as a change of the ground does. A tree or a boulder stays |
| `Settle()` | Puts it on the ground under it, so a tree left in the air after a change stands on it again |
| `MoveTo(position)` | Moves it anywhere, its look with it. The game's own checks of where a thing may stand are not made |

A tree is felled with a tool, not gathered by hand, so `GatherCount` and `Gather` answer 0 for it. `Settle` and
`MoveTo` are not sent over the network: the other players see the object where it stood until they load that part of
the world again.

| `NaturalObjectKind` | What |
|---|---|
| `Grass` | Grass and the like, drawn in their thousands: no object of its own stands in the world |
| `Plant` | A plant: flax, a berry bush, a mushroom |
| `Tree` | A tree |
| `Object` | A thing of the world: a small stone, a nest, a log |
| `LargeObject` | A large thing: a boulder, a cliff stone, an ore deposit |
| `Item` | An item lying in the world: one dropped by a player, or a sapling planted in the ground |
| `Other` | Anything else, or what the game does not say |

`LandscapeOptions.Objects` says what a change of the ground does with them:

| `LandscapeObjects` | What |
|---|---|
| `Remove` | What the game does: the bushes, saplings and small stones a change takes are taken |
| `Keep` | Nothing is taken: the objects stay where they stood, now over or under the new ground |
| `Settle` | Nothing is taken: every object in the area is put on the new ground under it |

## Levelling fields

A levelling field is the plan a player sets down for the villagers to level, tile by tile, to one height. A mod puts
one down the same way, and may level it at once instead of waiting for the villagers. The game saves it and sends it
to the other players.

| `LevellingFields` | What |
|---|---|
| `All` | The levelling fields of the loaded world |
| `Nearest(center, radius)` | The field nearest a point, or `null` |
| `Place(area)` | Puts one over the area: a grid of whole tiles of `TileSize` (2 m), laid along the world's own axes and fitted to the area's middle. At most `MaximumTiles` (256), what the game's own plan allows |

An area's turn is not used, and its blend is not counted: its own sides, rounded to whole tiles, give the grid.

| `LevellingField` | What |
|---|---|
| `Center`, `Width`, `Depth` | Where it is and how large, in metres |
| `Tiles`, `LevelledTiles`, `IsLevelled` | How many tiles it has, how many are levelled, and whether all are |
| `Height`, `HeightDifference` | The height its tiles go to, and how far its ground still stands from it at its worst |
| `IsGone` | Whether the plan is no longer in the world: finished, taken away, or out of the loaded part |
| `LevelNow()` | Levels every tile left, as the villagers level them with their hoes. Answers how many are levelled now |
| `Finish()` | Turns the plan into what it builds, as the game does once it is levelled. A plain levelling field builds nothing, so it only goes |
| `Remove()` | Takes the plan away as a player dismantles it, leaving the ground as it is |

The game finishes a plan whose last tile is levelled, so a field is `IsGone` right after `LevelNow()` levelled them
all and there is nothing left to `Finish`. `HeightDifference` is worked out from the ground as it was drawn, so after
`LevelNow()` it follows only on the next frame.

:::note[Not done yet]
- Checked in single player and in a hosted world; a joined client's view of a mod's changes is not checked yet.
- Felling a tree with its loot. A mod can `Gather` what the player picks by hand, and `Remove` what a change of the
  ground takes, but no blow of a tool can be dealt for it.
- Growing a tree, a stone or a bush of the mod's own: the world's objects can be read, moved and taken away, never
  added.
- Water: its level can be read, never changed.
:::
