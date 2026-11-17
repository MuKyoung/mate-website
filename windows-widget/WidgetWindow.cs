using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Shapes;
using System.Windows.Threading;

namespace MateCalendar
{
    /// <summary>
    /// 바탕화면 캘린더 위젯. 배치 · 크기 · 색은 Calendr 의 본 화면(MainViewController · CalendarView · EventView)을 옮겼다.
    /// 모든 길이는 Calendr 의 pt 단위로 적고 화면에는 Settings.Scale 배로 그린다(기본 1.5).
    ///
    ///   머리      2026년 11월                 ‹  ○  ›
    ///   달력      일 월 화 수 목 금 토 (주말 칸 바탕 · 이번 달 테두리 · 오늘 파란 테두리 · 일정 점)
    ///   도구      📌                          ☰  📅  ⋯
    ///   요약      ▍기한 지남: 2   ▍오늘: 3
    ///   목록      ── 오늘 ──  ▍○ 작업 제목 …
    /// </summary>
    internal sealed class WidgetWindow : Window
    {
        // Calendr 의 값(pt)
        private const double M = 8;            // MainStackView.margin
        private const double Cell = 25;        // CalendarViewModel.cellSize
        private const double WeekRatio = 0.85; // weekNumberCellRatio
        private const double Radius = 10;      // 팝오버 모서리
        private const double Pad = 14;         // 그림자 자리
        private const double ListHeight = 196; // 목록 칸 높이(위젯이라 고정, 화면이 작으면 줄인다)
        private const double MinList = 112;    // 화면이 작아도 목록은 이만큼(작업 서너 개)
        private const double Gap = 4;          // mainStackSpacing
        private const double Edge = 16;        // 작업 영역 가장자리와 카드 사이(DIP)

        /// <summary>점검용(--work) - 작업 영역 높이(DIP)를 흉내 내 작은 화면에서 맞춰지는지 본다</summary>
        internal static double? WorkOverride;

        private static readonly string[] WeekDays = { "일", "월", "화", "수", "목", "금", "토" };
        private static readonly string[] Palette = { "blue", "violet", "teal", "pink", "sky", "plum", "brown", "gray" };

        private readonly Controller _c;
        private readonly DesktopPin _pin;
        private Theme _t;
        private readonly ScaleTransform _scale = new ScaleTransform(1, 1);
        private readonly Grid _outer = new Grid();
        private readonly Grid _card = new Grid();
        private readonly Border _glass = new Border();
        private readonly Border _tint = new Border();
        private readonly StackPanel _stack = new StackPanel();

        private DateTime _today = DateTime.Today;
        private DateTime _selected = DateTime.Today;
        private DateTime _month = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        private DateTime? _hover;
        private readonly List<(DateTime date, Border border)> _cells = new List<(DateTime, Border)>();
        private Dictionary<DateTime, List<TaskItem>> _byDate = new Dictionary<DateTime, List<TaskItem>>();
        private Dictionary<string, int> _memberIndex = new Dictionary<string, int>();
        private Dictionary<string, string> _memberName = new Dictionary<string, string>();
        private Dictionary<string, string> _domainColor = new Dictionary<string, string>();

        private ScrollViewer? _scroll;
        private StackPanel? _list;
        private FrameworkElement? _calendarHost;
        private Border? _calendarSlot;
        private bool _dragging;
        private Native.POINT _dragStart;
        private Native.RECT _dragRect;
        private string _backdropKey = "";
        private readonly DispatcherTimer _clock = new DispatcherTimer();
        private bool _placed;
        private double _listH = ListHeight;  // 이번에 그린 목록 높이(pt)
        private double _fixedPt;             // 목록을 뺀 카드 높이(pt)
        private bool _overdueOpen;           // 기한 지난 작업을 펼쳤는지(다른 날을 고르면 다시 접는다)
        private bool _fadeUp, _fadeDown;

        public IntPtr Handle { get; private set; }

        public WidgetWindow(Controller controller)
        {
            _c = controller;
            _t = Theme.Create(_c.Settings.Appearance, _c.Settings.Transparency);

            Title = "MATE 캘린더";
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = Brushes.Transparent;
            ResizeMode = ResizeMode.NoResize;
            ShowInTaskbar = false;
            ShowActivated = false;
            Topmost = false;
            SizeToContent = SizeToContent.WidthAndHeight;
            UseLayoutRounding = true;
            SnapsToDevicePixels = true;
            FontFamily = Theme.Font;
            Language = System.Windows.Markup.XmlLanguage.GetLanguage("ko-KR");
            TextOptions.SetTextFormattingMode(this, TextFormattingMode.Ideal);
            Left = -32000; // 자리는 처음 그린 뒤 정한다(설정의 화면 좌표)
            Top = -32000;

            _pin = new DesktopPin(this);

            _outer.LayoutTransform = _scale;
            _card.Margin = new Thickness(Pad);
            _card.Children.Add(_glass);
            _card.Children.Add(_tint);
            _card.Children.Add(_stack);
            _outer.Children.Add(_card);
            Content = _outer;

            _glass.CornerRadius = new CornerRadius(Radius);
            _tint.CornerRadius = new CornerRadius(Radius);
            _tint.BorderThickness = new Thickness(0.6);
            _stack.Margin = new Thickness(0, M, 0, 0);
            _card.SizeChanged += (s, e) =>
                _stack.Clip = new RectangleGeometry(new Rect(0, -M, e.NewSize.Width, e.NewSize.Height), Radius, Radius);

            SourceInitialized += (s, e) =>
            {
                Handle = new WindowInteropHelper(this).Handle;
                HwndSource.FromHwnd(Handle)?.AddHook(WndProc);
            };
            // Loaded 는 창 핸들보다 먼저 올 수 있다(이 PC 에서 확인) - 처음 그린 뒤 크기가 정해졌을 때 자리를 잡는다
            ContentRendered += (s, e) => PlaceFirst();
            SizeChanged += (s, e) =>
            {
                if (!IsLoaded) return;
                // 크기가 바뀌면(배수 · 요약 줄 · 화면 맞춤) 카드가 작업 영역 밖으로 나가지 않게
                Dispatcher.BeginInvoke(new Action(KeepOnScreen), DispatcherPriority.Loaded);
                QueueBackdrop();
            };

            // 자정이 지나면 오늘을 옮긴다
            _clock.Interval = TimeSpan.FromSeconds(30);
            _clock.Tick += (s, e) =>
            {
                if (DateTime.Today != _today)
                {
                    bool followToday = _selected == _today;
                    _today = DateTime.Today;
                    if (followToday)
                    {
                        _selected = _today;
                        _month = new DateTime(_today.Year, _today.Month, 1);
                    }
                    Render();
                }
            };
            _clock.Start();

            Render();
        }

        public DesktopPin Pin => _pin;

        /* ── 자리 ─────────────────────────────────────── */

