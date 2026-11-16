using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;

namespace MateCalendar
{
    /// <summary>JSON 읽고 쓰기 - .NET Framework 에 든 JavaScriptSerializer 로(따로 깔 라이브러리 없이)</summary>
    internal static class Json
    {
        private static readonly JavaScriptSerializer S = new JavaScriptSerializer { MaxJsonLength = int.MaxValue, RecursionLimit = 64 };

        public static object? Parse(string text) => S.DeserializeObject(text);
        public static string Write(object value) => S.Serialize(value);

        public static IEnumerable<Dictionary<string, object?>> Rows(object? arr) =>
            arr is object[] a ? a.OfType<Dictionary<string, object?>>() : Enumerable.Empty<Dictionary<string, object?>>();

        public static string Str(this Dictionary<string, object?> d, string key, string def = "") =>
            d.TryGetValue(key, out var v) && v is string s ? s : def;

        public static string? StrOrNull(this Dictionary<string, object?> d, string key) =>
            d.TryGetValue(key, out var v) && v is string s ? s : null;

        public static long Long(this Dictionary<string, object?> d, string key, long def = 0) =>
            d.TryGetValue(key, out var v) && v != null && long.TryParse(Convert.ToString(v, CultureInfo.InvariantCulture), out var n) ? n : def;

        public static double Num(this Dictionary<string, object?> d, string key, double def = 0) =>
            d.TryGetValue(key, out var v) && v != null && double.TryParse(Convert.ToString(v, CultureInfo.InvariantCulture),
                NumberStyles.Float, CultureInfo.InvariantCulture, out var n) ? n : def;

        public static bool Bool(this Dictionary<string, object?> d, string key, bool def = false) =>
            d.TryGetValue(key, out var v) && v is bool b ? b : def;

        public static string[] StrArr(this Dictionary<string, object?> d, string key) =>
            d.TryGetValue(key, out var v) && v is object[] a ? a.OfType<string>().ToArray() : new string[0];
    }

    /// <summary>Hub 의 작업 한 줄(tm_tasks)</summary>
    internal sealed class TaskItem
    {
        public string Id = "";
        public long Num;
        public string Title = "";
        public string Status = "todo";
        public string Priority = "normal";
        public string Domain = "";
        public string[] Labels = new string[0];
        public DateTime? Start;
        public DateTime Due;
        public string? Assignee;

        public bool Done => Status == "done";
        public string Key => "MATE-" + Num.ToString(CultureInfo.InvariantCulture);

        public static TaskItem? From(Dictionary<string, object?> r)
        {
            if (!TryDate(r.StrOrNull("due_date"), out var due)) return null;
            return new TaskItem
            {
                Id = r.Str("id"),
                Num = r.Long("num"),
                Title = r.Str("title"),
                Status = r.Str("status", "todo"),
                Priority = r.Str("priority", "normal"),
                Domain = r.Str("domain"),
                Labels = r.StrArr("labels"),
                Start = TryDate(r.StrOrNull("start_date"), out var s) ? s : (DateTime?)null,
                Due = due,
                Assignee = r.StrOrNull("assignee"),
            };
        }

        public Dictionary<string, object?> ToRow() => new Dictionary<string, object?>
        {
            ["id"] = Id, ["num"] = Num, ["title"] = Title, ["status"] = Status, ["priority"] = Priority, ["domain"] = Domain,
            ["labels"] = Labels, ["start_date"] = Start?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            ["due_date"] = Due.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), ["assignee"] = Assignee,
        };

        public static bool TryDate(string? s, out DateTime d) =>
            DateTime.TryParseExact(s ?? "", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out d);

        /// <summary>웹과 같은 이름</summary>
        public static string StatusLabel(string s) => s switch
        {
            "backlog" => "백로그",
            "todo" => "할 일",
            "doing" => "진행 중",
            "review" => "리뷰",
            "done" => "완료",
            _ => s,
        };

