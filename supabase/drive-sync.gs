/**
 * MATE Hub - 구글 드라이브 지도 갱신 (Google Apps Script)
 *
 * 팀 구글 드라이브(contact@devteammate.co.kr 의 내 드라이브)의 폴더 · 파일 목록을
 * Hub(Supabase)의 tm_drive_snapshot 으로 보낸다(supabase/taskmanager.sql 의 '구글 드라이브 지도').
 * Hub 의 '구글 드라이브' 화면이 그 목록을 트리로 그린다. 드라이브는 읽기만 한다 - 만들거나 고치거나 지우지 않는다.
 *
 * 1분마다 드라이브에 바뀐 것이 있는지만 가볍게 묻고(Drive 변경 기록), 바뀌었을 때만 목록을 통째로 보낸다.
 * 바뀐 것이 이어지면 통째로 보내기는 3분에 한 번으로 묶고, 바뀐 것이 없어도 30분마다 한 번은 보낸다(놓친 변경 · 살아 있다는 표시).
 *
 * 처음 한 번 - contact@devteammate.co.kr 로 로그인한 브라우저에서:
 *   1. https://script.google.com/home/projects/create 를 연다(새 프로젝트).
 *   2. 편집기의 내용을 모두 지우고 이 파일 전체를 붙여 넣은 뒤 저장(Ctrl+S)한다.
 *   3. 왼쪽 '서비스' 옆 + 를 눌러 'Drive API' 를 고르고 '추가'를 누른다.
 *   4. 위쪽 실행 목록에서 install 을 고르고 '실행'을 누른다. 권한 창이 뜨면
 *      contact@devteammate.co.kr → '고급' → '(안전하지 않음)으로 이동' → '허용'.
 *      직접 만든 스크립트라 '구글에서 확인하지 않은 앱'이라는 안내가 뜨는 것이 정상이다.
 *   5. 아래 실행 로그에 '설치 완료'가 나오면 끝이다.
 * 예전 판(30분마다)을 이미 설치했다면 내용만 이 파일로 바꿔 저장하고 install 을 한 번 더 실행한다.
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
/** 바뀐 것을 묻는 간격(분) */
const CHECK_MINUTES = 1;
/** 바뀐 것이 이어져도 통째로 보내기는 이 간격(분) 이상 - 하루 실행 시간 한도(개인 계정 90분) 안에 넉넉히 들게 */
const COOLDOWN_MINUTES = 3;
/** 바뀐 것이 없어도 통째로 보내는 간격(분) - Hub 는 이 세 배를 넘기면 '멈췄다'고 알린다 */
const FULL_MINUTES = 30;
const FOLDER = 'application/vnd.google-apps.folder';

/** 처음 한 번 - 1분마다 tick 을 부르게 하고 지금 한 번 보낸다. 다시 실행해도 된다 */
function install() {
  if (typeof Drive === 'undefined') {
    throw new Error("왼쪽 '서비스' 옆 + 를 눌러 Drive API 를 추가한 뒤 다시 실행하세요.");
  }
  if (SUPABASE_KEY.charAt(0) === '<' || SYNC_KEY.charAt(0) === '<') {
    throw new Error('맨 위 SUPABASE_KEY · SYNC_KEY 에 받은 값을 넣고 저장한 뒤 다시 실행하세요.');
  }
  uninstall();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('changeToken', Drive.Changes.getStartPageToken().startPageToken);
  const n = sync();
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(CHECK_MINUTES).create();
  console.log('설치 완료 - 드라이브가 바뀌면 1분쯤 뒤에 Hub 로 보냅니다. 지금 보낸 폴더 · 파일 ' + n + '개');
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
  if (!lock.tryLock(1000)) return; // 앞 실행이 아직 보내는 중
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

/** 지금 목록을 Hub 로 보낸다 */
function sync() {
  const got = collect_();
  push_(got.root, got.items, 'apps-script');
  const props = PropertiesService.getScriptProperties();
  props.setProperty('lastSync', String(Date.now()));
  props.setProperty('dirty', '0');
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

/** Hub 의 tm_drive_sync 로 목록을 통째로 바꾼다 */
function push_(root, items, source) {
  const res = UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/rpc/tm_drive_sync', {
    method: 'post',
    contentType: 'application/json',
    headers: { apikey: SUPABASE_KEY },
    payload: JSON.stringify({ p_key: SYNC_KEY, p_root: root, p_items: items, p_source: source }),
    muteHttpExceptions: true,
  });
  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Hub 로 보내지 못했습니다(' + code + '): ' + res.getContentText().slice(0, 300));
  }
}
