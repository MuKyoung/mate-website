using System.Windows;
using System.Windows.Controls;
using System.Windows.Markup;

namespace MateCalendar
{
    /// <summary>메뉴 · 스크롤 막대 모양 - Calendr(macOS)의 얇은 막대와 둥근 반투명 메뉴를 흉내 낸다</summary>
    internal static class Styles
    {
        private const string Ns = "xmlns=\"http://schemas.microsoft.com/winfx/2006/xaml/presentation\" xmlns:x=\"http://schemas.microsoft.com/winfx/2006/xaml\"";

        public static void ApplyScroll(ScrollViewer sv, Theme t)
        {
            var xaml = $@"
<ControlTemplate {Ns} TargetType=""ScrollViewer"">
  <Grid Background=""Transparent"">
    <ScrollContentPresenter x:Name=""PART_ScrollContentPresenter"" CanContentScroll=""{{TemplateBinding CanContentScroll}}"" Margin=""{{TemplateBinding Padding}}""/>
    <ScrollBar x:Name=""PART_VerticalScrollBar"" HorizontalAlignment=""Right"" Width=""4"" MinWidth=""0"" Margin=""0,2,1,2""
               Value=""{{TemplateBinding VerticalOffset}}"" Maximum=""{{TemplateBinding ScrollableHeight}}""
               ViewportSize=""{{TemplateBinding ViewportHeight}}"" Visibility=""{{TemplateBinding ComputedVerticalScrollBarVisibility}}"">
      <ScrollBar.Template>
        <ControlTemplate TargetType=""ScrollBar"">
          <Track x:Name=""PART_Track"" IsDirectionReversed=""True"">
            <Track.Thumb>
              <Thumb>
                <Thumb.Template>
                  <ControlTemplate TargetType=""Thumb"">
                    <Border CornerRadius=""2.5"" Background=""{Theme.Hex(t.Tertiary)}""/>
                  </ControlTemplate>
                </Thumb.Template>
              </Thumb>
            </Track.Thumb>
          </Track>
        </ControlTemplate>
      </ScrollBar.Template>
    </ScrollBar>
  </Grid>
</ControlTemplate>";
            sv.Template = (ControlTemplate)XamlReader.Parse(xaml);
        }

        /// <summary>로그인 · 설치 창의 단추 - 키보드(Tab · Enter · Space)와 화면 읽기 프로그램이 다루는 진짜 Button</summary>
        public static ControlTemplate DialogButton(Theme t, double radius, bool hoverFill)
        {
            string hover = hoverFill
                ? $@"<Setter TargetName=""Bd"" Property=""Background"" Value=""{Theme.Hex(t.Quaternary)}""/>"
                : @"<Setter TargetName=""Bd"" Property=""Opacity"" Value=""0.86""/>";
            var xaml = $@"
<ControlTemplate {Ns} TargetType=""Button"">
  <Border x:Name=""Bd"" CornerRadius=""{radius}"" Background=""{{TemplateBinding Background}}"" Padding=""{{TemplateBinding Padding}}"">
    <ContentPresenter HorizontalAlignment=""Center"" VerticalAlignment=""Center"" RecognizesAccessKey=""False""/>
  </Border>
  <ControlTemplate.Triggers>
    <Trigger Property=""IsMouseOver"" Value=""True"">{hover}</Trigger>
    <Trigger Property=""IsPressed"" Value=""True""><Setter TargetName=""Bd"" Property=""Opacity"" Value=""0.72""/></Trigger>
    <Trigger Property=""IsEnabled"" Value=""False""><Setter Property=""Opacity"" Value=""0.5""/></Trigger>
  </ControlTemplate.Triggers>
</ControlTemplate>";
            return (ControlTemplate)XamlReader.Parse(xaml);
        }

