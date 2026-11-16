# MATE 캘린더 (Windows 바탕화면 캘린더 위젯)

Hub(/hub)의 **내 작업**을 Windows 바탕화면에 달력 위젯으로 띄우는 작은 프로그램입니다.
갤럭시 위젯 'MATE 오늘'(`android-widget/`)의 Windows 판입니다.

- 생김새는 맥 메뉴 막대 캘린더 **[Calendr](https://github.com/pakerwreah/Calendr)**(MIT, 별 2.4천, 2026-10 까지 꾸준히 갱신)의
  본 화면을 그대로 옮겼습니다 - 달 이름 · ‹ ○ ›, 주말 칸 바탕, 이번 달 테두리, 오늘 파란 테두리, 일정 색 점(세 개 넘으면 색 띠),
  📌 ☰ 📅 ⋯ 도구 줄, '기한 지남 · 오늘' 요약, 날짜 구역 줄과 색 막대 일정 줄. 길이 · 글자 크기 · 색은 Calendr 소스의 값입니다
  (셀 25pt, 날짜 12pt, 요일 굵게 11pt, 테두리 2pt · 모서리 5, 일정 줄 모서리 8 · 색 막대 4pt …). 코드는 옮기지 않고 새로 썼습니다.
- 맥의 흐린 유리(vibrancy)는 **위젯 뒤의 바탕화면 그림을 잘라 흐리게 깔아서** 냅니다. Windows 의 아크릴 · 미카 바탕은
  창이 비활성이면 단색으로 바뀌는데, 바탕화면 위젯은 늘 비활성이라 쓸 수 없었습니다(이 PC 에서 시험).
- 글꼴은 Hub 와 같은 Pretendard(OFL)를 exe 에 넣었습니다. 밝게 · 어둡게는 Windows 설정을 따르고 메뉴에서 바꿀 수 있습니다.

## 하는 일

- Hub 와 같은 메일 · 비밀번호로 로그인합니다(승인된 팀원만, 서버 RLS). 로그인 정보와 작업 사본은 이 PC 의 Windows 계정만
  풀 수 있게(DPAPI) `%LOCALAPPDATA%\MATE Calendar` 에 둡니다.
- 달력에는 **마감일**에 색 점을 찍습니다(웹 캘린더처럼). 끝난 작업은 점을 찍지 않습니다.
- 날을 누르면 아래 목록이 그날부터 앞으로 7일(메뉴에서 0 · 3 · 7 · 14일)의 작업을 보여 줍니다. 오늘을 고르면 맨 위에
  끝나지 않은 지난 작업을 '어제 · 그저께 · N일 전'으로 묶어 보여 줍니다(Calendr 의 기한 지난 미리 알림).
- 일정 줄: 색 막대 · ○(완료면 ◉) · 급함 `!!!` / 높음 `!!` · 제목, `MATE-12 · 진행 중`, 여러 날이면 기간, 라벨은 `#라벨`.
  누르면 웹 Hub 에서 그 작업이 열립니다(`/hub/?task=<id>`). 날을 두 번 누르거나 📅 는 Hub 캘린더, ☰ 는 Hub 목록.
- 색 기준은 영역(기본) · 라벨 · 담당자 - Hub 의 색(tm_colors · 자동 색 규칙)과 같은 색 이름을 Apple 시스템 색으로 옮깁니다.
- 3분마다, 위젯에 마우스를 올렸을 때(1분 넘었으면), 잠에서 깨거나 인터넷이 돌아오면 새로 읽습니다.
- ⋯ 메뉴: 새로 읽기 · 보기(내 작업 / 팀 전체) · 색 기준 · 목록 · 달력(이번 달 테두리 · 주 번호) · 크기 · 모양(밝게/어둡게/투명도) ·
  자리 고정 · 자리 처음으로 · Windows 시작 시 실행 · Hub 열기 · 업데이트 설치 · 로그아웃 · 끝내기.
  작업 표시줄 알림 영역의 아이콘도 같은 메뉴(오른쪽 클릭)이고, 왼쪽 클릭은 위젯을 잠깐 앞으로 꺼내 보여 줍니다.

### 바탕화면에 붙는 방법

- 위젯 창은 늘 **다른 창들 아래, 바탕화면 바로 위**에 있습니다(`HWND_BOTTOM` - Windows 가 바탕화면 창 Progman 바로 위에 놓는 것을
  z 순서로 확인). 눌러도 앞으로 나오지 않고(`WS_EX_NOACTIVATE`), 작업 표시줄 · Alt+Tab 에 없습니다.
- '바탕 화면 보기'(Win+D)는 바탕화면 창을 위로 올려 위젯까지 가립니다. Rainmeter 의 'On Desktop' 처럼 앞 창이 바탕화면으로 바뀌고
  바탕화면 창이 위젯보다 위에 있으면 잠깐 맨 위로 올리고, 다른 창이 앞으로 오면 되돌립니다. 작업 표시줄 끝의 바탕 화면 미리 보기에도 남습니다.
- 머리(달 이름)를 끌면 옮겨지고 자리는 기억합니다. 📌 로 고정합니다.

## 설치(팀원)

1. Hub 왼쪽 메뉴의 **Windows 위젯 → 설치 파일 받기**로 `MATE-Calendar-Setup.exe` 를 받습니다.
2. 브라우저가 '흔히 받는 파일이 아님'이라고 하면 **유지**를, Windows 가 'PC 보호' 창을 띄우면 **추가 정보 → 실행**을 누릅니다
   (코드 서명을 하지 않은 사내 프로그램이라 나오는 안내).
3. 설치 창에서 **설치** - 내 계정에만 깔려 관리자 권한이 필요 없습니다(`%LOCALAPPDATA%\Programs\MATE Calendar`).
4. 로그인 창에 Hub 메일 · 비밀번호를 넣으면 화면 오른쪽 위에 위젯이 뜹니다.

지우기: 설정 → 앱 → 설치된 앱 → 'MATE 캘린더' → 제거.

## 업데이트(다시 빌드)

```powershell
# 1) MateCalendar.csproj 의 <Version> 을 올린다
# 2) 빌드 + 배포 파일 두 개를 만든다
powershell -File windows-widget\tools\release.ps1 -Notes "바뀐 점"
# 3) public/downloads/MATE-Calendar-Setup.exe · mate-calendar.json 을 커밋 · main 푸시(Vercel)
```

- 깔린 위젯은 6시간마다(그리고 켤 때) `https://devteammate.co.kr/downloads/mate-calendar.json` 의 `version` 을 보고, 새것이면
  ⋯ 단추에 파란 점과 '업데이트 설치' 메뉴를 띄웁니다. 누르면 받아서 SHA-256 을 맞춰 본 뒤 `--update` 로 깔고 다시 띄웁니다.
- 빌드에는 .NET SDK(이 PC 9.0) 와 .NET Framework 4.8 참조 어셈블리가 필요합니다. 결과물은 .NET Framework 4.8(Windows 10 1903+ · 11 기본 포함)용
  exe 하나라 팀원 PC 에 따로 깔 것이 없습니다.
- Supabase 프로젝트를 옮기면 `Api.cs` 의 `Base` · `Key` 를 웹의 Vercel 값(NEXT_PUBLIC_SUPABASE_URL · ANON_KEY)과 같게 바꿉니다.
- 아이콘은 `python tools/make_icon.py`(Pillow)로 다시 만듭니다.

### 점검용 실행 옵션

| 옵션 | 하는 일 |
| --- | --- |
| `--portable` | 설치하지 않고 이 자리에서 바로 띄움 |
| `--demo` | 보기 자료로(로그인 없이) |
| `--snapshot <png> [--theme dark\|light] [--scale 1.5] [--backdrop x,y] [--extras]` | 창 없이 위젯(· 메뉴 · 로그인 · 설치 창)을 PNG 로 |
| `--update [--quiet]` | 묻지 않고 설치 · 업데이트(quiet 면 띄우지 않음) |
| `--uninstall [--quiet]` | 지우기 |

## 구조

| 파일 | 하는 일 |
| --- | --- |
| `App.cs` | 시작(설치 · 하나만 돌기 · 점검 그림), Controller(새로 읽기 · 메뉴 · 로그인 · 업데이트), 알림 영역 아이콘, 보기 자료 |
| `WidgetWindow.cs` | 위젯 화면 - 머리 · 달력 · 도구 줄 · 요약 · 목록, 끌어 옮기기 |
| `DesktopPin.cs` | 바탕화면 맨 아래 붙이기 · Win+D · 미리 보기 |
| `Backdrop.cs` | 바탕화면 그림(IDesktopWallpaper)을 잘라 흐리게 만든 유리 바탕 |
| `Api.cs` | Supabase - 로그인 · 토큰 갱신 · 작업 / 영역 / 색 / 팀원 읽기(갤럭시 위젯 Api.java 와 같은 길) |
| `Store.cs` | JSON · 작업 모양 · 설정 · DPAPI 보관 |
| `Theme.cs` · `Icons.cs` · `Styles.cs` | macOS 의미 색 · Apple 시스템 색, SF Symbols 를 다시 그린 아이콘, 메뉴 · 스크롤 막대 |
| `Dialogs.cs` | 로그인 창 · 설치 창 |
| `Installer.cs` · `Updater.cs` | 내 계정 설치 · 지우기 · 자동 실행, 새 판 받기 |

## 저작권 표시

- 화면 디자인: Calendr - Copyright (c) 2021 Carlos César Neves Enumo, MIT License.
- 글꼴: Pretendard - Copyright (c) 2021 Kil Hyung-jin, SIL Open Font License 1.1 (`Fonts/OFL.txt`).
