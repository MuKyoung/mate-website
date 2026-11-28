import Foundation

/// 보일 범위 - 내가 담당인 작업만, 또는 팀 전체
enum Scope: String, Codable {
    case mine, team

    var label: String { self == .mine ? "내 작업" : "팀 전체" }
}

struct TaskItem: Identifiable, Hashable, Codable {
    var id: String
    var num: Int
    var title: String
    var status: String
    var priority: String
    var assignee: String?

    var done: Bool { status == "done" }

    /// 급함 · 높음만 적는다 - 보통 · 낮음까지 적으면 줄마다 글자가 늘어 눈에 안 띈다
    var priorityTag: String? {
        if done { return nil }
        switch priority {
        case "urgent": return "긴급"
        case "high": return "높음"
        default: return nil
        }
    }

    /// 웹과 같은 이름
    var statusLabel: String {
        switch status {
        case "backlog": return "백로그"
        case "todo": return "할 일"
        case "doing": return "진행 중"
        case "review": return "리뷰"
        case "done": return "완료"
        default: return status
        }
    }

    var statusRank: Int {
        switch status {
        case "doing": return 0
        case "review": return 1
        case "todo": return 2
        case "backlog": return 3
        default: return 4
        }
    }

    var priorityRank: Int {
        switch priority {
        case "urgent": return 0
        case "high": return 1
        case "normal": return 2
        default: return 3
        }
    }
}

struct Session {
    var access: String
    var refresh: String
    /// 접근 토큰이 끝나는 때(1970 부터 초)
    var expiresAt: Double
    var uid: String
    var email: String
    var name: String

    /// 화면에 적는 이름 - 팀원 이름이 없으면 메일
    var who: String { name.isEmpty ? email : name }

    /// 로그인 · 갱신 답(JSON)
    init?(token data: Data) {
        guard let o = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
              let access = o["access_token"] as? String,
              let refresh = o["refresh_token"] as? String,
              let user = o["user"] as? [String: Any],
              let uid = user["id"] as? String
        else { return nil }
        let life = (o["expires_in"] as? NSNumber)?.doubleValue ?? 3600
        self.access = access
        self.refresh = refresh
        self.expiresAt = Date().timeIntervalSince1970 + life
        self.uid = uid
        self.email = user["email"] as? String ?? ""
        self.name = ""
    }

    init(access: String, refresh: String, expiresAt: Double, uid: String, email: String, name: String) {
        self.access = access
        self.refresh = refresh
        self.expiresAt = expiresAt
        self.uid = uid
        self.email = email
        self.name = name
    }
}

/// 로그인과 앞서 읽은 목록을 두는 곳.
/// 앱 그룹이 열리면 앱과 위젯이 한 칸을 같이 쓰고, 열리지 않으면(서명 도구가 앱 그룹을 뺐을 때) 저마다 제 칸을 쓴다.
enum Store {
    static let shared: UserDefaults? = AppGroup.id.flatMap { UserDefaults(suiteName: $0) }

    /// 앱과 위젯이 로그인을 같이 쓰는가
    static var linked: Bool { shared != nil }

    private static var d: UserDefaults { shared ?? .standard }

    static var session: Session? {
        guard let refresh = d.string(forKey: "refresh"), !refresh.isEmpty else { return nil }
        return Session(access: d.string(forKey: "access") ?? "",
                       refresh: refresh,
                       expiresAt: d.double(forKey: "expiresAt"),
                       uid: d.string(forKey: "uid") ?? "",
                       email: d.string(forKey: "email") ?? "",
                       name: d.string(forKey: "name") ?? "")
    }

    /// 새 토큰을 남긴다. 같은 사람이면 이름은 그대로 둔다
    static func save(_ s: Session) {
        if d.string(forKey: "uid") != s.uid { d.removeObject(forKey: "name") }
        d.set(s.access, forKey: "access")
        d.set(s.refresh, forKey: "refresh")
        d.set(s.expiresAt, forKey: "expiresAt")
        d.set(s.uid, forKey: "uid")
        d.set(s.email, forKey: "email")
    }

    static func setName(_ name: String) { d.set(name, forKey: "name") }

    static func signOut() {
        for key in ["access", "refresh", "expiresAt", "uid", "email", "name", "cache_mine", "cache_team", "widgetCode"] {
            d.removeObject(forKey: key)
        }
    }

    /* ── 앞서 읽은 목록 - 서버에 닿지 않을 때 같은 날 · 같은 사람 것이면 대신 보인다 ── */

    struct Cache: Codable {
        var day: String
        var uid: String
        var at: Double
        var tasks: [TaskItem]
    }

    static func cache(_ scope: Scope) -> Cache? {
        guard let data = d.data(forKey: "cache_" + scope.rawValue) else { return nil }
        return try? JSONDecoder().decode(Cache.self, from: data)
    }

    static func setCache(_ scope: Scope, tasks: [TaskItem]) {
        guard let uid = session?.uid else { return }
        let c = Cache(day: Day.iso(), uid: uid, at: Date().timeIntervalSince1970, tasks: tasks)
        if let data = try? JSONEncoder().encode(c) { d.set(data, forKey: "cache_" + scope.rawValue) }
    }

    /* ── 앱 그룹이 없을 때만 쓰는 '연결 코드' ─────────────────────────────
       앱이 로그인을 한 번 더 해서 받은 갱신 토큰을 사람이 위젯 편집 칸에 붙여 넣는다.
       위젯은 그 코드를 제 칸에 로그인으로 삼는다. */

    /// 앱: 위젯에 넘겨줄 코드
    static var widgetCode: String? {
        get { d.string(forKey: "widgetCode") }
        set {
            if let v = newValue, !v.isEmpty { d.set(v, forKey: "widgetCode") } else { d.removeObject(forKey: "widgetCode") }
        }
    }

    /// 위젯: 편집 칸에 적힌 코드를 받아들인다. 새 코드면 그것으로 로그인을 바꾸고, 지웠으면 로그인을 푼다
    static func adopt(code raw: String?) {
        guard !linked else { return }
        let code = (raw ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
        let last = d.string(forKey: "adopted") ?? ""
        if code == last { return }
        signOut()
        if code.isEmpty {
            d.removeObject(forKey: "adopted")
        } else {
            d.set(code, forKey: "adopted")
            d.set(code, forKey: "refresh")
        }
    }
}

/// 날짜 · 시각 글자
enum Day {
    /// 이 기기 날짜 기준 오늘(yyyy-MM-dd) - 웹 캘린더처럼 마감일이 오늘인 작업
    static func iso(_ date: Date = Date()) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }

    private static func korean(_ format: String, _ date: Date) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "ko_KR")
        f.dateFormat = format
        return f.string(from: date)
    }

    /// 11월 28일 (토)
    static func label(_ date: Date) -> String { korean("M월 d일 (E)", date) }

    /// 오후 3:12
    static func time(_ date: Date) -> String { korean("a h:mm", date) }

    /// 12월 5일 오후 3시
    static func deadline(_ date: Date) -> String { korean("M월 d일 a h시", date) }

    static func nextMidnight(after date: Date = Date()) -> Date {
        let cal = Calendar.current
        return cal.nextDate(after: date, matching: DateComponents(hour: 0, minute: 0, second: 0), matchingPolicy: .nextTime)
            ?? date.addingTimeInterval(24 * 3600)
    }
}