        /// <summary>설치 창의 체크 상자 - 둥근 칸 · 흰 체크(Space 로 바꾼다)</summary>
        public static ControlTemplate DialogCheck(Theme t)
        {
            string acc = Theme.Hex(t.Accent), sec = Theme.Hex(t.Secondary);
            var xaml = $@"
<ControlTemplate {Ns} TargetType=""CheckBox"">
  <StackPanel Orientation=""Horizontal"" Background=""Transparent"">
    <Border x:Name=""Box"" Width=""18"" Height=""18"" CornerRadius=""5"" BorderThickness=""1.3"" BorderBrush=""{sec}"" Background=""Transparent"" VerticalAlignment=""Center"">
      <Path x:Name=""Tick"" Data=""M1,5 L4.6,8.6 L11,1.6"" Stroke=""#FFFFFFFF"" StrokeThickness=""1.8"" StrokeStartLineCap=""Round"" StrokeEndLineCap=""Round""
            StrokeLineJoin=""Round"" HorizontalAlignment=""Center"" VerticalAlignment=""Center"" Visibility=""Hidden""/>
    </Border>
    <ContentPresenter Margin=""9,0,0,0"" VerticalAlignment=""Center"" RecognizesAccessKey=""False""/>
  </StackPanel>
  <ControlTemplate.Triggers>
    <Trigger Property=""IsChecked"" Value=""True"">
      <Setter TargetName=""Box"" Property=""Background"" Value=""{acc}""/>
      <Setter TargetName=""Box"" Property=""BorderBrush"" Value=""{acc}""/>
      <Setter TargetName=""Tick"" Property=""Visibility"" Value=""Visible""/>
    </Trigger>
  </ControlTemplate.Triggers>
</ControlTemplate>";
            return (ControlTemplate)XamlReader.Parse(xaml);
        }

        /// <summary>키보드로 옮겨 왔을 때만 보이는 둥근 초점 테두리</summary>
        public static Style FocusRing(Theme t, double radius)
        {
            var xaml = $@"
<Style {Ns} TargetType=""Control"">
  <Setter Property=""Template"">
    <Setter.Value>
      <ControlTemplate>
        <Border Margin=""-3"" CornerRadius=""{radius + 3}"" BorderThickness=""2"" BorderBrush=""{Theme.Hex(Theme.WithAlpha(t.Accent, 0.75))}""/>
      </ControlTemplate>
    </Setter.Value>
  </Setter>
</Style>";
            return (Style)XamlReader.Parse(xaml);
        }

