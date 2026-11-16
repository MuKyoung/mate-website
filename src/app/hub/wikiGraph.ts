/**
 * 팀 위키를 그래프 한 벌로 - 3D 그래프(WikiGraph3D) · 프레젠테이션(WikiPresent)이 같이 쓴다.
 * 규칙은 마인드맵(WikiMap 의 buildMap)과 같다: 카테고리 = 맨 위 문서, 본문의 문서 링크 = 문서 사이 선,
 * 본문의 작업 번호(MATE-123) = 그 문서가 다루는 작업, 제목이 팀원 이름과 같은 문서 = 그 사람의 문서.
 */
import type { Doc, Member, Task } from './types';
import type { TreeNode } from './DocTree';
import { titleOf } from './DocPanels';
import { docLinkIds, plainText } from './docMarkdown';

/** '전체' - 가운데(맨 위 문서 = 팀 위키 자체)에 카테고리를 모두 둔다. 맨 위 문서가 아직 없으면 가운데는 문서가 아니다 */
export const ALL = '__all__';
/** 본문의 작업 번호 - 편집기(DocEditor)의 작업 링크와 같은 규칙 */
export const TASK_RE = /(?<![\w-])MATE-\d+(?!\d)/g;
export const MENTION_RE = /\]\(mention:([^)\s]+)\)/g;

/** 작업 상태 점 - tailwind tm 색과 같다(백로그 · 할 일 · 진행 · 리뷰 · 완료) */
export const STATUS_DOT: Record<Task['status'], string> = {
  backlog: '#7f8b9e', todo: '#2644cb', doing: '#8a5a00', review: '#6a4c93', done: '#17805a',
};

/** 지도 · 3D · 프레젠테이션이 바깥(막대의 확대 단추)에 내주는 손잡이 */
export interface CanvasApi {
  zoomIn(): void;
  zoomOut(): void;
  /** 전체가 보이게(프레젠테이션은 개요로) */
  fit(): void;
}

export interface GDoc {
  /** 문서 id - 가운데가 '전체'면 ALL */
  id: string;
  title: string;
  icon: string;
  /** 0 = 가운데(카테고리 문서 또는 전체) */
  depth: number;
  parent: string | null;
  /** 바로 아래 문서 id */
  children: string[];
  /** 가지 색(가운데에서 뻗은 첫 가지 기준) - solid 는 선 · 테두리, tint 는 옅은 바탕 */
  color: string;
  tint: string;
  /** 본문에 적은 작업(있는 작업만) */
  tasks: Task[];
  /** 제목이 팀원 이름과 같은 문서면 그 팀원 */
  person: Member | null;
  /** person 이 맡은 끝나지 않은 작업 수 */
  assigned: number;
  /** 본문에서 언급한 팀원(자기 자신은 뺀다) */
  people: Member[];
  /** 본문 앞부분(꾸밈 없는 글자) */
  excerpt: string;
  /** 아래 문서 수(모든 깊이) */
  descendants: number;
  /** 가운데 '전체'인데 맨 위 문서가 없다(문서가 아니어서 열 수 없다) */
  virtual?: boolean;
}

export interface WikiGraph {
  rootId: string;
  /** 깊이 우선 차례(가운데 → 첫 가지 → 그 아래 → 둘째 가지 …) - 프레젠테이션의 넘김 순서 */
  docs: GDoc[];
  byId: Map<string, GDoc>;
  /** 문서 링크 - 위아래로 이미 이어진 짝은 빼고, 서로 걸었으면 하나 */
  links: { from: string; to: string }[];
  /** 문서들이 가리키는 작업(겹치지 않게) */
  tasks: Task[];
}

const countAll = (n: TreeNode): number => n.children.reduce((s, c) => s + 1 + countAll(c), 0);

