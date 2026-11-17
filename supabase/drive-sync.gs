/**
 * MATE Hub - 구글 드라이브 지도 갱신 (Google Apps Script)
 *
 * 팀 구글 드라이브(contact@devteammate.co.kr 의 내 드라이브)의 폴더 · 파일 목록을
 * Hub(Supabase)의 tm_drive_snapshot 으로 보낸다(supabase/taskmanager.sql 의 '구글 드라이브 지도').
 * Hub 의 '구글 드라이브' 화면이 그 목록을 트리로 그린다. 드라이브는 읽기만 한다 - 만들거나 고치거나 지우지 않는다.
 *
 * 1분마다 드라이브에 바뀐 것이 있는지만 가볍게 묻고(Drive 변경 기록), 바뀌었을 때만 목록을 통째로 보낸다.
 * 바뀐 것이 이어지면 통째로 보내기는 3분에 한 번으로 묶고, 바뀐 것이 없어도 30분마다 한 번은 보낸다(놓친 변경 · 살아 있다는 표시).
 * 웹 앱으로도 배포하면 Hub 의 '드라이브 확인' 단추가 이 스크립트를 바로 깨운다(doPost) - 승인된 팀원만, 팀 전체에 30초에 한 번.
 *
 * 처음 한 번 - contact@devteammate.co.kr 로 로그인한 브라우저에서:
 *   1. https://script.google.com/home/projects/create 를 연다(새 프로젝트).
 *   2. 편집기의 내용을 모두 지우고 이 파일 전체를 붙여 넣은 뒤 저장(Ctrl+S)한다.
 *   3. 왼쪽 '서비스' 옆 + 를 눌러 'Drive API' 를 고르고 '추가'를 누른다.
 *   4. 위쪽 실행 목록에서 install 을 고르고 '실행'을 누른다. 권한 창이 뜨면
 *      contact@devteammate.co.kr → '고급' → '(안전하지 않음)으로 이동' → '허용'.
 *      직접 만든 스크립트라 '구글에서 확인하지 않은 앱'이라는 안내가 뜨는 것이 정상이다.
 *   5. 아래 실행 로그에 '설치 완료'가 나오면 자동 갱신은 끝이다.
 * '드라이브 확인' 단추(바로 확인)까지 쓰려면 이어서:
 *   6. 오른쪽 위 '배포' → '새 배포' → 톱니 → '웹 앱'. 실행 계정은 '나', 액세스 권한은 '모든 사용자' → '배포'.
 *      (모든 사용자여도 스크립트가 Hub 로그인을 확인해 승인된 팀원만 받는다)
 *   7. 나온 '웹 앱 URL'(…/exec)을 복사해 아래 WEBAPP_URL 따옴표 안에 넣고 저장한 뒤, install 을 한 번 더 실행한다.
 * 예전 판을 이미 설치했다면 SUPABASE_KEY · SYNC_KEY 줄은 그대로 두고 나머지를 이 파일로 바꾼 뒤 install 을 다시 실행한다.
 * 코드를 바꾼 뒤에는 '배포 → 배포 관리 → 연필 → 버전: 새 버전 → 배포'로 웹 앱도 새 판으로 올린다(주소는 그대로).
 *
 * 멈추려면 uninstall 을 실행한다. 실패하면 구글이 contact@ 메일로 알린다.
 * 저장소의 이 파일은 틀이다 - SUPABASE_KEY · SYNC_KEY 를 채운 사본을 붙여 넣는다.
 * SYNC_KEY 는 Hub DB 의 tm_drive_sync_keys(sha256)와 짝인 비밀이다. 새로 만들면 DB 쪽도 바꾼다.
 */

const SUPABASE_URL = 'https://duxqhatypwcjiqmddcmu.supabase.co';
/** 공개 키(NEXT_PUBLIC_SUPABASE_ANON_KEY) - 브라우저에 실려도 되는 값이다 */
const SUPABASE_KEY = '<공개 키>';
/** 갱신 열쇠 - 비밀 */
const SYNC_KEY = '<갱신 열쇠>';
/** 바로 확인 주소 - 6번에서 나온 웹 앱 URL(https://script.google.com/macros/s/…/exec). 비우면 단추 없이 자동 갱신만 */
const WEBAPP_URL = '';
/** 바뀐 것을 묻는 간격(분) */
const CHECK_MINUTES = 1;
/** 바뀐 것이 이어져도 통째로 보내기는 이 간격(분) 이상 - 하루 실행 시간 한도(개인 계정 90분) 안에 넉넉히 들게 */
const COOLDOWN_MINUTES = 3;
/** 바뀐 것이 없어도 통째로 보내는 간격(분) - Hub 는 이 세 배를 넘기면 '멈췄다'고 알린다 */
const FULL_MINUTES = 30;
/** 바로 확인을 이 간격(초) 안에 다시 부르면 새로 받지 않고 방금 받은 것을 알린다 - 팀 전체에 한 번 */
const MANUAL_GAP_SECONDS = 30;
const FOLDER = 'application/vnd.google-apps.folder';
const WEBAPP_RE = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;

