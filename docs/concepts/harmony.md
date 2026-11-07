---
title: Harmony patches
---

# Harmony patches

The SDK covers what its modules cover. For anything else, a mod patches the game's methods itself with
[HarmonyX](https://github.com/BepInEx/HarmonyX), as on any IL2CPP game with Il2CppInterop. Prefer the SDK where it has
what you need: its events survive game updates, while a direct patch is yours to keep working after each update.

## The project

Patching needs Harmony itself and the interop assemblies of the types you patch, from the installed Mjolnir:

```xml
<ItemGroup>
  <Reference Include="$(MjolnirDir)\core\0Harmony.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\core\Il2CppInterop.Runtime.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\Assembly-CSharp.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\SandSailorStudio.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\Fusion.Runtime.dll" Private="false" />
</ItemGroup>
```

The game's code is `SSSGame.*` in `Assembly-CSharp`, plus the studio's framework `SandSailorStudio` (inventory,
localization, attributes, world generation). Networking is Photon Fusion (`Fusion.*`). The compiler asks for the
assemblies a type's members mention.

## Patches

`Mod.Harmony` is a HarmonyX instance whose id is the mod's id. Apply patches in `OnLoad`:

```csharp title="NoStaminaMod.cs"
using HarmonyLib;
using Mjolnir.SDK;
using SSSGame.Controllers;

namespace NoStaminaMod;

[ModManifest("author.nostamina", "No Stamina", "1.0.0")]
public sealed class NoStaminaMod : Mod
{
    public override void OnLoad() => Harmony.PatchAll(typeof(NoStaminaMod).Assembly);
}

// A class-level [HarmonyPatch] is needed even when its methods carry their own.
[HarmonyPatch(typeof(CharacterMovement), nameof(CharacterMovement.TryDrainStamina))]
internal static class TryDrainStaminaPatch
{
    private static bool Prefix(ref bool __result)
    {
        __result = true;   // "there was enough stamina"
        return false;      // skip the original: nothing is spent
    }
}

[HarmonyPatch(typeof(CharacterMovement), nameof(CharacterMovement.DrainStamina))]
internal static class DrainStaminaPatch
{
    private static bool Prefix() => false;
}
```

An exception thrown inside a patch is your mod's, like any other. The patches stay applied after a fault, though:
Harmony patches cannot be reliably undone on IL2CPP.

## IL2CPP pitfalls

- **Test types with `TryCast<T>()`, never `is` or `as`.** Il2CppInterop wraps a returned object as the method's
  declared type. `transform.Find("x")` gives a `Transform` wrapper even for a `RectTransform`, so `is RectTransform`
  is always false. `TryCast<T>()` returns `null` when the object is not a `T`; `Cast<T>()` throws.
- **IL2CPP interfaces are classes.** Cast to them with `Cast<T>()` / `TryCast<T>()`.
- **Small methods may be inlined** into their callers when the game was compiled. A patch on an inlined method never
  fires, with no error. When a prefix does nothing, patch the caller.
- **A Unity method the game never calls may not work** through the interop, even if the assembly has it: it can fail
  with `MissingMethodException`. Prefer the methods the game's own code uses.
- **Never `new Il2CppReferenceArray<T>(n)` with an `int` length.** An `int` binds to the constructor that takes an
  existing array's pointer, and the first write crashes the game. Pass a managed array, or cast the length to `long`.
- **No addresses or offsets.** Everything is reached by name. The game's metadata keeps all names, so a patch by name
  survives a rebuild of the game that keeps the name.
- **Input** is Unity's Input System (`InputAction`), not the old `Input` class.
- **No Unity objects in `OnLoad`.** Patching is fine there; creating objects is not. See
  [Mod lifecycle](lifecycle.md#two-phases).
