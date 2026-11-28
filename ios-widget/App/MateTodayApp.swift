import SwiftUI
import UIKit
import WidgetKit

@main
struct MateTodayApp: App {
    @StateObject private var model = AppModel()
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(model)
                // 위젯의 항목 · 머리를 누르면 앱이 주소를 받는다 - 웹 주소면 브라우저로 넘긴다
                .onOpenURL { url in
                    guard url.scheme == "https" else { return }
                    DispatchQueue.main.async { UIApplication.shared.open(url) }
                }
        }
        .onChange(of: phase) { _, now in
            if now == .active { model.appeared() }
        }
    }
}

/// 앱 화면이 보는 상태. 서버와 주고받는 일은 화면을 멈추지 않게 뒤에서 한다
@MainActor
final class AppModel: ObservableObject {
    @Published var signedIn = false
    @Published var who = ""
    @Published var busy = false
    @Published var error: String?
    @Published var scope: Scope = .mine
    @Published var team: [TaskItem]?
    @Published var note: String?
    @Published var widgetCode: String?

    /// 빌드 확인용 - 서버 없이 보기용 값으로 로그인한 화면을 보인다
    let demo = ProcessInfo.processInfo.arguments.contains("-demo")
    private let snapshot = ProcessInfo.processInfo.arguments.contains("-snapshot")
    private var started = false

    var uid: String { demo ? "me" : (Store.session?.uid ?? "") }
    var mine: [TaskItem] { (team ?? []).filter { $0.assignee == uid } }
    var shown: [TaskItem] { scope == .mine ? mine : (team ?? []) }

    /// 오늘 마감 건수 - 팀 전체와 내 것을 함께 적는다
    var summary: String {
        guard let team else { return note ?? "오늘 마감 작업을 읽는 중…" }
        let open = team.filter { !$0.done }.count
        return "오늘 마감 \(team.count)건(남은 일 \(open)건) · 내 담당 \(mine.count)건"
    }

    func appeared() {
        if snapshot {
            if !started {
                started = true
                Task { await Snapshot.run() }
            }
            return
        }
        if demo {
            signedIn = true
            who = "홍길동"
            team = (TodayData.sample(.team, count: 7).tasks).enumerated().map { i, t in
                var t = t
                t.assignee = i % 2 == 0 ? "me" : "other"
                return t
            }
            return
        }
        sync()
        if signedIn { Task { await load() } }
    }

    private func sync() {
        let s = Store.session
        signedIn = s != nil
        who = s?.who ?? ""
        widgetCode = Store.linked ? nil : Store.widgetCode
        if s == nil { team = nil }
    }

    func signIn(email: String, password: String) async {
        let email = email.trimmingCharacters(in: .whitespacesAndNewlines)
        if email.isEmpty || password.isEmpty {
            error = "이메일과 비밀번호를 적어 주세요."
            return
        }
        busy = true
        error = nil
        do {
            try await Api.shared.signIn(email: email, password: password)
        } catch let e as ApiError {
            error = e.message
        } catch {
            self.error = "로그인하지 못했습니다."
        }
        busy = false
        sync()
        WidgetCenter.shared.reloadAllTimelines()
        if signedIn { await load() }
    }

    func signOut() async {
        await Api.shared.signOut()
        sync()
        WidgetCenter.shared.reloadAllTimelines()
    }

    /// 새로 읽기 - 앱의 목록과 놓인 위젯 모두
    func reload() async {
        WidgetCenter.shared.reloadAllTimelines()
        await load()
    }

    private func load() async {
        if demo { return }
        note = nil
        do {
            team = try await Api.shared.today(mine: false)
            sync()
        } catch let e as ApiError {
            team = nil
            note = e.message
            sync()
            // 로그인이 풀렸으면 로그인 칸으로 돌아가 까닭을 적는다
            if !signedIn { error = e.message }
        } catch {
            team = nil
            note = "작업을 읽지 못했습니다."
        }
    }
}

extension TodayData {
    var tasks: [TaskItem] {
        if case .tasks(let t) = body { return t }
        return []
    }
}
