using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Media.Imaging;

namespace MateCalendar
{
    /// <summary>
    /// 위젯 뒤에 깔 '흐린 유리'. 위젯은 늘 바탕화면 바로 위(다른 창 아래)에 있어서 뒤에 보이는 것은 바탕화면 그림뿐이다 -
    /// 그 그림에서 위젯 자리만 잘라 흐리게 하고 채도를 조금 올려 macOS 의 vibrancy 처럼 깐다.
    /// Windows 의 아크릴 · 미카 바탕은 창이 비활성이면 단색으로 바뀌어(위젯은 늘 비활성) 쓰지 않는다.
    /// </summary>
    internal static class Backdrop
    {
        [ComImport, Guid("B92B56A9-8B55-4E14-9A89-0199BBB6F93B"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
        private interface IDesktopWallpaper
        {
            void SetWallpaper([MarshalAs(UnmanagedType.LPWStr)] string? monitorID, [MarshalAs(UnmanagedType.LPWStr)] string wallpaper);
            [return: MarshalAs(UnmanagedType.LPWStr)] string GetWallpaper([MarshalAs(UnmanagedType.LPWStr)] string? monitorID);
            [return: MarshalAs(UnmanagedType.LPWStr)] string GetMonitorDevicePathAt(uint monitorIndex);
            uint GetMonitorDevicePathCount();
            Native.RECT GetMonitorRECT([MarshalAs(UnmanagedType.LPWStr)] string monitorID);
            void SetBackgroundColor(uint color);
            uint GetBackgroundColor();
            void SetPosition(int position);
            int GetPosition();
        }

        [ComImport, Guid("C2CF3110-460E-4fc1-B9D0-8A1C0C9CC4BD")]
        private class DesktopWallpaperClass { }

        private const int Center = 0, Tile = 1, Stretch = 2, Fit = 3, Fill = 4, Span = 5;

        private sealed class Source
        {
            public string Path = "";
            public DateTime Stamp;
            public BitmapSource? Image;
            public int PixelWidth, PixelHeight;
        }

        private static Source? _cache;

        /// <summary>
        /// 화면 좌표(물리 픽셀)의 card 자리에 깔 흐린 그림. 못 만들면 null(테마의 단색 바탕을 쓴다).
        /// blurPx 는 화면 픽셀 기준 흐림 반지름.
        /// </summary>
        public static BitmapSource? Make(Native.RECT card, double blurPx)
        {
            try
            {
                if (card.Width <= 0 || card.Height <= 0) return null;
                var mon = Native.MonitorAt(card.Left + card.Width / 2, card.Top + card.Height / 2).rcMonitor;
                ReadSettings(mon, out var path, out var position, out var bg);

                var src = Load(path);
                // 그림을 못 읽으면 바탕색만 - 그래도 흐린 유리 대신 바탕화면 색이 비친다
                var bgBrush = new SolidColorBrush(bg);
                bgBrush.Freeze();

                // 반만 한 크기로 그리고 흐린 뒤 늘린다 - 흐림이 크면 차이가 보이지 않고 네 배 빠르다
                const double f = 0.5;
                int pad = (int)Math.Ceiling(blurPx * 1.6);
                int w = (int)Math.Ceiling((card.Width + 2 * pad) * f), h = (int)Math.Ceiling((card.Height + 2 * pad) * f);

                var dv = new DrawingVisual();
                using (var dc = dv.RenderOpen())
                {
                    dc.DrawRectangle(bgBrush, null, new Rect(0, 0, w, h));
                    dc.PushTransform(new ScaleTransform(f, f));
                    dc.PushTransform(new TranslateTransform(-(card.Left - pad), -(card.Top - pad)));
                    if (src?.Image != null)
                    {
                        var area = position == Span ? VirtualScreen() : ToRect(mon);
                        if (position == Tile)
                        {
                            var brush = new ImageBrush(src.Image)
                            {
                                TileMode = TileMode.Tile, Stretch = System.Windows.Media.Stretch.Fill, ViewportUnits = BrushMappingMode.Absolute,
                                Viewport = new Rect(area.X, area.Y, src.PixelWidth, src.PixelHeight),
                            };
                            dc.DrawRectangle(brush, null, area);
                        }
                        else
                        {
                            dc.PushClip(new RectangleGeometry(area));
                            dc.DrawImage(src.Image, Place(position, area, src.PixelWidth, src.PixelHeight));
                            dc.Pop();
                        }
                    }
                    dc.Pop();
                    dc.Pop();
                }
                var scene = new RenderTargetBitmap(w, h, 96, 96, PixelFormats.Pbgra32);
                scene.Render(dv);

                var img = new Image
                {
                    Source = scene, Width = w, Height = h,
                    Effect = new BlurEffect { Radius = blurPx * f, KernelType = KernelType.Gaussian, RenderingBias = RenderingBias.Quality },
                };
                var host = new Grid { Width = w, Height = h, Background = bgBrush };
                host.Children.Add(img);
                host.Measure(new Size(w, h));
                host.Arrange(new Rect(0, 0, w, h));
                host.UpdateLayout();
                var blurred = new RenderTargetBitmap(w, h, 96, 96, PixelFormats.Pbgra32);
                blurred.Render(host);

                int cx = (int)Math.Round(pad * f), cy = (int)Math.Round(pad * f);
                int cw = Math.Max(1, Math.Min(w - cx, (int)Math.Round(card.Width * f)));
                int ch = Math.Max(1, Math.Min(h - cy, (int)Math.Round(card.Height * f)));
                return Saturate(new CroppedBitmap(blurred, new Int32Rect(cx, cy, cw, ch)), 1.45);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>바탕화면 그림이 바뀌었는지 볼 때 쓰는 값</summary>
        public static string Signature(Native.RECT card)
        {
            try
            {
                var mon = Native.MonitorAt(card.Left + card.Width / 2, card.Top + card.Height / 2).rcMonitor;
                ReadSettings(mon, out var path, out var position, out var bg);
                var stamp = File.Exists(path) ? File.GetLastWriteTimeUtc(path).Ticks : 0;
                return $"{path}|{stamp}|{position}|{bg}";
            }
            catch { return ""; }
        }

        private static void ReadSettings(Native.RECT mon, out string path, out int position, out Color bg)
        {
            path = "";
            position = Fill;
            bg = Colors.Black;
            object? com = null;
            try
            {
                com = new DesktopWallpaperClass();
                var dw = (IDesktopWallpaper)com;
                string? id = null;
                uint n = dw.GetMonitorDevicePathCount();
                for (uint i = 0; i < n && id == null; i++)
                {
                    try
                    {
                        var mid = dw.GetMonitorDevicePathAt(i);
                        var r = dw.GetMonitorRECT(mid);
                        if (r.Left == mon.Left && r.Top == mon.Top && r.Right == mon.Right && r.Bottom == mon.Bottom) id = mid;
                    }
                    catch { /* 꺼진 모니터 */ }
                }
                try { path = dw.GetWallpaper(id) ?? ""; } catch { path = ""; }
                try { position = dw.GetPosition(); } catch { position = Fill; }
                try
                {
                    uint c = dw.GetBackgroundColor(); // 0x00BBGGRR
                    bg = Color.FromRgb((byte)(c & 0xFF), (byte)((c >> 8) & 0xFF), (byte)((c >> 16) & 0xFF));
                }
                catch { /* 검정 */ }
            }
            catch { /* Windows 8 전 · COM 막힘 - 아래 대체 길 */ }
            finally
            {
                if (com != null) Marshal.ReleaseComObject(com);
            }

            bool picture = path != "";
            if (!File.Exists(path))
            {
                var sb = new StringBuilder(520);
                if (Native.SystemParametersInfo(Native.SPI_GETDESKWALLPAPER, sb.Capacity, sb, 0)) path = sb.ToString();
                picture |= path != "";
            }
            // 두 길 모두 그림 경로가 비었으면 단색 바탕화면이다 - 남아 있는 옛 TranscodedWallpaper 를 깔지 않는다
            if (!picture) path = "";
            else if (!File.Exists(path))
            {
                // 슬라이드 쇼 · Windows 추천(Spotlight)은 지금 보이는 그림을 여기에 둔다
                var t = System.IO.Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    @"Microsoft\Windows\Themes\TranscodedWallpaper");
                path = File.Exists(t) ? t : "";
            }
        }

        private static Source? Load(string path)
        {
            if (path == "" || !File.Exists(path)) return null;
            var stamp = File.GetLastWriteTimeUtc(path);
            if (_cache != null && _cache.Path == path && _cache.Stamp == stamp) return _cache;
            try
            {
                var bytes = File.ReadAllBytes(path);
                int pw, ph;
                using (var ms = new MemoryStream(bytes))
                {
                    var dec = BitmapDecoder.Create(ms, BitmapCreateOptions.IgnoreColorProfile | BitmapCreateOptions.DelayCreation, BitmapCacheOption.None);
                    pw = dec.Frames[0].PixelWidth;
                    ph = dec.Frames[0].PixelHeight;
                }
                var bi = new BitmapImage();
                bi.BeginInit();
                bi.CacheOption = BitmapCacheOption.OnLoad;
                bi.CreateOptions = BitmapCreateOptions.IgnoreColorProfile;
                bi.StreamSource = new MemoryStream(bytes);
                // 흐리게 쓸 그림이라 크게 읽을 필요가 없다
                if (pw > 1600) bi.DecodePixelWidth = 1600;
                bi.EndInit();
                bi.Freeze();
                _cache = new Source { Path = path, Stamp = stamp, Image = bi, PixelWidth = pw, PixelHeight = ph };
                return _cache;
            }
            catch
            {
                return null;
            }
        }

        private static Rect Place(int position, Rect area, double iw, double ih)
        {
            switch (position)
            {
                case Stretch:
                    return area;
                case Center:
                    return new Rect(area.X + (area.Width - iw) / 2, area.Y + (area.Height - ih) / 2, iw, ih);
                case Fit:
                {
                    double s = Math.Min(area.Width / iw, area.Height / ih);
                    return new Rect(area.X + (area.Width - iw * s) / 2, area.Y + (area.Height - ih * s) / 2, iw * s, ih * s);
                }
                default: // Fill · Span
                {
                    double s = Math.Max(area.Width / iw, area.Height / ih);
                    return new Rect(area.X + (area.Width - iw * s) / 2, area.Y + (area.Height - ih * s) / 2, iw * s, ih * s);
                }
            }
        }

        private static Rect ToRect(Native.RECT r) => new Rect(r.Left, r.Top, r.Width, r.Height);

        private static Rect VirtualScreen()
        {
            var v = System.Windows.Forms.SystemInformation.VirtualScreen;
            return new Rect(v.X, v.Y, v.Width, v.Height);
        }

        /// <summary>채도를 올린다 - macOS 유리의 맑은 색감</summary>
        private static BitmapSource Saturate(BitmapSource src, double k)
        {
            var conv = new FormatConvertedBitmap(src, PixelFormats.Bgra32, null, 0);
            int w = conv.PixelWidth, h = conv.PixelHeight, stride = w * 4;
            var px = new byte[stride * h];
            conv.CopyPixels(px, stride, 0);
            for (int i = 0; i < px.Length; i += 4)
            {
                double b = px[i], g = px[i + 1], r = px[i + 2];
                double y = 0.299 * r + 0.587 * g + 0.114 * b;
                px[i] = Clamp(y + (b - y) * k);
                px[i + 1] = Clamp(y + (g - y) * k);
                px[i + 2] = Clamp(y + (r - y) * k);
                px[i + 3] = 255;
            }
            var outBmp = BitmapSource.Create(w, h, 96, 96, PixelFormats.Bgra32, null, px, stride);
            outBmp.Freeze();
            return outBmp;
        }

        private static byte Clamp(double v) => (byte)(v < 0 ? 0 : v > 255 ? 255 : Math.Round(v));
    }
}