/** 처음 한 번 - 1분마다 tick 을 부르게 하고 지금 한 번 보낸다. 다시 실행해도 된다 */
function install() {
  if (typeof Drive === 'undefined') {
    throw new Error("왼쪽 '서비스' 옆 + 를 눌러 Drive API 를 추가한 뒤 다시 실행하세요.");
  }
  if (SUPABASE_KEY.charAt(0) === '<' || SYNC_KEY.charAt(0) === '<') {
    throw new Error('맨 위 SUPABASE_KEY · SYNC_KEY 에 받은 값을 넣고 저장한 뒤 다시 실행하세요.');
  }
  const props = PropertiesService.getScriptProperties();
  if (WEBAPP_URL) {
    if (!WEBAPP_RE.test(WEBAPP_URL)) throw new Error('WEBAPP_URL 은 https://script.google.com/macros/s/…/exec 모양이어야 합니다.');
    // 웹 앱은 배포한 때의 코드로 돌기 때문에 주소는 코드가 아니라 스크립트 속성에 둔다(어느 판이 보내도 같은 주소)
    props.setProperty('webAppUrl', WEBAPP_URL);
  }
  uninstall();
  props.setProperty('changeToken', Drive.Changes.getStartPageToken().startPageToken);
  const n = sync();
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(CHECK_MINUTES).create();
  console.log('설치 완료 - 드라이브가 바뀌면 1분쯤 뒤에 Hub 로 보냅니다. 지금 보낸 폴더 · 파일 ' + n + '개');
  console.log(props.getProperty('webAppUrl')
    ? "'드라이브 확인' 단추도 켜졌습니다."
    : "'드라이브 확인' 단추를 쓰려면 맨 위 설명의 6 · 7번(웹 앱 배포 → WEBAPP_URL)을 하고 install 을 다시 실행하세요.");
}

/** 자동 갱신 멈추기 - 예전 판의 sync 트리거도 함께 지운다 */
function uninstall() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'tick' || t.getHandlerFunction() === 'sync'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
}

/** 1분마다 - 바뀐 것이 있으면(또는 30분이 지났으면) 목록을 보낸다 */
function tick() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return; // 앞 실행 · 바로 확인이 아직 보내는 중
  try {
    const props = PropertiesService.getScriptProperties();
    let dirty = props.getProperty('dirty') === '1';
    let token = props.getProperty('changeToken');
    if (!token) {
      token = Drive.Changes.getStartPageToken().startPageToken;
      dirty = true;
    }
    let next = token;
    let pageToken = token;
    while (pageToken) {
      const res = Drive.Changes.list(pageToken, { pageSize: 1000, fields: 'nextPageToken, newStartPageToken, changes(fileId)' });
      if ((res.changes || []).length) dirty = true;
      if (res.newStartPageToken) next = res.newStartPageToken;
      pageToken = res.nextPageToken || null;
    }
    props.setProperty('changeToken', next);
    props.setProperty('dirty', dirty ? '1' : '0');

    const since = Date.now() - Number(props.getProperty('lastSync') || 0);
    if ((dirty && since >= COOLDOWN_MINUTES * 60000) || since >= FULL_MINUTES * 60000) sync();
  } finally {
    lock.releaseLock();
  }
}

/**
 * 바로 확인 - Hub 의 '드라이브 확인' 단추가 부른다. 몸통은 { token: Hub 로그인 토큰 }.
 * 답: { ok, count } 새로 보냄 · { ok, skipped, ageSeconds } 방금 받은 것 그대로 · { ok: false, error } 못 함
 */
