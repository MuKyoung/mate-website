using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MateCalendar
{
    /// <summary>화면에 그대로 적는 실패. NeedLogin 이면 다시 로그인해야 한다</summary>
    internal sealed class ApiException : Exception
    {
        public bool NeedLogin { get; }
        /// <summary>기다리는 사이 로그아웃했거나 다른 계정으로 로그인했다 - 이 응답으로는 아무것도 바꾸지 않는다</summary>
        public bool Stale { get; }
        public ApiException(string message, bool needLogin, bool stale = false) : base(message)
        {
            NeedLogin = needLogin;
            Stale = stale;
        }
    }

    /// <summary>
    /// Hub(Supabase 서울 프로젝트)와 주고받는 일 - 로그인, 로그인 이어 가기, 작업 · 영역 · 색 · 팀원 읽기.
    /// 갤럭시 위젯(android-widget/ 의 Api.java)과 같은 길이다.
    ///
    /// 키는 웹 Hub 와 같은 공개(publishable) 키다. 누가 무엇을 읽는지는 DB 의 RLS 가 정한다 -
    /// 승인된 팀원만 작업을 읽는다(supabase/taskmanager.sql). service_role 키는 앱에 넣지 않는다.
    /// 프로젝트를 옮기면 Base · Key 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꾼다.
    /// </summary>
    internal static class Api
    {
        public const string Base = "https://duxqhatypwcjiqmddcmu.supabase.co";
        public const string Key = "sb_publishable_f6jyYhExiCTRF-CBShXkwg_A2QZa9WP";
        /// <summary>웹 Hub - ?task=&lt;id&gt; 는 그 작업을, ?view=calendar · list 는 그 보기를 연다</summary>
        public const string Web = "https://devteammate.co.kr/hub/";

        private static readonly HttpClient Http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        /// <summary>로그인 이어 가기(토큰 갱신)는 한 번에 하나만 - 갱신 토큰은 한 번 쓰면 바뀐다</summary>
        private static readonly SemaphoreSlim Gate = new SemaphoreSlim(1, 1);

        static Api()
        {
            Http.DefaultRequestHeaders.UserAgent.ParseAdd("MateCalendar/" + Program.Version);
        }

        /* ── 로그인 상태 ─────────────────────────────── */

        internal sealed class Session
        {
            public string Access = "", Refresh = "", Uid = "", Email = "", Name = "";
            public long ExpiresAt;
        }

        private static Session? _session;
        private static bool _loaded;
        private static int _epoch;

        /// <summary>로그인 · 로그아웃마다 올라가는 번호. 요청을 시작할 때와 달라졌으면 그 응답은 버린다</summary>
        public static int Epoch => _epoch;

        private static ApiException StaleError() => new ApiException("로그인이 바뀌었습니다.", false, true);

        public static Session? Current
        {
            get
            {
                if (!_loaded)
                {
                    _loaded = true;
                    var raw = Vault.Read("session.bin");
                    if (raw != null && Json.Parse(raw) is Dictionary<string, object?> d && d.Str("refresh") != "")
                    {
                        _session = new Session
                        {
                            Access = d.Str("access"), Refresh = d.Str("refresh"), Uid = d.Str("uid"),
                            Email = d.Str("email"), Name = d.Str("name"), ExpiresAt = d.Long("expiresAt"),
                        };
                    }
                }
                return _session;
            }
        }

        public static bool SignedIn => Current != null;

        /// <summary>화면에 적는 이름 - 팀원 이름이 없으면 메일</summary>
        public static string Who => Current == null ? "" : Current.Name != "" ? Current.Name : Current.Email;

        private static void Persist()
        {
            if (_session == null) { Vault.Delete("session.bin"); return; }
            Vault.Write("session.bin", Json.Write(new Dictionary<string, object?>
            {
                ["access"] = _session.Access, ["refresh"] = _session.Refresh, ["uid"] = _session.Uid,
                ["email"] = _session.Email, ["name"] = _session.Name, ["expiresAt"] = _session.ExpiresAt,
            }));
        }

        public static void SignOut()
        {
            _loaded = true;
            _session = null;
            _epoch++;
            Persist();
            Vault.Delete("cache.bin");
        }

        private static void Save(Dictionary<string, object?> s, bool newLogin = false)
        {
            if (newLogin) _epoch++;
            var user = s.TryGetValue("user", out var u) ? u as Dictionary<string, object?> : null;
            var prev = _session;
            _session = new Session
            {
                Access = s.Str("access_token"),
                Refresh = s.Str("refresh_token"),
                ExpiresAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds() + s.Long("expires_in", 3600),
                Uid = user?.Str("id") ?? prev?.Uid ?? "",
                Email = user?.Str("email") ?? prev?.Email ?? "",
                Name = prev?.Name ?? "",
            };
            _loaded = true;
            // 바뀐 갱신 토큰이 바로 남아야 다음 갱신이 옛 토큰을 쓰지 않는다
            Persist();
        }

        /* ── HTTP ─────────────────────────────────────── */

        private sealed class Res
        {
            public int Code;
            public string Body = "";
            /// <summary>Prefer: count=exact 로 물었을 때 Content-Range 의 전체 줄 수</summary>
            public long? Total;
        }

        private static async Task<Res> Call(HttpMethod method, string path, string? bearer, string? json, string? prefer = null)
        {
            using var req = new HttpRequestMessage(method, Base + path);
            req.Headers.Add("apikey", Key);
            req.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (bearer != null) req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearer);
            if (prefer != null) req.Headers.Add("Prefer", prefer);
            if (json != null) req.Content = new StringContent(json, Encoding.UTF8, "application/json");
            try
            {
                using var res = await Http.SendAsync(req).ConfigureAwait(true);
                var r = new Res { Code = (int)res.StatusCode, Body = await res.Content.ReadAsStringAsync().ConfigureAwait(true) };
                // 'Content-Range: 0-999/2345' - 뒤의 수가 전체 줄 수('*' 면 모름)
                if (res.Content.Headers.TryGetValues("Content-Range", out var cr) || res.Headers.TryGetValues("Content-Range", out cr))
                {
                    var v = cr.FirstOrDefault() ?? "";
                    int slash = v.LastIndexOf('/');
                    if (slash >= 0 && long.TryParse(v.Substring(slash + 1), out var total)) r.Total = total;
                }
                return r;
            }
            catch (Exception e) when (e is HttpRequestException || e is TaskCanceledException)
            {
                throw Offline();
            }
        }

        private static ApiException Offline() => new ApiException("서버에 닿지 않습니다. 인터넷 연결을 확인해 주세요.", false);

        private static object? ParseBody(Res r)
        {
            try { return Json.Parse(r.Body); }
            catch { throw new ApiException("서버 답을 읽지 못했습니다.", false); }
        }

        /* ── 로그인 ───────────────────────────────────── */

        /// <summary>메일 · 비밀번호로 로그인하고 승인된 팀원인지 확인한다. 승인 전이면 로그인을 풀고 알린다</summary>
        public static async Task SignIn(string email, string password)
        {
            var body = Json.Write(new Dictionary<string, object?> { ["email"] = email.Trim(), ["password"] = password });
            var r = await Call(HttpMethod.Post, "/auth/v1/token?grant_type=password", null, body);
            if (r.Code == 400 || r.Code == 401) throw new ApiException("메일이나 비밀번호가 맞지 않습니다.", true);
            if (r.Code == 429) throw new ApiException("잠시 너무 많이 시도했습니다. 조금 뒤 다시 해 주세요.", true);
            if (r.Code >= 300) throw new ApiException($"로그인하지 못했습니다({r.Code}). 잠시 뒤 다시 해 주세요.", true);
            if (!(ParseBody(r) is Dictionary<string, object?> s)) throw new ApiException("서버 답을 읽지 못했습니다.", true);
            await Gate.WaitAsync();
            try { Save(s, newLogin: true); }
            finally { Gate.Release(); }
            await CheckMember();
        }

        /// <summary>팀원 줄을 읽어 이름을 남긴다. 승인 대기 · 취소면 로그인을 풀고 그 까닭을 알린다</summary>
        public static async Task CheckMember()
        {
            var uid = Current?.Uid ?? "";
            var r = await Get("/rest/v1/tm_members?select=name,active&id=eq." + Uri.EscapeDataString(uid));
            if (r.Code >= 300) throw new ApiException($"팀원 정보를 읽지 못했습니다({r.Code}).", false);
            var row = Json.Rows(ParseBody(r)).FirstOrDefault();
            if (row == null || !row.Bool("active"))
            {
                SignOut();
                throw new ApiException("아직 승인되지 않은 계정입니다. 관리자에게 승인을 부탁해 주세요.", true);
            }
            if (_session != null)
            {
                _session.Name = row.Str("name");
                Persist();
            }
        }

        /// <summary>쓸 수 있는 접근 토큰. 1분 안에 끝나거나 force 면 갱신 토큰으로 새로 받는다</summary>
        private static async Task<string> Access(bool force)
        {
            await Gate.WaitAsync();
            try
            {
                var s = Current ?? throw new ApiException("로그인해 주세요.", true);
                if (!force && s.Access != "" && s.ExpiresAt - 60 > DateTimeOffset.UtcNow.ToUnixTimeSeconds()) return s.Access;

                int epoch = _epoch;
                var body = Json.Write(new Dictionary<string, object?> { ["refresh_token"] = s.Refresh });
                var r = await Call(HttpMethod.Post, "/auth/v1/token?grant_type=refresh_token", null, body);
                // 기다리는 사이 로그아웃 · 다시 로그인했으면 옛 로그인을 되살리지 않는다
                if (epoch != _epoch) throw StaleError();
                if (r.Code == 400 || r.Code == 401)
                {
                    SignOut();
                    throw new ApiException("로그인이 풀렸습니다. 다시 로그인해 주세요.", true);
                }
                if (r.Code >= 300) throw new ApiException($"서버가 답하지 않습니다({r.Code}).", false);
                if (!(ParseBody(r) is Dictionary<string, object?> d)) throw new ApiException("서버 답을 읽지 못했습니다.", false);
                Save(d);
                return _session!.Access;
            }
            finally { Gate.Release(); }
        }

        /// <summary>읽기. 접근 토큰이 그사이 끝났으면 한 번만 새로 받아 다시 읽는다</summary>
        private static async Task<Res> Get(string path, string? prefer = null)
        {
            int epoch = _epoch;
            var r = await Call(HttpMethod.Get, path, await Access(false), null, prefer);
            if (r.Code == 401) r = await Call(HttpMethod.Get, path, await Access(true), null, prefer);
            if (epoch != _epoch) throw StaleError();
            if (r.Code == 401)
            {
                // 새로 받은 토큰으로도 거절됐다 - 이 로그인은 더 쓸 수 없으니 풀고 로그인 창으로 안내한다
                SignOut();
                throw new ApiException("로그인이 풀렸습니다. 다시 로그인해 주세요.", true);
            }
            return r;
        }

        /* ── 읽기 ─────────────────────────────────────── */

        /// <summary>
        /// 마감일이 있는 작업. mine 이면 내가 담당인 것만.
        /// Supabase 는 한 번에 1000줄까지만 돌려준다 - 마감일 오래된 순이라 한 번만 읽으면 오늘 · 앞날 작업이 잘린다.
        /// 전체 줄 수(Content-Range)를 받아 다 읽을 때까지 쪽을 넘기고, 같은 작업이 두 번 오면 하나만 둔다
        /// </summary>
        public static async Task<List<TaskItem>> Tasks(bool mine)
        {
            const int page = 1000;
            var q = "/rest/v1/tm_tasks?select=id,num,title,status,priority,domain,labels,start_date,due_date,assignee"
                + "&due_date=not.is.null&order=due_date.asc,num.asc,id.asc";
            if (mine) q += "&assignee=eq." + Uri.EscapeDataString(Current?.Uid ?? "");
            var list = new List<TaskItem>();
            var seen = new HashSet<string>();
            long? total = null;
            int offset = 0;
            for (int i = 0; i < 100; i++)
            {
                var r = await Get($"{q}&limit={page}&offset={offset}", "count=exact");
                if (r.Code >= 300) throw new ApiException($"작업을 읽지 못했습니다({r.Code}).", false);
                total ??= r.Total;
                var rows = Json.Rows(ParseBody(r)).ToList();
                if (rows.Count == 0) break;
                foreach (var row in rows)
                {
                    var t = TaskItem.From(row);
                    if (t != null && seen.Add(t.Id)) list.Add(t);
                }
                offset += rows.Count;
                // 전체 줄 수를 알면 그만큼, 모르면 빈 쪽이 올 때까지
                if (total.HasValue && offset >= total.Value) break;
            }
            // 승인이 취소되면 RLS 가 빈 목록을 준다 - '작업 없음'으로 보이지 않게 비었을 때만 팀원 줄을 확인한다
            if (list.Count == 0) await CheckMember();
            return list;
        }

        /// <summary>영역(이름 · 색). 표가 아직 없는 DB(404)면 빈 목록, 그 밖의 실패는 알린다(전에 읽은 것을 지우지 않게)</summary>
        public static async Task<List<DomainItem>> Domains()
        {
            var r = await Get("/rest/v1/tm_domains?select=id,label,color,sort&order=sort.asc");
            if (r.Code == 404) return new List<DomainItem>();
            if (r.Code >= 300) throw new ApiException($"영역 정보를 읽지 못했습니다({r.Code}).", false);
            return Json.Rows(ParseBody(r)).Select(d => new DomainItem
            {
                Id = d.Str("id"), Label = d.Str("label"), Color = d.Str("color", "gray"), Sort = d.Num("sort"),
            }).ToList();
        }

        /// <summary>사람 · 라벨에 고른 색('member:&lt;id&gt;' · 'label:&lt;이름&gt;' → 색 이름)</summary>
        public static async Task<Dictionary<string, string>> Colors()
        {
            var r = await Get("/rest/v1/tm_colors?select=id,color");
            var map = new Dictionary<string, string>();
            if (r.Code == 404) return map;
            if (r.Code >= 300) throw new ApiException($"색 정보를 읽지 못했습니다({r.Code}).", false);
            foreach (var d in Json.Rows(ParseBody(r))) map[d.Str("id")] = d.Str("color", "gray");
            return map;
        }

        /// <summary>팀원 - 웹처럼 가입 순서. 사람 자동 색이 이 순서를 따른다</summary>
        public static async Task<List<MemberItem>> Members()
        {
            var r = await Get("/rest/v1/tm_members?select=id,name,active&order=created_at.asc");
            if (r.Code >= 300) throw new ApiException($"팀원 정보를 읽지 못했습니다({r.Code}).", false);
            return Json.Rows(ParseBody(r)).Select(d => new MemberItem
            {
                Id = d.Str("id"), Name = d.Str("name"), Active = d.Bool("active"),
            }).ToList();
        }
    }
}
