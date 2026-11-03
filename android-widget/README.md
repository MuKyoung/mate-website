# MATE 오늘 (갤럭시 홈 화면 위젯)

작업 관리(/taskmanager) 캘린더에서 **오늘이 마감일인 작업**을 안드로이드 홈 화면 위젯으로 보여 주는 작은 앱입니다.

- 작업 관리와 같은 계정으로 로그인합니다. 승인된 팀원만 볼 수 있습니다(서버 RLS).
- 위젯을 놓을 때 **내 작업** 또는 **팀 전체**를 고릅니다. 위젯을 길게 눌러 다시 고를 수 있습니다.
- 30분마다, 새로고침 단추를 누를 때, 앱에서 로그인 · 로그아웃할 때 새로 읽습니다.
- 끝나지 않은 일이 위로(진행 중 · 리뷰 · 할 일 · 백로그 순, 같으면 급한 순), 완료는 맨 아래 회색입니다.
- 항목을 누르면 웹 작업 관리에서 그 작업이 열리고(`?task=<id>`), 머리를 누르면 캘린더가 열립니다(`?view=calendar`).

## 휴대폰에 설치

1. 작업 관리 왼쪽 메뉴(휴대폰은 오른쪽 위 사람 메뉴)의 **갤럭시 위젯 앱 → APK 받기**로 휴대폰에서 받습니다.
   PC 에서 받았다면 카카오톡 나에게 보내기 · 구글 드라이브 · USB 로 휴대폰에 옮깁니다.
2. 파일을 누르면 "출처를 알 수 없는 앱" 허용을 묻습니다 - 파일을 연 앱(내 파일 · 카카오톡 등)에 허용합니다.
3. Play 프로텍트가 "확인되지 않은 앱"이라고 하면 **자세히 → 무시하고 설치**를 누릅니다(스토어에 올리지 않은 사내 앱이라 나오는 안내).
4. 앱을 열어 작업 관리 메일 · 비밀번호로 로그인합니다.
5. 홈 화면 빈 곳을 길게 누르고 **위젯 → MATE 오늘**을 놓은 뒤 범위를 고릅니다.

웹 작업 관리를 휴대폰 브라우저에서 처음 열면 그 브라우저에서도 한 번 로그인해야 합니다(앱과 브라우저는 로그인을 따로 갖습니다).

## 업데이트(다시 빌드)

이 PC 에는 유니티가 깔아 둔 안드로이드 SDK · JDK 17 · Gradle 8.13 이 있어 그것으로 빌드합니다.

```powershell
$u = "C:\Program Files\Unity\Hub\Editor\6000.3.12f1\Editor\Data\PlaybackEngines\AndroidPlayer"
$env:JAVA_HOME = "$u\OpenJDK"
cd android-widget
& "$env:JAVA_HOME\bin\java.exe" -cp "$u\Tools\gradle\lib\gradle-launcher-8.13.jar" org.gradle.launcher.GradleMain --no-daemon assembleRelease
# → app/build/outputs/apk/release/app-release.apk
```

- 작업 관리의 받기 단추는 `public/downloads/mate-today.apk` 를 내려줍니다. 다시 빌드하면 이 파일을 새 APK 로 바꿔 커밋 · 배포합니다.

- `local.properties` 에 `sdk.dir=` (위 SDK 경로)가 있어야 합니다. 저장소에는 올리지 않습니다.
- 고친 판을 덮어 깔려면 `app/build.gradle` 의 `versionCode` 를 1 올리고, **같은 키로 서명**해야 합니다.
  지금은 이 PC 의 `%USERPROFILE%\.android\debug.keystore`(인증서 SHA-256 98a32dc0…742b)로 서명합니다.
  이 파일이 없어지면 새 판은 기존 앱 위에 깔리지 않아, 휴대폰에서 지우고 다시 깔아야 합니다.
- Supabase 프로젝트를 옮기면 `Api.java` 의 `BASE` · `KEY` 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꿉니다.

## 구조

| 파일 | 하는 일 |
| --- | --- |
| `Api.java` | 로그인 · 로그인 이어 가기(토큰 갱신) · 오늘 마감 작업 읽기(Supabase REST) |
| `TodayWidgetProvider.java` | 위젯 머리 · 새로고침 · 누르면 열 주소 |
| `TodayWidgetService.java` | 위젯 목록 채우기(서버 읽기는 여기서) |
| `WidgetConfigActivity.java` | 위젯을 놓을 때 내 작업 / 팀 전체 |
| `MainActivity.java` | 로그인 · 상태 화면 |
| `OpenActivity.java` | 위젯 항목의 주소를 브라우저로 넘기는 화면 없는 창 |

외부 라이브러리는 쓰지 않습니다(안드로이드 기본 기능만).
