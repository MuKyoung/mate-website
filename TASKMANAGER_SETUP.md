# 작업 관리 도구(/taskmanager) - Supabase 연결

작업 · 문서 · 팀원을 MATE 전용 Supabase 프로젝트에 두고, 팀원이 로그인해서 함께 씁니다.
키를 넣지 않고 빌드하면 예전처럼 각자 브라우저에만 저장합니다(로컬 개발용).

| 파일 | 하는 일 |
| --- | --- |
| `supabase/taskmanager.sql` | 표 · 권한(RLS) · 실시간 설정. SQL Editor 에서 한 번 실행 |
| `src/app/taskmanager/supabase.ts` | 연결 · 키 읽기 |
| `src/app/taskmanager/remote.ts` | 작업 · 문서 저장(실시간 반영, 브라우저 데이터 가져오기) |
| `src/app/taskmanager/team.ts` | 로그인 · 팀원 목록 |

## 처음 한 번

### 1. 프로젝트 만들기

1. https://supabase.com 에 로그인 → **New project**
2. Name: `mate-taskmanager`, Region: **Northeast Asia (Seoul)**
3. Database password 는 비밀번호 관리 앱에 저장해 둡니다(다시 볼 수 없습니다) → **Create new project**

세종호이스트크레인 홈페이지용 프로젝트는 고객 소유라 쓰지 않습니다.

### 2. 가입 요청 받기

**Authentication → Sign In / Providers** 에서 **Allow new users to sign up** 은 켜 두고,
**Email** 을 눌러 **Confirm email** 은 끄고 저장합니다.

- 로그인 화면의 **가입 요청**이 계정을 만듭니다. 새 계정은 늘 '승인 대기'로만 들어오고, 관리자가 승인하기 전에는 아무것도 못 봅니다.
- Confirm email 을 켜 두면 인증 메일을 보내야 하는데, Supabase 기본 메일은 조직 구성원 주소로만 가고 한 시간에 몇 통뿐이라 대부분의 가입 요청이 막힙니다.

### 3. 표 만들기

**SQL Editor → New query** 에 `supabase/taskmanager.sql` 내용을 통째로 붙여 넣고 **Run**.
`Success. No rows returned` 가 나오면 됩니다. 여러 번 실행해도 괜찮습니다.

이미 쓰던 프로젝트에 다시 실행했다면 4단계의 관리자 한 줄도 한 번 실행합니다. 관리자가 생기기 전까지는 아무도 승인할 수 없습니다.

### 4. 첫 계정 만들고 관리자로 승인하기

**Authentication → Users → Add user → Create new user**

- 이메일 · 비밀번호를 적고 **Auto Confirm User** 를 체크합니다. 대표님 계정을 먼저 만드세요.
- 저절로 승인되는 계정은 없습니다. 처음 만든 계정도 승인 대기로 들어옵니다.

**SQL Editor → New query** 에 아래 한 줄을 메일만 바꿔 넣고 **Run** 하면 그 계정이 승인되고 관리자가 됩니다.

```sql
update public.tm_members set active = true, is_admin = true where lower(email) = lower('대표님 메일') returning email, active, is_admin;
```

결과 칸에 그 계정 한 줄(`active` · `is_admin` 이 `true`)이 나오면 됩니다. 3단계와 달리 여기서 `Success. No rows returned` 는 실패입니다.
적은 메일이 Users 목록의 메일과 다르다는 뜻이니 고쳐서 다시 실행합니다.

같은 줄이 `supabase/taskmanager.sql` 맨 아래에도 적혀 있습니다. 관리자만 팀원 창에서 다른 사람을 승인하고 관리자로 정할 수 있습니다.

### 5. 키 넣기

**Project Settings → API Keys**(또는 Data API)에서 두 값을 복사합니다.

