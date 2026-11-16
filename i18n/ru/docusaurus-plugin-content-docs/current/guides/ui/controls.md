---
title: Элементы управления и панели
---

# Элементы управления и панели

Элементы управления носят префикс `Ui`, поэтому не конфликтуют с `UnityEngine.UI.Button` и подобными в моде, который
использует и Unity UI напрямую. У всего остального простые имена: `Control`, `Panel`, `Thickness`, `Orientation`.

## Текст и ввод {/* #text-and-input */}

| Элемент управления | Что | Основные свойства и события |
|---|---|---|
| `UiTextBlock` | Текст или строка с текстом справа | `Text`, `Foreground`, `TextAlignment`, `TextWrapping` |
| `UiSectionHeader` | Заголовок раздела в стиле игры | `Text` |
| `UiTextBox` | Текстовое поле игры | `Text`, `PlaceholderText`, `MaxLength`, `ContentType`, `TextAlignment`, `UpdateSourceTrigger`, `TextChanged` |
| `UiButton` | Кнопка игры | `Content`, `Click`, `Command`, `CommandParameter` |
| `UiToggleSwitch` | Селектор игры «Выкл / Вкл» | `IsChecked`, `OnContent`, `OffContent`, `IsCheckedChanged` |
| `UiSlider` | Ползунок игры | `Value`, `Minimum`, `Maximum`, `TickFrequency`, `IsSnapToTickEnabled`, `ValueFormat`, `ValueChanged` |
| `UiStepper` | Селектор игры «‹ значение ›» | `ItemsSource`, `SelectedItem`, `SelectedIndex`, `ItemText`, `SelectionChanged` |
| `UiComboBox` | Выпадающий список игры | то же и `PlaceholderText` |
| `UiHotKeyBox` | Клавиша, которую записывает игрок | `Gesture`, `GestureChanged` |
| `UiKeyHint` | Клавиша в картинках клавиш игры, с текстом | `Gesture`, `Text` |

Текстовое поле записывает свой `Text` в привязку, когда игрок нажимает Enter или покидает поле. С
`UpdateSourceTrigger.PropertyChanged` оно записывает при каждом нажатии клавиши — для поля поиска.

`UiStepper` и `UiComboBox` показывают значения перечисления по локализованным именам мода, затем по их `[Description]`,
затем по именам; прочие элементы — через `ToString()` или функцию `ItemText`.

```csharp
var name = new UiTextBox { Header = "Your name", Text = "Ragnar", MaxLength = 20 };
var volume = new UiSlider { Header = "Volume", Maximum = 1, Value = 0.8 };
var season = new UiComboBox { Header = "Season", ItemsSource = new[] { "Spring", "Summer", "Autumn", "Winter" }, SelectedIndex = 0 };
var hello = new UiButton { Content = "Say hello" };

hello.Click += (_, _) => Notify.Message($"Hello, {name.Text}!");
volume.ValueChanged += (_, e) => Log.Info($"Volume {e.NewValue:0.##}");
```

События значений возникают при каждом изменении — из кода, привязки или от игрока. `Click` возникает только от игрока.

## Прогресс и картинки {/* #progress-and-pictures */}

| Элемент управления | Что | Основные свойства и события |
|---|---|---|
| `UiProgressBar` | Полоса здоровья HUD | `Value`, `Minimum`, `Maximum`, `Foreground`, `ShowProgressText`, `ProgressTextFormat` |
| `UiProgressRing` | Кольцо еды HUD. Его `Width` — диаметр | то же и `Icon` |
| `UiImage` | Картинка | `Source` (`Bitmap`), `Stretch` |
| `UiSlot` | Слот предмета инвентаря | `Icon`, `Count`, `FillFraction`, `IsSelected`, `Click`, `Command` |
| `UiCard` | Карточка бога со страницы деяний | `Image`, `Title`, `Subtitle`, `IsSelected`, `Click`, `Command`. `Width` масштабирует её |
| `UiItemCard` | Инвентарная карточка предмета: картинка, имя, уровень, вид, лор и характеристики | `AssetName` |

### Игровая карточка предмета {/* #the-games-card-of-an-item */}

`UiItemCard` рисует ту карточку, которую инвентарь показывает под указателем, для любого предмета из базы игры —
носить его игроку не нужно. Предмет называется так же, как его зовёт игра:

```csharp
var card = new UiItemCard { AssetName = "Item_Wood_Sticks" };
```

Имя — это имя ассета игры, `ItemDefinition.AssetName` из [каталога предметов](../content/catalog.md) или собственный
`ModItem.AssetName` мода. Как всплывающая подсказка над строкой или слотом карточка рисуется как есть, без рамки
подсказки вокруг:

```csharp
row.ToolTip = new UiItemCard { AssetName = item.AssetName };
```

Элемент управления со своей картинкой (`Icon`) может отдать карточку самой картинке. Тогда `ToolTipOnIcon` показывает карточку,
только пока указатель на картинке, и ставит её справа от картинки — так же, как игра ставит свою карточку рядом
со слотом под указателем:

```csharp
var row = new UiTextBox
{
    Header = item.DisplayName,
    Icon = item.Icon,
    ToolTip = new UiItemCard { AssetName = item.AssetName },
    ToolTipOnIcon = true,
};
```

Без `ToolTipOnIcon` карточка принадлежит всему элементу и встаёт рядом с указателем. Элемент без картинки его
не замечает.

