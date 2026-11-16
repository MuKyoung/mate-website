using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Threading;

namespace MateCalendar
{
    /// <summary>
    /// 창을 '바탕화면 위젯'으로 둔다 - 늘 다른 창들 아래, 바탕화면 그림 · 아이콘 바로 위.
    ///
    /// - HWND_BOTTOM 으로 내리면 Windows 가 바탕화면 창(Progman) 바로 위에 놓는다(이 PC 에서 z 순서로 확인).
    ///   z 순서가 바뀔 때마다(WM_WINDOWPOSCHANGING) 다시 맨 아래로 돌린다.
    /// - 눌러도 앞으로 나오지 않게 활성화하지 않는다(WS_EX_NOACTIVATE). 작업 표시줄 · Alt+Tab 에도 없다(WS_EX_TOOLWINDOW).
    /// - '바탕 화면 보기'(Win+D)는 바탕화면 창을 다른 창들 위로 올려 위젯까지 가린다. Rainmeter 의 'On Desktop' 처럼
    ///   앞 창이 바탕화면으로 바뀌고 바탕화면 창이 위젯보다 위에 있으면 잠깐 맨 위로 올리고, 다른 창이 앞으로 오면 되돌린다.
    /// - 작업 표시줄 끝의 '바탕 화면 미리 보기'(Aero Peek)에서도 남게 한다.
    /// </summary>
    internal sealed class DesktopPin : IDisposable
    {
        private readonly Window _window;
        private IntPtr _hwnd;
        private IntPtr _hook;
        private Native.WinEventDelegate? _proc; // 가비지 수집에 지워지지 않게 붙들어 둔다
        private bool _raised;
        private readonly uint _pid = (uint)Process.GetCurrentProcess().Id;

        public DesktopPin(Window window)
        {
            _window = window;
            window.SourceInitialized += (s, e) => Attach();
        }

        private void Attach()
        {
            _hwnd = new WindowInteropHelper(_window).Handle;
            int ex = Native.GetWindowLong(_hwnd, Native.GWL_EXSTYLE);
            ex |= Native.WS_EX_TOOLWINDOW | Native.WS_EX_NOACTIVATE;
            ex &= ~Native.WS_EX_APPWINDOW;
            Native.SetWindowLong(_hwnd, Native.GWL_EXSTYLE, ex);

            int on = 1;
            Native.DwmSetWindowAttribute(_hwnd, Native.DWMWA_EXCLUDED_FROM_PEEK, ref on, sizeof(int));

            HwndSource.FromHwnd(_hwnd)?.AddHook(WndProc);
            _proc = OnWinEvent;
            _hook = Native.SetWinEventHook(Native.EVENT_SYSTEM_FOREGROUND, Native.EVENT_SYSTEM_FOREGROUND, IntPtr.Zero, _proc, 0, 0,
                Native.WINEVENT_OUTOFCONTEXT);
            ToBottom();
        }

        public void ToBottom()
        {
            if (_hwnd == IntPtr.Zero || _raised) return;
            Native.SetWindowPos(_hwnd, Native.HWND_BOTTOM, 0, 0, 0, 0,
                Native.SWP_NOMOVE | Native.SWP_NOSIZE | Native.SWP_NOACTIVATE | Native.SWP_NOOWNERZORDER);
        }

        /// <summary>
        /// 맨 위로 올려 보여 준다(바탕 화면 보기 · 시작 메뉴에서 다시 열었을 때). 다른 창을 누르면 다시 내려간다.
        /// grace 동안은 앞 창이 바뀌어도 내리지 않는다 - 시작 메뉴가 닫히며 앞 창이 돌아오는 것에 바로 내려가지 않게
        /// </summary>
        public void Peek(double graceSeconds = 0)
        {
            if (_hwnd == IntPtr.Zero) return;
            _raised = true;
            if (graceSeconds > 0) _graceUntil = DateTime.UtcNow.AddSeconds(graceSeconds);
            Native.SetWindowPos(_hwnd, Native.HWND_TOPMOST, 0, 0, 0, 0, Native.SWP_NOMOVE | Native.SWP_NOSIZE | Native.SWP_NOACTIVATE);
        }

        private DateTime _graceUntil;

        private void Lower()
        {
            if (!_raised || DateTime.UtcNow < _graceUntil) return;
            _raised = false;
            Native.SetWindowPos(_hwnd, Native.HWND_NOTOPMOST, 0, 0, 0, 0, Native.SWP_NOMOVE | Native.SWP_NOSIZE | Native.SWP_NOACTIVATE);
            ToBottom();
        }

        private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == Native.WM_WINDOWPOSCHANGING && !_raised)
            {
                var pos = Marshal.PtrToStructure<Native.WINDOWPOS>(lParam);
                if ((pos.flags & Native.SWP_NOZORDER) == 0 && pos.hwndInsertAfter != Native.HWND_BOTTOM)
                {
                    pos.hwndInsertAfter = Native.HWND_BOTTOM;
                    Marshal.StructureToPtr(pos, lParam, false);
                }
            }
            else if (msg == Native.WM_MOUSEACTIVATE)
            {
                handled = true;
                return new IntPtr(Native.MA_NOACTIVATE);
            }
            return IntPtr.Zero;
        }

        private void OnWinEvent(IntPtr hook, uint ev, IntPtr hwnd, int idObject, int idChild, uint thread, uint time)
        {
            if (hwnd == IntPtr.Zero) return;
            Native.GetWindowThreadProcessId(hwnd, out var pid);
            if (pid == _pid) return; // 내 메뉴 · 로그인 창
            var cls = Native.ClassOf(hwnd);
            if (cls == "WorkerW" || cls == "Progman")
            {
                // 바탕화면이 앞으로 왔다 - Win+D 로 올라왔는지는 z 순서가 자리 잡은 뒤에 본다
                _window.Dispatcher.BeginInvoke(new Action(async () =>
                {
                    await System.Threading.Tasks.Task.Delay(120);
                    if (DesktopAbove()) Peek();
                }), DispatcherPriority.Background);
            }
            else if (cls != "Shell_TrayWnd" && cls != "Shell_SecondaryTrayWnd" && cls != "NotifyIconOverflowWindow"
                     && cls != "TopLevelWindowForOverflowXamlIsland" && cls != "XamlExplorerHostIslandWindow")
            {
                _window.Dispatcher.BeginInvoke(new Action(Lower), DispatcherPriority.Background);
            }
        }

        /// <summary>바탕화면 아이콘 창이 위젯보다 위에 있나 - 그렇다면 위젯이 가려졌다</summary>
        private bool DesktopAbove()
        {
            var desk = Native.DesktopHost();
            if (desk == IntPtr.Zero) return false;
            for (var h = Native.GetWindow(_hwnd, Native.GW_HWNDPREV); h != IntPtr.Zero; h = Native.GetWindow(h, Native.GW_HWNDPREV))
            {
                if (h == desk) return true;
            }
            return false;
        }

        public void Dispose()
        {
            if (_hook != IntPtr.Zero) Native.UnhookWinEvent(_hook);
            _hook = IntPtr.Zero;
        }
    }
}
