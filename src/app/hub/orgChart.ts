import { useCallback, useEffect, useRef, useState } from 'react';
import { isMissingTable, isRemote, sb } from './supabase';
import type { Member } from './types';

/*
 * 조직도의 데이터 - 팀원마다 소속(팀) · 상위(보고 대상) · 맡은 일 · 쓰는 MATE Studio 도구 · 담당 구글 드라이브 폴더.
 * 팀원 자체(이름 · 직무 · 사진)는 tm_members 이고, 여기는 그 옆에 붙는 한 줄(tm_org)이다.
 *   · 맡은 일 · 도구 · 폴더는 본인과 관리자가, 소속 · 상위는 관리자만 고친다 - DB(tm_org_guard · RLS)가 지킨다.
 *   · 줄이 없는 팀원도 조직도에 나온다(소속 미정, 도구는 직무로 추천).
 * 브라우저 저장 모드(Supabase 키 없이 빌드)는 이 브라우저에만 적고 누구나 고친다.
 * 화면은 Org.tsx - 조직도를 열 때만 이 파일을 받는다.
 */

export interface OrgFolder {
  /** 구글 드라이브 폴더 id */
  id: string;
  /** 연결할 때의 이름 - 드라이브 목록에서 못 찾을 때 보인다 */
  name: string;
}

export interface OrgEntry {
  member: string;
  /** 소속 팀 · 파트 - 비면 '소속 미정' */
  unit: string;
  /** 보고 대상(팀원 id) */
  manager: string | null;
  /** 맡은 역할과 책임 - 한 줄에 하나 */
  duties: string;
  /** 직접 고른 MATE Studio 도구(STUDIO_APPS 의 id) - 비면 직무로 추천만 한다 */
  tools: string[];
  folders: OrgFolder[];
  updatedAt: string | null;
  updatedBy: string | null;
}

export type OrgPatch = Partial<Pick<OrgEntry, 'unit' | 'manager' | 'duties' | 'tools' | 'folders'>>;

export const UNIT_MAX = 40;
export const DUTIES_MAX = 4000;
export const TOOLS_MAX = 40;
export const FOLDERS_MAX = 30;
/** 소속을 비운 사람이 모이는 자리 */
export const NO_UNIT = '소속 미정';

export const blankEntry = (member: string): OrgEntry => ({
  member, unit: '', manager: null, duties: '', tools: [], folders: [], updatedAt: null, updatedBy: null,
});

/** 맡은 일 - 빈 줄 · 앞의 글머리표(-, ·, *, 숫자.)를 떼고 줄마다 하나 */
export function dutyLines(duties: string): string[] {
  return duties
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-·•*]|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

/* ── 구글 드라이브 폴더 ─────────────────────────────── */

const FOLDER_ID = /^[A-Za-z0-9_-]{10,120}$/;

export const isFolderId = (s: string) => FOLDER_ID.test(s);

/**
 * 붙여 넣은 글에서 폴더 id 를 꺼낸다 - 드라이브 폴더 주소(…/folders/<id>, …/u/1/folders/<id>, open?id=<id>)나 id 그대로.
 * 구글이 아닌 주소 · 모양이 다른 글은 null
 */
export function folderIdFrom(text: string): string | null {
  const s = text.trim();
  if (!s) return null;
  if (isFolderId(s)) return s;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' || !/(^|\.)google\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/);
    const id = m?.[1] ?? u.searchParams.get('id') ?? '';
    return isFolderId(id) ? id : null;
  } catch {
    return null;
  }
}

/* ── MATE Studio 도구 ─────────────────────────────── */

export type StudioGroup = 'design' | 'video' | '3d' | 'game' | 'sound' | 'office';

export const STUDIO_GROUPS: { id: StudioGroup; label: string }[] = [
  { id: 'design', label: '그래픽 · 디자인' },
  { id: 'video', label: '영상 · 모션' },
  { id: '3d', label: '3D · 캐릭터' },
  { id: 'game', label: '게임 제작' },
  { id: 'sound', label: '사운드' },
  { id: 'office', label: '문서 · 사무' },
];

export interface StudioApp {
  id: string;
  name: string;
  /** 대신하는 프로그램 - 없으면 적지 않는다 */
  replaces?: string;
  /** 카드 알약에 쓰는 짧은 이름 - 없으면 이름에서 'MATE ' 를 뗀다 */
  short?: string;
  /** 무엇을 하는지 한 줄 */
  does: string;
  group: StudioGroup;
}