Карточка не показывает прочность конкретной вещи в руках игрока и подсказки клавиш инвентаря (использовать,
выбросить, в быстрый слот) — вне инвентаря они ничего не значат.

`ProgressTextFormat` — формат .NET: `{0}` — значение, `{1}` — процент, `{2}` — минимум, `{3}` — максимум.

`Bitmap` — это файл PNG или JPG, читаемый при первом показе, либо ваши `Texture2D` или `Sprite`, преобразуемые неявно:

```csharp
string folder = System.IO.Path.GetDirectoryName(Manifest.Location)!;   // Location — это .dll мода
var icon = new UiImage { Source = new Bitmap(System.IO.Path.Combine(folder, "items/rope.png")), Width = 64, Height = 64 };
```

Игра выгружает неиспользуемые ассеты при каждой загрузке сцены. Текстуре или спрайту, сделанным в коде и хранимым
между сценами, нужен `hideFlags = HideFlags.DontUnloadUnusedAsset`. Картинки из файлов SDK сохраняет сам.

## Панели {/* #panels */}

| Панель | Что | Основные свойства и события |
|---|---|---|
| `UiStackPanel` | Дочерние элементы в столбец или в ряд | `Orientation`, `Spacing`, `Children` |
| `UiGrid` | Дочерние элементы по столбцам, ряд за рядом | `ColumnDefinitions` (`"*,220"`, `"Auto,2*,100"`), `ColumnSpacing`, `RowSpacing` |
| `UiWrapPanel` | Ячейки в строках с переносом | `ItemWidth`, `ItemHeight`, `ItemSpacing`, `LineSpacing`, `Orientation`, `ItemsAlignment` |
| `UiBorder` | Один дочерний элемент на фоне | `Child`, `Background`, `Padding` |
| `UiScrollViewer` | Один дочерний элемент с вертикальной прокруткой | `Content`, `Height` (по умолчанию 300) |
| `UiExpander` | Заголовок, раскрывающий тело | `Header`, `Content`, `IsExpanded`, `Expanded`, `Collapsed` |
| `UiLayoutTransformControl` | Один дочерний элемент, нарисованный в масштабе | `Child`, `Scale` |
| `UiUserControl` | Основа для собственного представления | `Content` |
| `UiUnityHost` | Собственные объекты Unity в дереве | функция построения, получающая `RectTransform` |

`Children` (и `Controls`, его тип) принимает элементы по одному или последовательность через `AddRange`.

```csharp
var footer = new UiGrid
{
    ColumnDefinitions = "*,220,220",
    Children =
    {
        new UiTextBlock { Text = "Changes apply after a restart" },
        new UiButton { Content = "Reset" },
        new UiButton { Content = "Close" },
    },
};
```

## Элементы и выбор {/* #items-and-selection */}

| Элемент управления | Что | Основные свойства и события |
|---|---|---|
| `UiItemsControl` | По элементу на каждый элемент коллекции | `ItemsSource`, `ItemTemplate`, `ItemsPanel` |
| `UiListBox` | То же в строках слотов сохранений игры, с выбором | `SelectedIndex`, `SelectedItem`, `SelectionChanged` |
| `UiTabControl` | Вкладки, у каждой своя страница | `Items` из `UiTabItem` (`Header`, `Icon`, `Content`), `TabStripPlacement`, `SelectedIndex` |

За `ObservableCollection<T>` в `ItemsSource` следят: добавленные и удалённые элементы появляются и исчезают на экране.
Шаблон создаёт элемент для каждого элемента коллекции:

```csharp
var notes = new System.Collections.ObjectModel.ObservableCollection<string> { "Wood", "Stone" };
var list = new UiListBox
{
    ItemsSource = notes,
    ItemTemplate = new FuncDataTemplate<string>(note => new UiTextBlock { Text = note }),
};
list.SelectionChanged += (_, _) => Log.Info($"Selected {list.SelectedItem}");

// Слоты в сетке с переносом.
var slots = new UiItemsControl
{
    ItemsSource = new[] { 5, 12, 1 },
    ItemTemplate = new FuncDataTemplate<int>(count => new UiSlot { Count = count }),
    ItemsPanel = new FuncTemplate<Panel>(() => new UiWrapPanel()),
};
```

Вкладки сверху (`Dock.Top`, по умолчанию) — это вкладки-значки журнала, с заголовком во всплывающей карточке. Q и E
переключают их. Вкладки слева (`Dock.Left`) — это список категорий журнала:

```csharp
var tabs = new UiTabControl
{
    TabStripPlacement = Dock.Left,
    Items =
    {
        new UiTabItem { Header = "Wood", Content = new UiTextBlock { Text = "Logs and sticks" } },
        new UiTabItem { Header = "Stone", Content = new UiTextBlock { Text = "Rocks and flint" } },
    },
};
```

## Собственные объекты Unity {/* #unity-objects-of-your-own */}

Для всего, чего нет в SDK, `UiUnityHost` даёт `RectTransform` в дереве, в котором можно строить своё:

```csharp
var stripe = new UiUnityHost(rect =>
{
    var image = rect.gameObject.AddComponent<UnityEngine.UI.Image>();
    image.color = new UnityEngine.Color(0.99f, 0.67f, 0f);
}) { Width = 240, Height = 8 };
```

Для этого подключите `UnityEngine.UI.dll` из `Mjolnir/interop`.
