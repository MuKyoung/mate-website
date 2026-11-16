using System;
using System.Windows;
using System.Windows.Media;
using Microsoft.Win32;

namespace MateCalendar
{
    /// <summary>
    /// 색과 글꼴. 생김새는 Calendr(github.com/pakerwreah/Calendr, MIT)의 macOS 팝오버를 그대로 옮겼다 -
    /// 글자 색은 macOS 의 의미 색(label · secondaryLabel …)과 같은 값, 강조는 시스템 파랑, 일정 색은 Apple 시스템 색.
    /// Hub 의 팔레트 이름(blue · violet · teal …)을 같은 계열의 시스템 색으로 옮긴다.
    /// </summary>
    internal sealed class Theme
    {
        public bool Dark { get; }
        public Color Header { get; }      // headerTextColor
        public Color Label { get; }       // labelColor
        public Color Secondary { get; }   // secondaryLabelColor
        public Color Tertiary { get; }    // tertiaryLabelColor
        public Color Quaternary { get; }  // quaternaryLabelColor
        public Color Accent { get; }      // controlAccentColor
        public Color Red { get; }         // systemRed
        public Color Tint { get; }        // 흐린 바탕 위에 덮는 판(투명도마다 알파가 다르다)
        public Color Fallback { get; }    // 바탕화면 그림을 못 읽었을 때의 바탕
        public Color Border { get; }
        public Color Hover { get; }       // 일정 줄에 마우스를 올렸을 때 - NSColor.gray 20%
        public Color MenuBg { get; }
        public Color MenuBorder { get; }

        private Theme(bool dark, int transparency)
        {
            Dark = dark;
            // 투명도 0(낮음) · 1(보통) · 2(높음)
            byte[] darkAlpha = { 0xE6, 0xB8, 0x80 };
            byte[] lightAlpha = { 0xEB, 0xC2, 0x8C };
            int t = Math.Max(0, Math.Min(2, transparency));
            if (dark)
            {
                Header = Color.FromArgb(0xFF, 0xFF, 0xFF, 0xFF);
                Label = Color.FromArgb(0xD8, 0xFF, 0xFF, 0xFF);
                Secondary = Color.FromArgb(0x8C, 0xFF, 0xFF, 0xFF);
                Tertiary = Color.FromArgb(0x3F, 0xFF, 0xFF, 0xFF);
                Quaternary = Color.FromArgb(0x19, 0xFF, 0xFF, 0xFF);
                Accent = Color.FromRgb(0x0A, 0x84, 0xFF);
                Red = Color.FromRgb(0xFF, 0x45, 0x3A);
                Tint = Color.FromArgb(darkAlpha[t], 0x24, 0x24, 0x26);
                Fallback = Color.FromRgb(0x2B, 0x2B, 0x2E);
                Border = Color.FromArgb(0x2E, 0xFF, 0xFF, 0xFF);
                Hover = Color.FromArgb(0x33, 0x80, 0x80, 0x80);
                MenuBg = Color.FromArgb(0xF2, 0x2A, 0x2A, 0x2D);
                MenuBorder = Color.FromArgb(0x33, 0xFF, 0xFF, 0xFF);
            }
            else
            {
                Header = Color.FromArgb(0xD8, 0x00, 0x00, 0x00);
                Label = Color.FromArgb(0xD8, 0x00, 0x00, 0x00);
                Secondary = Color.FromArgb(0x7F, 0x00, 0x00, 0x00);
                Tertiary = Color.FromArgb(0x42, 0x00, 0x00, 0x00);
                Quaternary = Color.FromArgb(0x19, 0x00, 0x00, 0x00);
                Accent = Color.FromRgb(0x00, 0x7A, 0xFF);
                Red = Color.FromRgb(0xFF, 0x3B, 0x30);
                Tint = Color.FromArgb(lightAlpha[t], 0xF4, 0xF4, 0xF6);
                Fallback = Color.FromRgb(0xEC, 0xEC, 0xEF);
                Border = Color.FromArgb(0x24, 0x00, 0x00, 0x00);
                Hover = Color.FromArgb(0x33, 0x80, 0x80, 0x80);
                MenuBg = Color.FromArgb(0xF5, 0xF6, 0xF6, 0xF8);
                MenuBorder = Color.FromArgb(0x26, 0x00, 0x00, 0x00);
            }
        }

        /// <summary>appearance: system · dark · light</summary>
        public static Theme Create(string appearance, int transparency)
        {
            bool dark = appearance == "dark" || (appearance != "light" && SystemIsDark());
            return new Theme(dark, transparency);
        }

        /// <summary>Windows '앱 모드' - 밝게/어둡게</summary>
        public static bool SystemIsDark()
        {
            try
            {
                using var k = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Themes\Personalize");
                return k?.GetValue("AppsUseLightTheme") is int v && v == 0;
            }
            catch { return false; }
        }

        /// <summary>
        /// Hub 의 색 이름 → 일정 색. Hub 의 진한 색은 밝은 카드용이라 흐린 유리 위에서 어둡다 -
        /// Calendr 가 쓰는 Apple 시스템 색(어둡게/밝게 따로)으로 옮긴다.
        /// </summary>
        public Color Paint(string? name)
        {
            switch (name)
            {
                case "blue": return Dark ? Rgb(0x0A84FF) : Rgb(0x007AFF);
                case "violet": return Dark ? Rgb(0xBF5AF2) : Rgb(0xAF52DE);
                case "teal": return Dark ? Rgb(0x63E6E2) : Rgb(0x00C7BE);
                case "pink": return Dark ? Rgb(0xFF375F) : Rgb(0xFF2D55);
                case "sky": return Dark ? Rgb(0x64D2FF) : Rgb(0x32ADE6);
                case "plum": return Dark ? Rgb(0xE66BD8) : Rgb(0xC93BB9);
                case "brown": return Dark ? Rgb(0xAC8E68) : Rgb(0xA2845E);
                default: return Dark ? Rgb(0x98989D) : Rgb(0x8E8E93); // gray · 모름
            }
        }

        public static Color Rgb(int rgb) => Color.FromRgb((byte)(rgb >> 16), (byte)(rgb >> 8), (byte)rgb);

        public static SolidColorBrush Brush(Color c)
        {
            var b = new SolidColorBrush(c);
            b.Freeze();
            return b;
        }

        public static Color WithAlpha(Color c, double alpha) => Color.FromArgb((byte)Math.Round(255 * alpha), c.R, c.G, c.B);

        public static string Hex(Color c) => $"#{c.A:X2}{c.R:X2}{c.G:X2}{c.B:X2}";

        // ── 글꼴 ── Hub 와 같은 Pretendard(OFL). 없는 글자는 맑은 고딕 · Segoe UI 로
        private static FontFamily? _font;
        public static FontFamily Font => _font ??= new FontFamily(new Uri("pack://application:,,,/"),
            "./Fonts/#Pretendard, Malgun Gothic, Segoe UI");

        public static readonly FontWeight Regular = FontWeights.Normal;
        public static readonly FontWeight Medium = FontWeights.Medium;
        public static readonly FontWeight Bold = FontWeights.Bold;
    }
}
