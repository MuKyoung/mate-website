using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace MateCalendar
{
    /// <summary>
    /// 새 판 알림 · 설치. 사이트의 public/downloads/mate-calendar.json 에 지금 판 · 받을 주소 · SHA-256 을 둔다.
    /// 새 판을 받으면 해시를 맞춰 본 뒤 '--update' 로 실행한다 - 새 exe 가 옛 위젯을 끄고 제자리에 깔고 다시 띄운다.
    /// </summary>
    internal static class Updater
    {
        public const string ManifestUrl = "https://devteammate.co.kr/downloads/mate-calendar.json";
        private static readonly HttpClient Http = new HttpClient { Timeout = TimeSpan.FromMinutes(2) };

        internal sealed class Info
        {
            public Version Version = new Version(0, 0);
            public string Url = "";
            public string Sha256 = "";
            public string Notes = "";
        }

        /// <summary>지금 판보다 새것이 있으면 그 정보</summary>
        public static async Task<Info?> Check()
        {
            try
            {
                var text = await Http.GetStringAsync(ManifestUrl + "?t=" + DateTime.UtcNow.Ticks);
                if (!(Json.Parse(text) is Dictionary<string, object?> d)) return null;
                if (!Version.TryParse(d.Str("version"), out var v)) return null;
                if (v <= Version.Parse(Program.Version)) return null;
                var url = d.Str("url");
                if (url.StartsWith("/")) url = "https://devteammate.co.kr" + url;
                // 우리 사이트에서만 받는다
                if (!url.StartsWith("https://devteammate.co.kr/", StringComparison.OrdinalIgnoreCase)) return null;
                return new Info { Version = v, Url = url, Sha256 = d.Str("sha256").ToLowerInvariant(), Notes = d.Str("notes") };
            }
            catch
            {
                return null;
            }
        }

        /// <summary>받아서 해시를 맞춰 보고 설치를 시작한다. 실패하면 까닭을 돌려준다</summary>
        public static async Task<string?> Install(Info info, bool auto = false)
        {
            try
            {
                var bytes = await Http.GetByteArrayAsync(info.Url);
                using (var sha = SHA256.Create())
                {
                    var hash = BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-", "").ToLowerInvariant();
                    if (info.Sha256 == "" || hash != info.Sha256) return "받은 파일이 올바르지 않습니다. 잠시 뒤 다시 해 주세요.";
                }
                var path = Path.Combine(Path.GetTempPath(), $"MateCalendar-update-{info.Version}.exe");
                File.WriteAllBytes(path, bytes);
                // --auto : 저절로 까는 것 - 실패해도 창을 띄우지 않고 쓰던 판을 다시 띄운다
                Process.Start(new ProcessStartInfo(path, auto ? "--update --auto" : "--update") { UseShellExecute = false });
                return null;
            }
            catch (Exception e)
            {
                return "업데이트를 받지 못했습니다: " + e.Message;
            }
        }
    }
}
