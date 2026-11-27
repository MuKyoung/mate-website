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
        public int? W;                     // 옮겨 놓을 때의 창 폭(화면 픽셀) - 화면 오른쪽에 둔 카드는 오른쪽 끝을 지킨다
        public double Scale = 1.5;         // 크기 - Calendr 의 1pt 를 몇 DIP 로 그릴지
        public string Layout = "compact";  // compact(달력 + 목록) · wide(넓게 펼친 달력 + 옆 목록)
        public double WideScale = 1.25;    // 넓게 펼친 화면의 크기
        // 가장자리를 끌어 정한 크기(pt). 없으면 기본 - 작게: 목록 196, 넓게: 날짜 칸 90 × 64
        public double? ListPt, WideCellPt, WideRowPt;
        public string Appearance = "system";
        public int Transparency = 1;       // 0 낮음 · 1 보통 · 2 높음
        public string Scope = "mine";      // mine · all
        public string ColorBy = "domain";  // domain · label · member
        public bool WeekNumbers;
        public bool Summary = true;
        public bool MonthOutline = true;
        public int UpcomingDays = 7;       // 오늘을 고르면 목록에 함께 보일 앞날 수
        public string ListView = "due";    // due(그날 마감 · 다가오는 마감) · work(그날 진행: 그날 마감 + 기간 안에 든 작업)
        public string WorkSort = "due";    // 진행 보기 정렬 - due 마감 가까운 순 · priority 급한 순 · status 상태 순 · start 시작일 순 · title 이름 순
        public string WorkKind = "all";    // 진행 보기 거르기 - all 전체 · due 그날 마감만 · range 기간 작업만
        public string[] WorkHide = new string[0]; // 진행 보기에서 숨길 상태(backlog · todo · doing · review · done)
        public bool Locked;
        public string? SkippedVersion;
        public bool Scratch;               // 점검(--demo)용 - 파일에서 읽지도 남기지도 않는다
        public bool AutoUpdate = true;     // 새 판이 나오면 저절로 받아 깐다
        public string? AutoTriedVersion;   // 저절로 깔아 본 판과 그 시각 - 실패 · 판 표기 실수로 같은 판을 되풀이해 깔지 않게
        public DateTime? AutoTriedAt;

        public bool Wide => Layout == "wide";
        /// <summary>지금 화면(작게 · 넓게)의 크기</summary>
        public double ActiveScale => Wide ? WideScale : Scale;

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
                    W = d.ContainsKey("w") && d["w"] != null ? (int?)d.Long("w") : null,
                    Scale = Clamp(d.Num("scale", 1.5), 0.8, 2.5),
                    Layout = d.Str("layout", "compact") == "wide" ? "wide" : "compact",
                    WideScale = Clamp(d.Num("wideScale", 1.25), 0.8, 2.5),
                    ListPt = d.ContainsKey("listPt") && d["listPt"] != null ? Clamp(d.Num("listPt"), 112, 1200) : (double?)null,
                    WideCellPt = d.ContainsKey("wideCellPt") && d["wideCellPt"] != null ? Clamp(d.Num("wideCellPt"), 64, 200) : (double?)null,
                    WideRowPt = d.ContainsKey("wideRowPt") && d["wideRowPt"] != null ? Clamp(d.Num("wideRowPt"), 44, 240) : (double?)null,
                    Appearance = d.Str("appearance", "system"),
                    Transparency = (int)Clamp(d.Long("transparency", 1), 0, 2),
                    Scope = d.Str("scope", "mine") == "all" ? "all" : "mine",
                    ColorBy = d.Str("colorBy", "domain"),
                    WeekNumbers = d.Bool("weekNumbers"),
                    Summary = d.Bool("summary", true),
                    MonthOutline = d.Bool("monthOutline", true),
                    UpcomingDays = (int)Clamp(d.Long("upcomingDays", 7), 0, 31),
                    ListView = d.Str("listView", "due") == "work" ? "work" : "due",
                    WorkSort = new[] { "due", "priority", "status", "start", "title" }.Contains(d.Str("workSort", "due")) ? d.Str("workSort", "due") : "due",
                    WorkKind = new[] { "all", "due", "range" }.Contains(d.Str("workKind", "all")) ? d.Str("workKind", "all") : "all",
                    WorkHide = d.StrArr("workHide"),
                    Locked = d.Bool("locked"),
                    SkippedVersion = d.StrOrNull("skippedVersion"),
                    AutoUpdate = d.Bool("autoUpdate", true),
                    AutoTriedVersion = d.StrOrNull("autoTriedVersion"),
                    AutoTriedAt = DateTime.TryParse(d.Str("autoTriedAt"), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var tried)
                        ? tried.ToUniversalTime() : (DateTime?)null,
                };
                return s;
            }
            catch { return new Settings(); }
        }

        public void Save()
        {
            if (Scratch) return;
            try
            {
                Directory.CreateDirectory(Dir);
                var d = new Dictionary<string, object?>
                {
                    ["x"] = X, ["y"] = Y, ["w"] = W, ["scale"] = Scale, ["layout"] = Layout, ["wideScale"] = WideScale,
                    ["listPt"] = ListPt, ["wideCellPt"] = WideCellPt, ["wideRowPt"] = WideRowPt, ["appearance"] = Appearance, ["transparency"] = Transparency,
                    ["scope"] = Scope, ["colorBy"] = ColorBy, ["weekNumbers"] = WeekNumbers, ["summary"] = Summary,
                    ["monthOutline"] = MonthOutline, ["upcomingDays"] = UpcomingDays, ["locked"] = Locked,
                    ["listView"] = ListView, ["workSort"] = WorkSort, ["workKind"] = WorkKind, ["workHide"] = WorkHide,
                    ["skippedVersion"] = SkippedVersion,
                    ["autoUpdate"] = AutoUpdate, ["autoTriedVersion"] = AutoTriedVersion,
                    ["autoTriedAt"] = AutoTriedAt?.ToUniversalTime().ToString("o", CultureInfo.InvariantCulture),
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
