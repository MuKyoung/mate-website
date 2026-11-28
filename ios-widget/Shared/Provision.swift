import Foundation

/// 설치할 때 함께 들어온 서명 정보(embedded.mobileprovision).
/// 스토어 밖으로 깐 앱은 서명 도구(Sideloadly · AltStore · Xcode)가 앱 그룹 이름을 바꾸기도 하고,
/// 무료 Apple ID 로 서명하면 7일 뒤 열리지 않는다 - 그 둘을 여기서 읽는다.
enum Provision {
    private static let plist: [String: Any]? = {
        var bundles = [Bundle.main]
        // 위젯은 MateToday.app/PlugIns/…​.appex 안에 있다 - 제 것이 없으면 앱의 것을 본다
        let url = Bundle.main.bundleURL
        if url.pathExtension == "appex",
           let app = Bundle(url: url.deletingLastPathComponent().deletingLastPathComponent()) {
            bundles.append(app)
        }
        for bundle in bundles {
            guard let file = bundle.url(forResource: "embedded", withExtension: "mobileprovision"),
                  let data = try? Data(contentsOf: file),
                  let head = data.range(of: Data("<?xml".utf8)),
                  let tail = data.range(of: Data("</plist>".utf8), options: [], in: head.lowerBound..<data.endIndex)
            else { continue }
            let xml = data.subdata(in: head.lowerBound..<tail.upperBound)
            if let p = (try? PropertyListSerialization.propertyList(from: xml, options: [], format: nil)) as? [String: Any] {
                return p
            }
        }
        return nil
    }()

    /// 이 서명이 허락한 앱 그룹
    static var groups: [String] {
        let ent = plist?["Entitlements"] as? [String: Any]
        return ent?["com.apple.security.application-groups"] as? [String] ?? []
    }

    /// 서명이 끝나는 때. 그 뒤로는 앱 · 위젯이 열리지 않아 다시 깔아야 한다
    static var expires: Date? { plist?["ExpirationDate"] as? Date }

    /// 이틀 안에 끝난다
    static var expiresSoon: Bool {
        guard let e = expires else { return false }
        return e.timeIntervalSinceNow < 48 * 3600
    }
}

/// 앱과 위젯이 로그인을 나눠 갖는 칸(앱 그룹).
enum AppGroup {
    static let base = "group.kr.co.devteammate.today"

    /// 실제로 열리는 앱 그룹. 서명 도구가 이름을 바꿨으면 바뀐 이름, 아예 뺐으면 nil
    static let id: String? = {
        let profile = Provision.groups
        var candidates = profile.filter { $0.contains("devteammate") }
        if let alt = Bundle.main.object(forInfoDictionaryKey: "ALTAppGroups") as? [String] {
            candidates += alt
        }
        candidates.append(base)
        candidates += profile
        var seen = Set<String>()
        for group in candidates where seen.insert(group).inserted {
            if FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: group) != nil {
                return group
            }
        }
        return nil
    }()
}