        private void PlaceFirst()
        {
            if (Handle == IntPtr.Zero) return;
            Native.GetWindowRect(Handle, out var r);
            int w = r.Width, h = r.Height;
            int x, y;
            var s = _c.Settings;
            if (s.X.HasValue && s.Y.HasValue && OnScreen(s.X.Value, s.Y.Value, w, h))
            {
                x = s.X.Value;
                y = s.Y.Value;
            }
            else
            {
                // 주 모니터 작업 영역의 오른쪽 위 - 바탕화면 아이콘은 보통 왼쪽 위에 있다.
                // 창 둘레의 그림자 자리(Pad)는 투명하니 카드 자체가 가장자리에서 Edge 만큼 떨어지게 둔다
                var mon = Native.MonitorAt(0, 0);
                double k = Native.DpiAt(0, 0) / 96.0;
                int pad = PadPx();
                x = mon.rcWork.Right - w + pad - (int)Math.Round(Edge * k);
                y = mon.rcWork.Top - pad + (int)Math.Round(Edge * k);
            }
            ClampToWork(ref x, ref y, w, h);
            if (!Native.SetWindowPos(Handle, IntPtr.Zero, x, y, 0, 0, Native.SWP_NOSIZE | Native.SWP_NOZORDER | Native.SWP_NOACTIVATE))
                Program.Log($"place failed {x},{y}");
            _placed = true;
            _pin.ToBottom();
            QueueBackdrop();
        }

        /// <summary>창 둘레 그림자 자리(Pad)의 화면 픽셀</summary>
        private int PadPx()
        {
            double dpi = Handle != IntPtr.Zero ? Native.GetDpiForWindow(Handle) / 96.0 : 1;
            return (int)Math.Round(Pad * _scale.ScaleX * dpi);
        }

        /// <summary>카드(그림자 자리를 뺀 창)가 그 모니터 작업 영역 안에 다 들어오게 자리를 옮긴다</summary>
        private void ClampToWork(ref int x, ref int y, int w, int h)
        {
            int pad = PadPx();
            var work = Native.MonitorAt(x + w / 2, y + pad + Math.Min(h / 2, 60)).rcWork;
            if (x + w - pad > work.Right) x = work.Right - w + pad;
            if (x + pad < work.Left) x = work.Left - pad;
            if (y + h - pad > work.Bottom) y = work.Bottom - h + pad;
            if (y + pad < work.Top) y = work.Top - pad;
        }

        /// <summary>크기가 바뀐 뒤 - 기본 자리면 오른쪽 위에 다시 맞추고, 옮겨 둔 자리면 화면 안으로만 당긴다(저장한 자리는 그대로)</summary>
        private void KeepOnScreen()
        {
            if (!_placed || _dragging || Handle == IntPtr.Zero) return;
            if (!_c.Settings.X.HasValue || !_c.Settings.Y.HasValue) { PlaceFirst(); return; }
            Native.GetWindowRect(Handle, out var r);
            int x = r.Left, y = r.Top;
            ClampToWork(ref x, ref y, r.Width, r.Height);
            if (x != r.Left || y != r.Top)
                Native.SetWindowPos(Handle, IntPtr.Zero, x, y, 0, 0, Native.SWP_NOSIZE | Native.SWP_NOZORDER | Native.SWP_NOACTIVATE);
        }

        /// <summary>
        /// 카드가 지금 모니터의 작업 영역 높이에 들어가게 한다 - 먼저 목록을 줄이고(MinList 까지), 그래도 넘치면 배수를 줄인다.
        /// 1080p 노트북의 150% 배율처럼 작업 영역이 700 DIP 안팎이면 1.5 배 위젯이 화면 아래로 잘렸다.
        /// </summary>
        private (double list, double scale) Fit(double fixedPt)
        {
            double scale = _c.Settings.Scale;
            double room = WorkHeightDip() - 2 * Edge;
            double avail = room / scale - fixedPt;
            if (avail >= ListHeight) return (ListHeight, scale);
            if (avail >= MinList) return (Math.Floor(avail), scale);
            return (MinList, Math.Max(0.75, room / (fixedPt + MinList)));
        }

        /// <summary>위젯이 있는(아직 안 놓였으면 놓일) 모니터의 작업 영역 높이(DIP)</summary>
        private double WorkHeightDip()
        {
            if (WorkOverride.HasValue) return WorkOverride.Value;
            Native.MONITORINFOEX mon;
            if (_placed && Handle != IntPtr.Zero) mon = Native.MonitorOf(Handle);
            else if (_c.Settings.X.HasValue && _c.Settings.Y.HasValue) mon = Native.MonitorAt(_c.Settings.X.Value, _c.Settings.Y.Value);
            else mon = Native.MonitorAt(0, 0);
            var m = mon.rcMonitor;
            double dpi = Native.DpiAt(m.Left + m.Width / 2, m.Top + m.Height / 2) / 96.0;
            return mon.rcWork.Height / dpi;
        }

        /// <summary>모니터 · 배율 · 작업 표시줄이 바뀌었거나 다른 모니터로 옮겼을 때 - 맞춤이 달라졌으면 다시 그린다</summary>
        private void Refit()
        {
            if (_fixedPt <= 0) return;
            var (list, scale) = Fit(_fixedPt);
            if (Math.Abs(list - _listH) > 0.5 || Math.Abs(scale - _scale.ScaleX) > 0.001) Render();
            else KeepOnScreen();
        }

        private static bool OnScreen(int x, int y, int w, int h)
        {
            // 카드 가운데가 어느 모니터 작업 영역 안에 있으면 된다
            var cx = x + w / 2;
            var cy = y + Math.Min(h / 2, 60);
            foreach (var sc in System.Windows.Forms.Screen.AllScreens)
            {
                if (sc.WorkingArea.Contains(cx, cy)) return true;
            }
            return false;
        }

