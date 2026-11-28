# MATE 오늘 (아이폰 홈 화면 · 잠금 화면 위젯)

Hub(/hub) 캘린더에서 **오늘이 마감일인 작업**을 아이폰 위젯으로 보여 주는 작은 앱입니다. 갤럭시용 `android-widget/` 과 같은 일을 합니다.

- Hub 와 같은 계정으로 로그인합니다. 승인된 팀원만 볼 수 있습니다(서버 RLS).
- 위젯 크기는 작게 · 가운데 · 크게, 그리고 잠금 화면용이 있습니다.
- 위젯을 길게 눌러 **위젯 편집**에서 **내 작업** 또는 **팀 전체**를 고릅니다. 처음에는 내 작업입니다.
- 15분쯤마다(실제 간격은 iOS 가 정합니다), 새로 읽기 단추를 누를 때, 앱에서 로그인 · 로그아웃할 때 새로 읽습니다.
- 끝나지 않은 일이 위로(진행 중 · 리뷰 · 할 일 · 백로그 순, 같으면 급한 순), 완료는 맨 아래 회색입니다.
- 항목을 누르면 웹 Hub 에서 그 작업이 열리고(`?task=<id>`), 빈 곳을 누르면 캘린더가 열립니다(`?view=calendar`).
- 서버에 닿지 않으면 오늘 앞서 읽은 목록을 **연결 안 됨**과 함께 보입니다.
- iOS 17 이상에서 돕니다.

## 앱스토어 없이 설치하기

아이폰은 안드로이드의 APK 처럼 **파일만 받아서 깔 수는 없습니다.** 앱스토어에 올리지 않은 앱은 누군가의 Apple ID 로 서명해야 열립니다.
그래서 이 앱은 서명하지 않은 파일(IPA)로 내고, **쓰는 사람이 자기 Apple ID 로 서명해서** 넣습니다. 앱스토어 심사 · 공개를 거치지 않습니다.

| 방법 | 돈 | 쓸 수 있는 기간 | 준비물 |
| --- | --- | --- | --- |
| 1. 무료 Apple ID + PC 의 Sideloadly | 없음 | **7일**(그 전에 다시 설치하면 이어짐) | Windows · Mac PC, USB 케이블 |
| 2. Apple 개발자 프로그램에 든 Apple ID | 한 해 99달러(원화 값은 가입 화면에서 확인) | **1년** | 위와 같음. 또는 기기를 등록해 링크로 설치 |

직원 100명 이상인 법인만 신청할 수 있는 기업용 프로그램, 유럽연합에서만 되는 대체 마켓은 여기에 맞지 않아 뺐습니다.

### 방법 1. 무료 Apple ID 로 넣기 (Windows PC 기준)

