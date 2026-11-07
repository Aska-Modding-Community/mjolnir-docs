---
title: Патчи Harmony
---

# Патчи Harmony

Там, где модули SDK заканчиваются, мод сам патчит методы игры с помощью
[HarmonyX](https://github.com/BepInEx/HarmonyX), как в любой игре на IL2CPP с Il2CppInterop. Предпочитайте SDK, где в
нём есть нужное: его события переживают обновления игры, а работоспособность прямого патча после каждого обновления —
ваша забота.

## Проект {/* #the-project */}

Сошлитесь на Harmony и interop-сборки патчимых типов из установленного Mjolnir:

```xml
<ItemGroup>
  <Reference Include="$(MjolnirDir)\core\0Harmony.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\core\Il2CppInterop.Runtime.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\Assembly-CSharp.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\SandSailorStudio.dll" Private="false" />
  <Reference Include="$(MjolnirDir)\interop\Fusion.Runtime.dll" Private="false" />
</ItemGroup>
```

Код игры — `SSSGame.*` в `Assembly-CSharp`, плюс фреймворк студии `SandSailorStudio` (инвентарь, локализация,
атрибуты, генерация мира). Сеть — Photon Fusion (`Fusion.*`). Компилятор просит те сборки, которые упоминают члены
типа.

## Патчи {/* #patches */}

`Mod.Harmony` — экземпляр HarmonyX с id мода. Применяйте патчи в `OnLoad`:

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

// [HarmonyPatch] на уровне класса нужен, даже когда у его методов есть свои.
[HarmonyPatch(typeof(CharacterMovement), nameof(CharacterMovement.TryDrainStamina))]
internal static class TryDrainStaminaPatch
{
    private static bool Prefix(ref bool __result)
    {
        __result = true;   // «выносливости хватило»
        return false;      // пропустить оригинал: ничего не тратится
    }
}

[HarmonyPatch(typeof(CharacterMovement), nameof(CharacterMovement.DrainStamina))]
internal static class DrainStaminaPatch
{
    private static bool Prefix() => false;
}
```

Изоляция ошибок Mjolnir охватывает колбэки мода и обработчики, которые он передал SDK, но не код внутри патча: он
выполняется внутри вызова самой игры, поэтому исключения в нём перехватывайте сами. Патчи отключённого мода остаются
применёнными: на IL2CPP их нельзя надёжно откатить.

## Подводные камни IL2CPP {/* #il2cpp-pitfalls */}

- **Проверяйте типы через `TryCast<T>()`, никогда через `is` или `as`.** Il2CppInterop оборачивает возвращённый
  объект как объявленный тип метода. `transform.Find("x")` даёт обёртку `Transform` даже для `RectTransform`, поэтому
  `is RectTransform` всегда ложно. `TryCast<T>()` возвращает `null`, если объект не `T`; `Cast<T>()` бросает
  исключение.
- **Интерфейсы IL2CPP — это классы.** Приводите к ним через `Cast<T>()` / `TryCast<T>()`.
- **Маленькие методы могут быть встроены** в вызывающие при компиляции игры. Патч на встроенном методе никогда не
  срабатывает, и ничто об этом не сообщает. Если префикс ничего не делает, патчите вызывающий метод.
- **Метод Unity, который игра никогда не вызывает, может не работать** через interop, даже если он есть в сборке: он
  может бросить `MissingMethodException`. Предпочитайте методы, которые использует собственный код игры.
- **Никогда не пишите `new Il2CppReferenceArray<T>(n)` с длиной типа `int`.** `int` связывается с конструктором,
  принимающим указатель на существующий массив, и первая запись роняет игру. Передайте управляемый массив или
  приведите длину к `long`.
- **Никаких адресов и смещений.** Обращайтесь ко всему по имени: метаданные игры хранят все имена, поэтому патч по
  имени переживает пересборку игры, сохранившую это имя.
- **Ввод** — Input System Unity (`InputAction`), а не старый класс `Input`.
- **Никаких объектов Unity в `OnLoad`.** Патчить там можно, создавать объекты — нет. См.
  [Жизненный цикл мода](lifecycle.md#two-phases).
