---
title: Сборка из исходников
---

# Сборка из исходников

## Требования {/* #requirements */}

- Windows с ASKA, установленной через Steam;
- .NET 10 SDK;
- Visual Studio или её Build Tools с компилятором C++ x64 (MSVC) и CMake — для нативного прокси;
- только для моделей: Unity 6000.3.12f1 через Unity Hub.

Скрипты находят игру в ваших библиотеках Steam, а Unity 6000.3.12f1 — в папках установки Unity Hub
(`tools/locations.ps1`). Чтобы указать другое место, передайте `-GameDir` (`deploy.ps1`, `gen-interop.ps1`) или `-Unity`
(`build-bundles.ps1`) либо один раз задайте `MJOLNIR_GAME_DIR` / `MJOLNIR_UNITY` для всех сразу.

## Структура {/* #the-layout */}

| Путь | Содержимое |
|---|---|
| `src/Mjolnir.Native` | DLL прокси (C++, CMake, MinHook) |
| `src/Mjolnir.Core` | Рантайм |
| `src/Mjolnir.SDK`, `src/Mjolnir.SDK.*` | Основная библиотека SDK и его модули |
| `tests/` | Юнит-тесты, по проекту на сборку, и тестовые моды, которые работают в игре |
| `examples/` | Примеры модов |
| `tools/` | Скрипты сборки, развёртывания и упаковки, генератор interop, карта кода бинарника игры |
| `unity/Mjolnir.ModKit` | Проект Unity для AssetBundle модов |

`Mjolnir.slnx` группирует проекты по модулям, а все тестовые проекты — в одной папке `tests`.

## Interop для компиляции {/* #interop-for-compiling */}

Проекты собираются со ссылками на interop-сборки, сгенерированные из вашей копии игры в `build/interop`.
Сгенерируйте их один раз и повторяйте после каждого обновления игры:

```bash
powershell -File tools/gen-interop.ps1
```

Скрипт читает версию Unity из игры, один раз скачивает соответствующие базовые библиотеки Unity в `build/unity-libs`,
собирает генератор в `tools/Mjolnir.InteropGen` и запускает его. Папка игры не затрагивается.

## Сборка и установка в игру {/* #build-and-install-into-the-game */}

```bash
powershell -File tools/deploy.ps1 -Examples
```

`deploy.ps1` собирает нативный прокси, Core, SDK с его модулями и генератор interop и копирует их в игру:
`version.dll`, `Mjolnir/core`, `Mjolnir/interopgen` и приватный рантайм .NET в `Mjolnir/dotnet`. Свою
`Mjolnir/interop` игра генерирует при следующем запуске. Конфиги в `Mjolnir/Config` сохраняются.

| Флаг | Что |
|---|---|
| `-Examples` | Также собирает и устанавливает примеры модов; без него их папки удаляются из игры |
| `-SmokeMod`, `-UiLab` | То же для тестовых модов |
| `-SkipBuild` | Устанавливает уже собранные результаты |
| `-Uninstall` | Удаляет только `version.dll` |

Отдельно нативный прокси собирается командой `tools/build-native.cmd x64-release`, которая сама настраивает
окружение компилятора.

## Тесты {/* #tests */}

```bash
dotnet test tests/Mjolnir.Core.Tests
```

В `tests/` по одному проекту юнит-тестов на сборку; ни одному не нужна игра. Всё остальное проверяется в игре, с
тестовыми модами и `Mjolnir/LogOutput.log`.

## Публичный API {/* #the-public-api */}

Каждая сборка SDK объявляет свой публичный API в `PublicAPI.Shipped.txt` и `PublicAPI.Unshipped.txt` рядом со своим
проектом. Необъявленный публичный член — предупреждение сборки. Объявляйте добавления в `PublicAPI.Unshipped.txt`, а
удалённый или переименованный выпущенный член записывайте туда строкой `*REMOVED*`. Релиз переносит невыпущенные строки
в файл выпущенных.

Собственные тесты SDK также проверяют, что ни одна публичная сигнатура не раскрывает тип игры или Core и что каждое
событие следует [соглашению о событиях](../concepts/bindables-and-events.md#the-event-convention).

## Упаковка релиза {/* #packaging-a-release */}

```bash
powershell -File tools/package.ps1
```

Скрипт собирает всё в Release и пишет `artifacts/package/Mjolnir-<version>.zip` с его `.sha256`. В корне архива только
`version.dll` и `Mjolnir/` (`core`, `interopgen`, `dotnet`, пустая `Mods`, `licenses`, лицензия и README), но никогда
не interop-сборки, тестовые моды, примеры, конфиги и логи. Лицензия каждого стороннего компонента попадает в
`Mjolnir/licenses`, перечень — в `THIRD-PARTY-NOTICES.txt`; пакет без лицензии или известного источника останавливает
скрипт.

## Сайт документации {/* #the-documentation-site */}

У документации собственный репозиторий
[mjolnir-docs](https://github.com/Aska-Modding-Community/mjolnir-docs): страницы Markdown в `docs/`, которые читаются на
GitHub как есть, и сайт Docusaurus вокруг них.

```bash
npm install
npm start
```

`npm run build` пишет статический сайт в `build/`.

## Лицензия {/* #license */}

Mjolnir распространяется по лицензии MIT. Его зависимости сохраняют собственные лицензии, перечисленные в архиве
релиза.
