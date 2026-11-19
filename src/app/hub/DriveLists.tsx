'use client';

import { useEffect, useMemo, useState } from 'react';
import { ancestorsOf, driveUrl, kindOf, previewUrl, type DriveKind, type DriveNode, type DriveTree } from './driveTree';
import {
  FRESH_DAYS, RECENT_RANGES, STALE_DAYS, freshnessOf, ownersOf, recentGroups, sheetsOf,
  type FeedPrefs, type FolderOwners, type Freshness, type RecentRange,
} from './driveFeed';
import { useMembers } from './members';
import { IconClose, IconSearch, tmFieldBase, tmIconBtnSm } from './ui';

/*
 * 구글 드라이브 옆 칸의 두 목록 - '최근 올라온 것'(폴더별 묶음, 기간은 사람마다)과 '구글 시트'(얼마나 오래 그대로인지).
 * 셈은 driveFeed.ts, 고른 항목은 Drive.tsx 의 옆 칸(미리보기)으로 넘긴다.
 */

const num = (n: number) => n.toLocaleString('ko-KR');
const pathOf = (n: DriveNode) => ancestorsOf(n).map((a) => a.item.name).join(' › ');

function agoText(ms: number): string {
  const m = Math.floor(ms / 60_000);
  if (m < 1) return '방금';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

const pill =
  'inline-flex h-[32px] flex-none items-center whitespace-nowrap rounded-full border border-tm-edge bg-tm-card px-3 text-[13px] font-bold text-tm-ink ' +
  'transition-colors duration-150 hover:border-tm-blue hover:bg-tm-tint aria-pressed:border-tm-blue aria-pressed:bg-tm-blue aria-pressed:text-white ' +
  'disabled:cursor-default disabled:opacity-50 disabled:hover:border-tm-edge disabled:hover:bg-tm-card [@media(pointer:coarse)]:h-10';
const chip = 'inline-flex flex-none items-center rounded-full border px-1.5 py-[0.5px] text-[11.5px] font-bold';
const CHIP_TONE = {
  new: 'border-tm-blue/40 bg-tm-tint text-tm-blue',
  edit: 'border-tm-line bg-tm-bg text-tm-sub',
  fresh: 'border-tm-ok/40 bg-tm-ok-tint text-tm-ok-deep',
  aging: 'border-tm-line bg-tm-bg text-tm-sub',
  stale: 'border-tm-warn/50 bg-tm-warn-tint text-tm-warn-deep',
} as const;

type Icon = (kind: DriveKind) => React.ReactNode;

function useNames() {
  const members = useMembers();
  return useMemo(() => {
    const m = new Map(members.map((x) => [x.id, x.name]));
    return (ids: string[]) => ids.map((id) => m.get(id)).filter(Boolean).join(' · ');
  }, [members]);
}

function Head({ title, sub, onClose, children }: { title: string; sub: string; onClose(): void; children?: React.ReactNode }) {
  return (
    <div className="flex-none border-b border-tm-line px-5 pb-3.5 pt-4 max-[720px]:px-4">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-[18px] font-extrabold leading-[1.4] text-tm-deep">{title}</h2>
          <p className="mt-1 text-[13px] leading-[1.6] text-tm-sub">{sub}</p>
        </div>
        <button type="button" onClick={onClose} aria-label={`${title} 닫기`} title="닫기" className={`${tmIconBtnSm} -mr-1.5 -mt-1`}>
          <IconClose />
        </button>
      </div>
      {children}
    </div>
  );
}

/* ── 최근 올라온 것 ─────────────────────────────────── */

/** 묶음마다 바로 보이는 파일 수 - 나머지는 폴더를 열어 본다 */
const GROUP_CAP = 5;

export function RecentPanel({ tree, now, prefs, prevSeen, owners, myFolders, icon, onPrefs, onPick, onClose }: {
  tree: DriveTree;
  now: number;
  prefs: FeedPrefs;
  /** 이번에 열기 전에 마지막으로 본 때 - 그 뒤에 올라온 것에 점 */
  prevSeen: number;
  owners: FolderOwners;
  /** 조직도에서 내가 맡은 폴더 */
  myFolders: Set<string>;
  icon: Icon;
  onPrefs(patch: Partial<FeedPrefs>): void;
  onPick(n: DriveNode): void;
  onClose(): void;
}) {
  const names = useNames();
  const mine = prefs.mine && myFolders.size > 0;
  const groups = useMemo(() => recentGroups(tree, now, prefs.range, mine ? myFolders : null), [tree, now, prefs.range, mine, myFolders]);
  const total = groups.reduce((s, g) => s + g.files.length, 0);
  const rangeLabel = RECENT_RANGES.find((r) => r.id === prefs.range)?.label ?? '';
  const hasCreated = useMemo(() => tree.all.some((n) => !!n.item.created), [tree]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head title={`최근 올라온 것 ${num(total)}`} onClose={onClose}
        sub={!hasCreated
          ? '드라이브 쪽 스크립트가 아직 올린 시각을 보내지 않아 고친 시각으로만 셉니다.'
          : `${rangeLabel} 안에 새로 올라오거나 고친 파일을 폴더별로 모았습니다. 기간 · 담당 고르기는 나에게만 적용됩니다.`}>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <div role="group" aria-label="기간" className="flex flex-wrap gap-1">
            {RECENT_RANGES.map((r) => (
              <button key={r.id} type="button" aria-pressed={prefs.range === r.id} className={pill}
                onClick={() => onPrefs({ range: r.id as RecentRange })}>
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" aria-pressed={mine} disabled={!myFolders.size} className={pill}
            onClick={() => onPrefs({ mine: !prefs.mine })}
            title={myFolders.size ? '조직도에서 내가 맡은 구글 폴더 아래만 봅니다' : '조직도의 내 카드에 담당 구글 폴더가 없습니다'}>
            내 담당 폴더만
          </button>
        </div>
      </Head>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2.5">
        {groups.length === 0 && (
          <li className="px-2 py-8 text-center text-[14px] leading-[1.7] text-tm-sub">
            {rangeLabel} 안에 올라온 파일이 없습니다{mine ? ' (내 담당 폴더)' : ''}
          </li>
        )}
        {groups.map((g) => {
          const who = names(ownersOf(g.folder, owners));
          const added = g.files.filter((f) => f.added).length;
          const counts = [added ? `새로 ${num(added)}` : '', g.files.length - added ? `고침 ${num(g.files.length - added)}` : ''].filter(Boolean).join(' · ');
          return (
            <li key={g.folder.item.id} className="mb-1.5 rounded-tm-sm border border-tm-line bg-tm-card">
              <button type="button" onClick={() => onPick(g.folder)} title="이 폴더를 옆 칸에서 엽니다"
                className="flex w-full items-start gap-2.5 rounded-t-tm-sm px-2.5 py-2 text-left transition-colors duration-150 hover:bg-tm-tint">
                <span className="mt-[2px] text-tm-blue">{icon('folder')}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-bold text-tm-ink">{g.folder.item.name}</span>
                  <span className="block truncate text-[12.5px] text-tm-sub">
                    {[pathOf(g.folder), who && `담당 ${who}`].filter(Boolean).join(' · ') || '팀 드라이브 바로 아래'}
                  </span>
                </span>
                <span className="mt-[2px] flex-none text-right text-[12px] font-semibold tabular-nums text-tm-sub">
                  {counts}<br />{agoText(now - g.at)}
                </span>
              </button>
              <ul className="border-t border-tm-line py-1">
                {g.files.slice(0, GROUP_CAP).map((f) => {
                  const kind = kindOf(f.node.item.mime, f.node.item.name);
                  const unseen = prevSeen > 0 && f.at > prevSeen;
                  return (
                    <li key={f.node.item.id} className="flex items-center gap-1 px-1">
                      <button type="button" onClick={() => onPick(f.node)} title={f.node.item.name}
                        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-[6px] text-left transition-colors duration-150 hover:bg-tm-tint
                                   [@media(pointer:coarse)]:min-h-11">
                        <span className="relative text-tm-sub">
                          {icon(kind)}
                          {unseen && <span aria-label="처음 보는 것" className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-tm-card bg-tm-blue" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13.5px] text-tm-ink">{f.node.item.name}</span>
                        <span className={`${chip} ${f.added ? CHIP_TONE.new : CHIP_TONE.edit}`}>{f.added ? '새로' : '고침'}</span>
                        <span className="w-[54px] flex-none text-right text-[12px] tabular-nums text-tm-sub">{agoText(now - f.at)}</span>
                      </button>
                    </li>
                  );
                })}
                {g.files.length > GROUP_CAP && (
                  <li className="px-1">
                    <button type="button" onClick={() => onPick(g.folder)}
                      className="w-full rounded-md px-1.5 py-[6px] text-left text-[12.5px] font-semibold text-tm-blue hover:bg-tm-tint">
                      {num(g.files.length - GROUP_CAP)}개 더 - 폴더에서 보기
                    </button>
                  </li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ── 구글 시트 ────────────────────────────────────── */

const FRESH_TEXT: Record<Freshness, string> = { fresh: '최신', aging: '', stale: '오래됨' };

export function freshChip(tone: Freshness, days: number) {
  const label = FRESH_TEXT[tone] || (Number.isFinite(days) ? `${days}일 전` : '');
  return label ? <span className={`${chip} ${CHIP_TONE[tone]}`}>{label}</span> : null;
}

export function SheetPanel({ tree, now, prefs, owners, icon, onPrefs, onPick, onClose }: {
  tree: DriveTree;
  now: number;
  prefs: FeedPrefs;
  owners: FolderOwners;
  icon: Icon;
  onPrefs(patch: Partial<FeedPrefs>): void;
  onPick(n: DriveNode): void;
  onClose(): void;
}) {
  const names = useNames();
  const [query, setQuery] = useState('');
  const all = useMemo(() => sheetsOf(tree), [tree]);
  const staleCount = useMemo(() => all.filter((n) => freshnessOf(n, now).tone === 'stale').length, [all, now]);
  const pins = useMemo(() => new Set(prefs.pins), [prefs.pins]);
  const q = query.trim().normalize('NFC').toLowerCase();
  const list = useMemo(() => {
    const shown = all.filter((n) =>
      (!prefs.staleOnly || freshnessOf(n, now).tone === 'stale')
      && (!q || n.item.name.normalize('NFC').toLowerCase().includes(q) || pathOf(n).toLowerCase().includes(q)));
    // 고정한 시트를 위로(고정한 순서), 나머지는 최근에 고친 순 그대로
    return [...shown.filter((n) => pins.has(n.item.id)).sort((a, b) => prefs.pins.indexOf(a.item.id) - prefs.pins.indexOf(b.item.id)),
      ...shown.filter((n) => !pins.has(n.item.id))];
  }, [all, prefs.staleOnly, prefs.pins, pins, q, now]);
  const togglePin = (id: string) =>
    onPrefs({ pins: pins.has(id) ? prefs.pins.filter((x) => x !== id) : [id, ...prefs.pins].slice(0, 50) });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head title={`구글 시트 ${num(all.length)}`} onClose={onClose}
        sub={`팀 드라이브의 시트를 최근에 고친 순으로 모았습니다(보관함 밖). ${STALE_DAYS}일 넘게 그대로인 시트는 '오래됨' - 아직 쓰는 것이면 고쳐 두고, 끝난 것이면 보관함으로 옮겨 주세요.`}>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <div className="relative min-w-0 flex-[1_1_160px]">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-tm-sub"><IconSearch size={15} /></span>
            <input type="text" inputMode="search" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="시트 이름 · 폴더 찾기" aria-label="시트 찾기"
              className={`${tmFieldBase} h-[32px] w-full pl-8 pr-2 text-[14px] [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:text-[16px]`} />
          </div>
          <button type="button" aria-pressed={prefs.staleOnly} className={pill} disabled={!staleCount && !prefs.staleOnly}
            onClick={() => onPrefs({ staleOnly: !prefs.staleOnly })} title={`${STALE_DAYS}일 넘게 아무도 고치지 않은 시트만`}>
            오래됨 {num(staleCount)}
          </button>
        </div>
      </Head>
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2.5">
        {list.length === 0 && (
          <li className="px-2 py-8 text-center text-[14px] text-tm-sub">{all.length ? '맞는 시트가 없습니다' : '팀 드라이브에 시트가 없습니다'}</li>
        )}
        {list.map((n) => {
          const f = freshnessOf(n, now);
          const who = names(ownersOf(n, owners));
          const pinned = pins.has(n.item.id);
          const t = Date.parse(n.item.modified ?? '');
          return (
            <li key={n.item.id} className="flex items-start gap-0.5 rounded-md px-1 hover:bg-tm-tint">
              <button type="button" onClick={() => onPick(n)} title={`${n.item.name} - 옆 칸에서 미리 봅니다`}
                className="flex min-w-0 flex-1 items-start gap-2.5 rounded-md px-1.5 py-[7px] text-left [@media(pointer:coarse)]:min-h-11">
                <span className="mt-[2px] text-tm-sub">{icon('sheet')}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="min-w-0 truncate text-[14px] font-semibold text-tm-ink">{n.item.name}</span>
                    {freshChip(f.tone, f.days)}
                  </span>
                  <span className="block truncate text-[12.5px] text-tm-sub">
                    {[Number.isNaN(t) ? '' : `${agoText(now - t)} 고침`, who && `담당 ${who}`, pathOf(n)].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </button>
              <button type="button" onClick={() => togglePin(n.item.id)} aria-pressed={pinned}
                aria-label={pinned ? `${n.item.name} 고정 풀기` : `${n.item.name} 위에 고정`} title={pinned ? '고정 풀기' : '내 목록 위에 고정(나에게만)'}
                className={`${tmIconBtnSm} mt-1 ${pinned ? 'text-tm-blue' : 'text-tm-sub'}`}>
                <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round">
                  <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="flex-none border-t border-tm-line px-5 py-2 text-[12.5px] leading-[1.6] text-tm-sub max-[720px]:px-4">
        {FRESH_DAYS}일 안에 고친 것은 최신 · 시트를 누르면 옆 칸에서 미리 보고, &apos;크게 보기&apos;로 넓게 봅니다
      </p>
    </div>
  );
}

/* ── 크게 보기 ────────────────────────────────────── */

/** 시트 · 문서를 화면 가득 미리 본다(드라이브 미리보기, 읽기만). 고치려면 드라이브에서 연다 */
export function BigPreview({ node, onClose }: { node: DriveNode; onClose(): void }) {
  const url = previewUrl(node.item);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);
  if (!url) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={`${node.item.name} 크게 보기`}
      className="fixed inset-0 z-50 flex flex-col bg-black/50 p-4 max-[720px]:p-0" onClick={onClose}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-tm border border-tm-line bg-tm-card shadow-tm-pop max-[720px]:rounded-none"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-none items-center gap-2 border-b border-tm-line px-4 py-2.5">
          <h2 className="min-w-0 flex-1 truncate text-[15.5px] font-extrabold text-tm-deep">{node.item.name}</h2>
          <a href={driveUrl(node.item)} target="_blank" rel="noopener noreferrer"
            className="rounded-md px-2.5 py-1.5 text-[13px] font-bold text-tm-blue hover:bg-tm-tint">
            드라이브에서 열어 고치기
          </a>
          <button type="button" onClick={onClose} aria-label="크게 보기 닫기" title="닫기 (Esc)" className={tmIconBtnSm}>
            <IconClose />
          </button>
        </div>
        <iframe src={url} title={`${node.item.name} 크게 보기`} allow="fullscreen" allowFullScreen className="min-h-0 w-full flex-1 border-0" />
      </div>
    </div>
  );
}
