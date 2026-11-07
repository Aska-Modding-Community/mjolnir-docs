---
title: Localization
---

# Localization

A mod's texts live in its `lang` folder, one TOML file per language, next to its `.dll`. English is the fallback for
every language without a file of its own, and for every key a file leaves out.

```text
Mjolnir/Mods/MyMod/
├─ MyMod.dll
└─ lang/
   ├─ english.toml
   └─ russian.toml
```

## Files

A file is named after a language as Steam names it, or after a language code:

| Language | File names |
|---|---|
| English | `english.toml`, `en.toml`, `en-US.toml`, `en-GB.toml` |
| German | `german.toml`, `de.toml`, `de-DE.toml` |
| French | `french.toml`, `fr.toml`, `fr-FR.toml` |
| Spanish | `spanish.toml`, `es.toml`, `es-ES.toml` |
| Italian | `italian.toml`, `it.toml` |
| Polish | `polish.toml`, `pl.toml` |
| Portuguese (Brazil) | `brazilian.toml`, `pt.toml`, `pt-BR.toml` |
| Romanian | `romanian.toml`, `ro.toml` |
| Russian | `russian.toml`, `ru.toml`, `ru-RU.toml` |
| Ukrainian | `ukrainian.toml`, `uk.toml` |
| Japanese | `japanese.toml`, `ja.toml` |
| Chinese, simplified / traditional | `schinese.toml`, `zh-Hans.toml` / `tchinese.toml`, `zh-Hant.toml` |

Keys nest: `[section] form = "…"` is the key `section.form`, the same as a top-level `section.form = "…"`. Texts are
formatted with `string.Format`, so `{0}` takes the first argument.

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

## Looking texts up

```csharp
string hello = Localization.Get("greeting", LocalPlayer.Name);     // "Hello, Ragnar!"
string logs = Localization.Get("hud.count", 12000);                 // "12,000 logs" in English

// A text that follows a change of language, for UI bindings.
TranslatedText title = Localization.GetBindable("hud.title");
var header = new UiSectionHeader();
header.Bind(UiSectionHeader.TextProperty, title);
```

`Get` looks a key up in this order, and returns the key itself when nothing matches:

1. the calling mod's strings, in the player's language, then in English;
2. any mod's string by its full key, `<mod id>.<key>`;
3. the game's own strings by their keys, such as `common.settings` or `common.close`.

Numbers and dates are formatted with `Localization.Culture`, the culture of the player's language. A format string
that does not fit its arguments is shown as it is, and logged once.

| Member | What |
|---|---|
| `Localization.Language` | The game's language by Steam's name: `english`, `russian`, `schinese`… English until the game has loaded its language in the main menu |
| `Localization.Culture` | Its culture, `ru-RU` for `russian` |
| `Localization.LanguageChanged` | Raised on the main thread, at the start of the frame after the game loaded a language, once at the start too |

The game takes its language from Steam (**ASKA → Properties → Language**), so it stays the same for a session.

On a thread other than the main one, only mods' strings are found. The game's are read on the main thread.

## The game's own texts

The SDK also puts each mod's strings into the game's dictionaries, under `<mod id>.<key>`, so the game's own text
components can show them. A `[game]` table overrides the game's strings by their keys, in the languages the mod gives
it for:

```toml title="lang/english.toml"
[game]
"common.settings" = "Game settings"
```

## Content texts

Items, buildings and effects take their texts from tables named after them. See the
[content guides](../guides/content/items-and-recipes.md).

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

## The Mods window

The Mods window shows a mod's name, description and settings in the player's language when its files give them.
Without them it shows the code's texts: the manifest's name and description, `WithDisplayName` and the settings'
descriptions.

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

An enum's values are named by a table named after the enum type, in the selector of the Mods window and in any
`UiStepper` or `UiComboBox` showing them:

```toml title="lang/russian.toml"
[Difficulty]
Easy = "Лёгкая"
Normal = "Обычная"
Hard = "Сложная"
```

Without one, a value shows its `[Description]` attribute, else its name.