        public static int StatusRank(string s) => s switch { "doing" => 0, "review" => 1, "todo" => 2, "backlog" => 3, _ => 4 };
        public static int PriorityRank(string p) => p switch { "urgent" => 0, "high" => 1, "normal" => 2, _ => 3 };
    }

    internal sealed class DomainItem
    {
        public string Id = "", Label = "", Color = "gray";
        public double Sort;
    }

    internal sealed class MemberItem
    {
        public string Id = "", Name = "";
        public bool Active;
    }

    /// <summary>서버에서 읽은 것 - 껐다 켜도 바로 보이게 디스크에 둔다</summary>
    internal sealed class Snapshot
    {
        public List<TaskItem> Tasks = new List<TaskItem>();
        public List<DomainItem> Domains = new List<DomainItem>();
        public Dictionary<string, string> Colors = new Dictionary<string, string>();
        public List<MemberItem> Members = new List<MemberItem>();
        public string Scope = "mine";
        public DateTime? SyncedAt;
    }

    /// <summary>위젯 설정</summary>
    internal sealed class Settings
    {
        public int? X, Y;                  // 카드 왼쪽 위(화면 픽셀). 없으면 주 모니터 오른쪽 위
        public double Scale = 1.5;         // 크기 - Calendr 의 1pt 를 몇 DIP 로 그릴지
        public string Appearance = "system";
        public int Transparency = 1;       // 0 낮음 · 1 보통 · 2 높음
        public string Scope = "mine";      // mine · all
        public string ColorBy = "domain";  // domain · label · member
        public bool WeekNumbers;
        public bool Summary = true;
        public bool MonthOutline = true;
        public int UpcomingDays = 7;       // 오늘을 고르면 목록에 함께 보일 앞날 수
        public bool Locked;
        public string? SkippedVersion;

        public static string Dir => Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MATE Calendar");
        private static string File_ => Path.Combine(Dir, "settings.json");

        public static Settings Load()
        {
            try
            {
                if (!File.Exists(File_)) return new Settings();
                var d = Json.Parse(File.ReadAllText(File_, Encoding.UTF8)) as Dictionary<string, object?>;
                if (d == null) return new Settings();
                var s = new Settings
                {
                    X = d.ContainsKey("x") && d["x"] != null ? (int?)d.Long("x") : null,
                    Y = d.ContainsKey("y") && d["y"] != null ? (int?)d.Long("y") : null,
                    Scale = Clamp(d.Num("scale", 1.5), 1.0, 2.5),
                    Appearance = d.Str("appearance", "system"),
                    Transparency = (int)Clamp(d.Long("transparency", 1), 0, 2),
                    Scope = d.Str("scope", "mine") == "all" ? "all" : "mine",
                    ColorBy = d.Str("colorBy", "domain"),
                    WeekNumbers = d.Bool("weekNumbers"),
                    Summary = d.Bool("summary", true),
                    MonthOutline = d.Bool("monthOutline", true),
                    UpcomingDays = (int)Clamp(d.Long("upcomingDays", 7), 0, 31),
                    Locked = d.Bool("locked"),
                    SkippedVersion = d.StrOrNull("skippedVersion"),
                };
                return s;
            }
            catch { return new Settings(); }
        }

        public void Save()
        {
            try
            {
                Directory.CreateDirectory(Dir);
                var d = new Dictionary<string, object?>
                {
                    ["x"] = X, ["y"] = Y, ["scale"] = Scale, ["appearance"] = Appearance, ["transparency"] = Transparency,
                    ["scope"] = Scope, ["colorBy"] = ColorBy, ["weekNumbers"] = WeekNumbers, ["summary"] = Summary,
                    ["monthOutline"] = MonthOutline, ["upcomingDays"] = UpcomingDays, ["locked"] = Locked,
                    ["skippedVersion"] = SkippedVersion,
                };
                File.WriteAllText(File_, Json.Write(d), new UTF8Encoding(false));
            }
            catch { /* 설정을 못 남겨도 위젯은 돈다 */ }
        }

        private static double Clamp(double v, double lo, double hi) => Math.Max(lo, Math.Min(hi, v));
    }

    /// <summary>이 PC 의 Windows 계정만 풀 수 있게(DPAPI) 감싸 둔 파일 - 로그인 토큰 · 작업 사본</summary>
    internal static class Vault
    {
        private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("MATE Calendar · devteammate.co.kr");

        public static void Write(string name, string text)
        {
            Directory.CreateDirectory(Settings.Dir);
            var data = ProtectedData.Protect(Encoding.UTF8.GetBytes(text), Entropy, DataProtectionScope.CurrentUser);
            var path = Path.Combine(Settings.Dir, name);
            var tmp = path + ".tmp";
            File.WriteAllBytes(tmp, data);
            if (File.Exists(path)) File.Replace(tmp, path, null);
            else File.Move(tmp, path);
        }

        public static string? Read(string name)
        {
            try
            {
                var path = Path.Combine(Settings.Dir, name);
                if (!File.Exists(path)) return null;
                return Encoding.UTF8.GetString(ProtectedData.Unprotect(File.ReadAllBytes(path), Entropy, DataProtectionScope.CurrentUser));
            }
            catch { return null; }
        }

        public static void Delete(string name)
        {
            try { File.Delete(Path.Combine(Settings.Dir, name)); } catch { /* 없으면 그만 */ }
        }
    }
}