/* MATE Hub 데스크톱 앱의 studio_info(앱 구성)와 각 도구 설명을 옮겼다(2026-11-17). 이름 · 대신하는 것은 그대로 */
export const STUDIO_APPS: StudioApp[] = [
  { id: 'photo', name: 'MATE Photo', replaces: '포토샵', does: '사진 보정 · 합성, PSD 를 그대로 열고 고칩니다', group: 'design' },
  { id: 'paint', name: 'MATE Paint', replaces: '클립 스튜디오', does: '드로잉 · 만화 · 셀 애니메이션', group: 'design' },
  { id: 'vector', name: 'MATE Vector', replaces: '일러스트레이터', does: '로고 · 아이콘 · UI · 도식 같은 벡터 그림(.ai · SVG · PDF)', group: 'design' },
  { id: 'design', name: 'MATE Design', replaces: '피그마', does: '앱 · 웹 · 게임 UI 화면, 오토 레이아웃 · 컴포넌트 · 코드 핸드오프(.fig)', group: 'design' },
  { id: 'pipeline', name: '파이프라인 도구', short: '파이프라인', does: '표정 · 의상 차분, PSD 검수, 스프라이트 시트 · 엔진 좌표 파일, 일괄 변환', group: 'design' },
  { id: 'motion', name: 'MATE Motion', replaces: '애프터 이펙트', does: '모션 그래픽 - 컴포지션 · 키프레임 · 렌더', group: 'video' },
  { id: 'film', name: 'MATE Film', replaces: '프리미어 프로', does: '컷 편집 · 타이틀 · 자막 · 색 보정 · 소리', group: 'video' },
  { id: 'cut', name: 'MATE Cut', replaces: '캡컷', does: '숏폼 편집 - 캡컷 템플릿 가져오기 · 자동 자막 · 전환 · 효과', group: 'video' },
  { id: 'model', name: 'MATE Model', replaces: '3ds Max', does: '3D 모델링 - 편집 가능한 폴리 · 수정자 스택(GLB · FBX · OBJ)', group: '3d' },
  { id: 'sculpt', name: 'MATE Sculpt', replaces: '지브러시', does: '디지털 조각 - 몸 · 머리 · 크리처 기본 메시에서 시작', group: '3d' },
  { id: 'texture', name: 'MATE Texture', replaces: '서브스턴스 페인터', does: '3D 메시에 PBR 레이어 · 마스크 · 베이크, Unity · Unreal 텍스처', group: '3d' },
  { id: 'material', name: 'MATE Material', replaces: '서브스턴스 디자이너', does: '노드 그래프로 절차적 머티리얼 · 타일 텍스처', group: '3d' },
  { id: 'gen3d', name: 'MATE Gen3D', does: '그림 한 장(또는 4면 그림)을 텍스처가 입혀진 3D 모델(GLB)로', group: '3d' },
  { id: 'animate', name: 'MATE Animate', replaces: '믹사모 · 캐스케이더', does: '3D 캐릭터 자동 리깅 · 애니메이션', group: '3d' },
  { id: 'mocap', name: 'MATE Mocap', replaces: '모션빌더', does: '모캡 · 리타깃 · 애니메이션 레이어 · F-커브', group: '3d' },
  { id: 'rig', name: 'MATE Rig', replaces: 'Live2D Cubism', does: 'PSD 레이어로 2D 캐릭터 리깅 · moc3 내보내기', group: '3d' },
  { id: 'cloth', name: 'MATE Cloth', replaces: '마블러스 디자이너', does: '2D 옷본 · 재봉 · 천 시뮬레이션으로 3D 의상', group: '3d' },
  { id: 'level', name: 'MATE Level', replaces: '레벨 디자인 툴 · ProBuilder', does: '그레이박스 · 장치 · 플레이 시험 · 내비메시 검수, Unity · Godot 내보내기', group: 'game' },
  { id: 'music', name: 'MATE Music', replaces: 'FL Studio', does: '패턴 · 채널로 비트 · 곡 만들기', group: 'sound' },
  { id: 'compose', name: 'MATE Compose', replaces: '큐베이스', does: '트랙 · 피아노 롤 · 코드 트랙으로 작곡 · 편곡(WAV · MIDI · 스템)', group: 'sound' },
  { id: 'wave', name: 'MATE Wave', replaces: '오디션', does: 'WAV · MP3 · FLAC 오디오 편집, 멀티트랙 세션', group: 'sound' },
  { id: 'audio', name: 'MATE Audio', replaces: 'FMOD Studio', does: '게임 사운드 이벤트 · 매개변수 · 믹서 · 뱅크, Unity 패키지', group: 'sound' },
  { id: 'wwise', name: 'MATE Wwise', replaces: 'Wwise Authoring', does: 'Wwise 프로젝트를 그대로 열어 고치고 사운드뱅크', group: 'sound' },
  { id: 'doc', name: 'MATE Doc', replaces: '워드', does: '.docx · .odt · .rtf 문서 - 스타일 · 표 · 각주 · 변경 내용 추적', group: 'office' },
  { id: 'slides', name: 'MATE Slides', replaces: '파워포인트', does: '.pptx 발표 자료 - 레이아웃 · 애니메이션 · 전환 · 슬라이드 쇼', group: 'office' },
  { id: 'sheet', name: 'MATE Sheet', replaces: '엑셀', does: '.xlsx · .csv 표 - 함수 · 차트 · 피벗 · 조건부 서식', group: 'office' },
  { id: 'md', name: 'MD 리더', replaces: '마크다운 뷰어', does: '기획서 · README · AI 보고서를 표 · 도식째 HTML · PDF 로', group: 'office' },
];

