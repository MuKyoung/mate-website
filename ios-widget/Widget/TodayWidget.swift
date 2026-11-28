import AppIntents
import SwiftUI
import WidgetKit

/// 위젯을 길게 눌러 '위젯 편집'에서 고르는 범위
enum ScopeOption: String, AppEnum {
    case mine, team

    static let typeDisplayRepresentation: TypeDisplayRepresentation = "범위"
    static let caseDisplayRepresentations: [ScopeOption: DisplayRepresentation] = [
        .mine: "내 작업",
        .team: "팀 전체",
    ]
}

struct TodayConfigIntent: WidgetConfigurationIntent {
    static let title: LocalizedStringResource = "MATE 오늘"
    static let description = IntentDescription("오늘이 마감일인 작업을 보여 줍니다.")

    @Parameter(title: "범위", default: .mine)
    var scope: ScopeOption

    /// 앱과 위젯이 로그인을 같이 쓰지 못하는 설치에서만 쓴다 - 앱이 화면에 코드를 보여 준다
    @Parameter(title: "연결 코드 (앱이 알려 줄 때만)")
    var code: String?
}

struct TodayEntry: TimelineEntry {
    let date: Date
    let data: TodayData
}

/// 서버에서 읽어 위젯에 넘긴다. 15분 뒤(자정이 먼저면 자정 직후) 다시 읽게 하고,
/// 새로 읽기 단추 · 앱에서 로그인 · 로그아웃할 때도 다시 읽는다. 실제 간격은 iOS 가 정한다.
struct TodayProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> TodayEntry {
        TodayEntry(date: Date(), data: .sample(.mine))
    }

    func snapshot(for configuration: TodayConfigIntent, in context: Context) async -> TodayEntry {
        if context.isPreview { return TodayEntry(date: Date(), data: .sample(.mine)) }
        return await make(configuration)
    }

    func timeline(for configuration: TodayConfigIntent, in context: Context) async -> Timeline<TodayEntry> {
        let entry = await make(configuration)
        let now = Date()
        let next = min(now.addingTimeInterval(15 * 60), Day.nextMidnight(after: now).addingTimeInterval(5))
        return Timeline(entries: [entry], policy: .after(next))
    }

    private func make(_ configuration: TodayConfigIntent) async -> TodayEntry {
        Store.adopt(code: configuration.code)
        let scope: Scope = configuration.scope == .team ? .team : .mine
        return TodayEntry(date: Date(), data: await TodayData.load(scope: scope))
    }
}

struct TodayEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: TodayEntry

    var body: some View {
        TodayWidgetView(data: entry.data, family: family)
            .padding(family == .accessoryRectangular ? 0 : 14)
            .containerBackground(for: .widget) { Palette.card }
            // 빈 곳을 누르면 - 로그인이 필요하면 앱, 아니면 웹 캘린더
            .widgetURL(entry.data.needLogin ? Config.appURL : Config.calendarURL)
    }
}

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "TodayWidget", intent: TodayConfigIntent.self, provider: TodayProvider()) { entry in
            TodayEntryView(entry: entry)
        }
        .configurationDisplayName("MATE 오늘")
        .description("오늘이 마감일인 작업을 보여 줍니다.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
        .contentMarginsDisabled()
    }
}

@main
struct MateTodayWidgets: WidgetBundle {
    var body: some Widget {
        TodayWidget()
    }
}