        /// <summary>오른쪽 클릭 메뉴 · 작업 표시줄 메뉴에 쓰는 모양</summary>
        public static ResourceDictionary Menu(Theme t)
        {
            string bg = Theme.Hex(t.MenuBg), border = Theme.Hex(t.MenuBorder), text = Theme.Hex(t.Label), sub = Theme.Hex(t.Secondary),
                sep = Theme.Hex(t.Quaternary), hi = Theme.Hex(t.Accent);
            string panel = $@"
<Border Background=""{bg}"" BorderBrush=""{border}"" BorderThickness=""1"" CornerRadius=""9"" Padding=""5"" Margin=""0,0,10,10"">
  <Border.Effect><DropShadowEffect BlurRadius=""14"" ShadowDepth=""3"" Direction=""270"" Opacity=""0.28""/></Border.Effect>
  <StackPanel IsItemsHost=""True"" KeyboardNavigation.DirectionalNavigation=""Cycle""/>
</Border>";
            var xaml = $@"
<ResourceDictionary {Ns}>
  <Style TargetType=""{{x:Type ContextMenu}}"">
    <Setter Property=""OverridesDefaultStyle"" Value=""True""/>
    <Setter Property=""HasDropShadow"" Value=""False""/>
    <Setter Property=""SnapsToDevicePixels"" Value=""True""/>
    <Setter Property=""UseLayoutRounding"" Value=""True""/>
    <Setter Property=""FontSize"" Value=""13.5""/>
    <Setter Property=""Foreground"" Value=""{text}""/>
    <Setter Property=""Template"">
      <Setter.Value>
        <ControlTemplate TargetType=""{{x:Type ContextMenu}}"">{panel}</ControlTemplate>
      </Setter.Value>
    </Setter>
  </Style>
  <Style x:Key=""{{x:Static MenuItem.SeparatorStyleKey}}"" TargetType=""{{x:Type Separator}}"">
    <Setter Property=""OverridesDefaultStyle"" Value=""True""/>
    <Setter Property=""Template"">
      <Setter.Value>
        <ControlTemplate TargetType=""{{x:Type Separator}}""><Border Height=""1"" Margin=""10,5,10,5"" Background=""{sep}""/></ControlTemplate>
      </Setter.Value>
    </Setter>
  </Style>
  <Style TargetType=""{{x:Type MenuItem}}"">
    <Setter Property=""OverridesDefaultStyle"" Value=""True""/>
    <Setter Property=""Foreground"" Value=""{text}""/>
    <Setter Property=""Template"">
      <Setter.Value>
        <ControlTemplate TargetType=""{{x:Type MenuItem}}"">
          <Border x:Name=""Bd"" CornerRadius=""5"" Padding=""6,4,10,5"" Background=""Transparent"" SnapsToDevicePixels=""True"">
            <Grid>
              <Grid.ColumnDefinitions>
                <ColumnDefinition Width=""20""/>
                <ColumnDefinition Width=""*""/>
                <ColumnDefinition Width=""Auto""/>
              </Grid.ColumnDefinitions>
              <Path x:Name=""Check"" Data=""M1,5 L4.6,8.6 L11,1.6"" Stroke=""{{TemplateBinding Foreground}}"" StrokeThickness=""1.6""
                    StrokeStartLineCap=""Round"" StrokeEndLineCap=""Round"" StrokeLineJoin=""Round""
                    VerticalAlignment=""Center"" HorizontalAlignment=""Left"" Margin=""2,0,0,0"" Visibility=""Hidden""/>
              <ContentPresenter Grid.Column=""1"" ContentSource=""Header"" RecognizesAccessKey=""True"" VerticalAlignment=""Center""/>
              <TextBlock x:Name=""Gesture"" Grid.Column=""2"" Text=""{{TemplateBinding InputGestureText}}"" Margin=""18,0,0,0""
                         Foreground=""{sub}"" VerticalAlignment=""Center""/>
              <Path x:Name=""Arrow"" Grid.Column=""2"" Data=""M0,0 L4,4 L0,8"" Stroke=""{{TemplateBinding Foreground}}"" StrokeThickness=""1.4""
                    StrokeStartLineCap=""Round"" StrokeEndLineCap=""Round"" StrokeLineJoin=""Round""
                    Margin=""18,0,0,0"" VerticalAlignment=""Center"" Visibility=""Collapsed""/>
              <Popup x:Name=""PART_Popup"" Placement=""Right"" HorizontalOffset=""4"" VerticalOffset=""-6"" AllowsTransparency=""True""
                     Focusable=""False"" PopupAnimation=""None""
                     IsOpen=""{{Binding IsSubmenuOpen, RelativeSource={{RelativeSource TemplatedParent}}}}"">{panel}</Popup>
            </Grid>
          </Border>
          <ControlTemplate.Triggers>
            <Trigger Property=""IsChecked"" Value=""True""><Setter TargetName=""Check"" Property=""Visibility"" Value=""Visible""/></Trigger>
            <Trigger Property=""Role"" Value=""SubmenuHeader"">
              <Setter TargetName=""Arrow"" Property=""Visibility"" Value=""Visible""/>
              <Setter TargetName=""Gesture"" Property=""Visibility"" Value=""Collapsed""/>
            </Trigger>
            <Trigger Property=""IsHighlighted"" Value=""True"">
              <Setter TargetName=""Bd"" Property=""Background"" Value=""{hi}""/>
              <Setter Property=""Foreground"" Value=""#FFFFFFFF""/>
            </Trigger>
            <Trigger Property=""IsEnabled"" Value=""False""><Setter Property=""Opacity"" Value=""0.45""/></Trigger>
          </ControlTemplate.Triggers>
        </ControlTemplate>
      </Setter.Value>
    </Setter>
  </Style>
</ResourceDictionary>";
            return (ResourceDictionary)XamlReader.Parse(xaml);
        }
    }
}