export const APP_BY_ID = new Map(STUDIO_APPS.map((a) => [a.id, a]));
/** 카드에 쓰는 짧은 이름 - 'MATE Photo' → 'Photo' */
export const shortName = (a: StudioApp) => a.short ?? a.name.replace(/^MATE /, '');

/*
 * 직무 · 소속 · 맡은 일 글에 든 낱말로 도구를 고른다. 영문 줄임말(UI · PM · QA …)은 낱말 경계로, 한글은 들어 있기만 하면 맞는다.
 * 점수를 더해 높은 순서로 넷 - 같으면 STUDIO_APPS 순서.
 */
interface Rule { words: string[]; label: string; apps: [string, number][] }
const RULES: Rule[] = [
  { words: ['UI', 'UX', '화면 설계', '프로덕트 디자인', '피그마', 'Figma', '웹디자인', '웹 디자인', '앱디자인', '앱 디자인'], label: 'UI · UX',
    apps: [['design', 4], ['vector', 2], ['photo', 1]] },
  { words: ['그래픽', '일러스트', '원화', '드로잉', '웹툰', '만화', '컨셉', '콘셉트', '2D'], label: '그래픽 · 원화',
    apps: [['paint', 4], ['photo', 3], ['vector', 2], ['pipeline', 1]] },
  { words: ['디자인', '디자이너', '아트', 'Art'], label: '디자인',
    apps: [['photo', 2], ['design', 2], ['vector', 2]] },
  { words: ['3D', '모델링', '모델러'], label: '3D',
    apps: [['model', 4], ['texture', 3], ['sculpt', 2], ['material', 2], ['gen3d', 2]] },
  { words: ['캐릭터'], label: '캐릭터',
    apps: [['sculpt', 2], ['animate', 2], ['rig', 2], ['cloth', 1]] },
  { words: ['애니메이션', '애니메이터', '리깅', '리거', 'Live2D', '라이브2D', '모캡'], label: '애니메이션',
    apps: [['animate', 4], ['mocap', 3], ['rig', 3], ['motion', 1]] },
  { words: ['모션'], label: '모션 그래픽',
    apps: [['motion', 4], ['film', 1]] },
  { words: ['영상', '비디오', '유튜브', '촬영', '편집자'], label: '영상',
    apps: [['film', 4], ['cut', 3], ['motion', 2]] },
  { words: ['마케팅', '홍보', 'SNS', '콘텐츠', '브랜딩', '브랜드'], label: '마케팅 · 홍보',
    apps: [['cut', 4], ['photo', 2], ['vector', 2], ['slides', 2], ['film', 1]] },
  { words: ['사운드', '음향', '오디오', '효과음', 'SFX'], label: '사운드',
    apps: [['wave', 4], ['audio', 4], ['wwise', 3], ['music', 1]] },
  { words: ['음악', '작곡', 'BGM', '편곡'], label: '음악',
    apps: [['compose', 4], ['music', 4], ['wave', 1]] },
  { words: ['레벨', '맵 디자인', '월드'], label: '레벨 디자인',
    apps: [['level', 5], ['sheet', 1]] },
  { words: ['게임 기획', '게임기획', '시스템 기획', '콘텐츠 기획', '밸런스'], label: '게임 기획',
    apps: [['level', 3], ['sheet', 3], ['doc', 2], ['slides', 1], ['md', 1]] },
  { words: ['클라이언트', '유니티', 'Unity', '언리얼', 'Unreal', 'Godot', '게임 개발', '게임개발'], label: '게임 클라이언트',
    apps: [['pipeline', 4], ['level', 3], ['audio', 2], ['md', 2]] },
  { words: ['XR', 'VR', 'AR', 'MR', '메타버스'], label: 'XR',
    apps: [['model', 3], ['gen3d', 3], ['texture', 2], ['level', 2]] },
  { words: ['서버', '백엔드', '프론트', '프런트', '풀스택', '=웹', '=앱', '=웹앱', '웹 개발', '웹개발', '앱 개발', '앱개발', '개발', '엔지니어', 'DevOps', '인프라'], label: '개발',
    apps: [['md', 4], ['sheet', 2], ['doc', 1]] },
  { words: ['PM', 'PO', '기획', '매니저', '운영', '경영', '대표', '사업', '총괄', '팀장', 'CEO', 'CTO', '이사'], label: '기획 · 운영',
    apps: [['slides', 4], ['sheet', 4], ['doc', 3], ['md', 2]] },
  { words: ['QA', '테스트', '검수', '품질'], label: 'QA',
    apps: [['sheet', 3], ['md', 2], ['doc', 1], ['pipeline', 1]] },
  { words: ['강의', '교육', '강사', '튜터'], label: '교육',
    apps: [['slides', 4], ['doc', 2], ['film', 2], ['md', 1]] },
];