| 이름 | 값 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` 키 (새 프로젝트는 `Publishable key`, `sb_publishable_…`) |

- **Vercel**: mate-website 프로젝트 → Settings → Environment Variables 에 두 값을 Production · Preview 로 넣고,
  Deployments 에서 최신 배포를 **Redeploy** 합니다. 값은 빌드할 때 들어가서, 다시 배포해야 반영됩니다.
- **내 컴퓨터**: 저장소 루트에 `.env.local` 을 만들고 같은 두 줄을 넣습니다(`.env.example` 참고).

`service_role` 키는 어디에도 넣지 않습니다. 이 키는 모든 권한을 넘어서므로 사이트에 실리면 안 됩니다.
`anon` 키는 브라우저에 실려도 되는 키입니다. 누가 무엇을 볼지는 DB 의 RLS 가 정합니다.

### 6. 비밀번호 재설정 메일이 돌아올 곳

**Authentication → URL Configuration → Site URL** 을 `https://devteammate.co.kr/taskmanager/` 로 바꿉니다.

### 7. 들어가 보기

https://devteammate.co.kr/taskmanager/ → 로그인.
예전에 그 브라우저에서 쓴 작업 · 문서가 있으면 위에 안내가 뜹니다. **가져오기**를 누르면 팀 저장소로 옮깁니다.
작업 번호는 새로 매기고, 문서 안의 `MATE-###` 도 새 번호로 바꿔 적습니다. 예시 데이터는 옮기지 않습니다.

## 팀원 추가

1. 그 사람이 https://devteammate.co.kr/taskmanager/ 의 **가입 요청**에서 이름 · 이메일 · 비밀번호를 적어 보냅니다. 바로 '승인 대기' 화면이 뜹니다.
2. 관리자 계정 왼쪽 아래 내 이름에 승인 대기 숫자가 뜹니다. 눌러서 **팀원** 창 → **승인**. 그 사람 화면이 저절로 열립니다.
3. 모르는 사람이면 **거절**합니다. 계정째 지워지고, 같은 메일로 다시 요청할 수 있습니다.
4. 처음 들어온 사람은 팀원 창에서 역할을 적습니다.

대시보드 **Authentication → Users → Add user**(Auto Confirm User 체크)로 계정을 만들어 줘도 똑같이 승인 대기로 들어옵니다.

승인을 다른 사람에게도 맡기려면 팀원 창에서 그 사람의 **관리자로**를 누릅니다.
관리자는 자기 승인과 관리자 여부를 바꿀 수 없고, 마지막 관리자는 승인을 취소하거나 관리자에서 뺄 수 없습니다.
다른 사람을 먼저 관리자로 정한 뒤 그 사람에게 부탁합니다.

내보낼 때는 관리자가 팀원 창에서 **승인 취소**를 누르면 바로 아무것도 볼 수 없습니다. 관리자였다면 관리자에서도 빠집니다.
계정까지 지우려면 Supabase 의 Users 에서 지웁니다. 그 사람이 맡던 작업은 미배정이 됩니다.

## 영역을 맡을 사람

영역(웹 · 앱, 게임 · XR 처럼 작업을 가르는 갈래)은 맡은 사람만 만들고 고치고 지웁니다. 관리자와 따로 정하고, 화면에서는 누구도 바꿀 수 없습니다.
**SQL Editor → New query** 에 아래 한 줄을 메일만 바꿔 넣고 **Run** 합니다(같은 줄이 `supabase/taskmanager.sql` 맨 아래에 있습니다).

```sql
update public.tm_members set domain_editor = true where lower(email) = lower('그사람@메일') returning email, domain_editor;
```

맡은 사람에게는 왼쪽 메뉴의 '영역' 옆에 **관리**가 보입니다. 이름 · 짧은 이름(보드 카드의 알약) · 색 · 순서를 고치고 영역을 더하거나 지웁니다.
영역을 지울 때는 그 영역의 작업을 옮길 영역을 고르고, 마지막 하나는 지울 수 없습니다. 맡기기를 거두려면 `true` 를 `false` 로 바꿔 실행합니다.
승인을 취소하면 맡기기도 함께 빠집니다.

## 비밀번호를 잊었을 때

Supabase **Authentication → Users** 에서 그 사람의 줄 오른쪽 메뉴 → **Send password recovery**.
메일의 링크를 누르면 작업 관리에 로그인된 채로 열리고, 팀원 창이 저절로 떠서 새 비밀번호 칸부터 보입니다.
새 비밀번호를 정하면 끝입니다.
(Supabase 기본 메일은 한 시간에 몇 통만 보낼 수 있습니다.)

## 알아 둘 것