function doPost(e) {
  let body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    body = {};
  }
  if (!isMember_(String(body.token || ''))) return json_({ ok: false, error: 'not-member' });
  const lock = LockService.getScriptLock();
  // 다른 사람의 확인 · 1분 갱신이 돌고 있으면 끝나기를 기다린다 - 끝나면 방금 것이라 새로 받지 않는다
  if (!lock.tryLock(45000)) return json_({ ok: false, error: 'busy' });
  try {
    const since = Date.now() - Number(PropertiesService.getScriptProperties().getProperty('lastSync') || 0);
    if (since < MANUAL_GAP_SECONDS * 1000) return json_({ ok: true, skipped: true, ageSeconds: Math.round(since / 1000) });
    return json_({ ok: true, count: sync() });
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err).slice(0, 200) });
  } finally {
    lock.releaseLock();
  }
}

/** 웹 앱 주소를 브라우저로 열었을 때 - 살아 있는지만 알린다(아무것도 바꾸지 않는다) */
function doGet() {
  return ContentService.createTextOutput('MATE 드라이브 갱신 - 동작 중입니다. Hub 의 드라이브 확인 단추가 이 주소를 씁니다.');
}

/** 누른 사람이 승인된 Hub 팀원인가 - 그 사람의 로그인 토큰으로 tm_is_member 를 부른다 */
function isMember_(token) {
  if (!token || token.length > 4000) return false;
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/tm_is_member', {
    method: 'post',
    contentType: 'application/json',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token },
    payload: '{}',
    muteHttpExceptions: true,
  });
  return res.getResponseCode() === 200 && res.getContentText().trim() === 'true';
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/** 지금 목록을 Hub 로 보낸다 */
function sync() {
  const got = collect_();
  push_(got.root, got.items, 'apps-script');
  const props = PropertiesService.getScriptProperties();
  props.setProperty('lastSync', String(Date.now()));
  props.setProperty('dirty', '0');
  // 방금 보낸 것을 1분 갱신이 다시 보내지 않게 변경 기록 위치도 지금으로
  props.setProperty('changeToken', Drive.Changes.getStartPageToken().startPageToken);
  console.log('갱신 - 폴더 · 파일 ' + got.items.length + '개');
  return got.items.length;
}

/** 내 드라이브(맨 위)에서 닿는 폴더 · 파일만 - 공유 문서함 · 휴지통은 뺀다 */
function collect_() {
  const root = Drive.Files.get('root', { fields: 'id' }).id;
  const all = [];
  let pageToken = null;
  do {
    const res = Drive.Files.list({
      q: 'trashed = false',
      pageSize: 1000,
      pageToken: pageToken,
      fields: 'nextPageToken, files(id, name, mimeType, parents, webViewLink, modifiedTime)',
    });
    (res.files || []).forEach(function (f) { all.push(f); });
    pageToken = res.nextPageToken || null;
  } while (pageToken);

  const kids = {};
  all.forEach(function (f) {
    const p = (f.parents && f.parents[0]) || '';
    (kids[p] = kids[p] || []).push(f);
  });
  const items = [];
  const seen = {};
  const queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const parent = queue[i];
    (kids[parent] || []).forEach(function (f) {
      if (seen[f.id]) return;
      seen[f.id] = true;
      items.push({
        id: f.id,
        parent: parent,
        name: f.name || '',
        mime: f.mimeType || '',
        url: f.webViewLink || '',
        modified: f.modifiedTime || null,
      });
      if (f.mimeType === FOLDER) queue.push(f.id);
    });
  }
  return { root: root, items: items };
}

/**
 * Hub 의 tm_drive_sync 로 목록을 통째로 바꾼다.
 * 웹 앱 주소가 있으면 설정 줄(id '#refresh')을 하나 붙인다 - Hub 는 # 로 시작하는 줄을 트리에 넣지 않는다
 */
function push_(root, items, source) {
  const webApp = PropertiesService.getScriptProperties().getProperty('webAppUrl') || '';
  const rows = WEBAPP_RE.test(webApp)
    ? items.concat([{ id: '#refresh', parent: null, name: '바로 확인', mime: '', url: webApp, modified: null }])
    : items;
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/tm_drive_sync', {
    method: 'post',
    contentType: 'application/json',
    headers: { apikey: SUPABASE_KEY },
    payload: JSON.stringify({ p_key: SYNC_KEY, p_root: root, p_items: rows, p_source: source }),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Hub 로 보내지 못했습니다(' + code + '): ' + res.getContentText().slice(0, 300));
  }
}
