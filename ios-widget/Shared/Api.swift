import Foundation

/// 화면에 그대로 적는 실패. needLogin 이면 앱을 열어 다시 로그인해야 한다
struct ApiError: Error {
    let message: String
    let needLogin: Bool

    init(_ message: String, needLogin: Bool = false) {
        self.message = message
        self.needLogin = needLogin
    }

    static let offline = ApiError("서버에 닿지 않습니다. 인터넷 연결을 확인해 주세요.")
    static let signedOut = ApiError("앱을 열어 로그인해 주세요.", needLogin: true)
    static let expired = ApiError("로그인이 풀렸습니다. 앱을 열어 다시 로그인해 주세요.", needLogin: true)
}

/// 작업 관리(Supabase)와 주고받는 일 - 로그인, 로그인 이어 가기, 오늘 마감 작업 읽기.
/// actor 라서 위젯 여럿이 한꺼번에 읽어도 토큰 갱신은 한 번에 하나만 돈다(갱신 토큰은 한 번 쓰면 바뀐다).
actor Api {
    static let shared = Api()

    private let http: URLSession = {
        let c = URLSessionConfiguration.ephemeral
        c.timeoutIntervalForRequest = 12
        c.timeoutIntervalForResource = 20
        c.waitsForConnectivity = false
        return URLSession(configuration: c)
    }()

    private var refreshing: Task<String, Error>?

    /* ── HTTP ─────────────────────────────────────── */

    private func call(_ method: String, _ path: String, bearer: String? = nil, json: [String: Any]? = nil) async throws -> (Int, Data) {
        guard let url = URL(string: Config.base + path) else { throw ApiError("주소가 잘못됐습니다.") }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue(Config.key, forHTTPHeaderField: "apikey")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if let bearer { req.setValue("Bearer " + bearer, forHTTPHeaderField: "Authorization") }
        if let json {
            req.setValue("application/json", forHTTPHeaderField: "Content-Type")
            req.httpBody = try? JSONSerialization.data(withJSONObject: json)
        }
        do {
            let (data, res) = try await http.data(for: req)
            return ((res as? HTTPURLResponse)?.statusCode ?? 0, data)
        } catch {
            throw ApiError.offline
        }
    }

    /* ── 로그인 ───────────────────────────────────── */

    private func passwordSession(email: String, password: String) async throws -> Session {
        let (code, data) = try await call("POST", "/auth/v1/token?grant_type=password", json: ["email": email, "password": password])
        if code == 400 || code == 401 { throw ApiError("메일이나 비밀번호가 맞지 않습니다.", needLogin: true) }
        if code == 429 { throw ApiError("잠시 너무 많이 시도했습니다. 조금 뒤 다시 해 주세요.", needLogin: true) }
        if code >= 300 || code == 0 { throw ApiError("로그인하지 못했습니다(\(code)). 잠시 뒤 다시 해 주세요.", needLogin: true) }
        guard let s = Session(token: data) else { throw ApiError("서버 답을 읽지 못했습니다.", needLogin: true) }
        return s
    }

    /// 메일 · 비밀번호로 로그인하고 승인된 팀원인지 확인한다. 승인 전이면 로그인을 풀고 알린다
    func signIn(email: String, password: String) async throws {
        let s = try await passwordSession(email: email, password: password)
        Store.save(s)
        try await checkMember()
        // 앱 그룹이 없으면 위젯이 따로 쓸 로그인을 하나 더 받아 둔다(연결 코드)
        if !Store.linked {
            Store.widgetCode = (try? await passwordSession(email: email, password: password))?.refresh
        }
    }

    /// 이 기기의 로그인만 끝낸다. 서버에도 알려 갱신 토큰을 못 쓰게 한다(닿지 않아도 기기에서는 지운다)
    func signOut() async {
        if let s = Store.session, !s.access.isEmpty {
            _ = try? await call("POST", "/auth/v1/logout?scope=local", bearer: s.access)
        }
        Store.signOut()
    }

    /// 팀원 줄을 읽어 이름을 남긴다. 승인 대기 · 취소면 로그인을 풀고 그 까닭을 알린다
    private func checkMember() async throws {
        let token = try await access()
        let uid = Store.session?.uid ?? ""
        let (code, data) = try await call("GET", "/rest/v1/tm_members?select=name,active&id=eq.\(uid)", bearer: token)
        if code >= 300 || code == 0 { throw ApiError("팀원 정보를 읽지 못했습니다(\(code)).") }
        let rows = (try? JSONSerialization.jsonObject(with: data)) as? [[String: Any]] ?? []
        guard let row = rows.first, (row["active"] as? Bool) == true else {
            Store.signOut()
            throw ApiError("아직 승인되지 않은 계정입니다. 관리자에게 승인을 부탁해 주세요.", needLogin: true)
        }
        Store.setName(row["name"] as? String ?? "")
    }

    /// 쓸 수 있는 접근 토큰. 1분 안에 끝나거나 force 면 갱신 토큰으로 새로 받는다
    private func access(force: Bool = false) async throws -> String {
        if let running = refreshing { return try await running.value }
        guard let s = Store.session else { throw ApiError.signedOut }
        if !force, !s.access.isEmpty, s.expiresAt - 60 > Date().timeIntervalSince1970 { return s.access }
        let task = Task { try await self.refresh(s.refresh, retry: true) }
        refreshing = task
        defer { refreshing = nil }
        return try await task.value
    }

    private func refresh(_ token: String, retry: Bool) async throws -> String {
        let (code, data) = try await call("POST", "/auth/v1/token?grant_type=refresh_token", json: ["refresh_token": token])
        if code == 400 || code == 401 {
            // 앱과 위젯이 같은 때 갱신하면 한쪽은 옛 토큰이라 거절당한다 - 그사이 다른 쪽이 새 토큰을 적어 두었으면 그것을 쓴다
            if retry, let now = Store.session, now.refresh != token {
                if !now.access.isEmpty, now.expiresAt - 60 > Date().timeIntervalSince1970 { return now.access }
                return try await refresh(now.refresh, retry: false)
            }
            Store.signOut()
            throw ApiError.expired
        }
        if code >= 300 || code == 0 { throw ApiError("서버가 답하지 않습니다(\(code)).") }
        guard let s = Session(token: data) else { throw ApiError("서버 답을 읽지 못했습니다.") }
        Store.save(s)
        return s.access
    }

    /* ── 오늘 마감 ─────────────────────────────────── */

    /// 오늘이 마감일인 작업. mine 이면 내가 담당인 것만.
    /// 끝나지 않은 것을 위로 - 진행 중 · 리뷰 · 할 일 · 백로그 순, 같으면 급한 순, 같으면 번호 순. 완료는 맨 아래.
    func today(mine: Bool) async throws -> [TaskItem] {
        var token = try await access()
        var path = "/rest/v1/tm_tasks?select=id,num,title,status,priority,assignee&due_date=eq.\(Day.iso())"
        if mine { path += "&assignee=eq.\(Store.session?.uid ?? "")" }
        var (code, data) = try await call("GET", path, bearer: token)
        // 접근 토큰이 그사이 끝났으면 한 번만 새로 받아 다시 읽는다
        if code == 401 {
            token = try await access(force: true)
            (code, data) = try await call("GET", path, bearer: token)
        }
        if code == 401 { throw ApiError.expired }
        if code >= 300 || code == 0 { throw ApiError("작업을 읽지 못했습니다(\(code)).") }
        guard let tasks = Api.parseTasks(data) else { throw ApiError("서버 답을 읽지 못했습니다.") }
        // 승인이 취소되면 RLS 가 빈 목록을 준다 - '오늘 없음'으로 보이지 않게 비었을 때만 팀원 줄을 확인한다
        if tasks.isEmpty { try await checkMember() }
        return tasks
    }

    /// 작업 줄(JSON 배열)을 읽어 보이는 순서로 놓는다
    nonisolated static func parseTasks(_ data: Data) -> [TaskItem]? {
        guard let rows = (try? JSONSerialization.jsonObject(with: data)) as? [[String: Any]] else { return nil }
        let tasks = rows.compactMap { o -> TaskItem? in
            let id = (o["id"] as? String) ?? (o["id"] as? NSNumber)?.stringValue
            guard let id else { return nil }
            return TaskItem(id: id,
                            num: (o["num"] as? NSNumber)?.intValue ?? 0,
                            title: o["title"] as? String ?? "",
                            status: o["status"] as? String ?? "todo",
                            priority: o["priority"] as? String ?? "normal",
                            assignee: o["assignee"] as? String)
        }
        return tasks.sorted { a, b in
            if a.statusRank != b.statusRank { return a.statusRank < b.statusRank }
            if a.priorityRank != b.priorityRank { return a.priorityRank < b.priorityRank }
            return a.num < b.num
        }
    }
}
