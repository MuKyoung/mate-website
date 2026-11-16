using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Threading;
using Microsoft.Win32;

namespace MateCalendar
{
    internal static class Program
    {
        public static string Version
        {
            get
            {
                var v = Assembly.GetExecutingAssembly().GetName().Version ?? new Version(1, 0, 0);
                return v.ToString(3);
            }
        }

        [STAThread]
        public static int Main(string[] args)
        {
            var a = new HashSet<string>(args.Select(x => x.ToLowerInvariant()));
            var app = new Application { ShutdownMode = ShutdownMode.OnExplicitShutdown };
            app.DispatcherUnhandledException += (s, e) =>
            {
                Log("unhandled: " + e.Exception);
                e.Handled = true;
            };

            // 화면 점검용 - 창을 띄우지 않고 위젯을 PNG 로 그린다(--snapshot <파일> [--demo] [--theme dark|light] [--scale 1.5])
            int snap = Array.FindIndex(args, x => x.Equals("--snapshot", StringComparison.OrdinalIgnoreCase));
            if (snap >= 0 && snap + 1 < args.Length)
            {
                try { SnapshotRenderer.Run(args[snap + 1], args); }
                catch (Exception e) { Log("snapshot: " + e); return 1; }
                return 0;
            }

            // --quiet : 묻지 않고(점검 · 배포 스크립트용)
            bool quiet = a.Contains("--quiet");

            if (a.Contains("--uninstall"))
            {
                if (quiet) { Installer.Uninstall(); return 0; }
                if (MessageBox.Show("MATE 캘린더를 지울까요?\n바탕화면 위젯 · 시작 메뉴 바로 가기 · 이 PC 에 남은 로그인 정보를 지웁니다.",
                        "MATE 캘린더 지우기", MessageBoxButton.OKCancel, MessageBoxImage.Question) != MessageBoxResult.OK) return 0;
                Installer.Uninstall();
                MessageBox.Show("MATE 캘린더를 지웠습니다.", "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Information);
                return 0;
            }

            // 받은 exe(설치 폴더 밖)를 열었다 - 설치 창. --update 는 묻지 않고 바로 깔고 다시 띄운다
            if (!Installer.IsInstalledCopy && !a.Contains("--portable"))
            {
                if (a.Contains("--update"))
                {
                    try
                    {
                        Installer.Install(File.Exists(Installer.Exe) ? Installer.AutoStart : true);
                        if (!quiet) Process.Start(new ProcessStartInfo(Installer.Exe) { UseShellExecute = false });
                    }
                    catch (Exception e) { Log("update: " + e); }
                    return 0;
                }
                var setup = new SetupWindow(Theme.Create("system", 0));
                setup.Closed += (s, e) => app.Shutdown();
                app.Startup += (s, e) => setup.Show();
                app.Run();
                return 0;
            }

            // 하나만 돈다 - 이미 돌고 있으면 그 위젯을 잠깐 앞으로 꺼내 보여 주고 끝낸다
            using var mutex = new Mutex(true, Installer.MutexName, out bool first);
            if (!first)
            {
                try
                {
                    if (EventWaitHandle.TryOpenExisting(Installer.ShowEvent, out var show)) { show.Set(); show.Dispose(); }
                }
                catch { /* 없음 */ }
                return 0;
            }

            var controller = new Controller(a.Contains("--demo"));
            app.Startup += (s, e) => controller.Start();
            app.Run();
            GC.KeepAlive(mutex);
            return 0;
        }

        public static void Log(string text)
        {
            try
            {
                Directory.CreateDirectory(Settings.Dir);
                var path = Path.Combine(Settings.Dir, "log.txt");
                if (File.Exists(path) && new FileInfo(path).Length > 256 * 1024) File.Delete(path);
                File.AppendAllText(path, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} {text}{Environment.NewLine}");
            }
            catch { /* 기록 못 해도 그만 */ }
        }
    }

    /// <summary>위젯 · 로그인 · 메뉴 · 작업 표시줄 아이콘 · 새로 읽기 · 업데이트를 묶는다</summary>
    internal sealed class Controller
    {
        public Settings Settings { get; } = Settings.Load();
        public Snapshot Data { get; private set; } = new Snapshot();
        public bool Loaded { get; private set; }
        public string? Error { get; private set; }
        public string? LoginMessage { get; private set; }
        public bool NeedLogin => !_demo && !Api.SignedIn;
        public bool UpdateReady => _update != null;

