'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Doc } from './types';
import { DocIcon, titleOf, type MenuEntry } from './DocPanels';
import { FloatMenu } from './DocEditor';
import { IconPlus, NewDot } from './ui';

/*
 * 문서 트리 - 왼쪽 목록. 줄을 끌어 놓으면 위 · 아래(같은 깊이에서 순서) 또는 가운데(그 문서 아래)로 옮긴다.
 * HTML5 끌기는 터치 기기에서 동작하지 않으므로 같은 일을 줄 메뉴(⋯) · 문서 메뉴의 '옮기기'로도 할 수 있다.
 * 키보드: ↑ ↓ 줄 이동 · → 펼치기 / 첫 하위 문서 · ← 접기 / 위 문서 · Home End · Enter 열기 · Delete 휴지통으로 · Shift+F10 줄 메뉴
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
  /** 끌어 놓았다 - target 이 null 이면 맨 위 문서 바로 아래의 맨 끝 */
  onDrop(id: string, target: string | null, zone: DropZone): void;
  /** 자기 아래 문서(target) 위에서 놓았다 - 받지 않은 까닭을 알릴 곳 */
  onBlockedDrop?(id: string, target: string): void;
  canDrag: boolean;
  /** 다른 팀원이 보고 있는 문서 */
  watched?: ReadonlySet<string>;
  /** 남이 만들거나 고친 뒤 아직 안 본 문서(읽음 표시, reads.ts) - 빨간 점 */
  fresh?: ReadonlySet<string>;
  /** 줄 메뉴(⋯) 항목 - 없으면 메뉴 단추를 두지 않는다 */
  menuFor?(node: TreeNode): MenuEntry[];
  /** Delete 키 - 줄 메뉴의 '휴지통으로 옮기기'와 같은 일 */
  onDelete?(id: string): void;
  /** 문서를 연 뒤(서랍을 닫는 등) */
  onAfterSelect?(): void;
  /** 맨 위 문서(팀 위키 자체)의 이름 - 트리의 맨 위 줄들은 모두 이 문서 바로 아래다 */
  topTitle?: string;
}