export function buildGraph({ roots, home, cat, tasks, members, palette }: {
  /** 카테고리들(맨 위 문서 바로 아래 문서) */
  roots: TreeNode[];
  /** 맨 위 문서(팀 위키 자체) - '전체'의 가운데. 없으면 이름만 있는 가운데 */
  home: Doc | null;
  cat: string;
  tasks: Task[];
  members: Member[];
  /** 가지 색 - [solid, tint] */
  palette: [string, string][];
}): WikiGraph {
  const catRoot = cat === ALL ? null : roots.find((r) => r.id === cat) ?? null;
  const byKey = new Map(tasks.map((t) => [t.key, t]));
  const byName = new Map(members.map((m) => [m.name.trim(), m]));
  const memberById = new Map(members.map((m) => [m.id, m]));

  const docs: GDoc[] = [];
  const byId = new Map<string, GDoc>();
  const rawLinks: [string, string[]][] = [];

  const tasksOf = (d: Doc) =>
    [...new Set([...d.body.matchAll(TASK_RE)].map((m) => m[0]))].map((k) => byKey.get(k)).filter((t): t is Task => !!t);
  const peopleOf = (d: Doc, self: Member | null) =>
    [...new Set([...d.body.matchAll(MENTION_RE)].map((m) => m[1]))]
      .map((id) => memberById.get(id))
      .filter((m): m is Member => !!m && m.id !== self?.id);
  const excerptOf = (d: Doc) => {
    const t = plainText(d.body).replace(/\s+/g, ' ').trim();
    return t.length > 180 ? `${t.slice(0, 177)}…` : t;
  };

  const push = (g: GDoc) => { docs.push(g); byId.set(g.id, g); };
  const assignedTo = (m: Member | null) => (m ? tasks.filter((t) => t.assignee === m.id && t.status !== 'done').length : 0);
  const add = (d: TreeNode, depth: number, parent: string | null, [color, tint]: [string, string]) => {
    const person = byName.get(d.title.trim()) ?? null;
    push({
      id: d.id, title: titleOf(d), icon: d.icon, depth, parent, children: d.children.map((c) => c.id),
      color, tint, tasks: tasksOf(d), person, assigned: assignedTo(person), people: peopleOf(d, person),
      excerpt: excerptOf(d), descendants: countAll(d),
    });
    rawLinks.push([d.id, docLinkIds(d.body)]);
    d.children.forEach((c) => add(c, depth + 1, d.id, [color, tint]));
  };

  let rootId: string;
  const center: [string, string] = ['#2644cb', '#eef2ff'];
  if (catRoot) {
    rootId = catRoot.id;
    const person = byName.get(catRoot.title.trim()) ?? null;
    push({
      id: catRoot.id, title: titleOf(catRoot), icon: catRoot.icon, depth: 0, parent: null,
      children: catRoot.children.map((c) => c.id), color: center[0], tint: center[1], tasks: tasksOf(catRoot),
      person, assigned: assignedTo(person), people: peopleOf(catRoot, person), excerpt: excerptOf(catRoot),
      descendants: countAll(catRoot),
    });
    rawLinks.push([catRoot.id, docLinkIds(catRoot.body)]);
    catRoot.children.forEach((c, i) => add(c, 1, catRoot.id, palette[i % palette.length]));
  } else {
    const total = roots.reduce((s, r) => s + 1 + countAll(r), 0);
    const counts = `카테고리 ${roots.length}개 · 문서 ${total}개`;
    if (home) {
      // 맨 위 문서 - 바꾼 이름으로 가운데에 두고, 누르면 그 문서가 열린다
      rootId = home.id;
      push({
        id: home.id, title: titleOf(home), icon: home.icon, depth: 0, parent: null, children: roots.map((r) => r.id),
        color: center[0], tint: center[1], tasks: tasksOf(home), person: null, assigned: 0, people: peopleOf(home, null),
        excerpt: excerptOf(home) || counts, descendants: total,
      });
      rawLinks.push([home.id, docLinkIds(home.body)]);
    } else {
      rootId = ALL;
      push({
        id: ALL, title: '팀 위키', icon: '', depth: 0, parent: null, children: roots.map((r) => r.id),
        color: center[0], tint: center[1], tasks: [], person: null, assigned: 0, people: [],
        excerpt: counts, descendants: total, virtual: true,
      });
    }
    roots.forEach((r, i) => add(r, 1, rootId, palette[i % palette.length]));
  }

  const links: { from: string; to: string }[] = [];
  const seen = new Set<string>();
  rawLinks.forEach(([from, tos]) => {
    tos.forEach((to) => {
      const a = byId.get(from);
      const b = byId.get(to);
      if (!a || !b || from === to || b.parent === from || a.parent === to) return;
      const key = [from, to].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      links.push({ from, to });
    });
  });

  const taskSet = new Map<string, Task>();
  docs.forEach((d) => d.tasks.forEach((t) => taskSet.set(t.id, t)));

  return { rootId, docs, byId, links, tasks: [...taskSet.values()] };
}

/** 가운데에서 그 문서까지의 경로(가운데 제외) */
export function pathTo(g: WikiGraph, id: string): GDoc[] {
  const out: GDoc[] = [];
  for (let cur = g.byId.get(id), guard = 0; cur && cur.parent && guard < 60; guard += 1) {
    out.unshift(cur);
    cur = g.byId.get(cur.parent);
  }
  return out;
}
