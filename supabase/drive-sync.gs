/**
 * MATE Hub - 구글 드라이브 지도 갱신 (Google Apps Script)
 *
 * 팀 구글 드라이브(contact@devteammate.co.kr 의 내 드라이브)의 폴더 · 파일 목록을 30분마다
 * Hub(Supabase)의 tm_drive_snapshot 으로 보낸다(supabase/taskmanager.sql 의 '구글 드라이브 지도').
 * Hub 의 '구글 드라이브' 화면이 그 목록을 트리로 그린다. 드라이브는 읽기만 한다 - 만들거나 고치거나 지우지 않는다.
 *
 * 처음 한 번 - contact@devteammate.co.kr 로 로그인한 브라우저에서:
 *   1. https://script.google.com/home/projects/create 를 연다(새 프로젝트).
 *   2. 편집기의 내용을 모두 지우고 이 파일 전체를 붙여 넣은 뒤 저장(Ctrl+S)한다.
 *   3. 왼쪽 '서비스' 옆 + 를 눌러 'Drive API' 를 고르고 '추가'를 누른다.
 *   4. 위쪽 실행 목록에서 install 을 고르고 '실행'을 누른다. 권한 창이 뜨면
 *      contact@devteammate.co.kr → '고급' → '(안전하지 않음)으로 이동' → '허용'.
 *      직접 만든 스크립트라 '구글에서 확인하지 않은 앱'이라는 안내가 뜨는 것이 정상이다.
 *   5. 아래 실행 로그에 '설치 완료'가 나오면 끝이다.
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
const EVERY_MINUTES = 30;
const FOLDER = 'application/vnd.google-apps.folder';

/** 처음 한 번 - 30분마다 sync 를 부르게 하고 지금 한 번 보낸다. 다시 실행해도 된다 */
function install() {
  if (typeof Drive === 'undefined') {
    throw new Error("왼쪽 '서비스' 옆 + 를 눌러 Drive API 를 추가한 뒤 다시 실행하세요.");
  }
  uninstall();
  ScriptApp.newTrigger('sync').timeBased().everyMinutes(EVERY_MINUTES).create();
  const n = sync();
  console.log('설치 완료 - ' + EVERY_MINUTES + '분마다 갱신합니다. 지금 보낸 폴더 · 파일 ' + n + '개');
}

/** 자동 갱신 멈추기 */
function uninstall() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'sync'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
}

/** 지금 목록을 Hub 로 보낸다 - 30분마다 불린다 */
function sync() {
  const got = collect_();
  push_(got.root, got.items, 'apps-script');
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