1. **IPA 받기** - Hub 왼쪽 메뉴(휴대폰은 오른쪽 위 사람 메뉴)의 **휴대폰 위젯 앱 → 아이폰 → IPA 받기**로 PC 에 받습니다.
2. **PC 준비(처음 한 번)**
   - Apple 사이트에서 받은 **iTunes** 와 **iCloud** 를 깝니다. Microsoft Store 에서 깐 것은 지우고 Apple 사이트 판으로 바꿉니다.
   - [sideloadly.io](https://sideloadly.io) 에서 **Sideloadly** 를 받아 깝니다.
3. **아이폰 잇기** - USB 로 PC 에 잇고 아이폰에 뜨는 **이 컴퓨터를 신뢰**를 누릅니다. iTunes 를 한 번 열어 아이폰이 보이는지 확인합니다.
4. **넣기** - Sideloadly 를 열어 IPA 를 끌어다 놓고, Apple ID 를 적고 **Start** 를 누릅니다. 비밀번호와 확인 코드를 묻습니다.
5. **아이폰에서 허락(처음 한 번)**
   - 설정 › 일반 › **VPN 및 기기 관리** › 개발자 앱의 내 Apple ID › **신뢰**
   - 설정 › 개인정보 보호 및 보안 › **개발자 모드** 켜기(아이폰이 다시 켜집니다). 이 항목은 앱을 한 번 넣은 뒤에 나타납니다.
6. **로그인 · 위젯 놓기** - 앱을 열어 Hub 메일 · 비밀번호로 로그인합니다. 홈 화면 빈 곳을 길게 눌러 왼쪽 위의 **편집(또는 +) → 위젯 추가 → MATE 오늘**.
7. **7일마다** 4번을 다시 합니다. 같은 Apple ID 로 다시 넣으면 로그인과 놓아 둔 위젯은 그대로입니다.
   앱 아래쪽에 **이 설치는 ○월 ○일까지** 가 적혀 있고, 이틀 안으로 다가오면 위젯에도 빨간 글씨로 알립니다.
   Sideloadly 의 자동 갱신을 켜 두면 PC 와 아이폰이 이어져 있을 때 알아서 다시 넣습니다.

무료 Apple ID 는 한 기기에 이렇게 넣은 앱을 3개까지만 둘 수 있습니다.

### 방법 2. 개발자 프로그램 계정으로 넣기

- 가장 쉬운 길: 방법 1 과 똑같이 하되 **개발자 프로그램에 든 Apple ID** 를 Sideloadly 에 적습니다. 1년 동안 다시 넣지 않아도 됩니다.
- 케이블 없이 깔게 하려면: [developer.apple.com](https://developer.apple.com/account) 에서 팀원 아이폰을 등록하고(한 해 100대까지),
  Ad Hoc 프로파일로 서명한 IPA 를 사내 주소에 올려 사파리에서 누르면 깔립니다. 이때는 GitHub 빌드에 인증서를 넣어 서명까지 자동으로 하도록 워크플로를 고쳐야 합니다.
- TestFlight 내부 테스터로 돌리는 길도 있습니다. 스토어에 공개되지는 않지만 TestFlight 앱은 앱스토어에서 받아야 하고 90일마다 새 빌드를 올려야 합니다.

### 보안에서 알아 둘 것

- **Apple ID 비밀번호를 Sideloadly 에 적게 됩니다.** Sideloadly 는 Apple 서버에만 보낸다고 밝히지만 소스를 공개하지 않은 도구입니다.
  평소 쓰는 Apple ID 대신 **이 용도로만 쓰는 Apple ID 를 새로 만들어** 쓰기를 권합니다. 소스가 공개된 AltStore(AltServer) 로도 같은 일을 할 수 있습니다.
- IPA 에는 비밀이 없습니다. 들어 있는 키는 웹 Hub 와 같은 공개 키이고, 로그인해야만 작업이 보입니다.
- 로그인(토큰)은 아이폰 안, 이 앱과 위젯만 여는 칸에 둡니다. 앱에서 로그아웃하면 서버에도 알려 그 로그인을 못 쓰게 합니다.
- **개발자 모드**는 스토어 밖 앱을 열게 하는 iOS 설정입니다. 회사 정책으로 막혀 있는 아이폰에서는 이 방법을 쓸 수 없습니다.

### 앱과 위젯이 로그인을 같이 쓰지 못할 때

앱과 위젯은 '앱 그룹'이라는 칸으로 로그인을 나눠 씁니다. 서명 도구가 이 칸의 이름을 바꾸면 앱이 알아서 바뀐 이름을 찾고,
아예 빼 버리면 앱 화면에 **위젯에 로그인 넘기기**가 나타납니다. **연결 코드 복사**를 누른 뒤, 위젯을 길게 눌러 **위젯 편집**의 연결 코드 칸에 붙여 넣으면 됩니다.

## 빌드

이 저장소를 고치는 PC 에는 Mac 이 없어 **GitHub 의 Mac 에서 빌드합니다**(`.github/workflows/ios-widget.yml`).
`ios-widget/` 을 고쳐 올리면 저절로 돌고, 결과는 릴리스 [ios-widget-build](https://github.com/MuKyoung/mate-website/releases/tag/ios-widget-build) 에 올라옵니다.

| 파일 | 내용 |
| --- | --- |
| `MATE-Today.ipa` | 서명하지 않은 설치 파일 |
| `widgets-light.png` · `widgets-dark.png` | 위젯을 크기별 · 경우별로 그린 그림 |
| `app-login.png` · `app-demo-*.png` | 시뮬레이터에서 찍은 앱 화면 |
| `selftest.txt` | 서버 요청 · 답 읽기 자체 시험 |
| `status.txt` · `*-errors.txt` · `*-tail.txt` | 커밋 · 성공 여부 · 빌드 기록 |

- Hub 의 받기 단추는 `public/downloads/mate-today.ipa` 를 내려줍니다. 새로 빌드하면 릴리스의 IPA 로 이 파일을 바꿔 커밋 · 배포합니다.
- 판을 올릴 때는 `project.yml` 의 `MARKETING_VERSION` · `CURRENT_PROJECT_VERSION` 을 올립니다.
- Mac 이 있으면: `brew install xcodegen && xcodegen generate` 로 `MateToday.xcodeproj` 를 만들어 Xcode 로 열거나,
  `bash tools/build-ipa.sh`(IPA) · `bash tools/simulate.sh`(시뮬레이터 확인)를 돌립니다.
- Supabase 프로젝트를 옮기면 `Shared/Config.swift` 의 `base` · `key` 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꿉니다.
- 아이콘은 `tools/make-icon.ps1` 이 그립니다(갤럭시 아이콘과 같은 그림).

## 구조

| 파일 | 하는 일 |
| --- | --- |
| `Shared/Config.swift` | 서버 · 웹 주소 |
| `Shared/Api.swift` | 로그인 · 로그인 이어 가기(토큰 갱신) · 오늘 마감 작업 읽기(Supabase REST) |
| `Shared/Store.swift` | 로그인 · 앞서 읽은 목록 두기, 날짜 글자 |
| `Shared/Provision.swift` | 서명 정보 읽기 - 앱 그룹 이름 찾기, 설치 기한 |
| `Shared/TodayData.swift` | 위젯 한 번 그릴 값 만들기 |
| `Shared/TodayViews.swift` | 위젯 그림(작게 · 가운데 · 크게 · 잠금 화면), 색, 새로 읽기 단추 |
| `Widget/TodayWidget.swift` | 위젯 등록 · 범위 고르기 · 언제 다시 읽을지 |
| `App/MateTodayApp.swift` · `App/ContentView.swift` | 로그인 · 상태 화면 |
| `App/Snapshot.swift` | 빌드 확인용 그림 · 자체 시험(`-snapshot` 으로 띄울 때만) |

외부 라이브러리는 쓰지 않습니다(SwiftUI · WidgetKit · AppIntents 만).
