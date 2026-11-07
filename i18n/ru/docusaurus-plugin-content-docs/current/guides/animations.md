---
title: Анимации
---

# Анимации

`CharacterAnimator` проигрывает анимации на персонаже — игрока или жителя одинаково: собственные клипы игры и клипы
мода, поверх собственной анимации персонажа. Он в главной библиотеке, `Mjolnir.SDK`. Модуль `Mjolnir.SDK.Animation`
связывает его с игрой и добавляет собственные анимации и маски мода: для них подключите `Mjolnir.SDK.Animation.dll` и
добавьте `using Mjolnir.SDK.Animation;`.

```csharp
CharacterAnimator player = LocalPlayer.Animator;        // Mjolnir.SDK.Player
CharacterAnimator villager = Residents.All[0].Animator;  // Mjolnir.SDK.AI
```

Аниматор принадлежит одному персонажу: после загрузки возьмите его заново. Без персонажа он пуст и ничего не играет.

## Воспроизведение {/* #playing */}

```csharp
AnimationInfo? wave = Animations.Find("aska_wave");
if (wave != null)
    LocalPlayer.Animator.Play(wave, new AnimationOptions { Mask = AnimationMask.UpperBody });   // ноги продолжают идти
```

`Animations.All` перечисляет все клипы: игры — по имени ассета (`aska_wave`, `peasant_male_walk`, `aska_dodge_front`…),
модов — по полному имени `<mod id>.<name>`. `Animations.Find` принимает любое из них. Консольная `anims <words>`
перечисляет их. Клипы игры известны, когда игра их загрузила, — при её запуске: в `OnLoad` их ещё нет, поэтому ищите
их в момент воспроизведения.

Одновременно играет одна анимация. Новая перехватывает управление, предыдущая угасает; собственная анимация игры
продолжается под ней и возвращается, когда она кончается.

| `AnimationOptions` | По умолчанию | Что |
|---|---|---|
| `Loop` | `false` | Играет снова и снова до `Duration` или `Stop` |
| `Speed` | `1` | Скорость воспроизведения, больше 0 |
| `FadeIn`, `FadeOut` | 0,2 с | Плавный вход поверх анимации игры и выход обратно |
| `Duration` | длина клипа | Сколько играет, включая выход; с `Loop` — до остановки |
| `Mask` | всё тело | Кости, которые она двигает, например `AnimationMask.UpperBody` |
| `RootMotion` | `false` | Клип двигает персонажа через движение самой игры, которое держит его на земле и останавливает у стен |
| `MoveSpeed` | 0 для всего тела, 1 с маской | Какая часть собственной ходьбы игрока проходит, от 0 до 1. Жителей не удерживает |

`AnimationMask.UpperBody` — позвоночник, шея, голова и руки; таз и ноги остаются за анимацией игры.

## Воспроизведение как объект {/* #the-playback */}

`Play` возвращает `AnimationPlayback`:

```csharp
AnimationInfo wave = Animations.Find("aska_wave")!;
AnimationPlayback playback = LocalPlayer.Animator.Play(wave, new AnimationOptions { Mask = AnimationMask.UpperBody })
                                         .At(System.TimeSpan.FromSeconds(0.5), () => Notify.Message("Hello"));
playback.Ended += (_, e) => Log.Info(e.WasStopped ? "Interrupted" : "Done");
```

| Член | Что |
|---|---|
| `At(time, action)` | Выполняет действие, когда клип доходит до этого времени при скорости 1. Зацикленный клип выполняет его на каждом круге |
| `Ended` | Срабатывает один раз, когда анимация доиграла или её остановили (`WasStopped`): мод, другая анимация, уход персонажа |
| `IsPlaying`, `Time` | Играет ли ещё (угасание считается) и сколько клипа проиграно |
| `Speed` | Читается и меняется во время игры |
| `Stop()`, `Dispose()` | Плавно возвращают персонажа анимации игры |

`CharacterAnimator.Current` — текущее воспроизведение, `Stop()` останавливает его. Вызванный не из главного потока,
`Play` начинает на следующем кадре; события и действия `At` выполняются в главном потоке.

## Эмоции и кости {/* #emotes-and-bones */}

