---
title: Controls and panels
---

# Controls and panels

Controls carry the `Ui` prefix, so they never clash with `UnityEngine.UI.Button` and the like in a mod that also uses
raw Unity UI. Everything else has a plain name: `Control`, `Panel`, `Thickness`, `Orientation`.

## Text and input

| Control | What | Key members |
|---|---|---|
| `UiTextBlock` | A text, or a row with a text on its right | `Text`, `Foreground`, `TextAlignment`, `TextWrapping` |
| `UiSectionHeader` | A section's title in the game's look | `Text` |
| `UiTextBox` | The game's text field | `Text`, `PlaceholderText`, `MaxLength`, `ContentType`, `TextAlignment`, `UpdateSourceTrigger`, `TextChanged` |
| `UiButton` | The game's button | `Content`, `Click`, `Command`, `CommandParameter` |
| `UiToggleSwitch` | The game's Off / On selector | `IsChecked`, `OnContent`, `OffContent`, `IsCheckedChanged` |
| `UiSlider` | The game's slider | `Value`, `Minimum`, `Maximum`, `TickFrequency`, `IsSnapToTickEnabled`, `ValueFormat`, `ValueChanged` |
| `UiStepper` | The game's "‹ value ›" selector | `ItemsSource`, `SelectedItem`, `SelectedIndex`, `ItemText`, `SelectionChanged` |
| `UiComboBox` | The game's dropdown list | the same, and `PlaceholderText` |
| `UiHotKeyBox` | A key the player records | `Gesture`, `GestureChanged` |
| `UiKeyHint` | A key in the game's key pictures, with a text | `Gesture`, `Text` |

A text box writes its `Text` to a binding when the player presses Enter or leaves the field. With
`UpdateSourceTrigger.PropertyChanged` it writes on each keystroke, for a search field.

`UiStepper` and `UiComboBox` show an enum's values by the mod's localized names, then their `[Description]`, then their
names; other items by `ToString()`, or by an `ItemText` function.

```csharp
var name = new UiTextBox { Header = "Your name", Text = "Ragnar", MaxLength = 20 };
var volume = new UiSlider { Header = "Volume", Maximum = 1, Value = 0.8 };
var season = new UiComboBox { Header = "Season", ItemsSource = new[] { "Spring", "Summer", "Autumn", "Winter" }, SelectedIndex = 0 };
var hello = new UiButton { Content = "Say hello" };

hello.Click += (_, _) => Notify.Message($"Hello, {name.Text}!");
volume.ValueChanged += (_, e) => Log.Info($"Volume {e.NewValue:0.##}");
```

Value events fire on every change: from code, a binding or the player. `Click` fires only for the player.

## Progress and pictures

| Control | What | Key members |
|---|---|---|
| `UiProgressBar` | The HUD's health bar | `Value`, `Minimum`, `Maximum`, `Foreground`, `ShowProgressText`, `ProgressTextFormat` |
| `UiProgressRing` | The HUD's food ring. Its `Width` is its diameter | the same, and `Icon` |
| `UiImage` | A picture | `Source` (a `Bitmap`), `Stretch` |
| `UiSlot` | The inventory's item slot | `Icon`, `Count`, `FillFraction`, `IsSelected`, `Click`, `Command` |
| `UiCard` | The deeds page's god card | `Image`, `Title`, `Subtitle`, `IsSelected`, `Click`, `Command`. `Width` scales it |

`ProgressTextFormat` is a .NET format: `{0}` the value, `{1}` the percentage, `{2}` the minimum, `{3}` the maximum.

A `Bitmap` is a PNG or JPG file, read when first shown, or a `Texture2D` or `Sprite` of yours, converted implicitly:

```csharp
string folder = System.IO.Path.GetDirectoryName(Manifest.Location)!;   // Location is the mod's .dll
var icon = new UiImage { Source = new Bitmap(System.IO.Path.Combine(folder, "items/rope.png")), Width = 64, Height = 64 };
```

The game unloads unused assets on each scene load. A texture or sprite made in code and kept across scenes needs
`hideFlags = HideFlags.DontUnloadUnusedAsset`. Pictures read from files are kept by the SDK.

## Panels

| Panel | What | Key members |
|---|---|---|
| `UiStackPanel` | Children in a column or a row | `Orientation`, `Spacing`, `Children` |
| `UiGrid` | Children in columns, row after row | `ColumnDefinitions` (`"*,220"`, `"Auto,2*,100"`), `ColumnSpacing`, `RowSpacing` |
| `UiWrapPanel` | Cells in lines that wrap | `ItemWidth`, `ItemHeight`, `ItemSpacing`, `LineSpacing`, `Orientation`, `ItemsAlignment` |
| `UiBorder` | One child, on a background | `Child`, `Background`, `Padding` |
| `UiScrollViewer` | One child that scrolls vertically | `Content`, `Height` (300 by default) |
| `UiExpander` | A header that opens a body | `Header`, `Content`, `IsExpanded`, `Expanded`, `Collapsed` |
| `UiLayoutTransformControl` | One child drawn scaled | `Child`, `Scale` |
| `UiUserControl` | A base for a view of your own | `Content` |
| `UiUnityHost` | Unity objects of your own in the tree | a build function given the `RectTransform` |

`Children` (and `Controls`, its type) takes elements one by one, or a sequence of them through `AddRange`.

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

## Items and selection

| Control | What | Key members |
|---|---|---|
| `UiItemsControl` | One element per item of a collection | `ItemsSource`, `ItemTemplate`, `ItemsPanel` |
| `UiListBox` | The same, in the game's save-slot rows, with a selection | `SelectedIndex`, `SelectedItem`, `SelectionChanged` |
| `UiTabControl` | Tabs, each with a page | `Items` of `UiTabItem` (`Header`, `Icon`, `Content`), `TabStripPlacement`, `SelectedIndex` |

An `ObservableCollection<T>` as `ItemsSource` is followed: added and removed items appear and disappear on screen.
The template makes each item's element:

```csharp
var notes = new System.Collections.ObjectModel.ObservableCollection<string> { "Wood", "Stone" };
var list = new UiListBox
{
    ItemsSource = notes,
    ItemTemplate = new FuncDataTemplate<string>(note => new UiTextBlock { Text = note }),
};
list.SelectionChanged += (_, _) => Log.Info($"Selected {list.SelectedItem}");

// Slots in a grid that wraps.
var slots = new UiItemsControl
{
    ItemsSource = new[] { 5, 12, 1 },
    ItemTemplate = new FuncDataTemplate<int>(count => new UiSlot { Count = count }),
    ItemsPanel = new FuncTemplate<Panel>(() => new UiWrapPanel()),
};
```

Tabs on top (`Dock.Top`, the default) are the journal's icon tabs, with the header in the hover card. Q and E step
through them. Tabs on the left (`Dock.Left`) are the journal's list of categories:

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

## Unity objects of your own

For anything the SDK lacks, `UiUnityHost` gives a `RectTransform` in the tree to build into:

```csharp
var stripe = new UiUnityHost(rect =>
{
    var image = rect.gameObject.AddComponent<UnityEngine.UI.Image>();
    image.color = new UnityEngine.Color(0.99f, 0.67f, 0f);
}) { Width = 240, Height = 8 };
```

Reference `UnityEngine.UI.dll` from `Mjolnir/interop` for this.
