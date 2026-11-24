using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading;
using Microsoft.Win32;

namespace MateCalendar
{
    /// <summary>
    /// 내 계정에만 까는 설치(관리자 권한 없음). 받은 exe 가 스스로를 %LOCALAPPDATA%\Programs\MATE Calendar 로 옮기고,
    /// 시작 메뉴 바로 가기 · 'Windows 시작 시 실행' · '설치된 앱' 목록(지우기)을 만든다.
    /// </summary>
    internal static class Installer
    {
        public const string DisplayName = "MATE 캘린더";
        private const string UninstallKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\MateCalendar";
        private const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";
        private const string RunName = "MATE Calendar";
        public const string ExitEvent = @"Local\MateCalendar.Exit";
        public const string ShowEvent = @"Local\MateCalendar.Show";
        public const string MutexName = @"Local\MateCalendar.Widget";

        public static string Dir => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "MATE Calendar");
        public static string Exe => Path.Combine(Dir, "MateCalendar.exe");
        public static string Self => Assembly.GetExecutingAssembly().Location;
        private static string StartMenuLink => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), DisplayName + ".lnk");

        public static bool IsInstalledCopy => string.Equals(Path.GetFullPath(Self), Path.GetFullPath(Exe), StringComparison.OrdinalIgnoreCase);

        public static Version? InstalledVersion()
        {
            try
            {
                if (!File.Exists(Exe)) return null;
                var v = FileVersionInfo.GetVersionInfo(Exe).FileVersion;
                return Version.TryParse(v, out var ver) ? ver : null;
            }
            catch { return null; }
        }

        private static string StartupLink => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Startup), DisplayName + ".lnk");

        /// <summary>
        /// 'Windows 시작 시 실행'. 레지스트리 Run 값을 먼저 쓰고, 백신 등이 막으면 시작프로그램 폴더 바로 가기로 대신한다.
        /// 끌 때는 둘 다 지운다. 둘 다 막히면 false 를 돌려준다
        /// </summary>
        public static bool AutoStart
        {
            get
            {
                try
                {
                    using var k = Registry.CurrentUser.OpenSubKey(RunKey);
                    if (k?.GetValue(RunName) != null) return true;
                }
                catch { /* 읽기 막힘 */ }
                return File.Exists(StartupLink);
            }
            set => SetAutoStart(value);
        }

        /// <summary>켜기는 둘 중 하나로 켜졌을 때, 끄기는 둘 다 없어졌을 때 true</summary>
        public static bool SetAutoStart(bool on)
        {
            bool run = false;
            try
            {
                using var k = Registry.CurrentUser.CreateSubKey(RunKey);
                if (on) k.SetValue(RunName, $"\"{Exe}\" --autostart");
                else k.DeleteValue(RunName, false);
                run = true;
            }
            catch (Exception e) { Program.Log("autostart(run): " + e.Message); }

            bool link = false;
            try
            {
                if (on && !run) link = MakeShortcut(StartupLink, Exe, "MATE 캘린더 자동 실행", "--autostart");
                else if (File.Exists(StartupLink)) File.Delete(StartupLink); // 끌 때, 또는 Run 값을 썼으면 겹치지 않게
            }
            catch (Exception e) { Program.Log("autostart(link): " + e.Message); }

            if (on) return run || link;
            // 끄기는 실제로 둘 다 없어졌는지 다시 본다(지우다 막혔으면 다음 로그인에 또 켜진다)
            bool runLeft;
            try
            {
                using var k = Registry.CurrentUser.OpenSubKey(RunKey);
                runLeft = k?.GetValue(RunName) != null;
            }
            catch { runLeft = !run; }
            return !runLeft && !File.Exists(StartupLink);
        }

        /// <summary>
        /// 설치 · 업데이트. 새 파일을 설치 폴더에 먼저 옮겨 둔 뒤(여기서 실패하면 쓰던 위젯은 그대로 돈다)
        /// 돌고 있는 위젯을 끄고 바꿔 끼운다. 바꿔 끼우다 실패하면 옛 파일을 되돌려 놓고 예외를 넘긴다.
        /// 자동 실행을 못 켰으면 false
        /// </summary>
        public static bool Install(bool autostart)
        {
            Directory.CreateDirectory(Dir);
            var next = Exe + ".new";
            var old = Exe + ".old";
            File.Copy(Self, next, true);
            StopRunning();
            try
            {
                for (int i = 0; ; i++)
                {
                    try
                    {
                        if (File.Exists(Exe)) File.Replace(next, Exe, old, true);
                        else File.Move(next, Exe);
                        break;
                    }
                    catch (Exception e) when ((e is IOException || e is UnauthorizedAccessException) && i < 20)
                    {
                        Thread.Sleep(250); // 꺼지는 중인 옛 위젯이 파일을 놓을 때까지
                    }
                }
            }
            catch
            {
                // 옛 파일만 옮겨지고 새 파일이 못 들어간 경우 - 옛 판을 제자리로
                try { if (!File.Exists(Exe) && File.Exists(old)) File.Move(old, Exe); } catch { /* 그대로 */ }
                try { File.Delete(next); } catch { /* 그대로 */ }
                throw;
            }
            try { File.Delete(old); } catch { /* 다음 업데이트 때 덮인다 */ }
            // 인터넷에서 받은 표시(Zone.Identifier)를 지워 설치한 뒤에는 SmartScreen 이 다시 묻지 않게
            try { File.Delete(Exe + ":Zone.Identifier"); } catch { /* 없으면 그만 */ }

            MakeShortcut(StartMenuLink, Exe, "Hub 의 내 작업을 바탕화면 캘린더로 봅니다");
            bool auto = SetAutoStart(autostart);

            // '설치된 앱' 목록 - 못 쓰면 위젯 메뉴의 '지우기'로 지운다
            try
            {
                using var k = Registry.CurrentUser.CreateSubKey(UninstallKey);
                k.SetValue("DisplayName", DisplayName);
                k.SetValue("DisplayVersion", Program.Version);
                k.SetValue("Publisher", "MATE");
                k.SetValue("DisplayIcon", Exe + ",0");
                k.SetValue("InstallLocation", Dir);
                k.SetValue("UninstallString", $"\"{Exe}\" --uninstall");
                k.SetValue("URLInfoAbout", "https://devteammate.co.kr/hub/");
                k.SetValue("NoModify", 1, RegistryValueKind.DWord);
                k.SetValue("NoRepair", 1, RegistryValueKind.DWord);
                k.SetValue("EstimatedSize", (int)(new FileInfo(Exe).Length / 1024), RegistryValueKind.DWord);
            }
            catch (Exception e) { Program.Log("uninstall entry: " + e.Message); }
            return auto;
        }

        /// <summary>돌고 있는 위젯에 끄라고 알리고 기다린다. 5초 안에 안 꺼지면 끝낸다</summary>
        public static void StopRunning()
        {
            try
            {
                if (EventWaitHandle.TryOpenExisting(ExitEvent, out var ev))
                {
                    ev.Set();
                    ev.Dispose();
                }
            }
            catch { /* 없음 */ }

            var me = Process.GetCurrentProcess().Id;
            var deadline = DateTime.UtcNow.AddSeconds(5);
            while (DateTime.UtcNow < deadline)
            {
                if (!Others(me).Any()) return;
                Thread.Sleep(150);
            }
            foreach (var p in Others(me))
            {
                try { p.Kill(); p.WaitForExit(2000); } catch { /* 이미 꺼짐 */ }
            }
        }

        /// <summary>이 프로세스 말고 위젯이 돌고 있나(업데이트가 옛 위젯을 끄기 전에 실패했을 때)</summary>
        public static bool OthersRunning() => Others(Process.GetCurrentProcess().Id).Length > 0;

        private static Process[] Others(int me) =>
            Process.GetProcessesByName("MateCalendar").Where(p => p.Id != me).ToArray();

        /// <summary>'설치된 앱'에서 지우기 - 위젯 · 바로 가기 · 자동 실행 · 로그인 정보 · 설치 폴더</summary>
        public static void Uninstall()
        {
            StopRunning();
            SetAutoStart(false);
            try { File.Delete(StartMenuLink); } catch { /* 없음 */ }
            try { Registry.CurrentUser.DeleteSubKeyTree(UninstallKey, false); } catch { /* 없음 */ }
            try { if (Directory.Exists(Settings.Dir)) Directory.Delete(Settings.Dir, true); } catch { /* 쓰는 중 */ }
            // 지금 도는 exe 는 지울 수 없어 잠시 뒤 cmd 가 폴더를 지운다
            try
            {
                Process.Start(new ProcessStartInfo("cmd.exe", $"/c ping 127.0.0.1 -n 3 > nul & rmdir /s /q \"{Dir}\"")
                {
                    CreateNoWindow = true, UseShellExecute = false, WindowStyle = ProcessWindowStyle.Hidden,
                });
            }
            catch { /* 폴더는 남는다 */ }
        }

        private static bool MakeShortcut(string link, string target, string description, string arguments = "")
        {
            try
            {
                var type = Type.GetTypeFromProgID("WScript.Shell");
                if (type == null) return false;
                dynamic shell = Activator.CreateInstance(type)!;
                dynamic lnk = shell.CreateShortcut(link);
                lnk.TargetPath = target;
                lnk.Arguments = arguments;
                lnk.WorkingDirectory = Path.GetDirectoryName(target);
                lnk.IconLocation = target + ",0";
                lnk.Description = description;
                lnk.Save();
                return File.Exists(link);
            }
            catch (Exception e)
            {
                Program.Log("shortcut: " + e.Message);
                return false;
            }
        }
    }
}