        private readonly bool _demo;
        private WidgetWindow? _widget;
        private Tray? _tray;
        private LoginWindow? _login;
        private Updater.Info? _update;
        private bool _refreshing;
        private DateTime _lastRefresh = DateTime.MinValue;
        private DateTime _metaAt = DateTime.MinValue;
        private readonly DispatcherTimer _timer = new DispatcherTimer();
        private ContextMenu? _menu;

        public Controller(bool demo)
        {
            _demo = demo;
            if (demo)
            {
                Data = Demo.Make();
                Loaded = true;
            }
        }

        public void Start()
        {
            if (!_demo) LoadCache();

            _widget = new WidgetWindow(this);
            _widget.Show();
            _widget.MouseEnter += (s, e) =>
            {
                // 위젯을 볼 때 오래된 내용이면 새로 읽는다
                if (DateTime.UtcNow - _lastRefresh > TimeSpan.FromSeconds(60)) _ = Refresh(false);
            };
            _tray = new Tray(this);

            ListenSignals();
            SystemEvents.PowerModeChanged += (s, e) =>
            {
                if (e.Mode == PowerModes.Resume) Ui(async () => { await Task.Delay(6000); await Refresh(false); });
            };
            NetworkChange.NetworkAvailabilityChanged += (s, e) =>
            {
                if (e.IsAvailable) Ui(async () => { await Task.Delay(3000); await Refresh(false); });
            };
            SystemEvents.UserPreferenceChanged += (s, e) =>
            {
                if (e.Category == UserPreferenceCategory.Desktop) Ui(() => _widget?.QueueBackdrop(force: true));
            };

            // 3분마다 작업, 30분마다 영역 · 색 · 팀원, 10분마다 바탕화면 그림, 6시간마다 업데이트
            _timer.Interval = TimeSpan.FromMinutes(1);
            int tick = 0;
            _timer.Tick += (s, e) =>
            {
                tick++;
                if (tick % 3 == 0) _ = Refresh(false);
                if (tick % 10 == 0) _widget?.CheckBackdrop();
                if (tick % 360 == 0) _ = CheckUpdate();
            };
            _timer.Start();

            if (_demo) return;
            if (NeedLogin) ShowLogin();
            else _ = Refresh(true);
            Ui(async () => { await Task.Delay(15000); await CheckUpdate(); });
        }

        private static void Ui(Action a) => Application.Current.Dispatcher.BeginInvoke(a);

        /// <summary>설치 · 업데이트가 '꺼 달라'고, 다시 연 exe 가 '보여 달라'고 알린다</summary>
        private void ListenSignals()
        {
            var exit = new EventWaitHandle(false, EventResetMode.AutoReset, Installer.ExitEvent);
            var show = new EventWaitHandle(false, EventResetMode.AutoReset, Installer.ShowEvent);
            ThreadPool.RegisterWaitForSingleObject(exit, (o, t) => Ui(Quit), null, -1, true);
            ThreadPool.RegisterWaitForSingleObject(show, (o, t) => Ui(Reveal), null, -1, false);
        }

        /// <summary>위젯을 잠깐 앞으로(다른 창을 누르면 다시 바탕화면으로)</summary>
        public void Reveal()
        {
            _widget?.Pin.Peek(1.5);
            if (NeedLogin) ShowLogin();
        }

        /* ── 데이터 ───────────────────────────────────── */

        private void LoadCache()
        {
            if (!Api.SignedIn) return;
            try
            {
                var raw = Vault.Read("cache.bin");
                if (raw == null || !(Json.Parse(raw) is Dictionary<string, object?> d)) return;
                if (d.Str("uid") != Api.Current!.Uid || d.Str("scope") != Settings.Scope) return;
                Data = new Snapshot
                {
                    Scope = d.Str("scope"),
                    Tasks = Json.Rows(d.TryGetValue("tasks", out var t) ? t : null).Select(TaskItem.From).Where(x => x != null).Select(x => x!).ToList(),
                    Domains = Json.Rows(d.TryGetValue("domains", out var dm) ? dm : null)
                        .Select(r => new DomainItem { Id = r.Str("id"), Label = r.Str("label"), Color = r.Str("color", "gray"), Sort = r.Num("sort") }).ToList(),
                    Members = Json.Rows(d.TryGetValue("members", out var mm) ? mm : null)
                        .Select(r => new MemberItem { Id = r.Str("id"), Name = r.Str("name"), Active = r.Bool("active") }).ToList(),
                    Colors = (d.TryGetValue("colors", out var c) ? c as Dictionary<string, object?> : null)?
                        .Where(kv => kv.Value is string).ToDictionary(kv => kv.Key, kv => (string)kv.Value!) ?? new Dictionary<string, string>(),
                };
                Loaded = true;
            }
            catch { /* 사본이 깨졌으면 새로 읽는다 */ }
        }

