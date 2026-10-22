'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { affiliations, awards } from '@/data/teamCapabilities';
import { container } from '@/lib/styles';

type Kind = 'award' | 'exhibition' | 'member';

interface Cert {
  id: string;
  kind: Kind;
  title: string;
  org: string;
  rank: string;
  year?: number;
}

const byYear = [...awards].sort((a, b) => b.year - a.year);
const certs: Record<Kind, Cert[]> = {
  award: byYear.filter((a) => a.type === 'award')
    .map((a) => ({ id: a.id, kind: 'award', title: a.title, org: a.organization, rank: a.rank ?? '', year: a.year })),
  exhibition: byYear.filter((a) => a.type === 'exhibition')
    .map((a) => ({ id: a.id, kind: 'exhibition', title: a.title, org: a.organization, rank: a.rank ?? '', year: a.year })),
  member: affiliations.map((a) => ({ id: a.id, kind: 'member', title: a.name, org: a.role, rank: a.role })),
};

const TABS: { key: Kind; label: string }[] = [
  { key: 'award', label: '수상 · 선정' },
  { key: 'exhibition', label: '전시 참가' },
  { key: 'member', label: '소속' },
];

const KIND_LABEL: Record<Kind, string> = {
  award: 'AWARD CERTIFICATE',
  exhibition: 'EXHIBITION',
  member: 'MEMBERSHIP',
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 증서 모양 카드 - Figma 「Certificate」 · 「Award gallery card」.
 * 실제 증서 사진이 없어 증서를 본뜬 판에 이름 · 주관 · 결과를 적는다.
 * 큰 카드와 작은 카드가 같은 구성이라 글자 크기를 em 으로 두고 카드의 font-size 만 바꾼다.
 */
function CertCard({ cert, no }: { cert: Cert; no: number }) {
  return (
    <div className="flex h-full flex-col rounded-card-sm border border-line bg-white p-[1.15em] text-left lg:rounded-card">
      <span aria-hidden className="block h-1 w-full shrink-0 bg-point-200" />
      <p className="mt-[0.6em] text-[0.8em] font-bold text-point-200">{pad(no)}</p>
      <p className="truncate text-[0.8em] font-bold text-[#7d8a9e]">
        {cert.year ? `${cert.year} · ` : ''}{cert.org}
      </p>
      <div className="mt-[0.6em] flex flex-1 items-center justify-center rounded-[6px] bg-gray-100 p-[0.9em]">
        <div className="flex w-[86%] flex-col items-center bg-white px-[0.9em] py-[1.2em] text-center shadow-[0_6px_16px_rgba(22,29,60,0.12)]">
          <p className="text-[0.5em] font-bold tracking-[0.08em] text-point-200">{KIND_LABEL[cert.kind]}</p>
          <p className="mt-[0.5em] line-clamp-3 text-[0.82em] font-bold leading-[1.35] text-ink">{cert.title}</p>
          <span aria-hidden className="mt-[0.8em] h-px w-4/5 bg-[rgba(38,68,203,0.7)]" />
          <span aria-hidden className="mt-[0.45em] h-px w-4/5 bg-gray-200" />
          <span aria-hidden className="mt-[0.45em] h-px w-3/5 bg-gray-200" />
          <p className="mt-[0.7em] text-[0.62em] font-bold text-gray-500">{cert.rank}</p>
          <span aria-hidden className="mt-[0.7em] flex h-[1.9em] w-[1.9em] items-center justify-center rounded-pill border border-point-200 bg-point-100">
            <span className="h-[0.5em] w-[0.5em] rounded-pill bg-point-200" />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * 수상 · 전시 - 왼쪽에 제목과 갈래 탭, 오른쪽에 증서 카드가 줄지어 선다 (Figma 1-5. Certified & Certifications).
 * 고른 카드가 크게 맨 앞에 서고, 나머지는 작게 오른쪽으로 화면 밖까지 이어진다.
 */
export default function AwardsShowcase() {
  const [kind, setKind] = useState<Kind>('award');
  const [active, setActive] = useState(0);
  const list = certs[kind];

  const pick = (k: Kind) => { setKind(k); setActive(0); };
  const step = (d: -1 | 1) => setActive((a) => (a + d + list.length) % list.length);

  return (
    <section id="awards" data-header="dark" className="night-grid relative overflow-hidden py-24 sm:py-32 xl:py-[180px]">
      <div className={`${container} relative grid gap-14 lg:grid-cols-[minmax(0,0.47fr)_minmax(0,0.53fr)] lg:gap-6`}>
        <div className="relative z-10">
          <SectionHead dark eyebrow="Awards & Exhibitions"
            title={<>MATE가 받은 <b>상과 선정</b>,<br />참가한 <b>전시</b>입니다</>}
            desc={`해마다 쌓인 ${awards.length}건을 갈래별로 모았습니다. 카드를 누르면 크게 봅니다.`} />

          <div role="tablist" aria-label="이력 갈래" className="mt-10 w-full max-w-[363px] sm:mt-12">
            {TABS.map((t) => {
              const on = t.key === kind;
              return (
                <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => pick(t.key)}
                  className={`flex w-full items-center justify-between p-4 text-left text-[16px] font-bold transition-colors sm:text-[18px] ${
                    on ? 'bg-point-200 text-white' : 'border-b border-[rgba(185,192,208,0.4)] text-gray-300 hover:text-white'
                  }`}>
                  {t.label}
                  <span className="flex items-center gap-3">
                    <span className={`text-[13px] font-normal tabular-nums ${on ? 'text-white/75' : 'text-gray-400'}`}>
                      {certs[t.key].length}
                    </span>
                    <FiChevronRight size={20} />
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 카드 줄 - 오른쪽은 화면 끝까지 흘려 보낸다 */}
        <div className="relative -mr-5 overflow-hidden sm:-mr-8 lg:-mr-[max(2.5rem,calc((100vw-1500px)/2))] lg:self-end">
          <div role="tabpanel"
            className="flex items-end gap-[var(--cg)] pb-1 pr-24 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [--cg:12px] [--cw-b:250px] [--ch-b:352px] [--cw-s:170px] [--ch-s:250px] lg:[--cw-b:300px] lg:[--ch-b:420px] lg:[--cw-s:200px] lg:[--ch-s:296px] xl:[--cg:20px] xl:[--cw-b:360px] xl:[--ch-b:500px] xl:[--cw-s:237px] xl:[--ch-s:350px]"
            style={{ transform: `translateX(calc(${active} * -1 * (var(--cw-s) + var(--cg))))` }}>
            {list.map((c, i) => {
              const big = i === active;
              return (
                <button key={c.id} type="button" onClick={() => setActive(i)} aria-label={`${c.title} 크게 보기`}
                  aria-current={big}
                  className={`shrink-0 transition-[width,height,font-size,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    i < active ? 'opacity-0' : big ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                  }`}
                  style={{
                    width: big ? 'var(--cw-b)' : 'var(--cw-s)',
                    height: big ? 'var(--ch-b)' : 'var(--ch-s)',
                    fontSize: big ? 'clamp(15px, 0.6rem + 0.5vw, 17px)' : 'clamp(11px, 0.45rem + 0.35vw, 12.5px)',
                  }}>
                  <CertCard cert={c} no={i + 1} />
                </button>
              );
            })}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-night to-transparent sm:w-40" />
        </div>
      </div>

      {/* 넘기기 */}
      <div className={`${container} relative mt-8 flex items-center justify-end gap-4 lg:-mt-2`}>
        <p className="text-[14px] tabular-nums text-gray-300">
          <span className="font-bold text-white">{pad(active + 1)}</span> / {pad(list.length)}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="이전 카드"
            className="flex h-10 w-10 items-center justify-center rounded-pill border border-white/30 text-white transition-colors hover:border-white hover:bg-white/10">
            <FiChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="다음 카드"
            className="flex h-10 w-10 items-center justify-center rounded-pill border border-white/30 text-white transition-colors hover:border-white hover:bg-white/10">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