- `PlayEmote(Emote.Sit | Wave | Cheer | Skal)` проигрывает одну из эмоций игры, как колесо эмоций. Игра показывает её
  остальным игрокам. `false` без персонажа.
- `Bone(name)` даёт кость собственного скелета персонажа, например `Bip001 R Hand`, `Bip001 Head` или
  `Bone hand_weapon`, чтобы закрепить на ней эффект мода. `null` без персонажа или такой кости.
- `Rig` называет скелет: `aska` (игрок), `peasant_male`, `peasant_female`. Персонажи игры делят один скелет, так что
  клип одного играет на остальных; пропорции у них разные, поэтому клип, сделанный для игрока, на жителе может
  выглядеть чуть иначе.

## Жители {/* #villagers */}

Пока на жителе играет анимация, его собственный разум продолжает работу: он всё так же ходит, работает и носит. Поэтому:

- чтобы он остановился и сделал что-то (поклонился, станцевал, сотворил заклинание на месте), дайте ему работу с шагом
  `Play`. Работа забирает его от текущего занятия по приоритету и после возвращает;
- для жеста без отрыва от работы, например взмаха рукой на ходу, проигрывайте через `AnimationMask.UpperBody`;
- анимация всего тела, проигранная напрямую, подходит жителю, который и так стоит: идущий скользит в этой позе.

```csharp
Residents.AddJob("wave_back", priority: _ => 12f)
         .Play("aska_wave", duration: System.TimeSpan.FromSeconds(3));
```

`ResidentJob.Play(animation, options, duration)` принимает `AnimationInfo` или имя, которое ищется при старте шага, —
работы создаются в `OnLoad`. Шаг закончен, когда анимация кончилась или вышло `duration` (зацикленная анимация играет до
этого момента). Другой квест, забравший жителя, останавливает её. См. [Жители и работы](residents.md).

## Собственные анимации мода {/* #a-mods-own-animations */}

Клипы делаются на скелете игры в [mod kit](content/models.md#animations) и поставляются в AssetBundle.

```csharp title="BowMod.cs"
using Mjolnir.SDK;
using Mjolnir.SDK.Animation;
using Mjolnir.SDK.Player;
using Mjolnir.SDK.UI;

namespace BowMod;

[ModManifest("author.bow", "Bow", "1.0.0")]
public sealed class BowMod : Mod
{
    public override void OnLoad()
    {
        ModAnimation bow = Animations.Add("bow", "bundles/anims", "Bow");
        AnimationMask arms = AnimationMask.Add("arms", "bundles/anims", "Arms");

        HotKeys.Add(KeyGesture.Parse("F9"), () => LocalPlayer.Animator.Play(bow));
        HotKeys.Add(KeyGesture.Parse("F10"), () => LocalPlayer.Animator.Play(bow, new AnimationOptions { Mask = arms }));
    }
}
```

- `Animations.Add(name, bundle, asset)` добавляет клип `asset` из файла бандла относительно папки мода. Имя — буквы,
  цифры и подчёркивания; полное имя — `<mod id>.<name>`. Клип загружается при первом воспроизведении.
- `AnimationMask.Add(name, bundle, asset)` добавляет маску аватара, пути в которой идут от корня скелета игры
  (`master/Bip001/…`); их делает набор.
- Добавляйте и то и другое в `OnLoad`. Повторное добавление того же имени возвращает уже добавленное.

Пример мода `Mjolnir.AnimationsExample` кланяется по клавише (жители рядом кланяются в ответ через работу), делает рывок
вперёд с root motion и машет рукой на ходу.

## Мультиплеер {/* #multiplayer */}

Анимация, проигранная через `CharacterAnimator`, показывается на машинах других игроков, у которых стоит тот же мод.
Там место персонажа приходит по сети, поэтому ни root motion, ни удержание ходьбы не действуют. Эмоции идут путём
игры: их проигрывает владелец персонажа, а игра показывает всем.

## Консоль {/* #console */}

| Команда | Что |
|---|---|
| `anims [words]` | Перечисляет анимации, в именах которых есть эти слова |
| `anim <animation> [loop] [upper] [move] [villager]` | Проигрывает анимацию на игроке или на ближайшем жителе |
| `animstop [villager]` | Останавливает её |
| `emote <sit\|wave\|cheer\|skal> [villager]` | Проигрывает одну из эмоций игры |
