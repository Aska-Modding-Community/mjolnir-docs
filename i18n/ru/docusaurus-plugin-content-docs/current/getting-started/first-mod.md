---
title: Ваш первый мод
---

# Ваш первый мод

Мод — это библиотека классов `net10.0`, которая собирается со ссылками на файлы установленного Mjolnir. Тот, что
ниже, снижает расход выносливости на бег, а величину он берёт из настройки, которую игрок меняет прямо в игре.

## Что нужно {/* #what-you-need */}

- ASKA с [установленным](installing.md) Mjolnir, запущенная хотя бы раз, чтобы существовала `Mjolnir/interop/`;
- [.NET 10 SDK](https://dotnet.microsoft.com/download);
- любой редактор C#: Visual Studio, Rider или VS Code.

## Проект {/* #the-project */}

Создайте библиотеку классов и замените её `.csproj`:

```bash
dotnet new classlib -n MyFirstMod -f net10.0
```

```xml title="MyFirstMod.csproj"
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <Version>1.0.0</Version>
    <!-- Папка игры: измените её, если ваша библиотека Steam в другом месте. -->
    <AskaDir>C:\Program Files (x86)\Steam\steamapps\common\ASKA</AskaDir>
    <MjolnirDir>$(AskaDir)\Mjolnir</MjolnirDir>
  </PropertyGroup>

  <ItemGroup>
    <!-- Всегда: SDK, рантайм, интерфейс которого реализует его тип Mod, и типы движка, которые используют его колбэки. -->
    <Reference Include="$(MjolnirDir)\core\Mjolnir.Core.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\interop\Il2Cppmscorlib.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\interop\UnityEngine.CoreModule.dll" Private="false" />
    <!-- Модули, которые использует этот мод. -->
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.Player.dll" Private="false" />
    <Reference Include="$(MjolnirDir)\core\Mjolnir.SDK.UI.dll" Private="false" />
  </ItemGroup>

  <!-- После каждой сборки копировать мод в игру. -->
  <Target Name="InstallMod" AfterTargets="Build">
    <Copy SourceFiles="$(TargetPath)" DestinationFolder="$(MjolnirDir)\Mods\$(AssemblyName)" />
  </Target>

</Project>
```

`Private="false"` оставляет эти файлы вне вывода сборки: в игре они уже есть, а копия в папке мода игнорируется. Мод поставляет
только свою `.dll`.

Каждая сборка SDK идёт со своей XML-документацией, поэтому редактор подсказывает, что делает каждый метод и каждое свойство.

## Класс мода {/* #the-mod-class */}

Удалите `Class1.cs` и добавьте:

```csharp title="MyFirstMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Config;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace MyFirstMod;

[ModManifest("author.myfirstmod", "My First Mod", "1.0.0", Description = "Cheaper sprinting.", Author = "Author")]
public sealed class MyFirstMod : Mod
{
    public override void OnLoad()
    {
        ConfigEntry<float> cost = Config.Bind("Stamina", "CostMultiplier", 0.5f, "Part of the game's stamina cost.")
                                        .WithRange(0f, 1f)
                                        .WithDisplayName("Stamina cost");

        LocalPlayer.Stamina.Draining += (_, e) => e.Amount *= cost.Value;
        LocalPlayer.Spawned += (_, _) => Notify.Message($"Stamina costs {cost.Value:P0}");
        Log.Info("Loaded");
    }
}
```

- `[ModManifest]` даёт моду id, имя и версию. По id называется файл его настроек, и из него же выводятся id
  его контента: после релиза не меняйте его.
- `OnLoad` выполняется один раз, до того как поднимется движок игры: место для настроек, подписок на события и контента.
  См. [Жизненный цикл мода](../concepts/lifecycle.md).
- `Config.Bind` объявляет настройку, которая сохраняется в `Mjolnir/Config/author.myfirstmod.toml`. С диапазоном окно
  модов показывает её ползунком.
- `LocalPlayer.Stamina.Draining` вызывается перед каждым расходом выносливости локального игрока. Обработчик меняет
  величину расхода или отменяет его.
- `Log` пишет в `Mjolnir/LogOutput.log`, каждая строка начинается с имени мода.

## Сборка и запуск {/* #build-and-run */}

```bash
dotnet build
```

Сборка копирует `MyFirstMod.dll` в `Mjolnir/Mods/MyFirstMod/`. Запустите игру из Steam и посмотрите в
`Mjolnir/LogOutput.log`:

```text
[2026-11-07 12:00:01.250] [Info ] [Mods] Loaded My First Mod (author.myfirstmod) 1.0.0 in 3 ms
[2026-11-07 12:00:01.251] [Info ] [My First Mod] Loaded
```

Откройте **Mjolnir** в главном меню: мод есть в списке, а на его странице **Настройки** — ползунок.

Собирайте при закрытой игре: запущенная игра держит файл мода открытым, а моды не перезагружаются, пока она работает.

## Дальше {/* #next */}

- [Жизненный цикл мода](../concepts/lifecycle.md): все колбэки, манифест, зависимости и что когда может выполняться.
- [Конфиг](../concepts/config.md) и [Локализация](../concepts/localization.md).
- Руководства, начиная с [Пользовательского интерфейса](../guides/ui/overview.md).