const LATIN = /^[A-Za-z0-9 ]+$/;
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* 낱말 앞의 '=' 는 한 줄 전체가 그 낱말일 때만('웹' 직무는 맞고 '웹 디자이너'는 아니다) */
const RULE_TESTS = RULES.map((r) => ({
  rule: r,
  test: (text: string, lower: string, lines: string[]) =>
    r.words.some((w) =>
      w.startsWith('=') ? lines.includes(w.slice(1).toLowerCase()) : LATIN.test(w)
        ? new RegExp(`(^|[^A-Za-z])${escapeRe(w)}([^A-Za-z]|$)`, 'i').test(text)
        : lower.includes(w.toLowerCase())),
}));

export interface Suggestion { app: StudioApp; why: string[] }

/** 글(직무 · 소속 · 맡은 일)에 맞는 도구 - 맞는 낱말이 없으면 문서 · 사무 넷 */
export function recommend(text: string, limit = 4): Suggestion[] {
  const lower = text.toLowerCase();
  const score = new Map<string, number>();
  const why = new Map<string, string[]>();
  const lines = lower.split('\n').map((l) => l.trim());
  for (const { rule, test } of RULE_TESTS) {
    if (!test(text, lower, lines)) continue;
    for (const [id, w] of rule.apps) {
      score.set(id, (score.get(id) ?? 0) + w);
      const list = why.get(id) ?? [];
      if (!list.includes(rule.label)) list.push(rule.label);
      why.set(id, list);
    }
  }
  if (score.size === 0) {
    return ['doc', 'sheet', 'slides', 'md'].slice(0, limit).map((id) => ({ app: APP_BY_ID.get(id)!, why: [] }));
  }
  return STUDIO_APPS
    .filter((a) => score.has(a.id))
    .sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0))
    .slice(0, limit)
    .map((a) => ({ app: a, why: why.get(a.id) ?? [] }));
}

/** 추천에 쓰는 글 - 직무 · 소속 · 맡은 일 */
export const profileText = (m: Member, e: OrgEntry) => [m.role, e.unit, e.duties].filter(Boolean).join('\n');

/** 한 사람의 도구 - 직접 고른 것(있는 id 만, 고른 순서) + 그와 겹치지 않는 추천 */
export function toolsOf(m: Member, e: OrgEntry, limit = 4): { pinned: StudioApp[]; suggested: Suggestion[] } {
  const pinned = e.tools.map((id) => APP_BY_ID.get(id)).filter((a): a is StudioApp => !!a);
  const have = new Set(pinned.map((a) => a.id));
  const suggested = recommend(profileText(m, e), limit + pinned.length).filter((s) => !have.has(s.app.id)).slice(0, pinned.length ? 2 : limit);
  return { pinned, suggested };
}

