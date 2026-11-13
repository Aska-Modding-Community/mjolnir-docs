---
title: Локализация
---

# Локализация

Тексты мода лежат в `lang/` рядом с его `.dll`, по TOML-файлу на язык. Английский — запасной язык для языка без файла
и для ключа, которого нет в файле.

```text
Mjolnir/Mods/MyMod/
├─ MyMod.dll
└─ lang/
   ├─ english.toml
   └─ russian.toml
```

## Файлы {/* #files */}

Файл называется по имени языка в Steam или по коду языка:

| Язык | Имена файлов |
|---|---|
| Английский | `english.toml`, `en.toml`, `en-US.toml`, `en-GB.toml` |
| Немецкий | `german.toml`, `de.toml`, `de-DE.toml` |
| Французский | `french.toml`, `fr.toml`, `fr-FR.toml` |
| Испанский | `spanish.toml`, `es.toml`, `es-ES.toml` |
| Итальянский | `italian.toml`, `it.toml` |
| Польский | `polish.toml`, `pl.toml` |
| Португальский (Бразилия) | `brazilian.toml`, `pt.toml`, `pt-BR.toml` |
| Румынский | `romanian.toml`, `ro.toml` |
| Русский | `russian.toml`, `ru.toml`, `ru-RU.toml` |
| Украинский | `ukrainian.toml`, `uk.toml` |
| Японский | `japanese.toml`, `ja.toml` |
| Китайский, упрощённый / традиционный | `schinese.toml`, `zh-Hans.toml` / `tchinese.toml`, `zh-Hant.toml` |

Ключи вкладываются: `[section] form = "…"` — это ключ `section.form`, то же, что `section.form = "…"` на верхнем
уровне. Тексты форматируются через `string.Format`.

```toml title="lang/english.toml"
greeting = "Hello, {0}!"

[hud]
title = "Camp supplies"
count = "{0:N0} logs"
```

```toml title="lang/russian.toml"
greeting = "Привет, {0}!"

[hud]
title = "Припасы лагеря"
```

## Поиск текстов {/* #looking-texts-up */}

```csharp
string hello = Localization.Get("greeting", LocalPlayer.Name);     // "Hello, Ragnar!"
string logs = Localization.Get("hud.count", 12000);                 // "12,000 logs" на английском

// Текст, который следует за сменой языка, для привязок UI.
TranslatedText title = Localization.GetBindable("hud.title");
var header = new UiSectionHeader();
header.Bind(UiSectionHeader.TextProperty, title);
```

`Get` ищет ключ в таком порядке и возвращает сам ключ, если ничего не нашлось:

1. строки вызывающего мода на языке игрока, затем на английском;
2. строка любого мода по полному ключу, `<mod id>.<key>`;
3. собственные строки игры по их ключам, например `common.settings` или `common.close`.

Числа и даты форматируются по `Localization.Culture`, культуре языка игрока. Строка формата, не подходящая к своим
аргументам, показывается как есть и один раз записывается в лог.

| Имя | Что это |
|---|---|
| `Localization.Language` | Язык игры по имени Steam: `english`, `russian`, `schinese`… Английский, пока игра не загрузила свой язык в главном меню |
| `Localization.Culture` | Его культура, `ru-RU` для `russian` |
| `Localization.LanguageChanged` | Вызывается в главном потоке, в начале кадра после того, как игра загрузила язык, и один раз при запуске |

Игра берёт язык из Steam (**ASKA → Свойства → Язык**), поэтому в течение сеанса он не меняется.

Из другого потока доступны только строки модов: строки игры читаются в главном потоке.

## Собственные тексты игры {/* #the-games-own-texts */}

SDK также добавляет строки каждого мода в словари игры под ключами `<mod id>.<key>`, чтобы их могли показывать
собственные текстовые компоненты игры. Таблица `[game]` переопределяет строки игры по ключу на тех языках, в чьих
файлах она есть:

```toml title="lang/english.toml"
[game]
"common.settings" = "Game settings"
```

## Тексты контента {/* #content-texts */}

Предметы, постройки и эффекты берут тексты из таблиц, названных по ним. См.
[руководства по контенту](../guides/content/items-and-recipes.md).

```toml
[item.twine]
name = "Twine"
description = "Thin cord twisted from rope fibres."
lore = "Coiled so it does not tangle."

[building.twine_arch]
name = "Twine arch"
description = "Decoration"
lore = "Two posts and a bent top, bound with twine."

[effect.blessing]
name = "Blessing"
description = "Stronger, and wounds close by themselves."
added = "You feel blessed."
removed = "The blessing fades."
```

## Окно модов {/* #the-mods-window */}

Окно модов берёт имя, описание и настройки мода на языке игрока из его файлов. Без них оно показывает тексты из кода:
имя и описание из манифеста, `WithDisplayName` и описания настроек.

```toml title="lang/russian.toml"
[mod]
name = "Мой мод"
description = "Что он делает."

[sections]
Stamina = "Выносливость"

[config.Stamina.CostMultiplier]
name = "Расход выносливости"
description = "Доля обычного расхода выносливости."
```

Имена значений перечисления берутся из таблицы, названной по типу перечисления, — для переключателя в окне модов и для любого
`UiStepper` или `UiComboBox`, который их показывает:

```toml title="lang/russian.toml"
[Difficulty]
Easy = "Лёгкая"
Normal = "Обычная"
Hard = "Сложная"
```

Без неё значение показывает свой атрибут `[Description]`, а без него — своё имя.
