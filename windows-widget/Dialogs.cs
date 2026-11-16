using System;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace MateCalendar
{
    /// <summary>위젯과 같은 모양의 작은 창(둥근 카드 · 끌어서 옮기기 · 닫기 단추)</summary>
    internal abstract class CardWindow : Window
    {
        protected readonly Theme T;
        protected readonly StackPanel Body = new StackPanel();

        protected CardWindow(string title, Theme theme)
        {
            T = theme;
            Title = title;
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            ResizeMode = ResizeMode.NoResize;
            SizeToContent = SizeToContent.WidthAndHeight;
            WindowStartupLocation = WindowStartupLocation.CenterScreen;
            ShowInTaskbar = true;
            Topmost = true;
            UseLayoutRounding = true;
            FontFamily = Theme.Font;
            Language = System.Windows.Markup.XmlLanguage.GetLanguage("ko-KR");
            try { Icon = BitmapFrame.Create(new Uri("pack://application:,,,/Assets/app.ico")); } catch { /* 아이콘 없이 */ }

            var card = new Border
            {
                Width = 360, Margin = new Thickness(18), CornerRadius = new CornerRadius(12),
                Background = Theme.Brush(theme.Dark ? Color.FromRgb(0x2A, 0x2A, 0x2D) : Color.FromRgb(0xF7, 0xF7, 0xF9)),
                BorderBrush = Theme.Brush(theme.Border), BorderThickness = new Thickness(1),
                Effect = new DropShadowEffect { BlurRadius = 22, ShadowDepth = 4, Direction = 270, Opacity = theme.Dark ? 0.5 : 0.25 },
                Padding = new Thickness(22, 18, 22, 20),
                Language = System.Windows.Markup.XmlLanguage.GetLanguage("ko-KR"),
            };
            var grid = new Grid();
            grid.Children.Add(Body);
            var close = new Border
            {
                Width = 26, Height = 26, CornerRadius = new CornerRadius(6), Background = Brushes.Transparent, Cursor = Cursors.Hand,
                HorizontalAlignment = HorizontalAlignment.Right, VerticalAlignment = VerticalAlignment.Top, Margin = new Thickness(0, -6, -10, 0),
                ToolTip = "닫기",
                Child = new Path
                {
                    Data = Geometry.Parse("M0,0 L9,9 M9,0 L0,9"), Stroke = Theme.Brush(theme.Secondary), StrokeThickness = 1.5,
                    StrokeStartLineCap = PenLineCap.Round, StrokeEndLineCap = PenLineCap.Round,
                    HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center,
                },
            };
            close.MouseEnter += (s, e) => close.Background = Theme.Brush(theme.Quaternary);
            close.MouseLeave += (s, e) => close.Background = Brushes.Transparent;
            close.MouseLeftButtonUp += (s, e) => Close();
            grid.Children.Add(close);
            card.Child = grid;
            Content = card;

            KeyDown += (s, e) => { if (e.Key == Key.Escape) Close(); };
        }

        protected TextBlock Text(string text, double size, Color color, FontWeight? weight = null, bool wrap = false) => new TextBlock
        {
            Text = text, FontSize = size, Foreground = Theme.Brush(color), FontWeight = weight ?? Theme.Regular,
            TextWrapping = wrap ? TextWrapping.Wrap : TextWrapping.NoWrap,
        };

        protected FrameworkElement Head(string title, string sub)
        {
            var head = new StackPanel { Margin = new Thickness(0, 0, 0, 14), Background = Brushes.Transparent };
            // 머리를 끌어 창을 옮긴다(단추 위에서 끌면 단추가 눌리지 않으므로 머리에서만)
            head.MouseLeftButtonDown += (s, e) => { if (e.ButtonState == MouseButtonState.Pressed) try { DragMove(); } catch { /* 놓침 */ } };
            var row = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, 24, 0) };
            var icon = new Image { Width = 36, Height = 36, Margin = new Thickness(0, 0, 11, 0), VerticalAlignment = VerticalAlignment.Center };
            try { icon.Source = BitmapFrame.Create(new Uri("pack://application:,,,/Assets/app.ico")); } catch { /* 없이 */ }
            row.Children.Add(icon);
            var t = Text(title, 17, T.Header, Theme.Bold);
            t.VerticalAlignment = VerticalAlignment.Center;
            row.Children.Add(t);
            head.Children.Add(row);
            var s = Text(sub, 12.5, T.Secondary, null, true);
            s.Margin = new Thickness(0, 10, 0, 0);
            head.Children.Add(s);
            return head;
        }

        protected Border Button(string text, bool primary, Action click)
        {
            var label = Text(text, 13.5, primary ? Colors.White : T.Label, Theme.Medium);
            label.HorizontalAlignment = HorizontalAlignment.Center;
            var b = new Border
            {
                MinWidth = 84, Height = 34, CornerRadius = new CornerRadius(8), Padding = new Thickness(16, 0, 16, 0),
                Background = Theme.Brush(primary ? T.Accent : T.Quaternary), Child = label, Cursor = Cursors.Hand,
                Margin = new Thickness(8, 0, 0, 0),
            };
            label.VerticalAlignment = VerticalAlignment.Center;
            b.MouseEnter += (s, e) => b.Opacity = 0.88;
            b.MouseLeave += (s, e) => b.Opacity = 1;
            b.MouseLeftButtonUp += (s, e) => { if (b.IsEnabled) click(); };
            b.IsEnabledChanged += (s, e) => b.Opacity = b.IsEnabled ? 1 : 0.5;
            return b;
        }

        protected Border Field(Control input)
        {
            input.BorderThickness = new Thickness(0);
            input.Background = Brushes.Transparent;
            input.Foreground = Theme.Brush(T.Header);
            input.FontSize = 14;
            input.VerticalContentAlignment = VerticalAlignment.Center;
            input.Padding = new Thickness(2, 0, 2, 0);
            input.FontFamily = Theme.Font;
            if (input is TextBox tb) tb.CaretBrush = Theme.Brush(T.Header);
            if (input is PasswordBox pb) pb.CaretBrush = Theme.Brush(T.Header);
            var border = new Border
            {
                Height = 38, CornerRadius = new CornerRadius(8), BorderThickness = new Thickness(1.2), Padding = new Thickness(8, 0, 8, 0),
                BorderBrush = Theme.Brush(T.Tertiary), Background = Theme.Brush(T.Dark ? Color.FromArgb(0x26, 0, 0, 0) : Colors.White),
                Child = input,
            };
            input.GotKeyboardFocus += (s, e) => border.BorderBrush = Theme.Brush(T.Accent);
            input.LostKeyboardFocus += (s, e) => border.BorderBrush = Theme.Brush(T.Tertiary);
            return border;
        }
    }

    /// <summary>Hub 계정으로 로그인 - 갤럭시 위젯과 같은 메일 · 비밀번호</summary>
    internal sealed class LoginWindow : CardWindow
    {
        private readonly TextBox _email = new TextBox();
        private readonly PasswordBox _password = new PasswordBox();
        private readonly TextBlock _error;
        private readonly Border _submit;
        public bool Succeeded { get; private set; }

        public LoginWindow(Theme theme, string? message) : base("MATE 캘린더 로그인", theme)
        {
            Body.Children.Add(Head("MATE 캘린더", "Hub 와 같은 메일 · 비밀번호로 로그인합니다."));

            Body.Children.Add(Label("메일"));
            _email.Text = Api.Current?.Email ?? "";
            Body.Children.Add(Field(_email));
            var pw = Label("비밀번호");
            pw.Margin = new Thickness(0, 12, 0, 6);
            Body.Children.Add(pw);
            Body.Children.Add(Field(_password));

            _error = Text(message ?? "", 12.5, T.Red, null, true);
            _error.Margin = new Thickness(0, 10, 0, 0);
            _error.Visibility = string.IsNullOrEmpty(message) ? Visibility.Collapsed : Visibility.Visible;
            Body.Children.Add(_error);

            var foot = new StackPanel { Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Right, Margin = new Thickness(0, 18, 0, 0) };
            foot.Children.Add(Button("취소", false, Close));
            _submit = Button("로그인", true, () => _ = Submit());
            foot.Children.Add(_submit);
            Body.Children.Add(foot);

            var hint = Text("계정이 없으면 Hub(devteammate.co.kr/hub)에서 가입 요청 뒤 관리자 승인을 받습니다.", 11.5, T.Secondary, null, true);
            hint.Margin = new Thickness(0, 14, 0, 0);
            Body.Children.Add(hint);

            KeyDown += (s, e) => { if (e.Key == Key.Enter) _ = Submit(); };
            Loaded += (s, e) =>
            {
                Activate();
                if (_email.Text.Length > 0) _password.Focus();
                else _email.Focus();
            };
        }

        private TextBlock Label(string text)
        {
            var l = Text(text, 12.5, T.Secondary, Theme.Medium);
            l.Margin = new Thickness(0, 4, 0, 6);
            return l;
        }

        private bool _busy;

        private async Task Submit()
        {
            if (_busy) return;
            if (_email.Text.Trim() == "" || _password.Password == "")
            {
                ShowError("메일과 비밀번호를 넣어 주세요.");
                return;
            }
            _busy = true;
            _submit.IsEnabled = false;
            ((TextBlock)_submit.Child).Text = "확인 중…";
            try
            {
                await Api.SignIn(_email.Text, _password.Password);
                Succeeded = true;
                Close();
            }
            catch (ApiException e)
            {
                ShowError(e.Message);
            }
            catch (Exception e)
            {
                ShowError("로그인하지 못했습니다: " + e.Message);
            }
            finally
            {
                _busy = false;
                _submit.IsEnabled = true;
                ((TextBlock)_submit.Child).Text = "로그인";
            }
        }

        private void ShowError(string text)
        {
            _error.Text = text;
            _error.Visibility = Visibility.Visible;
        }
    }

    /// <summary>받은 exe 를 처음 열었을 때 - 설치 · 업데이트</summary>
    internal sealed class SetupWindow : CardWindow
    {
        private bool _autostart = true;
        private readonly Border _go;
        private readonly TextBlock _status;

        public SetupWindow(Theme theme) : base("MATE 캘린더 설치", theme)
        {
            var installed = Installer.InstalledVersion();
            var me = Version.Parse(Program.Version);
            string verb = installed == null ? "설치" : installed < me ? "업데이트" : "다시 설치";
            Body.Children.Add(Head($"MATE 캘린더 {verb}", $"Hub 의 내 작업을 바탕화면 캘린더 위젯으로 띄웁니다. 판 {Program.Version}" +
                (installed != null ? $" (지금 {installed.ToString(3)})" : "")));

            var info = Text("내 Windows 계정에만 설치합니다 - 관리자 권한이 필요 없습니다. 지울 때는 설정 → 앱 → 설치된 앱에서 'MATE 캘린더'를 지웁니다.",
                12.5, T.Label, null, true);
            Body.Children.Add(info);

            if (installed != null) _autostart = Installer.AutoStart;
            Body.Children.Add(Toggle("Windows 를 켤 때 함께 실행", _autostart, v => _autostart = v));

            _status = Text("", 12.5, T.Secondary, null, true);
            _status.Margin = new Thickness(0, 12, 0, 0);
            _status.Visibility = Visibility.Collapsed;
            Body.Children.Add(_status);

            var foot = new StackPanel { Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Right, Margin = new Thickness(0, 18, 0, 0) };
            foot.Children.Add(Button("취소", false, Close));
            _go = Button(verb, true, () => _ = Go());
            foot.Children.Add(_go);
            Body.Children.Add(foot);
            KeyDown += (s, e) => { if (e.Key == Key.Enter) _ = Go(); };
            Loaded += (s, e) => Activate();
        }

        private FrameworkElement Toggle(string text, bool on, Action<bool> changed)
        {
            var box = new Border
            {
                Width = 18, Height = 18, CornerRadius = new CornerRadius(5), BorderThickness = new Thickness(1.3),
                VerticalAlignment = VerticalAlignment.Center,
            };
            var tick = new Path
            {
                Data = Geometry.Parse("M1,5 L4.6,8.6 L11,1.6"), Stroke = Brushes.White, StrokeThickness = 1.8,
                StrokeStartLineCap = PenLineCap.Round, StrokeEndLineCap = PenLineCap.Round, StrokeLineJoin = PenLineJoin.Round,
                HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center,
            };
            box.Child = tick;
            void Paint()
            {
                box.Background = on ? Theme.Brush(T.Accent) : Brushes.Transparent;
                box.BorderBrush = Theme.Brush(on ? T.Accent : T.Secondary);
                tick.Visibility = on ? Visibility.Visible : Visibility.Hidden;
            }
            Paint();
            var row = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 14, 0, 0), Background = Brushes.Transparent, Cursor = Cursors.Hand };
            row.Children.Add(box);
            var label = Text(text, 13, T.Header);
            label.Margin = new Thickness(9, 0, 0, 0);
            label.VerticalAlignment = VerticalAlignment.Center;
            row.Children.Add(label);
            row.MouseLeftButtonUp += (s, e) => { on = !on; Paint(); changed(on); };
            return row;
        }

        private bool _busy;

        private async Task Go()
        {
            if (_busy) return;
            _busy = true;
            _go.IsEnabled = false;
            _status.Text = "설치하는 중…";
            _status.Visibility = Visibility.Visible;
            try
            {
                bool auto = _autostart;
                bool autoOk = await Task.Run(() => Installer.Install(auto));
                if (!autoOk)
                {
                    MessageBox.Show(this, "설치는 끝났지만 'Windows 를 켤 때 함께 실행'을 켜지 못했습니다(보안 프로그램이 막았을 수 있습니다).\n" +
                        "위젯의 ⋯ 메뉴에서 다시 켜 볼 수 있고, 시작 메뉴의 'MATE 캘린더'로 언제든 띄울 수 있습니다.",
                        "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(Installer.Exe) { UseShellExecute = false });
                Close();
            }
            catch (Exception e)
            {
                _status.Text = "설치하지 못했습니다: " + e.Message;
                _status.Foreground = Theme.Brush(T.Red);
                _go.IsEnabled = true;
                _busy = false;
            }
        }
    }
}
