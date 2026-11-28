import AppIntents
import SwiftUI
import UIKit
import WidgetKit

/// 웹 작업 관리(tailwind.config.ts 의 tm)와 같은 색. 어두운 화면에서는 밝힌 값을 쓴다
enum Palette {
    private static func dyn(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(UIColor { trait in
            let v = trait.userInterfaceStyle == .dark ? dark : light
            return UIColor(red: CGFloat((v >> 16) & 0xFF) / 255,
                           green: CGFloat((v >> 8) & 0xFF) / 255,
                           blue: CGFloat(v & 0xFF) / 255,
                           alpha: 1)
        })
    }

    static let blue = dyn(0x2644CB, 0x93A8FF)
    static let tint = dyn(0xEEF2FF, 0x222C4A)
    static let ink = dyn(0x1B2430, 0xF1F4F9)
    static let sub = dyn(0x5B6676, 0xAAB4C3)
    static let edge = dyn(0x7F8B9E, 0x8592A6)
    static let line = dyn(0xD7DCE4, 0x2C3545)
    static let bg = dyn(0xF4F6F9, 0x0E1218)
    static let card = dyn(0xFFFFFF, 0x171C26)
    static let red = dyn(0xD32D27, 0xFF8078)

    /// 상태 점 · 상태 글자 색
    static func status(_ s: String) -> Color {
        switch s {
        case "todo": return blue
        case "doing": return dyn(0xB45309, 0xF2A84B)
        case "review": return dyn(0x6A4C93, 0xC3A6EE)
        case "done": return dyn(0x17805A, 0x58C99B)
        default: return edge
        }
    }
}

/// 위젯의 새로 읽기 단추. 누르면 놓인 위젯이 모두 다시 읽는다
struct RefreshIntent: AppIntent {
    static let title: LocalizedStringResource = "새로 읽기"
    static let isDiscoverable = false