- 무료 요금제 프로젝트는 일주일 동안 아무도 쓰지 않으면 잠깁니다. 대시보드에서 **Restore** 하면 그대로 돌아옵니다.
- 저장은 고치는 즉시 화면에 반영되고, 0.5초 안에 서버로 갑니다. 다른 사람이 고친 것은 새로고침 없이 보입니다.
- 인터넷이 끊겨 저장하지 못하면 빨간 알림이 뜨고, 고친 내용은 화면에 둔 채 연결이 돌아오면 저절로 다시 보냅니다.
  그동안 창을 닫으려 하면 브라우저가 한 번 묻습니다.
- 서버가 받아 주지 않은 저장(권한이 없을 때 등)은 알림을 띄우고 화면을 서버에 저장된 내용으로 되돌립니다.
- 보고 있거나 고치던 작업 · 문서를 다른 팀원이 지우면 알려 줍니다. 지워진 것에는 더 보내지 않습니다.
- 실행 취소(Z)는 지우기 · 상태 옮기기 · 캘린더에서 마감일 옮기기 바로 뒤, 알림이 떠 있는 동안 한 번 쓸 수 있습니다. 지운 작업은 같은 번호로 되살아납니다.
  그사이 다른 사람이 그 작업을 옮기거나 되살렸으면 되돌리지 않습니다.
- 팀 위키의 아이콘 · 휴지통 · 기록(예전 판) · 댓글 · 그림과 파일 첨부 · 함께 보는 사람 표시는 3단계 SQL 의 위키 부분(tm_doc_versions ·
  tm_doc_comments 표, tm-files 저장소, tm_presence 권한)이 있어야 켜집니다. 그 전에는 위키가 예전처럼 문서 쓰기 · 삭제만 합니다.
  SQL 을 다시 실행하면 새로고침만으로 켜집니다(다시 배포할 필요 없음).
- 기록은 누가 고치기 시작할 때마다(다른 사람이 고치거나, 10분 넘게 쉬었다 고치거나, 30분 넘게 이어서 고칠 때) 그 전 모습을 남깁니다.
  예전 판으로 되돌려도 되돌리기 전 모습이 기록에 남습니다.
- 위키 문서는 휴지통으로 갔다가 직접 영구 삭제하거나 휴지통을 비울 때 지워집니다. 영구 삭제한 문서의 기록과 댓글도 함께 지워집니다.
- 그림 · 첨부 파일은 비공개 저장소(tm-files)에 들어가고, 승인된 팀원에게만 한 시간짜리 주소로 열립니다. 파일 하나는 20MB 까지입니다.

## 화면에 이런 말이 나오면

| 화면 | 할 일 |
| --- | --- |
| Supabase 에 작업 관리 표가 아직 없습니다 | 3단계 SQL 을 실행합니다 |
| 팀원 목록에 이 계정이 없습니다 | 3단계 SQL 을 한 번 더 실행합니다(그 전에 만든 계정을 채웁니다) |
| 승인을 기다리고 있습니다 | 관리자가 팀원 창에서 승인합니다. 첫 계정이면 4단계 SQL 한 줄을 실행합니다 |
| 가입 요청: 지금은 가입 요청을 받을 수 없습니다 | 2단계 설정을 봅니다(가입 허용 켜기, Confirm email 끄기) |
| 거절: 거절 기능이 아직 DB 에 없습니다 | 3단계 SQL 을 다시 실행합니다 |
| 팀원 창에 승인 버튼이 없다 | 관리자에게만 보입니다. 관리자가 아무도 없으면 4단계 SQL 한 줄을 실행합니다 |
| 메뉴의 '영역' 옆에 관리가 없다 | 영역을 맡은 사람에게만 보입니다. '영역을 맡을 사람'의 SQL 한 줄을 실행합니다. 3단계 SQL 이 예전 것이면 그것부터 다시 실행합니다 |
| 이메일 또는 비밀번호가 올바르지 않습니다 | Users 에 그 메일이 있는지, 비밀번호가 맞는지 확인합니다 |
| 메일 인증이 끝나지 않은 계정입니다 | Users 에서 그 계정을 지우고 Auto Confirm User 를 체크해 다시 만듭니다 |
| 로그인 화면 대신 예시 작업이 보인다 | 키 없이 빌드된 것입니다. 5단계 Vercel 값을 넣고 다시 배포합니다 |