        private void SaveCache()
        {
            try
            {
                Vault.Write("cache.bin", Json.Write(new Dictionary<string, object?>
                {
                    ["uid"] = Api.Current?.Uid ?? "",
                    ["scope"] = Data.Scope,
                    ["tasks"] = Data.Tasks.Select(t => t.ToRow()).ToList(),
                    ["domains"] = Data.Domains.Select(x => new Dictionary<string, object?> { ["id"] = x.Id, ["label"] = x.Label, ["color"] = x.Color, ["sort"] = x.Sort }).ToList(),
                    ["members"] = Data.Members.Select(x => new Dictionary<string, object?> { ["id"] = x.Id, ["name"] = x.Name, ["active"] = x.Active }).ToList(),
                    ["colors"] = Data.Colors,
                }));
            }
            catch { /* 사본 없이도 돈다 */ }
        }

        public async Task Refresh(bool meta)
        {
            if (_demo || _refreshing) return;
            if (NeedLogin) { _widget?.Render(); return; }
            _refreshing = true;
            _lastRefresh = DateTime.UtcNow;
            try
            {
                var scope = Settings.Scope;
                var tasks = await Api.Tasks(scope != "all");
                if (meta || DateTime.UtcNow - _metaAt > TimeSpan.FromMinutes(30) || Data.Domains.Count == 0)
                {
                    var domains = await Api.Domains();
                    var colors = await Api.Colors();
                    var members = await Api.Members();
                    Data.Domains = domains;
                    Data.Colors = colors;
                    Data.Members = members;
                    _metaAt = DateTime.UtcNow;
                }
                Data.Tasks = tasks;
                Data.Scope = scope;
                Data.SyncedAt = DateTime.Now;
                Loaded = true;
                Error = null;
                LoginMessage = null;
                SaveCache();
            }
            catch (ApiException e)
            {
                Program.Log("refresh: " + e.Message);
                if (e.NeedLogin)
                {
                    LoginMessage = e.Message;
                    Data = new Snapshot();
                    Loaded = false;
                }
                Error = Data.SyncedAt.HasValue ? $"{e.Message} ({Data.SyncedAt:HH:mm} 기준)" : e.Message;
            }
            catch (Exception e)
            {
                Program.Log("refresh: " + e);
                Error = "작업을 읽지 못했습니다.";
            }
            finally
            {
                _refreshing = false;
                _widget?.Render();
                _tray?.Update();
            }
        }

        /* ── 열기 ─────────────────────────────────────── */

        public void OpenTask(string id) => Open(Api.Web + "?task=" + Uri.EscapeDataString(id));

        public void OpenHub(string? view) => Open(Api.Web + (view != null ? "?view=" + view : ""));

        private static void Open(string url)
        {
            try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); }
            catch (Exception e) { Program.Log("open: " + e.Message); }
        }

        public void ShowLogin()
        {
            if (_demo) return;
            if (_login != null) { _login.Activate(); return; }
            _login = new LoginWindow(Theme.Create(Settings.Appearance, 0), LoginMessage);
            _login.Closed += (s, e) =>
            {
                bool ok = _login!.Succeeded;
                _login = null;
                if (ok)
                {
                    LoginMessage = null;
                    Data = new Snapshot();
                    Loaded = false;
                    _widget?.Render();
                    _ = Refresh(true);
                }
            };
            _login.Show();
        }

        public void SignOut()
        {
            Api.SignOut();
            Data = new Snapshot();
            Loaded = false;
            Error = null;
            LoginMessage = null;
            _widget?.Render();
            _tray?.Update();
        }