export default function DocTree({ roots, activeId, openSet, onToggle, onSelect, onAddChild, onDrop, onBlockedDrop, canDrag, watched, fresh, menuFor, onDelete, onAfterSelect, topTitle }: Props) {
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string | null; zone: DropZone } | null>(null);
  /* 끄는 문서와 그 아래 문서 - 그 위로는 놓을 수 없다 */
  const blocked = useRef<Set<string>>(new Set());
  /** 끄는 동안 마지막으로 손이 머문 놓을 수 없는 줄(자기 아래 문서) */
  const overBlocked = useRef<string | null>(null);
  /** 키보드 초점이 머무는 줄(Tab 은 트리에 한 번만 멈춘다) */
  const [focusId, setFocusId] = useState<string | null>(null);
  /** 메뉴가 열린 줄과 그 단추 */
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const open = (id: string) => {
    onSelect(id);
    onAfterSelect?.();
  };

  const byId = useMemo(() => {
    const m = new Map<string, TreeNode>();
    const walk = (ns: TreeNode[]) => ns.forEach((n) => { m.set(n.id, n); walk(n.children); });
    walk(roots);
    return m;
  }, [roots]);
  /** 연 문서의 위 문서들 - 연 문서가 보이도록 펼친 채로 둔다(접으려 하면 부르는 쪽이 까닭을 알린다) */
  const lockedOpen = useMemo(() => {
    const out = new Set<string>();
    let cur = activeId ? byId.get(activeId)?.parentId : null;
    while (cur && !out.has(cur)) {
      out.add(cur);
      cur = byId.get(cur)?.parentId ?? null;
    }
    return out;
  }, [activeId, byId]);
  /** 아래 어딘가에 아직 안 본 문서가 있는 줄 - 접혀 있으면 그 줄에 빨간 점을 단다 */
  const freshUnder = useMemo(() => {
    const out = new Set<string>();
    if (!fresh?.size) return out;
    const walk = (n: TreeNode): boolean => {
      let any = false;
      n.children.forEach((c) => { if (walk(c)) any = true; });
      if (any) out.add(n.id);
      return any || fresh.has(n.id);
    };
    roots.forEach(walk);
    return out;
  }, [roots, fresh]);

  const start = (id: string) => {
    const out = new Set<string>();
    const add = (n: TreeNode | undefined) => {
      if (!n) return;
      out.add(n.id);
      n.children.forEach(add);
    };
    add(byId.get(id));
    blocked.current = out;
    overBlocked.current = null;
    setDrag(id);
  };
  const reset = () => {
    setDrag(null);
    setOver(null);
  };

  /*
   * 끄는 동안 지금 손이 있는 곳이 자기 아래 문서 줄인지 - 그런 줄은 놓기를 받지 않는다(놓으면 고리가 생긴다).
   * 거기서 놓으면 끌기가 아무 일 없이 끝나므로 끝날 때 까닭을 알린다. 줄 밖으로 나가면 지운다
   */
  useEffect(() => {
    if (!drag) return;
    const onOver = (e: DragEvent) => {
      const row = e.target instanceof Element ? e.target.closest<HTMLElement>('[role="treeitem"]') : null;
      const id = row && treeRef.current?.contains(row) ? row.dataset.id ?? null : null;
      overBlocked.current = id && id !== drag && blocked.current.has(id) ? id : null;
    };
    document.addEventListener('dragover', onOver, true);
    return () => document.removeEventListener('dragover', onOver, true);
  }, [drag]);

  const rowDnD = (node: TreeNode) => canDrag ? {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/x-tm-doc', node.id);
      start(node.id);
    },
    onDragEnd: () => {
      const bad = overBlocked.current;
      overBlocked.current = null;
      reset();
      if (bad) onBlockedDrop?.(node.id, bad);
    },
    onDragOver: (e: React.DragEvent) => {
      if (!drag) return;
      // 놓을 수 없는 줄 - 앞서 그려 둔 놓을 자리 표시를 지워 엉뚱한 곳에 놓일 것처럼 보이지 않게
      if (blocked.current.has(node.id)) {
        setOver((o) => (o ? null : o));
        return;
      }
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

  /* 보이는 줄(접힌 문서의 아래 줄은 그리지 않는다) */
  const rows = () => [...(treeRef.current?.querySelectorAll<HTMLElement>('[role="treeitem"]') ?? [])];
  const focusRow = (el: HTMLElement | undefined | null) => {
    if (!el) return;
    setFocusId(el.dataset.id ?? null);
    el.focus();
  };
  const openMenu = (id: string, anchor: HTMLElement | null) => {
    if (!menuFor || !anchor) return;
    setMenu({ id, anchor });
  };

  const onTreeKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const cur = (e.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    if (!cur || e.target !== cur) return;
    const id = cur.dataset.id ?? '';
    const node = byId.get(id);
    if (!node) return;
    const list = rows();
    const i = list.indexOf(cur);
    const hasKids = node.children.length > 0;
    const expanded = openSet.has(id);
    const stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (e.key === 'ArrowDown') { stop(); focusRow(list[i + 1]); }
    else if (e.key === 'ArrowUp') { stop(); focusRow(list[i - 1]); }
    else if (e.key === 'Home') { stop(); focusRow(list[0]); }
    else if (e.key === 'End') { stop(); focusRow(list[list.length - 1]); }
    else if (e.key === 'ArrowRight') {
      stop();
      if (hasKids && !expanded) onToggle(id);
      else if (hasKids) focusRow(list[i + 1]);
    } else if (e.key === 'ArrowLeft') {
      stop();
      if (hasKids && expanded) onToggle(id);
      else focusRow(cur.parentElement?.closest<HTMLElement>('[role="treeitem"]'));
    } else if (e.key === 'Enter' || e.key === ' ') { stop(); open(id); }
    else if (e.key === 'Delete' && onDelete) { stop(); onDelete(id); }
    else if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') {
      stop();
      openMenu(id, cur.querySelector<HTMLElement>('[data-row-menu]') ?? cur);
    }
  };

  /* 트리에 들어올 때 멈출 줄 - 키보드로 고른 줄, 없으면 연 문서, 그것도 없으면 첫 줄 */
  const tabId = (focusId && byId.has(focusId) ? focusId : null) ?? (activeId && byId.has(activeId) ? activeId : null) ?? roots[0]?.id ?? null;

  const item = (node: TreeNode, depth: number): React.ReactNode => {
    const hasKids = node.children.length > 0;
    const expanded = openSet.has(node.id);
    const active = node.id === activeId;
    const zone = over?.id === node.id ? over.zone : null;
    const menuOpen = menu?.id === node.id;
    return (
      <li key={node.id} role="treeitem" data-id={node.id} aria-level={depth + 1} aria-selected={active}
        aria-expanded={hasKids ? expanded : undefined} aria-label={titleOf(node)}
        tabIndex={node.id === tabId ? 0 : -1}
        onFocus={(e) => { if (e.target === e.currentTarget) setFocusId(node.id); }}
        className="group/item rounded-tm-sm outline-none [&:focus-visible>div]:ring-2 [&:focus-visible>div]:ring-tm-blue [&:focus-visible>div]:ring-offset-1">
        <div
          {...rowDnD(node)}
          onContextMenu={menuFor ? (e) => {
            e.preventDefault();
            openMenu(node.id, e.currentTarget.querySelector<HTMLElement>('[data-row-menu]'));
          } : undefined}
          className={`group relative flex min-h-[38px] items-center gap-0.5 rounded-tm-sm pr-1 transition-colors duration-150 [@media(pointer:coarse)]:min-h-11 ${
            active ? 'bg-tm-blue text-white' : 'text-tm-ink hover:bg-tm-tint'} ${
            zone === 'inside' ? 'ring-2 ring-inset ring-tm-blue' : ''} ${drag === node.id ? 'opacity-40' : ''}`}
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          {zone === 'before' && <span aria-hidden className="pointer-events-none absolute inset-x-1 -top-px h-[3px] rounded-full bg-tm-blue" />}
          {zone === 'after' && <span aria-hidden className="pointer-events-none absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-tm-blue" />}
          {/* 펼치기 · 메뉴 · 새 문서 단추는 마우스 · 손가락용 - 키보드는 화살표 · Shift+F10 으로 같은 일을 한다 */}
          {hasKids ? (
            <button type="button" tabIndex={-1} onClick={() => onToggle(node.id)}
              aria-label={expanded ? `${titleOf(node)} 접기` : `${titleOf(node)} 펼치기`}
              title={expanded && lockedOpen.has(node.id) ? '지금 보는 문서가 이 아래에 있어 접을 수 없습니다' : undefined}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-150
                          [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9 ${
                active ? 'text-white hover:bg-white/20' : 'text-tm-sub hover:bg-tm-card hover:text-tm-ink'}`}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden
                className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="h-7 w-7 shrink-0" />
          )}
          <div role="none" onClick={(e) => { open(node.id); focusRow(e.currentTarget.closest<HTMLElement>('[role="treeitem"]')); }}
            className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 self-stretch rounded-md text-left text-[14.5px] ${active ? 'font-bold' : 'font-semibold'}`}>
            <span className={active ? 'text-white' : 'text-tm-sub'}><DocIcon icon={node.icon} /></span>
            <span className="truncate">{titleOf(node)}</span>
            {(fresh?.has(node.id) || (!expanded && freshUnder.has(node.id))) && (
              <NewDot title={fresh?.has(node.id) ? '아직 안 본 변경' : '아래에 아직 안 본 문서가 있습니다'}
                className={active ? 'ring-2 ring-white' : ''} />
            )}
            {watched?.has(node.id) && (
              <span aria-label="다른 팀원이 보는 중" title="다른 팀원이 보는 중"
                className={`h-2 w-2 flex-none rounded-full ${active ? 'bg-tm-card' : 'bg-tm-ok'}`} />
            )}
          </div>
          {menuFor && (
            <button type="button" tabIndex={-1} data-row-menu aria-label={`${titleOf(node)} 메뉴`} title="문서 메뉴"
              aria-haspopup="menu" aria-expanded={menuOpen}
              onClick={(e) => { if (menuOpen) setMenu(null); else openMenu(node.id, e.currentTarget); }}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-md transition-[opacity,background-color] duration-150
                          [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9 [@media(pointer:coarse)]:opacity-100 ${
                active || menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within/item:opacity-100'} ${
                active ? 'text-white hover:bg-white/20' : 'text-tm-sub hover:bg-tm-card hover:text-tm-blue'}`}>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden fill="currentColor">
                <circle cx="4.5" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="15.5" cy="10" r="1.5" />
              </svg>
            </button>
          )}
          <button type="button" tabIndex={-1} onClick={() => onAddChild(node.id)} aria-label={`${titleOf(node)} 아래에 새 문서`} title="아래에 새 문서"
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-md opacity-0 transition-[opacity,background-color] duration-150 group-hover:opacity-100
                        [@media(pointer:coarse)]:hidden ${active ? 'text-white hover:bg-white/20' : 'text-tm-sub hover:bg-tm-card hover:text-tm-blue'}`}>
            <IconPlus size={15} />
          </button>
        </div>
        {hasKids && expanded && (
          <ul role="group" className="mt-0.5 space-y-0.5">
            {node.children.map((c) => item(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const menuNode = menu ? byId.get(menu.id) : undefined;

  return (
    <>
      <ul ref={treeRef} role="tree" aria-label="문서 트리" onKeyDown={onTreeKey} className="space-y-0.5">
        {roots.map((n) => item(n, 0))}
      </ul>
      {menu && menuNode && menuFor && (
        <FloatMenu anchor={menu.anchor} label={`${titleOf(menuNode)} 메뉴`} align="end" width={220}
          onClose={(why) => {
            setMenu(null);
            // 키보드로 연 메뉴는 그 줄로 돌아간다
            if (why === 'escape') focusRow(treeRef.current?.querySelector<HTMLElement>(`[role="treeitem"][data-id="${CSS.escape(menu.id)}"]`));
          }}>
          {menuFor(menuNode).map((it) => (
            <div key={it.label} className="contents">
              {it.sep && <div className="tm-menu-sep" role="separator" />}
              <button type="button" role="menuitem" tabIndex={-1} disabled={it.disabled}
                className={`tm-menu-item${it.danger ? ' is-danger' : ''}`}
                onClick={() => {
                  setMenu(null);
                  it.onSelect();
                }}>
                <span className="min-w-0 flex-1 truncate">{it.label}</span>
              </button>
            </div>
          ))}
        </FloatMenu>
      )}
      {/* 끄는 동안만 - 맨 위 문서 바로 아래(카테고리 줄의 맨 끝)로 놓는 자리 */}
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
          {topTitle ? `여기에 놓으면 '${topTitle}' 바로 아래로` : '여기에 놓으면 맨 위 문서로'}
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
