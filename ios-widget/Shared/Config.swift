import Foundation

/// 작업 관리(Supabase 서울 프로젝트) 주소와 웹 Hub 주소.
///
/// 키는 웹 Hub · 갤럭시 위젯과 같은 공개(publishable) 키다. 누가 무엇을 읽는지는 DB 의 RLS 가 정한다 -
/// 승인된 팀원만 작업을 읽는다(supabase/taskmanager.sql). service_role 키는 앱에 넣지 않는다.
/// 프로젝트를 옮기면 base · key 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꾼다.
enum Config {
    static let base = "https://duxqhatypwcjiqmddcmu.supabase.co"
    static let key = "sb_publishable_f6jyYhExiCTRF-CBShXkwg_A2QZa9WP"
    /// 웹 Hub - ?task=<id> 는 그 작업을, ?view=calendar 는 캘린더를 연다
    static let web = "https://devteammate.co.kr/hub/"

    static var calendarURL: URL { URL(string: web + "?view=calendar")! }

    static func taskURL(_ id: String) -> URL {
        var c = URLComponents(string: web)
        c?.queryItems = [URLQueryItem(name: "task", value: id)]
        return c?.url ?? calendarURL
    }

    /// 위젯에서 앱(로그인 화면)을 여는 주소
    static let appURL = URL(string: "matetoday://open")!
}