        public void Quit()
        {
            try { _widget?.Pin.Dispose(); } catch { /* 이미 닫힘 */ }
            _tray?.Dispose();
            Application.Current.Shutdown();
        }

        /* ── 업데이트 ─────────────────────────────────── */

        private async Task CheckUpdate()
        {
            if (_demo) return;
            var info = await Updater.Check();
            _update = info;
            _widget?.Render();
        }

        private async Task InstallUpdate()
        {
            if (_update == null) return;
            var err = await Updater.Install(_update);
            if (err != null) MessageBox.Show(err, "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Warning);
            // 성공하면 새 exe 가 이 위젯을 끄라고 알린다(ExitEvent)
        }

        /* ── 메뉴 ─────────────────────────────────────── */

        /// <summary>⋯ 단추 · 작업 표시줄 아이콘의 메뉴. anchor 가 없으면 마우스 자리에 연다</summary>
        public void ShowMenu(FrameworkElement? anchor)
        {
            if (_menu != null) _menu.IsOpen = false;
            var m = BuildMenu();
            if (anchor != null)
            {
                m.PlacementTarget = anchor;
                m.Placement = System.Windows.Controls.Primitives.PlacementMode.Bottom;
            }
            else m.Placement = System.Windows.Controls.Primitives.PlacementMode.MousePoint;
            m.Opened += (s, e) =>
            {
                // 다른 곳을 누르면 닫히게 메뉴 창을 앞 창으로
                if (PresentationSource.FromVisual(m) is HwndSource src) Native.SetForegroundWindow(src.Handle);
            };
            _menu = m;
            m.IsOpen = true;
        }

        public ContextMenu BuildMenu()
        {
            var theme = Theme.Create(Settings.Appearance, 0);
            var m = new ContextMenu { FontFamily = Theme.Font };
            m.Resources.MergedDictionaries.Add(Styles.Menu(theme));

            MenuItem Item(string header, Action? click, bool check = false, bool enabled = true, string? gesture = null)
            {
                var mi = new MenuItem { Header = header, IsChecked = check, IsEnabled = enabled, InputGestureText = gesture ?? "" };
                if (click != null) mi.Click += (s, e) => click();
                return mi;
            }
            MenuItem Sub(string header, params object[] items)
            {
                var mi = new MenuItem { Header = header };
                foreach (var it in items) mi.Items.Add(it);
                return mi;
            }
            void Set(Action change) { change(); Settings.Save(); _widget?.Render(); }

            if (!NeedLogin && !_demo)
            {
                m.Items.Add(Item(Api.Who, null, false, false));
                m.Items.Add(Item("새로 읽기", () => _ = Refresh(true), false, true,
                    Data.SyncedAt.HasValue ? Data.SyncedAt.Value.ToString("HH:mm", CultureInfo.InvariantCulture) : null));
                m.Items.Add(new Separator());
            }

            m.Items.Add(Sub("보기",
                Item("내 작업", () => SetScope("mine"), Settings.Scope != "all"),
                Item("팀 전체", () => SetScope("all"), Settings.Scope == "all")));
            m.Items.Add(Sub("색 기준",
                Item("영역", () => Set(() => Settings.ColorBy = "domain"), Settings.ColorBy == "domain"),
                Item("라벨", () => Set(() => Settings.ColorBy = "label"), Settings.ColorBy == "label"),
                Item("담당자", () => Set(() => Settings.ColorBy = "member"), Settings.ColorBy == "member")));
            m.Items.Add(Sub("목록",
                Item("고른 날만", () => Set(() => Settings.UpcomingDays = 0), Settings.UpcomingDays == 0),
                Item("앞으로 3일", () => Set(() => Settings.UpcomingDays = 3), Settings.UpcomingDays == 3),
                Item("앞으로 7일", () => Set(() => Settings.UpcomingDays = 7), Settings.UpcomingDays == 7),
                Item("앞으로 14일", () => Set(() => Settings.UpcomingDays = 14), Settings.UpcomingDays == 14),
                new Separator(),
                Item("요약 보이기", () => Set(() => Settings.Summary = !Settings.Summary), Settings.Summary)));
            m.Items.Add(Sub("달력",
                Item("이번 달 테두리", () => Set(() => Settings.MonthOutline = !Settings.MonthOutline), Settings.MonthOutline),
                Item("주 번호", () => Set(() => Settings.WeekNumbers = !Settings.WeekNumbers), Settings.WeekNumbers)));
            m.Items.Add(Sub("크기",
                Item("작게", () => SetScale(1.0), Math.Abs(Settings.Scale - 1.0) < 0.01),
                Item("보통", () => SetScale(1.25), Math.Abs(Settings.Scale - 1.25) < 0.01),
                Item("크게", () => SetScale(1.5), Math.Abs(Settings.Scale - 1.5) < 0.01),
                Item("아주 크게", () => SetScale(1.75), Math.Abs(Settings.Scale - 1.75) < 0.01),
                Item("가장 크게", () => SetScale(2.0), Math.Abs(Settings.Scale - 2.0) < 0.01)));
            m.Items.Add(Sub("모양",
                Item("시스템 설정 따름", () => SetLook(() => Settings.Appearance = "system"), Settings.Appearance == "system"),
                Item("밝게", () => SetLook(() => Settings.Appearance = "light"), Settings.Appearance == "light"),
                Item("어둡게", () => SetLook(() => Settings.Appearance = "dark"), Settings.Appearance == "dark"),
                new Separator(),
                Item("투명도 낮게", () => SetLook(() => Settings.Transparency = 0), Settings.Transparency == 0),
                Item("투명도 보통", () => SetLook(() => Settings.Transparency = 1), Settings.Transparency == 1),
                Item("투명도 높게", () => SetLook(() => Settings.Transparency = 2), Settings.Transparency == 2)));
            m.Items.Add(new Separator());
            m.Items.Add(Item("자리 고정", () => Set(() => Settings.Locked = !Settings.Locked), Settings.Locked));
            m.Items.Add(Item("자리 처음으로", () => _widget?.ResetPosition()));
            if (Installer.IsInstalledCopy)
            {
                bool auto = Installer.AutoStart;
                m.Items.Add(Item("Windows 시작 시 실행", () =>
                {
                    if (!Installer.SetAutoStart(!auto))
                        MessageBox.Show("자동 실행을 켜지 못했습니다. 보안 프로그램이 막았을 수 있습니다.", "MATE 캘린더",
                            MessageBoxButton.OK, MessageBoxImage.Warning);
                }, auto));
            }
            m.Items.Add(new Separator());
            m.Items.Add(Item("Hub 열기", () => OpenHub(null)));
            if (_update != null) m.Items.Add(Item($"업데이트 설치 ({_update.Version.ToString(3)})", () => _ = InstallUpdate()));
            m.Items.Add(new Separator());
            if (!_demo)
            {
                if (NeedLogin) m.Items.Add(Item("로그인…", ShowLogin));
                else m.Items.Add(Item("로그아웃", SignOut));
            }
            m.Items.Add(Item($"정보 - MATE 캘린더 {Program.Version}", () => MessageBox.Show(
                $"MATE 캘린더 {Program.Version}\n\nHub 의 작업을 바탕화면 캘린더 위젯으로 보여 줍니다.\n" +
                "화면 디자인: Calendr (github.com/pakerwreah/Calendr, MIT 라이선스)\n글꼴: Pretendard (SIL Open Font License 1.1)",
                "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Information)));
            m.Items.Add(Item("끝내기", Quit));
            return m;
        }

        private void SetScope(string scope)
        {
            if (Settings.Scope == scope) return;
            Settings.Scope = scope;
            Settings.Save();
            if (_demo) { _widget?.Render(); return; }
            Data = new Snapshot();
            Loaded = false;
            _widget?.Render();
            _ = Refresh(true);
        }

        private void SetScale(double s)
        {
            Settings.Scale = s;
            Settings.Save();
            _widget?.Render();
            _widget?.QueueBackdrop(force: true);
        }

        private void SetLook(Action change)
        {
            change();
            Settings.Save();
            _widget?.ApplyTheme();
        }
    }

    /// <summary>작업 표시줄 알림 영역 아이콘 - 왼쪽 클릭은 위젯 꺼내 보기, 오른쪽 클릭은 메뉴</summary>
    internal sealed class Tray : IDisposable
    {
        private readonly System.Windows.Forms.NotifyIcon _icon;
        private readonly Controller _c;

        public Tray(Controller c)
        {
            _c = c;
            _icon = new System.Windows.Forms.NotifyIcon { Text = "MATE 캘린더", Visible = true };
            try
            {
                var s = Application.GetResourceStream(new Uri("pack://application:,,,/Assets/app.ico"))?.Stream;
                if (s != null) _icon.Icon = new System.Drawing.Icon(s, System.Windows.Forms.SystemInformation.SmallIconSize);
            }
            catch { _icon.Icon = System.Drawing.SystemIcons.Application; }
            _icon.MouseUp += (s, e) =>
            {
                if (e.Button == System.Windows.Forms.MouseButtons.Right) _c.ShowMenu(null);
                else if (e.Button == System.Windows.Forms.MouseButtons.Left) _c.Reveal();
            };
            Update();
        }

        public void Update()
        {
            var who = Api.Who;
            var text = "MATE 캘린더" + (who != "" ? " - " + who : "");
            _icon.Text = text.Length > 63 ? text.Substring(0, 63) : text;
        }

        public void Dispose()
        {
            _icon.Visible = false;
            _icon.Dispose();
        }
    }

    /// <summary>화면 점검용 보기 자료(--demo · --snapshot)</summary>
    internal static class Demo
    {
        public static Snapshot Make()
        {
            var today = DateTime.Today;
            var s = new Snapshot
            {
                Scope = "mine",
                SyncedAt = DateTime.Now,
                Domains = new List<DomainItem>
                {
                    new DomainItem { Id = "web", Label = "웹 · 앱", Color = "blue", Sort = 1 },
                    new DomainItem { Id = "game", Label = "게임 · XR", Color = "violet", Sort = 2 },
                    new DomainItem { Id = "edu", Label = "교육 · 강의", Color = "teal", Sort = 3 },
                    new DomainItem { Id = "ops", Label = "내부 · 운영", Color = "gray", Sort = 4 },
                },
            };
            int n = 140;
            TaskItem T(int day, string title, string domain, string status = "todo", string pr = "normal", int? startOffset = null, params string[] labels) =>
                new TaskItem
                {
                    Id = Guid.NewGuid().ToString(), Num = n++, Title = title, Domain = domain, Status = status, Priority = pr,
                    Due = today.AddDays(day), Start = startOffset.HasValue ? today.AddDays(day + startOffset.Value) : (DateTime?)null,
                    Labels = labels,
                };
            s.Tasks = new List<TaskItem>
            {
                T(-3, "세종 관리자 캡처 정리", "web", "doing", "high"),
                T(-1, "견적서 회신", "ops", "todo", "urgent"),
                T(0, "Hub 일간보고 화면 다듬기", "web", "doing", "high", -4, "Hub"),
                T(0, "XR 시연 영상 컷 편집", "game", "review"),
                T(0, "주간 회의 자료", "ops", "done"),
                T(1, "강의 3회차 실습 파일", "edu", "todo", "normal", null, "강의"),
                T(2, "갤럭시 위젯 실기기 시험", "web", "todo", "high"),
                T(2, "게임 BGM 루프 다듬기", "game", "backlog"),
                T(4, "세금계산서 발행", "ops", "todo", "urgent"),
                T(6, "포트폴리오 사진 교체", "web", "todo"),
                T(9, "교육 과정 안내문", "edu", "todo"),
                T(12, "레벨 디자인 검토", "game", "todo", "high", -5),
                T(15, "서버 비용 점검", "ops", "todo"),
                T(-8, "지난달 정산", "ops", "done"),
                T(-6, "랜딩 문구 고침", "web", "done"),
                T(18, "모션 그래픽 시안", "game", "todo"),
                T(18, "강의 피드백 정리", "edu", "todo"),
                T(18, "홈페이지 점검", "web", "todo"),
                T(18, "장비 반납", "ops", "todo"),
            };
            return s;
        }
    }

    /// <summary>창을 띄우지 않고 위젯을 PNG 로 그린다 - 디자인 점검용</summary>
    internal static class SnapshotRenderer
    {
        public static void Run(string path, string[] args)
        {
            string Arg(string name, string def)
            {
                int i = Array.FindIndex(args, x => x.Equals(name, StringComparison.OrdinalIgnoreCase));
                return i >= 0 && i + 1 < args.Length ? args[i + 1] : def;
            }
            var c = new Controller(true);
            c.Settings.Appearance = Arg("--theme", "dark");
            c.Settings.Scale = double.Parse(Arg("--scale", "1.5"), CultureInfo.InvariantCulture);
            c.Settings.WeekNumbers = args.Contains("--weeks");

            var w = new WidgetWindow(c);
            var root = (FrameworkElement)w.Content;
            w.Content = null;

            // --backdrop x,y : 그 화면 자리의 바탕화면 그림으로 흐린 바탕을 깐다
            var bd = Arg("--backdrop", "");
            if (bd != "")
            {
                var xy = bd.Split(',').Select(v => int.Parse(v, CultureInfo.InvariantCulture)).ToArray();
                root.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
                var sz = root.DesiredSize;
                double k = c.Settings.Scale; // 100% 배율 화면 기준
                int pad = (int)Math.Round(14 * k);
                var card = new Native.RECT { Left = xy[0] + pad, Top = xy[1] + pad, Right = xy[0] + (int)sz.Width - pad, Bottom = xy[1] + (int)sz.Height - pad };
                var bmp = Backdrop.Make(card, 34);
                var glass = FindGlass(root);
                if (bmp != null && glass != null) glass.Background = new ImageBrush(bmp) { Stretch = Stretch.Fill };
            }
            else
            {
                // 바탕화면 대신 어두운 그러데이션 사진 느낌
                var glass = FindGlass(root);
                if (glass != null)
                {
                    glass.Background = new LinearGradientBrush(
                        new GradientStopCollection { new GradientStop(Color.FromRgb(0x5B, 0x2C, 0x3A), 0), new GradientStop(Color.FromRgb(0x1F, 0x3B, 0x4E), 1) },
                        new Point(0, 0), new Point(1, 1));
                }
            }

            Save(root, path);

            // --extras : 같은 폴더에 메뉴 · 로그인 · 설치 창도 그린다
            if (args.Contains("--extras"))
            {
                var dir = System.IO.Path.GetDirectoryName(System.IO.Path.GetFullPath(path)) ?? ".";
                var theme = Theme.Create(c.Settings.Appearance, 0);
                var menu = c.BuildMenu();
                Save(menu, System.IO.Path.Combine(dir, "menu-" + c.Settings.Appearance + ".png"));
                var login = new LoginWindow(theme, "메일이나 비밀번호가 맞지 않습니다.");
                var lc = (FrameworkElement)login.Content; login.Content = null;
                Save(lc, System.IO.Path.Combine(dir, "login-" + c.Settings.Appearance + ".png"));
                var setup = new SetupWindow(theme);
                var sc = (FrameworkElement)setup.Content; setup.Content = null;
                Save(sc, System.IO.Path.Combine(dir, "setup-" + c.Settings.Appearance + ".png"));
            }
        }

        private static void Save(FrameworkElement root, string path)
        {
            // 메뉴(ContextMenu)는 부모를 가질 수 없어 그대로 재고 그린다
            FrameworkElement host = root;
            if (!(root is ContextMenu))
            {
                var g = new Grid();
                g.Children.Add(root);
                host = g;
            }
            host.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
            host.Arrange(new Rect(host.DesiredSize));
            host.UpdateLayout();
            const double scale = 2;
            var rtb = new RenderTargetBitmap((int)Math.Ceiling(host.ActualWidth * scale), (int)Math.Ceiling(host.ActualHeight * scale),
                96 * scale, 96 * scale, PixelFormats.Pbgra32);
            var bg = new DrawingVisual();
            using (var dc = bg.RenderOpen()) dc.DrawRectangle(new SolidColorBrush(Color.FromRgb(0x50, 0x50, 0x58)), null, new Rect(0, 0, host.ActualWidth, host.ActualHeight));
            rtb.Render(bg);
            rtb.Render(host);
            var enc = new PngBitmapEncoder();
            enc.Frames.Add(BitmapFrame.Create(rtb));
            using var fs = File.Create(path);
            enc.Save(fs);
        }

        private static System.Windows.Controls.Border? FindGlass(FrameworkElement root)
        {
            // 바깥 Grid → 카드 Grid → 첫 Border(흐린 바탕)
            if (root is Grid outer && outer.Children.Count > 0 && outer.Children[0] is Grid card && card.Children.Count > 0)
                return card.Children[0] as System.Windows.Controls.Border;
            return null;
        }
    }
}
