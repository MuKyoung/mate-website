'use client';

import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';
import {
  FiCalendar, FiCheck, FiEye, FiFileText, FiFolder, FiGitBranch, FiPackage,
} from 'react-icons/fi';
import { blurUp, inView, rowIn, staggerRows, staggerTight } from '@/lib/motion';

export type ProcessKind = 'repo' | 'weekly' | 'handover';

export interface ProcessItem {
  kind: ProcessKind;
  kr: string;
  desc: string;
}

/**
 * 일하는 방식 카드 - Resend 홈의 기능 카드("Test mode", "Modular webhooks")를 옮겼다.
 * 틀 안에는 그 방식을 보여 주는 작은 화면을 두고 아래로 녹이고, 틀 밖에 아이콘 · 제목 · 설명을 둔다.
 *
 * 작은 화면은 모양을 보여 주는 그림이다. 글은 진행 절차(process.ts)에 밝힌 일만
 * 일반적인 말로 적는다 - 실제 고객 · 수치 · 기술 이름은 넣지 않는다.
 */
export default function ProcessCards({ items }: { items: ProcessItem[] }) {
  return (
    <motion.div {...inView} variants={staggerTight} className="grid gap-x-6 gap-y-14 md:grid-cols-3">
      {items.map((it) => {
        const Icon = ICON[it.kind];
        const Mock = MOCK[it.kind];
        return (
          <motion.div key={it.kind} variants={blurUp}>
            <div className="beam-frame h-[236px] overflow-hidden sm:h-[256px]"
              style={{ '--beam-w': 'min(64%, 360px)' } as React.CSSProperties}>
              <div className="fade-b absolute inset-0 p-5 sm:p-6">
                <Mock />
              </div>
            </div>
            <div className="px-1 pt-7">
              <Icon size={18} className="mb-4 text-white/75" aria-hidden />
              <h3 className="type-h2 mb-3 text-[var(--text-1)]">{it.kr}</h3>
              <p className="type-b3 max-w-[26em] text-white/60">{it.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

const ICON: Record<ProcessKind, IconType> = {
  repo: FiGitBranch,
  weekly: FiCalendar,
  handover: FiPackage,
};

const chip = 'inline-flex items-center gap-1.5 rounded-[2px] border px-2.5 py-1';

/* 저장소 - 브랜치와 공유 표시, 최근 올린 작업 몇 줄 */
function RepoMock() {
  const rows = [
    { t: '기획 반영', at: '방금', on: true },
    { t: '화면 구현', at: '1시간 전' },
    { t: '리뷰 반영', at: '어제' },
    { t: '테스트 추가', at: '2일 전' },
    { t: '첫 화면 설계', at: '3일 전' },
  ];
  return (
    <div className="font-mono text-[12px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`${chip} border-white/[0.14] bg-white/[0.04] text-white/80`}>
          <FiGitBranch size={12} aria-hidden /> main
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--point)]">
          <FiEye size={12} aria-hidden /> 고객과 공유 중
        </span>
      </div>
      <motion.ul variants={staggerRows} className="border-t border-white/[0.07]">
        {rows.map((r) => (
          <motion.li key={r.t} variants={rowIn} className="flex items-center gap-3 border-b border-white/[0.07] py-2.5">
            <span aria-hidden className={`h-[7px] w-[7px] shrink-0 ${r.on ? 'bg-[var(--blue-glow)]' : 'border border-white/30'}`} />
            <span className={r.on ? 'text-white' : 'text-white/55'}>{r.t}</span>
            <span className="ml-auto text-white/35">{r.at}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

/* 매주 공유 - 주차별 공유가 이어지는 시간 줄 (Resend 웹훅 카드의 시간 줄 모양) */
function WeeklyMock() {
  const weeks: { w: string; s: string; state: 'done' | 'now' | 'next' }[] = [
    { w: '1주차 공유', s: '완료', state: 'done' },
    { w: '2주차 공유', s: '완료', state: 'done' },
    { w: '3주차 공유', s: '코드 리뷰 중', state: 'now' },
    { w: '4주차 공유', s: '예정', state: 'next' },
  ];
  return (
    <motion.ol variants={staggerRows} className="relative font-mono text-[12px]">
      <span aria-hidden className="absolute bottom-4 left-[11px] top-4 w-px bg-white/10" />
      {weeks.map((k) => (
        <motion.li key={k.w} variants={rowIn} className="relative flex items-center gap-4 py-2">
          <span aria-hidden className={`flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[2px] border ${
            k.state === 'now'
              ? 'border-[var(--blue-glow)] bg-[var(--blue-glow)] text-white'
              : k.state === 'done'
                ? 'border-white/25 bg-black text-white/70'
                : 'border-white/15 bg-black'
          }`}>
            {k.state === 'done' && <FiCheck size={12} />}
            {k.state === 'now' && <span className="h-[5px] w-[5px] bg-white" />}
          </span>
          <span className={k.state === 'next' ? 'text-white/40' : 'text-white/85'}>{k.w}</span>
          <span className={`ml-auto ${
            k.state === 'now'
              ? `${chip} border-[rgba(91,134,255,0.4)] bg-[rgba(91,134,255,0.12)] text-[var(--point)]`
              : k.state === 'done' ? 'text-white/45' : 'text-white/30'
          }`}>
            {k.s}
          </span>
        </motion.li>
      ))}
    </motion.ol>
  );
}

/* 인계 - 넘겨드리는 묶음 (소스 코드와 문서) */
function HandoverMock() {
  const files: { icon: IconType; name: string; note: string }[] = [
    { icon: FiFolder, name: 'src', note: '소스 코드' },
    { icon: FiFolder, name: 'docs', note: '문서' },
    { icon: FiFileText, name: 'README.md', note: '안내' },
  ];
  return (
    <div className="font-mono text-[12px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`${chip} border-white/[0.14] bg-white/[0.04] text-white/80`}>
          <FiPackage size={12} aria-hidden /> 인계 묶음
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--point)]">
          <FiCheck size={12} aria-hidden /> 모두 전달
        </span>
      </div>
      <motion.ul variants={staggerRows} className="border-t border-white/[0.07]">
        {files.map((f) => (
          <motion.li key={f.name} variants={rowIn} className="flex items-center gap-3 border-b border-white/[0.07] py-2.5">
            <f.icon size={13} className="shrink-0 text-white/45" aria-hidden />
            <span className="text-white/85">{f.name}</span>
            <span className="ml-auto text-white/35">{f.note}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

const MOCK: Record<ProcessKind, () => JSX.Element> = {
  repo: RepoMock,
  weekly: WeeklyMock,
  handover: HandoverMock,
};
