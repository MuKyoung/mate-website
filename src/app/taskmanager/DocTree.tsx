'use client';

import { useMemo, useRef, useState } from 'react';
import type { Doc } from './types';
import { DocIcon, titleOf } from './DocPanels';
import { IconPlus } from './ui';

/*
 * 문서 트리 - 왼쪽 목록. 줄을 끌어 놓으면 위 · 아래(같은 깊이에서 순서) 또는 가운데(그 문서 아래)로 옮긴다.
 * HTML5 끌기는 터치 기기에서 동작하지 않으므로 같은 일을 문서 메뉴의 '옮기기'로도 할 수 있다.
 */

export interface TreeNode extends Doc {
  children: TreeNode[];
}

/** 트리 세우기 - 위 문서가 목록에 없거나(지움 · 휴지통) 고리가 생긴 문서는 맨 위에 둔다 */
export function buildTree(docs: Doc[]): TreeNode[] {
  const byId = new Map<string, TreeNode>(docs.map((d) => [d.id, { ...d, children: [] }]));
  const roots: TreeNode[] = [];
  /* 위로 따라 올라가다 자기로 돌아오면 고리다(두 사람이 동시에 서로의 아래로 옮긴 경우) */
  const cyclic = (n: TreeNode) => {
    const seen = new Set<string>([n.id]);
    let cur = n.parentId ? byId.get(n.parentId) : undefined;
    while (cur) {
      if (seen.has(cur.id)) return true;
      seen.add(cur.id);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return false;
  };
  byId.forEach((n) => {
    const parent = n.parentId ? byId.get(n.parentId) : undefined;
    if (parent && !cyclic(n)) parent.children.push(n);
    else roots.push(n);
  });
  const sort = (ns: TreeNode[]) => {
    ns.sort((a, b) => a.order - b.order);
    ns.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

export type DropZone = 'before' | 'after' | 'inside';

interface Props {
  roots: TreeNode[];
  activeId: string | null;
  openSet: Set<string>;
  onToggle(id: string): void;
  onSelect(id: string): void;
  onAddChild(id: string): void;
  /** 끌어 놓았다 - target 이 null 이면 맨 아래(최상위) */
  onDrop(id: string, target: string | null, zone: DropZone): void;
  canDrag: boolean;
  /** 다른 팀원이 보고 있는 문서 */
  watched?: ReadonlySet<string>;
}

export default function DocTree({ roots, activeId, openSet, onToggle, onSelect, onAddChild, onDrop, canDrag, watched }: Props) {
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string | null; zone: DropZone } | null>(null);
  /* 끄는 문서와 그 아래 문서 - 그 위로는 놓을 수 없다 */
  const blocked = useRef<Set<string>>(new Set());

  const byId = useMemo(() => {
    const m = new Map<string, TreeNode>();
    const walk = (ns: TreeNode[]) => ns.forEach((n) => { m.set(n.id, n); walk(n.children); });
    walk(roots);
    return m;
  }, [roots]);

  const start = (id: string) => {
    const out = new Set<string>();
    const add = (n: TreeNode | undefined) => {
      if (!n) return;
      out.add(n.id);
      n.children.forEach(add);
    };
    add(byId.get(id));
    blocked.current = out;
    setDrag(id);
  };
  const reset = () => {
    setDrag(null);
    setOver(null);
  };

  const rowDnD = (node: TreeNode) => canDrag ? {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/x-tm-doc', node.id);
      start(node.id);
    },
    onDragEnd: reset,
    onDragOver: (e: React.DragEvent) => {
      if (!drag || blocked.current.has(node.id)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const r = e.currentTarget.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height;
      const zone: DropZone = y < 0.28 ? 'before' : y > 0.72 ? 'after' : 'inside';
      setOver((o) => (o?.id === node.id && o.zone === zone ? o : { id: node.id, zone }));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (drag && over?.id === node.id) onDrop(drag, node.id, over.zone);
      reset();
    },
  } : {};

  const item = (node: TreeNode, depth: number): React.ReactNode => {
    const hasKids = node.children.length > 0;
    const expanded = openSet.has(node.id);
    const active = node.id === activeId;
    const zone = over?.id === node.id ? over.zone : null;
    return (
      <li key={node.id}>
        <div
          {...rowDnD(node)}
          className={`group relative flex min-h-[38px] items-center gap-0.5 rounded-tm-sm pr-1 transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 ${
            active ? 'bg-tm-blue text-white' : 'text-tm-ink hover:bg-tm-tint'} ${
            zone === 'inside' ? 'ring-2 ring-inset ring-tm-blue' : ''} ${drag === node.id ? 'opacity-40' : ''}`}
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          {zone === 'before' && <span aria-hidden className="pointer-events-none absolute inset-x-1 -top-px h-[3px] rounded-full bg-tm-blue" />}
          {zone === 'after' && <span aria-hidden className="pointer-events-none absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-tm-blue" />}
          {hasKids ? (
            <button type="button" onClick={() => onToggle(node.id)}
              aria-label={expanded ? `${titleOf(node)} 접기` : `${titleOf(node)} 펼치기`} aria-expanded={expanded}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-150 ${
                active ? 'text-white hover:bg-white/20 focus-visible:outline-white' : 'text-tm-sub hover:bg-white hover:text-tm-ink'}`}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden
                className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="h-7 w-7 shrink-0" />
          )}
          <button type="button" onClick={() => onSelect(node.id)} aria-current={active ? 'page' : undefined}
            className={`flex min-w-0 flex-1 items-center gap-2 self-stretch rounded-md text-left text-[14.5px] ${
              active ? 'font-bold focus-visible:outline-white' : 'font-semibold'}`}>
            <span className={active ? 'text-white' : 'text-tm-sub'}><DocIcon icon={node.icon} /></span>
            <span className="truncate">{titleOf(node)}</span>
            {watched?.has(node.id) && (
              <span aria-label="다른 팀원이 보는 중" title="다른 팀원이 보는 중"
                className={`h-2 w-2 flex-none rounded-full ${active ? 'bg-white' : 'bg-tm-ok'}`} />
            )}
          </button>
          <button type="button" onClick={() => onAddChild(node.id)} aria-label={`${titleOf(node)} 아래에 새 문서`} title="아래에 새 문서"
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md opacity-0 transition-[opacity,background-color] duration-150 group-hover:opacity-100 focus-visible:opacity-100
                        [@media(pointer:coarse)]:hidden ${active ? 'text-white hover:bg-white/20 focus-visible:outline-white' : 'text-tm-sub hover:bg-white hover:text-tm-blue'}`}>
            <IconPlus size={15} />
          </button>
        </div>
        {hasKids && expanded && (
          <ul className="mt-0.5 space-y-0.5">
            {node.children.map((c) => item(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <ul className="space-y-0.5">
        {roots.map((n) => item(n, 0))}
      </ul>
      {/* 끄는 동안만 - 맨 아래(최상위 문서)로 놓는 자리 */}
      {drag && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setOver((o) => (o?.id === null ? o : { id: null, zone: 'after' }));
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (drag) onDrop(drag, null, 'after');
            reset();
          }}
          className={`mt-2 grid h-11 place-items-center rounded-tm-sm border-2 border-dashed text-[13px] font-bold transition-colors ${
            over?.id === null ? 'border-tm-blue bg-tm-tint text-tm-blue' : 'border-tm-line text-tm-sub'}`}>
          여기에 놓으면 맨 위 문서로
        </div>
      )}
    </>
  );
}

/** 즐겨찾기 · 찾은 문서처럼 깊이 없이 늘어놓는 줄 */
export function FlatRow({ doc, active, onSelect, sub }: { doc: Doc; active: boolean; onSelect(): void; sub?: React.ReactNode }) {
  return (
    <button type="button" onClick={onSelect} aria-current={active ? 'page' : undefined}
      className={`flex min-h-[38px] w-full items-center gap-2 rounded-tm-sm px-2.5 py-1.5 text-left text-[14.5px] transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 ${
        active ? 'bg-tm-blue font-bold text-white focus-visible:outline-white' : 'font-semibold text-tm-ink hover:bg-tm-tint'}`}>
      <span className={active ? 'text-white' : 'text-tm-sub'}><DocIcon icon={doc.icon} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{titleOf(doc)}</span>
        {sub && <span className={`block truncate text-[12.5px] font-medium ${active ? 'text-white/85' : 'text-tm-sub'}`}>{sub}</span>}
      </span>
    </button>
  );
}