/* ── 저장소 ─────────────────────────────────────── */

const LOCAL_KEY = 'mate.taskmanager.org.v1';
const COLS = 'member, unit, manager, duties, tools, folders, updated_at, updated_by';

interface OrgRow {
  member: string;
  unit: string | null;
  manager: string | null;
  duties: string | null;
  tools: unknown;
  folders: unknown;
  updated_at: string | null;
  updated_by: string | null;
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

function cleanFolders(raw: unknown): OrgFolder[] {
  if (!Array.isArray(raw)) return [];
  const out: OrgFolder[] = [];
  const seen = new Set<string>();
  for (const f of raw) {
    if (!f || typeof f !== 'object') continue;
    const id = str((f as { id?: unknown }).id);
    if (!isFolderId(id) || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: str((f as { name?: unknown }).name).slice(0, 200) });
  }
  return out.slice(0, FOLDERS_MAX);
}

function cleanTools(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((t): t is string => typeof t === 'string' && /^[a-z0-9-]{1,24}$/.test(t)))].slice(0, TOOLS_MAX);
}

function entryFromRow(r: OrgRow): OrgEntry {
  return {
    member: r.member,
    unit: str(r.unit),
    manager: r.manager || null,
    duties: str(r.duties),
    tools: cleanTools(r.tools),
    folders: cleanFolders(r.folders),
    updatedAt: r.updated_at,
    updatedBy: r.updated_by,
  };
}

/** 저장 전에 모양을 맞춘다 - DB 의 검사와 같은 한도 */
function cleanPatch(p: OrgPatch): OrgPatch {
  const out: OrgPatch = {};
  if (p.unit !== undefined) out.unit = p.unit.trim().slice(0, UNIT_MAX);
  if (p.manager !== undefined) out.manager = p.manager || null;
  if (p.duties !== undefined) out.duties = p.duties.replace(/\s+$/, '').slice(0, DUTIES_MAX);
  if (p.tools !== undefined) out.tools = cleanTools(p.tools);
  if (p.folders !== undefined) out.folders = cleanFolders(p.folders);
  return out;
}

function readLocal(): Map<string, OrgEntry> {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) return new Map();
    const rows = list.filter((r): r is OrgRow => !!r && typeof r === 'object' && typeof (r as OrgRow).member === 'string');
    return new Map(rows.map((r) => [r.member, entryFromRow(r)]));
  } catch {
    return new Map();
  }
}

