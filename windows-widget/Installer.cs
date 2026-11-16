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

        public static bool SetAutoStart(bool on)
        {
            bool ok = false;
            try
            {
                using var k = Registry.CurrentUser.CreateSubKey(RunKey);
                if (on) k.SetValue(RunName, $"\"{Exe}\" --autostart");
                else k.DeleteValue(RunName, false);
                ok = true;
            }
            catch (Exception e) { Program.Log("autostart(run): " + e.Message); }

            try
            {
                if (on && !ok) ok = MakeShortcut(StartupLink, Exe, "MATE 캘린더 자동 실행", "--autostart");
                else if (!on && File.Exists(StartupLink)) File.Delete(StartupLink);
                else if (on && File.Exists(StartupLink)) File.Delete(StartupLink); // Run 값을 썼으면 바로 가기는 겹치지 않게
            }
            catch (Exception e) { Program.Log("autostart(link): " + e.Message); }
            return ok || !on;
        }

        /// <summary>설치 · 업데이트. 돌고 있는 위젯은 먼저 끈다. 자동 실행을 못 켰으면 false</summary>
        public static bool Install(bool autostart)
        {
            StopRunning();
            Directory.CreateDirectory(Dir);
            for (int i = 0; ; i++)
            {
                try
                {
                    File.Copy(Self, Exe, true);
                    break;
                }
                catch (IOException) when (i < 20)
                {
                    Thread.Sleep(250); // 꺼지는 중인 옛 위젯이 파일을 놓을 때까지
                }
            }
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