        /// <summary>자리를 처음(주 모니터 오른쪽 위)으로</summary>
        public void ResetPosition()
        {
            _c.Settings.X = null;
            _c.Settings.Y = null;
            _c.Settings.Save();
            PlaceFirst();
        }

        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == Native.WM_SETTINGCHANGE)
            {
                if (wParam.ToInt32() == Native.SPI_SETDESKWALLPAPER) QueueBackdrop(force: true);
                // 작업 표시줄 크기 · 자리가 바뀌었다
                else if (wParam.ToInt32() == Native.SPI_SETWORKAREA) Dispatcher.BeginInvoke(new Action(Refit), DispatcherPriority.Background);
                // Windows 의 밝게/어둡게가 바뀌었을 때만 다시 칠한다(설정 변경 알림은 자주 온다)
                else if (_c.Settings.Appearance == "system" && Theme.SystemIsDark() != _t.Dark)
                    Dispatcher.BeginInvoke(new Action(ApplyTheme), DispatcherPriority.Background);
            }
            else if (msg == Native.WM_DISPLAYCHANGE || msg == Native.WM_DPICHANGED)
            {
                QueueBackdrop(force: true);
                Dispatcher.BeginInvoke(new Action(Refit), DispatcherPriority.Background);
            }
            return IntPtr.Zero;
        }

        /* ── 흐린 바탕 ─────────────────────────────────── */

        private DispatcherOperation? _backdropOp;

        public void QueueBackdrop(bool force = false)
        {
            if (force) _backdropKey = "";
            _backdropOp?.Abort();
            _backdropOp = Dispatcher.BeginInvoke(new Action(UpdateBackdrop), DispatcherPriority.ApplicationIdle);
        }

        private void UpdateBackdrop()
        {
            if (Handle == IntPtr.Zero || _dragging) return;
            Native.GetWindowRect(Handle, out var wr);
            double dpi = Native.GetDpiForWindow(Handle) / 96.0;
            double k = _scale.ScaleX * dpi;
            int pad = (int)Math.Round(Pad * k);
            var card = new Native.RECT { Left = wr.Left + pad, Top = wr.Top + pad, Right = wr.Right - pad, Bottom = wr.Bottom - pad };
            var key = $"{card.Left},{card.Top},{card.Right},{card.Bottom}|{Backdrop.Signature(card)}";
            if (key == _backdropKey) return;
            _backdropKey = key;
            var bmp = Backdrop.Make(card, 34 * dpi);
            _glass.Background = bmp != null
                ? new ImageBrush(bmp) { Stretch = Stretch.Fill }
                : Theme.Brush(_t.Fallback);
        }

        /// <summary>바탕화면 그림이 슬라이드 쇼로 바뀌었는지 가끔 본다</summary>
        public void CheckBackdrop() => QueueBackdrop();

        /* ── 그리기 ───────────────────────────────────── */

        public void ApplyTheme()
        {
            _t = Theme.Create(_c.Settings.Appearance, _c.Settings.Transparency);
            QueueBackdrop(force: true);
            Render();
        }

        public void Render()
        {
            // 새로 읽어 다시 그릴 때 보던 목록 자리를 지킨다(고른 날이 그대로일 때)
            double? keep = _scroll != null && _listFor == _selected ? _scroll.VerticalOffset : (double?)null;
            _t = Theme.Create(_c.Settings.Appearance, _c.Settings.Transparency);
            _glass.Effect = new DropShadowEffect
            {
                BlurRadius = 16, ShadowDepth = 3, Direction = 270, Color = Colors.Black, Opacity = _t.Dark ? 0.42 : 0.2,
            };
            if (_glass.Background == null) _glass.Background = Theme.Brush(_t.Fallback);
            _tint.Background = Theme.Brush(_t.Tint);
            _tint.BorderBrush = Theme.Brush(_t.Border);

            Index();

            _stack.Children.Clear();
            // 폭은 달력(7칸 + 주 번호)으로 정한다 - 긴 작업 제목 · 안내 글이 카드를 넓히지 않고 그 안에서 줄을 바꾼다
            _stack.Width = 2 * M + (_c.Settings.WeekNumbers ? Cell * WeekRatio : 0) + 7 * Cell;
            _stack.Children.Add(Spaced(Header(), 0));
            _calendarSlot = new Border { Margin = new Thickness(M, Gap, M, 0) };
            _calendarSlot.Child = _calendarHost = BuildCalendar();
            _stack.Children.Add(_calendarSlot);
            _stack.Children.Add(Spaced(Toolbar(), Gap));
            var summary = Summary();
            if (summary != null) _stack.Children.Add(Spaced(summary, Gap));

            // 목록을 뺀 높이를 재고, 화면에 맞는 목록 높이와 배수를 정한다
            double listTop = summary != null ? Gap + 2 : Gap;
            _stack.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
            _fixedPt = _stack.DesiredSize.Height + listTop + M / 2;
            var fit = Fit(_fixedPt);
            _listH = fit.list;
            _scale.ScaleX = _scale.ScaleY = fit.scale;
            _stack.Children.Add(ListArea(listTop));
            if (keep.HasValue && keep.Value > 0)
            {
                var sv = _scroll;
                Dispatcher.BeginInvoke(new Action(() => sv?.ScrollToVerticalOffset(keep.Value)), DispatcherPriority.Loaded);
            }
        }

        private DateTime _listFor;

        private FrameworkElement Spaced(FrameworkElement e, double top)
        {
            e.Margin = new Thickness(M, top, M, 0);
            return e;
        }

        private void Index()
        {
            var data = _c.Data;
            _byDate = data.Tasks.GroupBy(t => t.Due.Date).ToDictionary(g => g.Key, g => g.ToList());
            _memberIndex = new Dictionary<string, int>();
            _memberName = new Dictionary<string, string>();
            for (int i = 0; i < data.Members.Count; i++)
            {
                _memberIndex[data.Members[i].Id] = i;
                _memberName[data.Members[i].Id] = data.Members[i].Name;
            }
            _domainColor = data.Domains.GroupBy(d => d.Id).ToDictionary(g => g.Key, g => g.First().Color);
        }

        /* ── 색 ── Hub 의 colorStore.ts 와 같은 규칙 */

        private string PaintName(TaskItem t)
        {
            var colors = _c.Data.Colors;
            switch (_c.Settings.ColorBy)
            {
                case "label":
                    if (t.Labels.Length == 0) return "gray";
                    return colors.TryGetValue("label:" + t.Labels[0], out var lc) ? lc : HashColor(t.Labels[0]);
                case "member":
                    if (t.Assignee == null) return "gray";
                    if (colors.TryGetValue("member:" + t.Assignee, out var mc)) return mc;
                    return _memberIndex.TryGetValue(t.Assignee, out var i) ? Palette[i % Palette.Length] : HashColor(t.Assignee);
                default:
                    return _domainColor.TryGetValue(t.Domain, out var dc) ? dc : "gray";
            }
        }

        private Color ColorOf(TaskItem t) => _t.Paint(PaintName(t));

        /// <summary>colorStore.ts 의 hashColor - 같은 이름은 웹과 같은 색</summary>
        private static string HashColor(string s)
        {
            uint h = 0;
            for (int i = 0; i < s.Length; i++)
            {
                int cp = s[i];
                if (char.IsHighSurrogate(s[i]) && i + 1 < s.Length && char.IsLowSurrogate(s[i + 1]))
                {
                    cp = char.ConvertToUtf32(s[i], s[i + 1]);
                    i++;
                }
                unchecked { h = h * 31 + (uint)cp; }
            }
            return Palette[h % (uint)Palette.Length];
        }

        /* ── 글자 ─────────────────────────────────────── */

        private TextBlock Text(string text, double size, Color color, FontWeight? weight = null)
        {
            return new TextBlock
            {
                Text = text, FontSize = size, Foreground = Theme.Brush(color), FontWeight = weight ?? Theme.Regular,
                FontFamily = Theme.Font,
            };
        }

        /* ── 머리: 달 이름 · ‹ ○ › ───────────────────── */

        private FrameworkElement Header()
        {
            var dock = new DockPanel { Height = 22, LastChildFill = true, Background = Brushes.Transparent };
            var buttons = new StackPanel { Orientation = Orientation.Horizontal };
            buttons.Children.Add(IconButton(Icons.ChevronLeft, "이전 달", () => MoveMonth(-1), 15));
            buttons.Children.Add(IconButton(Icons.Reset, "오늘", GoToday, 15));
            buttons.Children.Add(IconButton(Icons.ChevronRight, "다음 달", () => MoveMonth(1), 15));
            DockPanel.SetDock(buttons, Dock.Right);
            dock.Children.Add(buttons);

            var title = Text($"{_month.Year}년 {_month.Month}월", 14, _t.Header, Theme.Medium);
            title.VerticalAlignment = VerticalAlignment.Center;
            title.Margin = new Thickness(5, 0, 0, 0);
            var handle = new Border { Background = Brushes.Transparent, Child = title, Cursor = _c.Settings.Locked ? Cursors.Arrow : Cursors.SizeAll };
            handle.ToolTip = _c.Settings.Locked ? null : "끌어서 옮기기";
            handle.MouseLeftButtonDown += (s, e) => BeginDrag(handle, e);
            handle.MouseMove += (s, e) => DragMove_(e);
            handle.MouseLeftButtonUp += (s, e) => EndDrag(handle);
            dock.Children.Add(handle);
            return dock;
        }

        private FrameworkElement IconButton(string icon, string tip, Action click, double iconSize = 16, Color? color = null, bool badge = false)
        {
            var glyph = Icons.Make(icon, iconSize, Theme.Brush(color ?? _t.Label));
            var grid = new Grid { Width = 22, Height = 22 };
            grid.Children.Add(glyph);
            glyph.HorizontalAlignment = HorizontalAlignment.Center;
            glyph.VerticalAlignment = VerticalAlignment.Center;
            if (badge)
            {
                grid.Children.Add(new Ellipse
                {
                    Width = 6, Height = 6, Fill = Theme.Brush(_t.Accent),
                    HorizontalAlignment = HorizontalAlignment.Right, VerticalAlignment = VerticalAlignment.Top, Margin = new Thickness(0, 1, 1, 0),
                });
            }
            var b = new Border { CornerRadius = new CornerRadius(5), Background = Brushes.Transparent, Child = grid, ToolTip = tip, Cursor = Cursors.Hand };
            var hover = Theme.Brush(_t.Quaternary);
            b.MouseEnter += (s, e) => b.Background = hover;
            b.MouseLeave += (s, e) => b.Background = Brushes.Transparent;
            b.MouseLeftButtonUp += (s, e) => { e.Handled = true; click(); };
            return b;
        }

        private void MoveMonth(int n)
        {
            // Calendr 처럼 고른 날을 한 달 옮긴다(그 달에 없는 날이면 마지막 날)
            var m = _month.AddMonths(n);
            int day = Math.Min(_selected.Day, DateTime.DaysInMonth(m.Year, m.Month));
            _selected = new DateTime(m.Year, m.Month, day);
            _month = m;
            Render();
        }

        /// <summary>점검 그림(--snapshot --select)용 - 그날을 고른 화면</summary>
        internal void SelectForSnapshot(DateTime d)
        {
            _selected = d.Date;
            _month = new DateTime(d.Year, d.Month, 1);
            Render();
        }

        private void GoToday()
        {
            _today = DateTime.Today;
            _selected = _today;
            _month = new DateTime(_today.Year, _today.Month, 1);
            Render();
        }

        /* ── 끌어서 옮기기 ───────────────────────────── */

        private void BeginDrag(UIElement handle, MouseButtonEventArgs e)
        {
            if (_c.Settings.Locked) return;
            Native.GetCursorPos(out _dragStart);
            Native.GetWindowRect(Handle, out _dragRect);
            _dragging = true;
            handle.CaptureMouse();
            e.Handled = true;
        }

        private void DragMove_(MouseEventArgs e)
        {
            if (!_dragging) return;
            Native.GetCursorPos(out var p);
            Native.SetWindowPos(Handle, IntPtr.Zero, _dragRect.Left + p.X - _dragStart.X, _dragRect.Top + p.Y - _dragStart.Y, 0, 0,
                Native.SWP_NOSIZE | Native.SWP_NOZORDER | Native.SWP_NOACTIVATE);
        }

        private void EndDrag(UIElement handle)
        {
            if (!_dragging) return;
            _dragging = false;
            handle.ReleaseMouseCapture();
            // 카드가 화면 밖으로 반쯤 나가게 놓았으면 안으로 당겨 놓는다
            Native.GetWindowRect(Handle, out var r);
            int x = r.Left, y = r.Top;
            ClampToWork(ref x, ref y, r.Width, r.Height);
            if (x != r.Left || y != r.Top)
                Native.SetWindowPos(Handle, IntPtr.Zero, x, y, 0, 0, Native.SWP_NOSIZE | Native.SWP_NOZORDER | Native.SWP_NOACTIVATE);
            _c.Settings.X = x;
            _c.Settings.Y = y;
            _c.Settings.Save();
            _pin.ToBottom();
            QueueBackdrop();
            // 다른 크기 · 배율의 모니터로 옮겼으면 그 화면에 맞춘다
            Refit();
        }

        /* ── 달력 ─────────────────────────────────────── */

        private FrameworkElement BuildCalendar()
        {
            _cells.Clear();
            bool weekNumbers = _c.Settings.WeekNumbers;
            double wkW = weekNumbers ? Cell * WeekRatio : 0;
            var g = new Grid();
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(wkW) });
            for (int i = 0; i < 7; i++) g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(Cell) });
            for (int i = 0; i < 7; i++) g.RowDefinitions.Add(new RowDefinition { Height = new GridLength(Cell) });

            // 주말(일 · 토) 칸 바탕 - quaternaryLabelColor, 모서리 6
            foreach (var col in new[] { 1, 7 })
            {
                var wk = new Border { CornerRadius = new CornerRadius(6), Background = Theme.Brush(_t.Quaternary) };
                Grid.SetColumn(wk, col);
                Grid.SetRow(wk, 1);
                Grid.SetRowSpan(wk, 6);
                g.Children.Add(wk);
            }

            int offset = (int)_month.DayOfWeek; // 일요일 시작
            int days = DateTime.DaysInMonth(_month.Year, _month.Month);

            // 이번 달 테두리 - 이번 달 날짜 칸을 둘러싼 둥근 선(Calendr 의 month outline)
            if (_c.Settings.MonthOutline)
            {
                var outline = new Path
                {
                    Data = MonthOutline(offset, days, wkW), Stroke = Theme.Brush(_t.Secondary), StrokeThickness = 1.5, IsHitTestVisible = false,
                };
                var canvas = new Canvas { IsHitTestVisible = false };
                canvas.Children.Add(outline);
                Grid.SetRowSpan(canvas, 7);
                Grid.SetColumnSpan(canvas, 8);
                g.Children.Add(canvas);
            }

            // 요일 - 굵게 11pt, secondaryLabelColor
            for (int i = 0; i < 7; i++)
            {
                var wd = Text(WeekDays[i], 11, _t.Secondary, Theme.Bold);
                wd.HorizontalAlignment = HorizontalAlignment.Center;
                wd.VerticalAlignment = VerticalAlignment.Center;
                Grid.SetColumn(wd, i + 1);
                g.Children.Add(wd);
            }

            var start = _month.AddDays(-offset);
            var ko = CultureInfo.GetCultureInfo("ko-KR");
            for (int row = 0; row < 6; row++)
            {
                if (weekNumbers)
                {
                    int wn = ko.Calendar.GetWeekOfYear(start.AddDays(row * 7), CalendarWeekRule.FirstDay, DayOfWeek.Sunday);
                    var tb = Text(wn.ToString(CultureInfo.InvariantCulture), 10, _t.Secondary);
                    tb.HorizontalAlignment = HorizontalAlignment.Center;
                    tb.VerticalAlignment = VerticalAlignment.Center;
                    tb.Margin = new Thickness(0, 0, 4, 0);
                    Grid.SetRow(tb, row + 1);
                    g.Children.Add(tb);
                }
                for (int col = 0; col < 7; col++)
                {
                    var d = start.AddDays(row * 7 + col);
                    var cell = MakeCell(d);
                    Grid.SetRow(cell, row + 1);
                    Grid.SetColumn(cell, col + 1);
                    g.Children.Add(cell);
                }
            }
            g.MouseLeave += (s, e) => { _hover = null; PaintCells(); };
            return g;
        }

        private Border MakeCell(DateTime d)
        {
            bool inMonth = d.Month == _month.Month && d.Year == _month.Year;
            var label = Text(d.Day.ToString(CultureInfo.InvariantCulture), 12, _t.Header);
            label.HorizontalAlignment = HorizontalAlignment.Center;
            label.Opacity = inMonth ? 1 : 0.3;

            var content = new StackPanel { HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center };
            content.Children.Add(label);
            var dots = Dots(d);
            dots.Margin = new Thickness(0, 2, 0, 0);
            content.Children.Add(dots);

            var b = new Border
            {
                CornerRadius = new CornerRadius(5), BorderThickness = new Thickness(2), Background = Brushes.Transparent, Child = content,
                Cursor = Cursors.Hand,
            };
            b.MouseEnter += (s, e) => { _hover = d; PaintCells(); };
            b.MouseLeftButtonDown += (s, e) =>
            {
                e.Handled = true;
                if (e.ClickCount >= 2) { _c.OpenHub("calendar"); return; }
                Select(d);
            };
            _cells.Add((d, b));
            PaintCell(d, b);
            return b;
        }

        private void PaintCells()
        {
            foreach (var (date, border) in _cells) PaintCell(date, border);
        }

        private void PaintCell(DateTime d, Border b)
        {
            // 오늘은 강조색, 고른 날은 secondary, 마우스를 올린 날은 tertiary
            Color c = d == _today ? _t.Accent : d == _selected ? _t.Secondary : _hover == d ? _t.Tertiary : Colors.Transparent;
            b.BorderBrush = Theme.Brush(c);
        }

        private void Select(DateTime d)
        {
            bool otherMonth = d.Month != _month.Month || d.Year != _month.Year;
            _selected = d;
            if (otherMonth)
            {
                _month = new DateTime(d.Year, d.Month, 1);
                Render();
                return;
            }
            PaintCells();
            RebuildList();
            RebuildSummary();
        }

        /// <summary>그날 마감인 끝나지 않은 작업의 색 점 - 세 개까지, 넘으면 색 띠(Calendr 의 eventsGradient)</summary>
        private FrameworkElement Dots(DateTime d)
        {
            const double size = 3;
            var panel = new StackPanel { Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Center, Height = size };
            var colors = _byDate.TryGetValue(d, out var list)
                ? list.Where(t => !t.Done).Select(PaintName).Distinct().OrderBy(n => Array.IndexOf(Palette, n)).Select(_t.Paint).ToList()
                : new List<Color>();
            if (colors.Count == 0)
            {
                panel.Children.Add(new Ellipse { Width = size, Height = size, Fill = Brushes.Transparent });
            }
            else if (colors.Count <= 3)
            {
                for (int i = 0; i < colors.Count; i++)
                {
                    panel.Children.Add(new Ellipse
                    {
                        Width = size, Height = size, Fill = Theme.Brush(colors[i]), Margin = new Thickness(i == 0 ? 0 : 2, 0, 0, 0),
                    });
                }
            }
            else
            {
                var stops = new GradientStopCollection();
                for (int i = 0; i < colors.Count; i++) stops.Add(new GradientStop(colors[i], (double)i / (colors.Count - 1)));
                panel.Children.Add(new Border
                {
                    Width = size * 4, Height = size, CornerRadius = new CornerRadius(size / 2),
                    Background = new LinearGradientBrush(stops, new Point(0, 0.5), new Point(1, 0.5)),
                });
            }
            return panel;
        }

        /// <summary>
        /// 이번 달 날짜 칸들을 감싸는 둥근 선. 칸들의 합집합은 계단 모양 다각형이라 꼭짓점을 바로 구한다:
        /// 첫 주는 1일부터, 마지막 주는 말일까지. 시계 방향으로 돌며 바깥으로 1pt 넓히고 모서리를 6pt 로 둥글린다.
        /// </summary>
        private static Geometry MonthOutline(int first, int days, double x0)
        {
            int lastIndex = first + days - 1;
            int rowLast = lastIndex / 7, colLast = lastIndex % 7;
            var pts = new List<Point> { new Point(first, 0), new Point(7, 0) };
            if (colLast == 6) pts.Add(new Point(7, rowLast + 1));
            else
            {
                pts.Add(new Point(7, rowLast));
                pts.Add(new Point(colLast + 1, rowLast));
                pts.Add(new Point(colLast + 1, rowLast + 1));
            }
            pts.Add(new Point(0, rowLast + 1));
            if (first != 0)
            {
                pts.Add(new Point(0, 1));
                pts.Add(new Point(first, 1));
            }

            // 칸 단위 → pt, 바깥으로 1pt
            const double inset = 1;
            int n = pts.Count;
            var p = pts.Select(q => new Point(x0 + q.X * Cell, Cell + q.Y * Cell)).ToList();
            var outP = new List<Point>();
            for (int i = 0; i < n; i++)
            {
                var prev = p[(i - 1 + n) % n];
                var cur = p[i];
                var next = p[(i + 1) % n];
                var dIn = Unit(cur - prev);
                var dOut = Unit(next - cur);
                // 시계 방향(아래로 커지는 y)에서 바깥 법선은 (dy, -dx)
                var nIn = new Vector(dIn.Y, -dIn.X);
                var nOut = new Vector(dOut.Y, -dOut.X);
                outP.Add(cur + (nIn + nOut) * inset);
            }

            const double r = 6;
            var fig = new PathFigure { IsClosed = true };
            for (int i = 0; i < n; i++)
            {
                var prev = outP[(i - 1 + n) % n];
                var cur = outP[i];
                var next = outP[(i + 1) % n];
                var vIn = Unit(cur - prev);
                var vOut = Unit(next - cur);
                var a = cur - vIn * r;
                var b = cur + vOut * r;
                double cross = vIn.X * vOut.Y - vIn.Y * vOut.X;
                if (i == 0) fig.StartPoint = a;
                else fig.Segments.Add(new LineSegment(a, true));
                fig.Segments.Add(new ArcSegment(b, new Size(r, r), 0, false,
                    cross > 0 ? SweepDirection.Clockwise : SweepDirection.Counterclockwise, true));
            }
            var geo = new PathGeometry();
            geo.Figures.Add(fig);
            geo.Freeze();
            return geo;
        }

        private static Vector Unit(Vector v) => v.Length == 0 ? v : v / v.Length;

        /* ── 도구 줄: 📌 ··· ☰ 📅 ⋯ ─────────────────── */

        private FrameworkElement Toolbar()
        {
            var dock = new DockPanel { Height = 22, LastChildFill = true };
            var pinBtn = IconButton(_c.Settings.Locked ? Icons.PinFill : Icons.Pin,
                _c.Settings.Locked ? "자리 고정됨. 누르면 다시 옮길 수 있습니다" : "자리 고정", () =>
                {
                    _c.Settings.Locked = !_c.Settings.Locked;
                    _c.Settings.Save();
                    Render();
                }, 17);
            DockPanel.SetDock(pinBtn, Dock.Left);
            dock.Children.Add(pinBtn);

            var right = new StackPanel { Orientation = Orientation.Horizontal };
            if (_c.Error != null && !_c.NeedLogin)
            {
                right.Children.Add(IconButton(Icons.Warning, _c.Error + "\n누르면 다시 읽습니다", () => _ = _c.Refresh(true), 16, _t.Secondary));
            }
            right.Children.Add(IconButton(Icons.List, "Hub 작업 목록 열기", () => _c.OpenHub("list"), 17));
            right.Children.Add(IconButton(Icons.Calendar, "Hub 캘린더 열기", () => _c.OpenHub("calendar"), 17));
            FrameworkElement? more = null;
            more = IconButton(Icons.More, "메뉴 열기", () => _c.ShowMenu(more!), 17, null, _c.UpdateReady);
            right.Children.Add(more);
            DockPanel.SetDock(right, Dock.Right);
            dock.Children.Add(right);
            dock.Children.Add(new Border { Background = Brushes.Transparent });
            return dock;
        }

        /* ── 요약: ▍기한 지남: 2   ▍오늘: 3 ─────────── */

        private Border? _summarySlot;

        private FrameworkElement? Summary()
        {
            _summarySlot = new Border();
            RebuildSummary();
            return _c.Settings.Summary ? _summarySlot : null;
        }

        private void RebuildSummary()
        {
            if (_summarySlot == null) return;
            if (!_c.Settings.Summary || _c.NeedLogin)
            {
                _summarySlot.Child = null;
                _summarySlot.Visibility = Visibility.Collapsed;
                return;
            }
            var overdue = _c.Data.Tasks.Where(t => !t.Done && t.Due < _today).ToList();
            var today = _byDate.TryGetValue(_today, out var l) ? l.Where(t => !t.Done).ToList() : new List<TaskItem>();
            var items = new List<(string label, List<TaskItem> tasks)>();
            if (overdue.Count > 0) items.Add(("기한 지남", overdue));
            if (today.Count > 0) items.Add(("오늘", today));
            if (items.Count == 0)
            {
                _summarySlot.Child = null;
                _summarySlot.Visibility = Visibility.Collapsed;
                return;
            }
            var grid = new Grid();
            for (int i = 0; i < items.Count; i++)
            {
                grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
                var row = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(i == 0 ? 1 : 4, 0, 1, 0) };
                var bars = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 0, items.Count > 2 ? 4 : 6, 0) };
                foreach (var c in items[i].tasks.Select(PaintName).Distinct().OrderBy(n => Array.IndexOf(Palette, n)))
                {
                    bars.Children.Add(new Border
                    {
                        Width = 2, CornerRadius = new CornerRadius(1), Background = Theme.Brush(_t.Paint(c)), Margin = new Thickness(0, 1, 2, 1),
                    });
                }
                row.Children.Add(bars);
                row.Children.Add(Text($"{items[i].label}: {items[i].tasks.Count}", 10, _t.Label));
                Grid.SetColumn(row, i);
                grid.Children.Add(row);
            }
            _summarySlot.Child = grid;
            _summarySlot.Visibility = Visibility.Visible;
        }

        /* ── 목록 ─────────────────────────────────────── */

        private FrameworkElement ListArea(double top)
        {
            // 오른쪽은 얇은 스크롤 막대 자리 - 막대가 글자 · 단추를 덮지 않게
            _list = new StackPanel { Margin = new Thickness(0, 0, 5, 0) };
            _scroll = new ScrollViewer
            {
                Height = _listH, VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Disabled, Content = _list, Focusable = false,
                Margin = new Thickness(M / 2, top, M / 2, M / 2), Padding = new Thickness(0),
            };
            Styles.ApplyScroll(_scroll, _t);
            _fadeUp = _fadeDown = false;
            _scroll.ScrollChanged += (s, e) => UpdateFade();
            RebuildList();
            return _scroll;
        }

        /// <summary>목록이 칸 끝에서 뚝 잘려 보이지 않게, 더 있는 쪽 가장자리만 흐리게 사라지게 한다</summary>
        private void UpdateFade()
        {
            if (_scroll == null) return;
            bool up = _scroll.VerticalOffset > 0.5;
            bool down = _scroll.ScrollableHeight - _scroll.VerticalOffset > 0.5;
            if (up == _fadeUp && down == _fadeDown && (_scroll.OpacityMask != null) == (up || down)) return;
            _fadeUp = up;
            _fadeDown = down;
            if (!up && !down) { _scroll.OpacityMask = null; return; }
            double f = Math.Min(0.2, 14 / Math.Max(1, _listH));
            var mask = new LinearGradientBrush { StartPoint = new Point(0, 0), EndPoint = new Point(0, 1) };
            mask.GradientStops.Add(new GradientStop(up ? Colors.Transparent : Colors.Black, 0));
            mask.GradientStops.Add(new GradientStop(Colors.Black, f));
            mask.GradientStops.Add(new GradientStop(Colors.Black, 1 - f));
            mask.GradientStops.Add(new GradientStop(down ? Colors.Transparent : Colors.Black, 1));
            mask.Freeze();
            _scroll.OpacityMask = mask;
        }

        private void RebuildList()
        {
            if (_list == null || _scroll == null) return;
            _list.Children.Clear();
            if (_listFor != _selected) _overdueOpen = false;
            _listFor = _selected;

            if (_c.NeedLogin)
            {
                _list.Children.Add(Message(_c.LoginMessage ?? "Hub 계정으로 로그인하면 내 작업이 여기에 보입니다.", "로그인", _c.ShowLogin));
                return;
            }
            if (!_c.Loaded)
            {
                _list.Children.Add(Message(_c.Error ?? "작업을 읽는 중…", _c.Error != null ? "다시 읽기" : null, () => _ = _c.Refresh(true)));
                return;
            }

            bool isToday = _selected == _today;
            int sections = 0;
            bool overdue = false;

            if (isToday)
            {
                // 기한 지남 - 한 줄로 접어 두고(오늘 할 일이 먼저 보이게), 펼치면 날마다 묶어 '어제' · '그저께' · 'N일 전'
                var late = _c.Data.Tasks.Where(t => !t.Done && t.Due < _today).ToList();
                if (late.Count > 0)
                {
                    overdue = true;
                    _list.Children.Add(OverdueToggle(late));
                    if (_overdueOpen)
                    {
                        foreach (var g in late.GroupBy(t => t.Due).OrderBy(g => g.Key))
                        {
                            int ago = (int)(_today - g.Key).TotalDays;
                            _list.Children.Add(Section(ago == 1 ? "어제" : ago == 2 ? "그저께" : $"{ago}일 전"));
                            foreach (var t in Order(g)) _list.Children.Add(Row(t));
                        }
                    }
                }
            }

            for (int i = 0; i <= _c.Settings.UpcomingDays; i++)
            {
                var d = _selected.AddDays(i);
                if (!_byDate.TryGetValue(d, out var tasks) || tasks.Count == 0) continue;
                _list.Children.Add(Section(d == _today ? "오늘" : DateLabel(d)));
                foreach (var t in Order(tasks)) _list.Children.Add(Row(t));
                sections++;
            }

            if (sections == 0)
            {
                string msg = _c.Settings.UpcomingDays > 0
                    ? (isToday ? $"오늘부터 {_c.Settings.UpcomingDays}일 동안 마감인 작업이 없습니다." : $"이날부터 {_c.Settings.UpcomingDays}일 동안 마감인 작업이 없습니다.")
                    : "이날 마감인 작업이 없습니다.";
                // 기한 지난 줄이 있으면 그 아래에 작게, 아니면 목록 칸 가운데에
                _list.Children.Add(Message(msg, null, null, fill: !overdue));
            }
            else
            {
                _list.Children.Add(new Border { Height = 10 }); // 끝이 흐려지는 자리
            }
            _scroll.ScrollToTop();
        }

        /// <summary>기한 지난 작업 한 줄 - 누르면 펼치고 접는다</summary>
        private FrameworkElement OverdueToggle(List<TaskItem> late)
        {
            var dock = new DockPanel { LastChildFill = true };
            var chevron = Icons.Make(_overdueOpen ? Icons.ChevronDown : Icons.ChevronRight, 10, Theme.Brush(_t.Secondary));
            chevron.VerticalAlignment = VerticalAlignment.Center;
            chevron.Margin = new Thickness(0, 0, 6, 0);
            DockPanel.SetDock(chevron, Dock.Left);
            dock.Children.Add(chevron);

            // 요약 줄처럼 색 막대(서로 다른 색만)
            var bars = new StackPanel { Orientation = Orientation.Horizontal, Margin = new Thickness(0, 2, 5, 2) };
            foreach (var c in late.Select(PaintName).Distinct().OrderBy(n => Array.IndexOf(Palette, n)))
                bars.Children.Add(new Border { Width = 2, CornerRadius = new CornerRadius(1), Background = Theme.Brush(_t.Paint(c)), Margin = new Thickness(0, 0, 2, 0) });
            DockPanel.SetDock(bars, Dock.Left);
            dock.Children.Add(bars);

            var hint = Text(_overdueOpen ? "접기" : "펼치기", 10, _t.Secondary);
            hint.VerticalAlignment = VerticalAlignment.Center;
            hint.Margin = new Thickness(6, 0, 0, 0);
            DockPanel.SetDock(hint, Dock.Right);
            dock.Children.Add(hint);

            var label = Text($"기한 지난 작업 {late.Count}개", 11, _t.Header, Theme.Medium);
            label.VerticalAlignment = VerticalAlignment.Center;
            label.TextTrimming = TextTrimming.CharacterEllipsis;
            dock.Children.Add(label);

            var row = new Border
            {
                CornerRadius = new CornerRadius(8), Background = Theme.Brush(_t.Quaternary), Child = dock, Cursor = Cursors.Hand,
                Padding = new Thickness(8, 5, 8, 5), Margin = new Thickness(0, 4, 0, 2),
            };
            var normal = row.Background;
            var hover = Theme.Brush(_t.Hover);
            row.MouseEnter += (s, e) => row.Background = hover;
            row.MouseLeave += (s, e) => row.Background = normal;
            row.MouseLeftButtonUp += (s, e) =>
            {
                e.Handled = true;
                _overdueOpen = !_overdueOpen;
                RebuildList();
            };
            return row;
        }

        /// <summary>끝나지 않은 것을 위로 - 진행 중 · 리뷰 · 할 일 · 백로그 순, 같으면 급한 순, 같으면 번호 순. 완료는 맨 아래</summary>
        private static IEnumerable<TaskItem> Order(IEnumerable<TaskItem> tasks) =>
            tasks.OrderBy(t => TaskItem.StatusRank(t.Status)).ThenBy(t => TaskItem.PriorityRank(t.Priority)).ThenBy(t => t.Num);

        private static string DateLabel(DateTime d)
        {
            // Calendr 의 "EEEE d MMM" - 한국어로 '11월 18일 화요일'
            var ko = CultureInfo.GetCultureInfo("ko-KR");
            return $"{d.Month}월 {d.Day}일 {ko.DateTimeFormat.GetDayName(d.DayOfWeek)}";
        }

        private FrameworkElement Section(string text)
        {
            var g = new Grid { Margin = new Thickness(0, 8, 0, 3) };
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            var l1 = new Border { Height = 1, Background = Theme.Brush(_t.Secondary), Margin = new Thickness(8, 0, 8, 0), VerticalAlignment = VerticalAlignment.Center, Opacity = 0.6 };
            var l2 = new Border { Height = 1, Background = Theme.Brush(_t.Secondary), Margin = new Thickness(8, 0, 8, 0), VerticalAlignment = VerticalAlignment.Center, Opacity = 0.6 };
            var label = Text(text, 11, _t.Header);
            Grid.SetColumn(label, 1);
            Grid.SetColumn(l2, 2);
            g.Children.Add(l1);
            g.Children.Add(label);
            g.Children.Add(l2);
            return g;
        }

        private FrameworkElement Row(TaskItem t)
        {
            var color = ColorOf(t);
            var brush = Theme.Brush(color);

            var g = new Grid();
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(4) });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(4) });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(8) });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            g.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(4) });

            // 왼쪽 색 막대 - 너비 4, 모서리 2, 위아래 6pt 안쪽
            var bar = new Border { CornerRadius = new CornerRadius(2), Background = brush, Margin = new Thickness(0, 6, 0, 6) };
            Grid.SetColumn(bar, 1);
            g.Children.Add(bar);

            var body = new StackPanel { Margin = new Thickness(0, 4, 0, 4) };
            Grid.SetColumn(body, 3);
            g.Children.Add(body);

            // 제목 줄: ○ !! 제목
            var titleRow = new DockPanel { LastChildFill = true };
            var check = Icons.Make(t.Done ? Icons.ReminderDone : Icons.ReminderOpen, 12, brush);
            check.VerticalAlignment = VerticalAlignment.Top;
            check.Margin = new Thickness(0, 1.5, 3, 0);
            DockPanel.SetDock(check, Dock.Left);
            titleRow.Children.Add(check);
            string? marks = t.Priority == "urgent" ? "!!!" : t.Priority == "high" ? "!!" : null;
            if (marks != null)
            {
                var pr = Text(marks, 13, color);
                pr.Margin = new Thickness(0, -1.5, 3, 0);
                pr.VerticalAlignment = VerticalAlignment.Top;
                DockPanel.SetDock(pr, Dock.Left);
                titleRow.Children.Add(pr);
            }
            // 제목은 두 줄까지, 넘치면 … (전체는 툴팁)
            var title = Text(t.Title.Length > 0 ? t.Title : "(제목 없음)", 12, _t.Header);
            title.TextWrapping = TextWrapping.Wrap;
            title.TextTrimming = TextTrimming.CharacterEllipsis;
            title.LineStackingStrategy = LineStackingStrategy.BlockLineHeight;
            title.LineHeight = 15;
            title.MaxHeight = 30;
            if (t.Done) title.TextDecorations = TextDecorations.Strikethrough;
            titleRow.Children.Add(title);
            body.Children.Add(titleRow);

            // 작은 글: MATE-12 · 진행 중 (· 담당자)
            var sub = $"{t.Key} · {TaskItem.StatusLabel(t.Status)}";
            if (_c.Settings.Scope == "all" && t.Assignee != null && _memberName.TryGetValue(t.Assignee, out var who) && who != "")
                sub += " · " + who;
            var subtitle = Text(sub, 10, _t.Secondary);
            subtitle.TextTrimming = TextTrimming.CharacterEllipsis;
            subtitle.Margin = new Thickness(0, 2, 0, 0);
            body.Children.Add(subtitle);

            // 여러 날에 걸친 작업이면 기간(Calendr 의 여러 날 종일 일정 표기)
            // 범위는 물결표(대시를 쓰지 않는다)
            if (t.Start.HasValue && t.Start.Value < t.Due)
            {
                var s = t.Start.Value;
                var range = s.Year != t.Due.Year
                    ? $"{s.Year}년 {s.Month}월 {s.Day}일~{t.Due.Year}년 {t.Due.Month}월 {t.Due.Day}일"
                    : s.Month == t.Due.Month
                        ? $"{s.Month}월 {s.Day}일~{t.Due.Day}일"
                        : $"{s.Month}월 {s.Day}일~{t.Due.Month}월 {t.Due.Day}일";
                var dur = Text(range, 10, _t.Secondary);
                dur.TextTrimming = TextTrimming.CharacterEllipsis;
                dur.Margin = new Thickness(0, 2, 0, 0);
                body.Children.Add(dur);
            }

            if (t.Labels.Length > 0)
            {
                var tags = Text(string.Join(" ", t.Labels.Select(l => "#" + l)), 10, color);
                tags.TextTrimming = TextTrimming.CharacterEllipsis;
                tags.Margin = new Thickness(0, 2, 0, 0);
                body.Children.Add(tags);
            }

            var row = new Border
            {
                CornerRadius = new CornerRadius(8), Background = Brushes.Transparent, Child = g, Cursor = Cursors.Hand,
                Opacity = t.Done ? 0.5 : 1, Margin = new Thickness(0, 1, 0, 1),
                ToolTip = $"{t.Key} {t.Title}\n{TaskItem.StatusLabel(t.Status)} · 마감 {t.Due.Month}월 {t.Due.Day}일\n누르면 Hub 에서 엽니다",
            };
            var hover = Theme.Brush(_t.Hover);
            row.MouseEnter += (s, e) => row.Background = hover;
            row.MouseLeave += (s, e) => row.Background = Brushes.Transparent;
            row.MouseLeftButtonUp += (s, e) => _c.OpenTask(t.Id);
            return row;
        }

        /// <summary>안내 글(+ 단추). fill 이면 목록 칸 한가운데, 아니면 위 줄 아래에 작게</summary>
        private FrameworkElement Message(string text, string? action, Action? onAction, bool fill = true)
        {
            var panel = new StackPanel
            {
                Margin = fill ? new Thickness(12, 0, 12, 14) : new Thickness(12, 12, 12, 4),
                HorizontalAlignment = HorizontalAlignment.Center, VerticalAlignment = VerticalAlignment.Center,
            };
            var tb = Text(text, 11, _t.Secondary);
            tb.TextWrapping = TextWrapping.Wrap;
            tb.TextAlignment = TextAlignment.Center;
            panel.Children.Add(tb);
            if (action != null && onAction != null)
            {
                var label = Text(action, 11, Colors.White, Theme.Medium);
                label.HorizontalAlignment = HorizontalAlignment.Center;
                var btn = new Border
                {
                    Background = Theme.Brush(_t.Accent), CornerRadius = new CornerRadius(6), Padding = new Thickness(14, 4, 14, 5),
                    Margin = new Thickness(0, 10, 0, 0), HorizontalAlignment = HorizontalAlignment.Center, Child = label, Cursor = Cursors.Hand,
                };
                btn.MouseLeftButtonUp += (s, e) => onAction();
                panel.Children.Add(btn);
            }
            if (!fill) return panel;
            var box = new Grid { Height = _listH };
            box.Children.Add(panel);
            return box;
        }
    }
}
