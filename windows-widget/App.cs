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
                        return 0;
                    }
                    catch (Exception e)
                    {
                        Log("update: " + e);
                        // 쓰던 위젯이 꺼졌으면 남아 있는 판을 다시 띄우고 까닭을 알린다(끄기 전에 실패했으면 그대로 돈다)
                        bool back = Installer.OthersRunning();
                        try
                        {
                            if (!quiet && !back && File.Exists(Installer.Exe))
                            {
                                Process.Start(new ProcessStartInfo(Installer.Exe) { UseShellExecute = false });
                                back = true;
                            }
                        }
                        catch (Exception e2) { Log("update restart: " + e2.Message); }
                        if (!quiet && !a.Contains("--auto"))
                        {
                            MessageBox.Show("업데이트를 설치하지 못했습니다.\n" + e.Message + "\n\n" +
                                (back ? "쓰던 판을 다시 띄웠습니다. 잠시 뒤 위젯의 업데이트 단추를 다시 눌러 주세요."
                                      : "Hub 의 Windows 위젯 메뉴에서 설치 파일을 다시 받아 설치해 주세요."),
                                "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Warning);
                        }
                        return 1;
                    }
                }
                var setup = new SetupWindow(Theme.Create("system", 0));
                setup.Closed += (s, e) => app.Shutdown();
                app.Startup += (s, e) => setup.Show();
                app.Run();
                return 0;
            }

            // 하나만 돈다 - 이미 돌고 있으면 그 위젯을 잠깐 앞으로 꺼내 보여 주고 끝낸다(보기 자료 점검은 따로 뜬다)
            bool demo = a.Contains("--demo");
            using var mutex = new Mutex(!demo, demo ? Installer.MutexName + ".Demo" : Installer.MutexName, out bool first);
            if (!first && !demo)
            {
                try
                {
                    if (EventWaitHandle.TryOpenExisting(Installer.ShowEvent, out var show)) { show.Set(); show.Dispose(); }
                }
                catch { /* 없음 */ }
                return 0;
            }

            // --demo --work <높이> 또는 <폭>x<높이>(DIP) : 작은 화면을 흉내 내 맞춰지는지 본다(점검용)
            int work = Array.FindIndex(args, x => x.Equals("--work", StringComparison.OrdinalIgnoreCase));
            if (demo && work >= 0 && work + 1 < args.Length) WidgetWindow.SetWorkOverride(args[work + 1]);

            var controller = new Controller(demo);
            if (demo)
            {
                // --wide : 넓게 펼친 화면, --update-ready : 새 판이 나온 것처럼(단추만 보이고 설치는 안 한다)
                if (a.Contains("--wide")) controller.Settings.Layout = "wide";
                if (a.Contains("--update-ready")) controller.DemoUpdate("9.9.9");
            }
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
        public Settings Settings { get; }
        public Snapshot Data { get; private set; } = new Snapshot();
        public bool Loaded { get; private set; }
        public string? Error { get; private set; }
        public string? LoginMessage { get; private set; }
        public bool NeedLogin => _demo ? DemoSignedOut : !Api.SignedIn;

        /// <summary>점검 그림(--snapshot --state …)용 - 보기 자료에서 로그인 전 · 읽는 중 · 오류 화면을 흉내 낸다</summary>
        internal bool DemoSignedOut;

        internal void DemoState(bool loaded, string? error)
        {
            Loaded = loaded;
            Error = error;
            if (!loaded) Data = new Snapshot();
        }
        public bool UpdateReady => _update != null;
        public string UpdateVersion => _update?.Version.ToString(3) ?? "";
        public string UpdateNotes => _update?.Notes ?? "";
        /// <summary>새 판을 받는 중(단추를 다시 못 누르게)</summary>
        public bool Updating { get; private set; }

        /// <summary>점검용 - 새 판이 나온 것처럼 단추를 보인다</summary>
        internal void DemoUpdate(string version) =>
            _update = new Updater.Info { Version = System.Version.Parse(version), Notes = "넓게 펼친 화면 · 업데이트 단추" };

        private readonly bool _demo;
        private WidgetWindow? _widget;
        private Tray? _tray;
        private LoginWindow? _login;
        private Updater.Info? _update;
        private bool _refreshing;
        private bool _again, _againMeta; // 읽는 사이 로그인 · 보기 범위가 바뀌어 응답을 버렸다 - 끝나면 새 설정으로 다시 읽는다
        private DateTime _lastRefresh = DateTime.MinValue;
        private DateTime _metaAt = DateTime.MinValue;
        private readonly DispatcherTimer _timer = new DispatcherTimer();
        private ContextMenu? _menu;

        public Controller(bool demo)
        {
            _demo = demo;
            // 보기 자료로 띄울 때는 깔린 위젯의 설정(자리 · 크기)을 읽지도 바꾸지도 않는다
            Settings = demo ? new Settings { Scratch = true } : Settings.Load();
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

            if (!_demo) ListenSignals();
            SystemEvents.PowerModeChanged += (s, e) =>
            {
                if (e.Mode == PowerModes.Resume) Ui(async () => { await Task.Delay(6000); await Refresh(false); await CheckUpdate(); });
            };
            NetworkChange.NetworkAvailabilityChanged += (s, e) =>
            {
                if (e.IsAvailable) Ui(async () => { await Task.Delay(3000); await Refresh(false); });
            };
            SystemEvents.UserPreferenceChanged += (s, e) =>
            {
                if (e.Category == UserPreferenceCategory.Desktop) Ui(() => _widget?.QueueBackdrop(force: true));
            };

            // 3분마다 작업, 30분마다 영역 · 색 · 팀원, 10분마다 바탕화면 그림, 1시간마다 새 판 확인(나왔으면 1분마다 저절로 깔 때인지 본다)
            _timer.Interval = TimeSpan.FromMinutes(1);
            int tick = 0;
            _timer.Tick += (s, e) =>
            {
                tick++;
                if (tick % 3 == 0) _ = Refresh(false);
                if (tick % 10 == 0) _widget?.CheckBackdrop();
                if (tick % 60 == 0) _ = CheckUpdate();
                else TryAutoUpdate();
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

        /// <summary>점검 그림(--snapshot --cache)용 - 이 PC 에 저장된 내 작업 사본으로 그린다(네트워크 없이)</summary>
        internal void LoadCacheForSnapshot() => LoadCache();

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
                    // 전에 저장한 사본(1.0.2 까지)에는 읽은 시각이 없다 - 지어내지 않고 비워 둔다
                    SyncedAt = DateTime.TryParse(d.Str("syncedAt"), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var at)
                        ? at.ToLocalTime() : (DateTime?)null,
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
                    ["syncedAt"] = Data.SyncedAt?.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture),
                    ["tasks"] = Data.Tasks.Select(t => t.ToRow()).ToList(),
                    ["domains"] = Data.Domains.Select(x => new Dictionary<string, object?> { ["id"] = x.Id, ["label"] = x.Label, ["color"] = x.Color, ["sort"] = x.Sort }).ToList(),
                    ["members"] = Data.Members.Select(x => new Dictionary<string, object?> { ["id"] = x.Id, ["name"] = x.Name, ["active"] = x.Active }).ToList(),
                    ["colors"] = Data.Colors,
                }));
            }
            catch { /* 사본 없이도 돈다 */ }
        }

        /// <summary>지금 작업을 읽는 중인지 - 새로 읽기 단추가 도는 동안</summary>
        public bool Refreshing => _refreshing;

        private Task? _running;

        /// <summary>작업을 새로 읽는다. 이미 읽는 중이면 그 읽기가 끝나기를 기다린다.
        /// manual = 사람이 단추로 누른 것 - 너무 빨리 끝나도 단추가 잠깐은 돌아 눌린 것이 보이게 한다</summary>
        public Task Refresh(bool meta, bool manual = false)
        {
            if (_running != null && !_running.IsCompleted)
            {
                // 저절로 읽는 중에 눌렀으면 단추만 돌게 다시 그린다
                if (manual) _widget?.Render();
                return _running;
            }
            return _running = RefreshCore(meta, manual);
        }

        private async Task RefreshCore(bool meta, bool manual)
        {
            if (_demo || _refreshing) return;
            _lastRefresh = DateTime.UtcNow;
            if (NeedLogin) { _widget?.Render(); return; }
            _refreshing = true;
            var started = DateTime.UtcNow;
            if (manual) _widget?.Render();
            // 요청을 시작할 때의 로그인 · 보기 범위 - 응답이 왔을 때 달라졌으면 버리고 새 설정으로 다시 읽는다
            int epoch = Api.Epoch;
            var scope = Settings.Scope;
            try
            {
                var tasks = await Api.Tasks(scope != "all");
                List<DomainItem>? domains = null;
                Dictionary<string, string>? colors = null;
                List<MemberItem>? members = null;
                if (meta || DateTime.UtcNow - _metaAt > TimeSpan.FromMinutes(30) || Data.Domains.Count == 0)
                {
                    try
                    {
                        domains = await Api.Domains();
                        colors = await Api.Colors();
                        members = await Api.Members();
                    }
                    catch (ApiException e) when (!e.NeedLogin && !e.Stale)
                    {
                        // 영역 · 색 · 팀원은 전에 읽은 것을 그대로 쓰고 다음에 다시 읽는다(빈 값으로 덮지 않는다)
                        Program.Log("meta: " + e.Message);
                        domains = null;
                    }
                }
                if (epoch != Api.Epoch || scope != Settings.Scope)
                {
                    _again = true;
                    _againMeta |= meta;
                    return;
                }
                if (domains != null && colors != null && members != null)
                {
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
            // 그사이 사람이 로그아웃 · 다시 로그인했다 - 이 응답은 버린다.
            // (로그인이 풀려 Api 가 스스로 로그아웃한 NeedLogin 은 아래에서 로그인 안내로 바꾼다)
            catch (ApiException e) when (e.Stale || (epoch != Api.Epoch && !e.NeedLogin))
            {
                _again = true;
            }
            catch (ApiException e)
            {
                Program.Log("refresh: " + e.Message);
                if (e.NeedLogin)
                {
                    LoginMessage = e.Message;
                    Data = new Snapshot();
                    Loaded = false;
                    Error = null;
                }
                else Error = e.Message; // 읽은 시각은 위젯이 Data.SyncedAt 으로 함께 보인다
            }
            catch (Exception e)
            {
                Program.Log("refresh: " + e);
                Error = "작업을 읽지 못했습니다.";
            }
            finally
            {
                if (manual)
                {
                    var left = TimeSpan.FromMilliseconds(600) - (DateTime.UtcNow - started);
                    if (left > TimeSpan.Zero) await Task.Delay(left);
                }
                _refreshing = false;
                _widget?.Render();
                _tray?.Update();
                if (_again)
                {
                    bool m = _againMeta;
                    _again = _againMeta = false;
                    _running = RefreshCore(m, false);
                }
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
                    Error = null;
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
            if (_demo || Updating) return;
            var info = await Updater.Check();
            bool changed = (info?.Version) != (_update?.Version);
            _update = info;
            if (changed) _widget?.Render();
            TryAutoUpdate();
        }

        /// <summary>
        /// 새 판을 저절로 깐다 - 설치한 위젯이고, 자동 업데이트를 켰고, 사람이 위젯을 만지는 중이 아니고(아니면 1분 뒤 다시),
        /// 같은 판을 12시간 안에 이미 깔아 보지 않았을 때. 깔면 위젯이 잠깐 꺼졌다가 새 판으로 다시 뜬다
        /// </summary>
        private void TryAutoUpdate()
        {
            if (_demo || _update == null || Updating || !Settings.AutoUpdate || !Installer.IsInstalledCopy) return;
            var v = _update.Version.ToString(3);
            if (Settings.AutoTriedVersion == v && Settings.AutoTriedAt.HasValue && DateTime.UtcNow - Settings.AutoTriedAt.Value < TimeSpan.FromHours(12)) return;
            if (_widget?.IsMouseOver == true || _menu?.IsOpen == true || _login != null) return;
            Settings.AutoTriedVersion = v;
            Settings.AutoTriedAt = DateTime.UtcNow;
            Settings.Save();
            Program.Log("auto update " + v);
            _ = InstallUpdate(auto: true);
        }

        public async Task InstallUpdate(bool auto = false)
        {
            if (_update == null || Updating) return;
            if (_demo) { MessageBox.Show("점검 화면이라 설치하지 않습니다.", "MATE 캘린더"); return; }
            Updating = true;
            _widget?.Render();
            var err = await Updater.Install(_update, auto);
            if (err != null)
            {
                Updating = false;
                _widget?.Render();
                Program.Log("update: " + err);
                // 저절로 깔다 실패하면 창을 띄우지 않는다(단추는 남아 사람이 다시 누를 수 있다)
                if (!auto) MessageBox.Show(err, "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            // 성공하면 새 exe 가 이 위젯을 끄라고 알린다(ExitEvent). 1분이 지나도 그대로면 단추를 되살린다
            await Task.Delay(60000);
            Updating = false;
            _widget?.Render();
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
                m.Items.Add(Item("새로 읽기", () => _ = Refresh(true, manual: true), false, true,
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
            m.Items.Add(Item("넓게 펼쳐 보기", () => SetLayout(Settings.Wide ? "compact" : "wide"), Settings.Wide));
            // 크기는 Windows 화면 배율 위에 한 번 더 곱하는 배수 - 이름 대신 배수와 기본값을 적는다
            double sc = Settings.ActiveScale, def = Settings.Wide ? 1.25 : 1.5;
            MenuItem Size(double v) => Item(v.ToString("0.##", CultureInfo.InvariantCulture) + "배" + (Math.Abs(v - def) < 0.01 ? " (기본)" : ""),
                () => SetScale(v), Math.Abs(sc - v) < 0.01);
            m.Items.Add(Sub(Settings.Wide ? "크기(넓은 화면)" : "크기", Size(1.0), Size(1.25), Size(1.5), Size(1.75), Size(2.0)));
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
                        MessageBox.Show(auto
                                ? "자동 실행을 끄지 못했습니다. 작업 관리자의 '시작 앱'에서 'MATE 캘린더'를 끌 수 있습니다."
                                : "자동 실행을 켜지 못했습니다. 보안 프로그램이 막았을 수 있습니다.\n시작 메뉴의 'MATE 캘린더'로 언제든 띄울 수 있습니다.",
                            "MATE 캘린더", MessageBoxButton.OK, MessageBoxImage.Warning);
                }, auto));
            }
            if (Installer.IsInstalledCopy || _demo)
                m.Items.Add(Item("자동 업데이트", () => Set(() => Settings.AutoUpdate = !Settings.AutoUpdate), Settings.AutoUpdate));
            m.Items.Add(new Separator());
            m.Items.Add(Item("Hub 열기", () => OpenHub(null)));
            if (_update != null)
                m.Items.Add(Updating ? Item("업데이트 받는 중…", null, false, false)
                    : Item($"업데이트 설치 ({_update.Version.ToString(3)})", () => _ = InstallUpdate()));
            m.Items.Add(new Separator());
            if (!_demo)
            {
                if (NeedLogin) m.Items.Add(Item("로그인…", ShowLogin));
                else m.Items.Add(Item("로그아웃", SignOut));
            }
            m.Items.Add(Item($"정보 · MATE 캘린더 {Program.Version}", () => MessageBox.Show(
                $"MATE 캘린더 {Program.Version}\n\nHub 의 작업 가운데 마감일이 있는 것을 바탕화면 캘린더로 보여 줍니다. 위젯에서는 작업을 고치지 않고, 누르면 Hub 에서 엽니다.\n" +
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
            Data = new Snapshot { Domains = Data.Domains, Colors = Data.Colors, Members = Data.Members };
            Loaded = false;
            Error = null;
            _widget?.Render();
            _ = Refresh(true);
        }

        /// <summary>작게(달력 + 목록) · 넓게(펼친 달력 + 옆 목록)</summary>
        public void SetLayout(string layout)
        {
            if (Settings.Layout == layout) return;
            Settings.Layout = layout;
            Settings.Save();
            _widget?.Render();
            _widget?.QueueBackdrop(force: true);
        }

        private void SetScale(double s)
        {
            if (Settings.Wide) Settings.WideScale = s;
            else Settings.Scale = s;
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
            var text = "MATE 캘린더" + (who != "" ? " · " + who : "");
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
            // 점검용 사람 - 팀 전체 보기에서 담당자 이름 · 사람 색을 보이려고
            s.Members = new List<MemberItem>
            {
                new MemberItem { Id = "m1", Name = "가팀원", Active = true },
                new MemberItem { Id = "m2", Name = "나팀원", Active = true },
                new MemberItem { Id = "m3", Name = "다팀원", Active = true },
            };
            int n = 140;
            TaskItem T(int day, string title, string domain, string status = "todo", string pr = "normal", int? startOffset = null, string who = "m1", params string[] labels) =>
                new TaskItem
                {
                    Id = Guid.NewGuid().ToString(), Num = n++, Title = title, Domain = domain, Status = status, Priority = pr,
                    Due = today.AddDays(day), Start = startOffset.HasValue ? today.AddDays(day + startOffset.Value) : (DateTime?)null,
                    Labels = labels, Assignee = who,
                };
            s.Tasks = new List<TaskItem>
            {
                T(-3, "관리자 화면 캡처 정리", "web", "doing", "high", null, "m1", "관리자"),
                T(-1, "견적서 회신", "ops", "todo", "urgent", null, "m2", "영업"),
                T(0, "Hub 일간보고 화면 다듬기", "web", "doing", "high", -4, "m1", "Hub"),
                T(0, "XR 시연 영상 컷 편집", "game", "review", "normal", null, "m3", "영상"),
                T(0, "주간 회의 자료", "ops", "done", "normal", null, "m2"),
                T(1, "강의 3회차 실습 파일", "edu", "todo", "normal", null, "m3", "강의"),
                T(1, "관리자 페이지 2차 개선 요청 반영과 휴대폰 화면 점검, 배포 전에 운영 자료로 마지막 확인", "web", "doing", "high", -6, "m1", "관리자", "배포", "휴대폰 점검"),
                T(2, "갤럭시 위젯 실기기 시험", "web", "todo", "high", null, "m1", "Hub"),
                T(2, "게임 BGM 루프 다듬기", "game", "backlog", "normal", null, "m2", "사운드"),
                T(4, "세금계산서 발행", "ops", "todo", "urgent", null, "m2", "영업"),
                T(6, "포트폴리오 사진 교체", "web", "todo", "normal", null, "m1"),
                T(9, "교육 과정 안내문", "edu", "todo", "normal", null, "m3", "강의"),
                T(12, "레벨 디자인 검토", "game", "todo", "high", -5, "m3"),
                T(15, "서버 비용 점검", "ops", "todo", "normal", null, "m1"),
                T(-8, "지난달 정산", "ops", "done", "normal", null, "m2"),
                T(-6, "랜딩 문구 고침", "web", "done", "normal", null, "m1"),
                T(18, "모션 그래픽 시안", "game", "todo", "normal", null, "m3", "영상"),
                T(18, "강의 피드백 정리", "edu", "todo", "normal", null, "m3", "강의"),
                T(18, "홈페이지 점검", "web", "todo", "normal", null, "m1"),
                T(18, "장비 반납", "ops", "todo", "normal", null, "m2"),
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
            // --cache : 보기 자료 대신 이 PC 에 저장된 실제 작업 사본(로그인한 경우)
            bool real = args.Contains("--cache");
            var c = new Controller(!real);
            c.Settings.Appearance = Arg("--theme", "dark");
            // --wide : 넓게 펼친 화면(--scale 은 그 화면의 크기, 기본 1.25)
            if (args.Contains("--wide"))
            {
                c.Settings.Layout = "wide";
                c.Settings.WideScale = double.Parse(Arg("--scale", "1.25"), CultureInfo.InvariantCulture);
            }
            else c.Settings.Scale = double.Parse(Arg("--scale", "1.5"), CultureInfo.InvariantCulture);
            // --update-ready : 새 판이 나왔을 때의 업데이트 단추
            if (args.Contains("--update-ready")) c.DemoUpdate("1.0.2");
            c.Settings.WeekNumbers = args.Contains("--weeks");
            // 점검용 설정: --scope all · --color domain|label|member · --transparency 0~2 · --upcoming N · --no-outline · --no-summary
            c.Settings.Scope = Arg("--scope", "mine");
            c.Settings.ColorBy = Arg("--color", "domain");
            c.Settings.Transparency = int.Parse(Arg("--transparency", "1"), CultureInfo.InvariantCulture);
            c.Settings.UpcomingDays = int.Parse(Arg("--upcoming", "7"), CultureInfo.InvariantCulture);
            c.Settings.MonthOutline = !args.Contains("--no-outline");
            c.Settings.Summary = !args.Contains("--no-summary");
            c.Settings.Locked = args.Contains("--locked");
            // --work <높이> 또는 <폭>x<높이>(DIP) : 작업 영역(작은 노트북 화면 흉내)
            var workArg = Arg("--work", "");
            if (workArg != "") WidgetWindow.SetWorkOverride(workArg);
            // --state login|loading|error : 로그인 전 · 읽는 중 · 서버 오류 화면
            switch (Arg("--state", ""))
            {
                case "login": c.DemoSignedOut = true; break;
                case "loading": c.DemoState(false, null); break;
                case "error": c.DemoState(true, "서버에 닿지 않습니다. 인터넷 연결을 확인해 주세요."); break;
            }

            if (real) c.LoadCacheForSnapshot();

            var w = new WidgetWindow(c);
            // --select +N(오늘부터 며칠 뒤) 또는 yyyy-MM-dd : 고른 날
            var sel = Arg("--select", "");
            if (sel != "")
            {
                var d = sel.StartsWith("+") || sel.StartsWith("-")
                    ? DateTime.Today.AddDays(int.Parse(sel, CultureInfo.InvariantCulture))
                    : DateTime.ParseExact(sel, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                w.SelectForSnapshot(d);
            }
            var root = (FrameworkElement)w.Content;
            w.Content = null;

            // --backdrop x,y : 그 화면 자리의 바탕화면 그림으로 흐린 바탕을 깐다
            var bd = Arg("--backdrop", "");
            if (bd != "")
            {
                var xy = bd.Split(',').Select(v => int.Parse(v, CultureInfo.InvariantCulture)).ToArray();
                root.Measure(new Size(double.PositiveInfinity, double.PositiveInfinity));
                var sz = root.DesiredSize;
                double k = c.Settings.ActiveScale; // 100% 배율 화면 기준
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
