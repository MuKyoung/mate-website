import Foundation

/// 위젯 한 번 그릴 때 쓰는 값
struct TodayData {
    enum Body {
        case tasks([TaskItem])
        case message(String, needLogin: Bool)
        case loading
    }

    var date: Date
    var scope: Scope
    var body: Body
    /// 목록을 읽은 때
    var fetchedAt: Date?
    /// 서버에 닿지 않아 앞서 읽은 목록을 보이는 중
    var stale = false
    /// 서명이 곧 끝난다(무료 Apple ID 로 깐 앱은 7일)
    var expiresSoon = false

    var needLogin: Bool {
        if case .message(_, let need) = body { return need }
        return false
    }

    /// 서버에서 읽어 만든다. 실패하면 그 까닭을, 닿지 않을 뿐이면 오늘 앞서 읽은 목록을 보인다
    static func load(scope: Scope) async -> TodayData {
        let now = Date()
        var data = TodayData(date: now, scope: scope, body: .loading, expiresSoon: Provision.expiresSoon)
        do {
            let tasks = try await Api.shared.today(mine: scope == .mine)
            Store.setCache(scope, tasks: tasks)
            data.body = .tasks(tasks)
            data.fetchedAt = now
        } catch let e as ApiError {
            if !e.needLogin, let c = Store.cache(scope), c.day == Day.iso(now), c.uid == Store.session?.uid {
                data.body = .tasks(c.tasks)
                data.fetchedAt = Date(timeIntervalSince1970: c.at)
                data.stale = true
            } else {
                data.body = .message(e.message, needLogin: e.needLogin)
            }
        } catch {
            data.body = .message("작업을 읽지 못했습니다.", needLogin: false)
        }
        return data
    }

    /* ── 보기용 값 - 위젯 고르는 화면의 미리 보기, 빌드 확인용 그림 ── */

    static func sample(_ scope: Scope, count: Int = 4) -> TodayData {
        let all: [TaskItem] = [
            TaskItem(id: "s1", num: 128, title: "주간 보고 초안 올리기", status: "doing", priority: "high"),
            TaskItem(id: "s2", num: 131, title: "로그인 화면 문구 확인", status: "review", priority: "normal"),
            TaskItem(id: "s3", num: 135, title: "배포 전 점검 목록 정리", status: "todo", priority: "urgent"),
            TaskItem(id: "s4", num: 119, title: "회의록 위키에 옮기기", status: "todo", priority: "normal"),
            TaskItem(id: "s5", num: 140, title: "아이콘 크기별로 내보내기", status: "todo", priority: "low"),
            TaskItem(id: "s6", num: 142, title: "견적 문의 답장 보내기", status: "backlog", priority: "normal"),
            TaskItem(id: "s7", num: 101, title: "지난주 일정 정리", status: "done", priority: "normal"),
            TaskItem(id: "s8", num: 102, title: "테스트 계정 정리", status: "done", priority: "normal"),
            TaskItem(id: "s9", num: 144, title: "화면 캡처 다시 찍기", status: "todo", priority: "normal"),
            TaskItem(id: "s10", num: 145, title: "가이드 영상 자막 확인", status: "todo", priority: "normal"),
            TaskItem(id: "s11", num: 146, title: "드라이브 폴더 이름 맞추기", status: "todo", priority: "low"),
            TaskItem(id: "s12", num: 147, title: "아주 긴 제목은 한 줄에서 잘려 보여야 합니다 그래야 옆 칸이 밀리지 않습니다", status: "doing", priority: "normal"),
            TaskItem(id: "s13", num: 148, title: "블로그 글 올리기", status: "todo", priority: "normal"),
            TaskItem(id: "s14", num: 149, title: "주간 회의 자료", status: "todo", priority: "normal"),
        ]
        let tasks = Array(all.prefix(count)).sorted { a, b in
            if a.statusRank != b.statusRank { return a.statusRank < b.statusRank }
            if a.priorityRank != b.priorityRank { return a.priorityRank < b.priorityRank }
            return a.num < b.num
        }
        return TodayData(date: Date(), scope: scope, body: .tasks(tasks), fetchedAt: Date())
    }
}