    func perform() async throws -> some IntentResult {
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

/// 위젯 안쪽 그림. 앱에서도 같은 것을 그려 보려고(빌드 확인용 그림) 크기를 값으로 받는다
struct TodayWidgetView: View {
    let data: TodayData
    let family: WidgetFamily

    var body: some View {
        switch family {
        case .accessoryRectangular:
            lock
        case .systemSmall:
            small
        case .systemLarge, .systemExtraLarge:
            board(large: true)
        default:
            board(large: false)
        }
    }

    /* ── 가운데 · 큰 크기 ─────────────────────────── */

    private func board(large: Bool) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            header
            switch data.body {
            case .tasks(let tasks) where !tasks.isEmpty:
                Group {
                    if large {
                        ViewThatFits(in: .vertical) {
                            list(tasks, limit: 11)
                            list(tasks, limit: 10)
                            list(tasks, limit: 9)
                            list(tasks, limit: 8)
                            list(tasks, limit: 7)
                            list(tasks, limit: 6)
                            list(tasks, limit: 5)
                        }
                    } else {
                        ViewThatFits(in: .vertical) {
                            list(tasks, limit: 4)
                            list(tasks, limit: 3)
                            list(tasks, limit: 2)
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            case .tasks:
                note("오늘 마감인 작업이 없습니다")
            case .message(let text, _):
                note(text)
            case .loading:
                note("불러오는 중…")
            }
            if data.expiresSoon {
                Text("설치 기한이 곧 끝납니다 · PC 에서 다시 설치해 주세요")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Palette.red)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
        }
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 8) {
            VStack(alignment: .leading, spacing: 2) {
                Text("오늘 마감")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(Palette.ink)
                Text(subtitle)
                    .font(.system(size: 11.5))
                    .foregroundStyle(Palette.sub)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            Spacer(minLength: 4)
            if case .tasks(let tasks) = data.body {
                Text("\(tasks.count)건")
                    .font(.system(size: 12.5, weight: .bold))
                    .foregroundStyle(Palette.blue)
                    .padding(.horizontal, 9)
                    .frame(height: 24)
                    .background(Palette.tint, in: Capsule())
            }
            refresh(size: 28)
        }
    }

    /// 11월 28일 (토) · 내 작업 · 오후 3:12
    private var subtitle: String {
        var parts = [Day.label(data.date), data.scope.label]
        if data.stale { parts.append("연결 안 됨") }
        if let at = data.fetchedAt { parts.append(Day.time(at)) }
        return parts.joined(separator: " · ")
    }

    private func refresh(size: CGFloat) -> some View {
        Button(intent: RefreshIntent()) {
            Image(systemName: "arrow.clockwise")
                .font(.system(size: size * 0.46, weight: .semibold))
                .foregroundStyle(Palette.blue)
                .frame(width: size, height: size)
                .background(Palette.tint, in: Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("새로 읽기")
    }

    /// limit 줄까지. 넘치면 마지막 줄에 나머지 건수를 적는다
    private func list(_ tasks: [TaskItem], limit: Int) -> some View {
        let over = tasks.count > limit
        let shown = over ? max(limit - 1, 1) : tasks.count
        return VStack(alignment: .leading, spacing: 0) {
            ForEach(tasks.prefix(shown)) { task in
                row(task)
            }
            if over {
                Text("외 \(tasks.count - shown)건")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Palette.sub)
                    .frame(height: 24, alignment: .center)
                    .padding(.leading, 14)
            }
        }
    }

    /// 누르면 웹 작업 관리에서 그 작업이 열린다
    private func row(_ task: TaskItem) -> some View {
        Link(destination: Config.taskURL(task.id)) {
            HStack(spacing: 7) {
                Circle()
                    .fill(Palette.status(task.status))
                    .frame(width: 7, height: 7)
                Text(task.title.isEmpty ? "(제목 없음)" : task.title)
                    .font(.system(size: 13.5, weight: .medium))
                    .foregroundStyle(task.done ? Palette.edge : Palette.ink)
                    .lineLimit(1)
                Spacer(minLength: 4)
                if let tag = task.priorityTag {
                    Text(tag)
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Palette.red)
                        .fixedSize()
                }
                Text(task.statusLabel)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Palette.status(task.status))
                    .fixedSize()
            }
            .frame(height: 24)
        }
    }

    private func note(_ text: String) -> some View {
        Text(text)
            .font(.system(size: 13))
            .foregroundStyle(Palette.sub)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    }

    /* ── 작은 크기 ────────────────────────────────── */

    private var small: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 4) {
                Text("오늘 마감")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(Palette.sub)
                Spacer(minLength: 0)
                refresh(size: 24)
            }
            switch data.body {
            case .tasks(let tasks):
                HStack(alignment: .firstTextBaseline, spacing: 2) {
                    Text("\(tasks.count)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(Palette.ink)
                    Text("건")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Palette.sub)
                }
                Text(smallLine(tasks))
                    .font(.system(size: 11.5))
                    .foregroundStyle(data.expiresSoon ? Palette.red : Palette.sub)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
                Spacer(minLength: 4)
                ForEach(tasks.prefix(2)) { task in
                    HStack(spacing: 6) {
                        Circle()
                            .fill(Palette.status(task.status))
                            .frame(width: 6, height: 6)
                        Text(task.title.isEmpty ? "(제목 없음)" : task.title)
                            .font(.system(size: 12.5, weight: .medium))
                            .foregroundStyle(task.done ? Palette.edge : Palette.ink)
                            .lineLimit(1)
                    }
                    .frame(height: 20)
                }
            case .message(let text, _):
                Text(text)
                    .font(.system(size: 12.5))
                    .foregroundStyle(Palette.sub)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            case .loading:
                Text("불러오는 중…")
                    .font(.system(size: 12.5))
                    .foregroundStyle(Palette.sub)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
        }
    }

    private func smallLine(_ tasks: [TaskItem]) -> String {
        if data.expiresSoon { return "설치 기한이 곧 끝납니다" }
        if data.stale { return "\(data.scope.label) · 연결 안 됨" }
        let open = tasks.filter { !$0.done }.count
        return tasks.isEmpty ? data.scope.label : "\(data.scope.label) · 남은 일 \(open)건"
    }

    /* ── 잠금 화면 ────────────────────────────────── */

    private var lock: some View {
        VStack(alignment: .leading, spacing: 1) {
            switch data.body {
            case .tasks(let tasks):
                Text("오늘 마감 \(tasks.count)건")
                    .font(.headline)
                    .widgetAccentable()
                if tasks.isEmpty {
                    Text("마감인 작업이 없습니다")
                        .font(.caption)
                } else {
                    ForEach(tasks.prefix(2)) { task in
                        Text(task.title.isEmpty ? "(제목 없음)" : task.title)
                            .font(.caption)
                            .lineLimit(1)
                    }
                }
            case .message(let text, _):
                Text("MATE 오늘")
                    .font(.headline)
                    .widgetAccentable()
                Text(text)
                    .font(.caption)
                    .lineLimit(2)
            case .loading:
                Text("오늘 마감")
                    .font(.headline)
                Text("불러오는 중…")
                    .font(.caption)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