function writeLocal(map: Map<string, OrgEntry>) {
  const rows: OrgRow[] = [...map.values()].map((e) => ({
    member: e.member, unit: e.unit, manager: e.manager, duties: e.duties, tools: e.tools, folders: e.folders,
    updated_at: e.updatedAt, updated_by: e.updatedBy,
  }));
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

export type OrgStatus = 'loading' | 'ready' | 'missing' | 'error';

export interface OrgStore {
  /** missing = 표가 아직 DB 에 없다(SQL 을 실행하기 전) - 조직도는 팀원만으로 그린다 */
  status: OrgStatus;
  message: string;
  entries: Map<string, OrgEntry>;
  /** 실패하면 화면에 보일 문구, 성공하면 null */
  save(member: string, patch: OrgPatch): Promise<string | null>;
  reload(): Promise<void>;
}

const MISSING_TEXT = '조직도 표가 아직 DB 에 없습니다. supabase/taskmanager.sql 의 \'조직도\' 블록을 Supabase SQL Editor 에서 실행해 주세요.';

function friendly(e: { code?: string; message?: string }): string {
  if (isMissingTable(e)) return MISSING_TEXT;
  if (e.code === '42501') return '이 사람의 조직도는 본인이나 관리자만 고칠 수 있습니다.';
  // tm_org_guard 가 올린 규칙 문구는 그대로
  if (e.code === 'P0001' && e.message) return e.message;
  return '저장하지 못했습니다. 잠시 뒤 다시 해 주세요.';
}

export function useOrgStore(): OrgStore {
  const [state, setState] = useState<{ status: OrgStatus; message: string; entries: Map<string, OrgEntry> }>(
    { status: 'loading', message: '', entries: new Map() });
  const alive = useRef(true);

  const reload = useCallback(async () => {
    if (!isRemote) {
      setState({ status: 'ready', message: '', entries: readLocal() });
      return;
    }
    try {
      const { data, error } = await sb().from('tm_org').select(COLS);
      if (!alive.current) return;
      if (error) {
        // 한 번 읽은 뒤의 실패로는 보던 조직도를 지우지 않는다
        setState((s) => (s.status === 'ready' ? s
          : { status: isMissingTable(error) ? 'missing' : 'error', message: error.message, entries: new Map() }));
        return;
      }
      const rows = (data ?? []) as OrgRow[];
      setState({ status: 'ready', message: '', entries: new Map(rows.map((r) => [r.member, entryFromRow(r)])) });
    } catch {
      if (alive.current) setState((s) => (s.status === 'ready' ? s : { ...s, status: 'error', message: '인터넷 연결을 확인해 주세요.' }));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    void reload();
    if (!isRemote) {
      // 다른 탭에서 고친 것
      const onStorage = (e: StorageEvent) => { if (e.key === LOCAL_KEY) void reload(); };
      window.addEventListener('storage', onStorage);
      return () => {
        alive.current = false;
        window.removeEventListener('storage', onStorage);
      };
    }
    const client = sb();
    // 다른 사람이 고친 것도 새로고침 없이 - 줄이 팀원 수만큼이라 바뀔 때마다 통째로 다시 읽는다
    const channel = client
      .channel(`tm-org-${Math.random().toString(36).slice(2, 10)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tm_org' }, () => { void reload(); })
      .subscribe();
    return () => {
      alive.current = false;
      void client.removeChannel(channel);
    };
  }, [reload]);

  const save = useCallback(async (member: string, patch: OrgPatch): Promise<string | null> => {
    const p = cleanPatch(patch);
    if (Object.keys(p).length === 0) return null;
    if (!isRemote) {
      try {
        const map = readLocal();
        map.set(member, { ...(map.get(member) ?? blankEntry(member)), ...p, updatedAt: new Date().toISOString() });
        writeLocal(map);
        setState({ status: 'ready', message: '', entries: map });
        return null;
      } catch {
        return '이 브라우저에 저장하지 못했습니다(저장 공간이 막혀 있습니다).';
      }
    }
    try {
      const t = sb().from('tm_org');
      // 있는 줄은 고친 칸만 바꾼다 - 관리자가 그사이 바꾼 소속 · 상위를 본인 저장이 되돌리지 않게
      const up = await t.update(p).eq('member', member).select('member');
      if (up.error) return friendly(up.error);
      if (!up.data || up.data.length === 0) {
        const ins = await t.insert({ member, ...p });
        if (ins.error?.code === '23505') {
          // 그사이 다른 화면이 줄을 만들었다
          const again = await t.update(p).eq('member', member);
          if (again.error) return friendly(again.error);
        } else if (ins.error) {
          return friendly(ins.error);
        }
      }
      await reload();
      return null;
    } catch {
      return '저장하지 못했습니다. 인터넷 연결을 확인해 주세요.';
    }
  }, [reload]);

  return { ...state, save, reload };
}

/* ── 트리 ─────────────────────────────────────── */

/** team = 회사 → 팀 → 사람(같은 팀 안에서는 상위 아래), report = 회사 → 상위 → 아래 사람 */
export type OrgView = 'team' | 'report';

export interface OrgNode {
  /** 'root' · 'unit:<이름>' · 팀원 id */
  key: string;
  kind: 'root' | 'unit' | 'person';
  label: string;
  member?: Member;
  entry?: OrgEntry;
  kids: OrgNode[];
  parent: OrgNode | null;
  depth: number;
  /** 이 아래 모든 사람 수(자기 빼고) */
  below: number;
}

export interface OrgTree {
  root: OrgNode;
  byKey: Map<string, OrgNode>;
  people: OrgNode[];
  /** 쓰이는 소속 이름 - 소속 미정 빼고, 이름순 */
  units: string[];
  /** 고리 · 없는 사람을 가리켜 상위를 무시한 사람 */
  broken: string[];
}

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

/** 상위 - 승인된 팀원이고, 따라 올라가다 자기로 돌아오지 않을 때만 */
function managersOf(members: Member[], entries: Map<string, OrgEntry>): { boss: Map<string, string>; broken: string[] } {
  const ids = new Set(members.map((m) => m.id));
  const raw = new Map<string, string>();
  const broken: string[] = [];
  for (const m of members) {
    const b = entries.get(m.id)?.manager;
    if (!b) continue;
    if (b !== m.id && ids.has(b)) raw.set(m.id, b);
    else broken.push(m.id);
  }
  const boss = new Map<string, string>();
  for (const [id, b] of raw) {
    let cur: string | undefined = b;
    let loop = false;
    for (let i = 0; cur && i <= members.length; i++) {
      if (cur === id) { loop = true; break; }
      cur = raw.get(cur);
    }
    if (loop) broken.push(id);
    else boss.set(id, b);
  }
  // 고리에 든 사람은 모두 맨 위로 - 남은 사람이 고리 안의 사람을 가리켜도 그 사람이 이제 맨 위라 고리가 없다
  for (const id of broken) boss.delete(id);
  return { boss, broken };
}

export function buildOrg(members: Member[], entries: Map<string, OrgEntry>, view: OrgView, rootLabel = 'MATE'): OrgTree {
  const root: OrgNode = { key: 'root', kind: 'root', label: rootLabel, kids: [], parent: null, depth: 0, below: 0 };
  const byKey = new Map<string, OrgNode>([['root', root]]);
  const people: OrgNode[] = members.map((m) => {
    const entry = entries.get(m.id) ?? blankEntry(m.id);
    const n: OrgNode = { key: m.id, kind: 'person', label: m.name, member: m, entry, kids: [], parent: null, depth: 0, below: 0 };
    byKey.set(m.id, n);
    return n;
  });
  const { boss, broken } = managersOf(members, entries);
  const unitOf = (n: OrgNode) => n.entry?.unit.trim() || NO_UNIT;

  const unitNodes = new Map<string, OrgNode>();
  const unitNode = (name: string) => {
    let u = unitNodes.get(name);
    if (!u) {
      u = { key: `unit:${name}`, kind: 'unit', label: name, kids: [], parent: null, depth: 0, below: 0 };
      unitNodes.set(name, u);
      byKey.set(u.key, u);
    }
    return u;
  };

  for (const n of people) {
    const b = boss.get(n.key);
    const up = b ? byKey.get(b) : undefined;
    if (view === 'report') {
      n.parent = up ?? root;
    } else {
      // 팀별: 같은 팀의 상위 아래, 아니면 팀 아래
      n.parent = up && unitOf(up) === unitOf(n) ? up : unitNode(unitOf(n));
    }
    n.parent.kids.push(n);
  }
  const units = [...unitNodes.keys()].filter((u) => u !== NO_UNIT).sort(collator.compare);
  for (const name of [...units, ...(unitNodes.has(NO_UNIT) ? [NO_UNIT] : [])]) {
    const u = unitNodes.get(name)!;
    u.parent = root;
    root.kids.push(u);
  }

  /* 깊이 · 아래 사람 수, 그리고 순서 - 아래 사람이 많은 사람 먼저, 같으면 이름순 */
  const walk = (n: OrgNode, depth: number): number => {
    n.depth = depth;
    let count = 0;
    for (const k of n.kids) count += walk(k, depth + 1) + (k.kind === 'person' ? 1 : 0);
    n.below = count;
    return count;
  };
  walk(root, 0);
  const order = (n: OrgNode) => {
    if (n.kind !== 'root') n.kids.sort((a, b) => b.below - a.below || collator.compare(a.label, b.label));
    n.kids.forEach(order);
  };
  order(root);
  // 보고 체계의 맨 위도 같은 순서로(팀별의 맨 위는 위에서 팀 이름순으로 넣었다)
  if (view === 'report') root.kids.sort((a, b) => b.below - a.below || collator.compare(a.label, b.label));

  const allUnits = [...new Set(people.map((p) => p.entry?.unit.trim() ?? '').filter(Boolean))].sort(collator.compare);
  return { root, byKey, people, units: allUnits, broken };
}

/** n 아래의 사람 id(자기 빼고) - 상위 고르기에서 고리가 될 사람을 뺀다 */
export function reportsUnder(memberId: string, members: Member[], entries: Map<string, OrgEntry>): Set<string> {
  const kids = new Map<string, string[]>();
  for (const m of members) {
    const b = entries.get(m.id)?.manager;
    if (!b) continue;
    const list = kids.get(b) ?? [];
    list.push(m.id);
    kids.set(b, list);
  }
  const out = new Set<string>();
  const stack = [...(kids.get(memberId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id) || id === memberId) continue;
    out.add(id);
    stack.push(...(kids.get(id) ?? []));
  }
  return out;
}
