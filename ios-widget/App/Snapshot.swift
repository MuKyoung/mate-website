import SwiftUI
import WidgetKit

/// 빌드 확인용(`-snapshot` 으로 띄웠을 때만 돈다). 이 PC 에는 Mac 이 없어 GitHub 의 시뮬레이터에서
/// 위젯 그림을 PNG 로 뽑고, 서버 요청 모양 · JSON 읽기를 한 번 시험해 Documents/snap 에 남긴다.
@MainActor
enum Snapshot {
    static func run() async {
        let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("snap")
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)

        for (name, scheme) in [("light", ColorScheme.light), ("dark", ColorScheme.dark)] {
            let renderer = ImageRenderer(content: sheet.environment(\.colorScheme, scheme))
            renderer.scale = 2
            if let png = renderer.uiImage?.pngData() {
                try? png.write(to: dir.appendingPathComponent("widgets-\(name).png"))
            }
        }

        let text = await selfTest().joined(separator: "\n") + "\n"
        try? text.write(to: dir.appendingPathComponent("selftest.txt"), atomically: true, encoding: .utf8)
        try? "done\n".write(to: dir.appendingPathComponent("done.txt"), atomically: true, encoding: .utf8)
    }

    private static var cases: [(String, TodayData)] {
        var stale = TodayData.sample(.team, count: 3)
        stale.stale = true
        var soon = TodayData.sample(.mine, count: 2)
        soon.expiresSoon = true
        return [
            ("4건", .sample(.mine)),
            ("14건", .sample(.team, count: 14)),
            ("없음", TodayData(date: Date(), scope: .mine, body: .tasks([]), fetchedAt: Date())),
            ("로그인 필요", TodayData(date: Date(), scope: .mine, body: .message(ApiError.signedOut.message, needLogin: true))),
            ("연결 안 됨", stale),
            ("기한 임박", soon),
        ]
    }

    private static var sheet: some View {
        HStack(alignment: .top, spacing: 20) {
            ForEach(Array(cases.enumerated()), id: \.offset) { _, item in
                VStack(alignment: .leading, spacing: 14) {
                    Text(item.0)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(Palette.ink)
                    HStack(alignment: .top, spacing: 14) {
                        tile(item.1, .systemSmall, 158, 158)
                        tile(item.1, .systemSmall, 141, 141)
                    }
                    tile(item.1, .systemMedium, 338, 158)
                    tile(item.1, .systemMedium, 292, 141)
                    tile(item.1, .systemLarge, 338, 354)
                    tile(item.1, .systemLarge, 292, 311)
                    TodayWidgetView(data: item.1, family: .accessoryRectangular)
                        .frame(width: 160, height: 72)
                        .padding(8)
                        .background(Palette.card, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
        .padding(24)
        .background(Palette.bg)
    }

    private static func tile(_ data: TodayData, _ family: WidgetFamily, _ w: CGFloat, _ h: CGFloat) -> some View {
        TodayWidgetView(data: data, family: family)
            .padding(14)
            .frame(width: w, height: h)
            .background(Palette.card, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }

    private static func selfTest() async -> [String] {
        var lines: [String] = []
        lines.append("group=\(AppGroup.id ?? "none") linked=\(Store.linked)")
        lines.append("today=\(Day.iso()) label=\(Day.label(Date())) time=\(Day.time(Date()))")
        lines.append("midnight=\(Day.iso(Day.nextMidnight()))")

        // 틀린 로그인 - 서버에 닿는지, 실패 문구가 맞는지
        do {
            try await Api.shared.signIn(email: "selftest@devteammate.invalid", password: "wrong-password")
            lines.append("signin=unexpected ok")
        } catch let e as ApiError {
            lines.append("signin=\(e.message) needLogin=\(e.needLogin)")
        } catch {
            lines.append("signin=\(error)")
        }
        // 로그인 없이 읽기 - 앱을 열어 로그인하라는 문구
        let data = await TodayData.load(scope: .mine)
        if case .message(let text, let need) = data.body {
            lines.append("load=\(text) needLogin=\(need)")
        } else {
            lines.append("load=unexpected")
        }

        // 서버 답 읽기
        let token = #"{"access_token":"a","refresh_token":"r","expires_in":3600,"user":{"id":"u1","email":"a@b.c"}}"#
        let session = Session(token: Data(token.utf8))
        lines.append("session=\(session?.uid ?? "nil") \(session?.email ?? "nil") \(session?.refresh ?? "nil")")
        let rows = #"[{"id":"t1","num":3,"title":"가","status":"todo","priority":"high","assignee":"u1"},{"id":"t2","num":1,"title":null,"status":"doing","priority":"normal","assignee":null},{"id":"t3","num":2,"title":"다","status":"done","priority":"urgent","assignee":"u1"}]"#
        let tasks = Api.parseTasks(Data(rows.utf8)) ?? []
        lines.append("tasks=" + tasks.map { "\($0.num):\($0.status):\($0.priorityTag ?? "-")" }.joined(separator: ","))
        lines.append("url=\(Config.taskURL("abc 123").absoluteString)")
        return lines
    }
}
