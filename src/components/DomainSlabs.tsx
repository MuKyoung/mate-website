'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import BlueImage from '@/components/visual/BlueImage';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { domains } from '@/data/domains';
import { games } from '@/data/games';
import { fadeUp, inView, onMount } from '@/lib/motion';
import { container } from '@/lib/styles';

/**
 * 영역별 슬래브 - 한 영역이 화면 한 칸을 통째로 쓴다.
 *
 * 홈과 /services 가 같은 블록을 쓴다. 사진은 오른쪽에 파랗게 눌러 깔고,
 * 호버하면 원래 색이 돌아온다. 사진 한 장은 사이트에서 한 자리만 쓴다.
 */

const SLAB = {
  web: {
    href: '/web',
    // 포트폴리오의 세종호이스트크레인 홈페이지 첫 화면에 걸린 사진.
    // 화면 캡처를 깔면 그 사이트의 제목과 메뉴가 이쪽 글자 뒤로 비쳐 사진만 쓴다.
    bg: '/images/projects/세종호이스트크레인-메인.webp' as string | null,
    note: '기획서 작성부터 배포 후 모니터링까지',
  },
  game: {
    href: '/game',
    bg: '/images/projects/꼬꼬지생.webp',
    note: '프로토타입부터 빠르게 만들어 확인합니다',
  },
  edu: {
    href: '/education',
    bg: '/images/projects/미래산업과학고.webp',
    note: '교육 방향과 수준에 맞춰 커리큘럼을 조정합니다',
  },
} as const;

const titleSize = { fontSize: 'clamp(2.5rem, 5.6vw, 4.75rem)' } as const;

export default function DomainSlabs({
  eager = false,
  className = '',
  heading,
  withGames = false,
}: {
  /** 첫 화면에 쓸 때 - 스크롤 진입을 기다리지 않는다 */
  eager?: boolean;
  className?: string;
  /** 이 블록이 페이지의 첫 내용일 때 넘기는 h1. 화면에는 띄우지 않고 문서 구조에만 남긴다 */
  heading?: string;
  /** 자체 게임 슬래브를 뒤에 붙인다 - 외주가 아닌 독립 사업이라 따로 둔다 */
  withGames?: boolean;
}) {
  const play = eager ? onMount : inView;
  return (
    <section className={`border-t border-white/10 ${className}`}>
      {heading && <h1 className="sr-only">{heading}</h1>}
      {domains.map((d, i) => {
        const s = SLAB[d.key];
        return (
          <motion.div key={d.key} {...play} variants={fadeUp} data-domain={d.key}>
            <Link href={s.href} className="group relative block overflow-hidden border-b border-white/10">
              {s.bg && (
                <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
                  <BlueImage src={s.bg} reveal className="absolute inset-0" />
                  <div aria-hidden className="absolute inset-0 bg-black/70 lg:bg-transparent"
                    style={{ backgroundImage: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.82) 22%, rgba(0,0,0,0.3) 62%, rgba(0,0,0,0.12) 100%)' }} />
                </div>
              )}

              <div className={`relative ${container} py-14 sm:py-20`}>
                <div className="grid items-start gap-x-gutter gap-y-10 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <p className="mono-label mb-6">
                      <span className="text-white/40 tabular-nums">0{i + 1}</span> Area:
                    </p>
                    <h2 className="font-en font-medium leading-[0.95] tracking-[-0.05em] text-[var(--text-1)]"
                      style={titleSize}>
                      {d.en}
                    </h2>
                    <p className="mt-4 text-[17px] text-white/70">{d.kr}</p>
                  </div>

                  <div className="lg:col-span-5">
                    <p className="type-h3 mb-4 text-[var(--text-1)]">{d.lead}</p>
                    <p className="type-b3 mb-7 max-w-md text-white/75">{d.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.tags.map((t) => <span key={t} className="tag bg-black/40">{t}</span>)}
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-6 lg:col-span-2 lg:h-full lg:flex-col lg:items-end">
                    <div className="space-y-5 lg:text-right">
                      {d.stats.slice(0, 2).map((st) => (
                        <div key={st.label}>
                          <p className="font-en font-mono-stat text-[32px] leading-none tracking-[-0.04em] text-[var(--text-1)]">
                            {st.value}
                          </p>
                          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.02em] text-white/60">{st.label}</p>
                        </div>
                      ))}
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/25 bg-black/30 text-white/80
                                     transition-colors duration-300 group-hover:border-primary-200 group-hover:bg-primary-200 group-hover:text-white">
                      <FiArrowUpRight size={18} />
                    </span>
                  </div>
                </div>

                <p className="relative mt-10 font-mono text-[12px] tracking-[0.01em] text-white/60">
                  <span className="mono-bullet" />{s.note}
                </p>
              </div>
            </Link>
          </motion.div>
        );
      })}

      {withGames && (
        <motion.div {...play} variants={fadeUp} data-domain="game">
          {/* 외주 세 영역과 나란히 두되 링크는 걸지 않는다 -
              두 타이틀 다 제작 중이라 보낼 스토어도 상세 페이지도 아직 없다 */}
          <div className="relative overflow-hidden border-b border-white/10">
            {/* 아직 공개할 화면이 없어 사진 대신 블록 모자이크를 둔다 */}
            <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[46%] opacity-90 lg:block">
              <BlockMosaic seed={11} rows={10} className="absolute inset-0" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.2) 45%, transparent 100%)' }} />
            </div>

            <div className={`relative ${container} py-14 sm:py-20`}>
              <div className="grid items-start gap-x-gutter gap-y-10 lg:grid-cols-12">
                <div className="lg:col-span-5">
                  <p className="mono-label mb-6">
                    <span className="text-white/40 tabular-nums">0{domains.length + 1}</span> Originals:
                  </p>
                  <h2 className="font-en font-medium leading-[0.95] tracking-[-0.05em] text-[var(--text-1)]" style={titleSize}>
                    Original Games
                  </h2>
                  <p className="mt-4 text-[17px] text-white/70">자체 게임 제작 · 퍼블리싱</p>
                </div>

                <div className="lg:col-span-5">
                  <p className="type-h3 mb-4 text-[var(--text-1)]">MATE 이름으로 내는 게임</p>
                  <p className="type-b3 mb-7 max-w-md text-white/75">
                    기획과 아트, 개발, 퍼블리싱까지 팀 안에서 끝냅니다. 판권도 저희가 쥡니다.
                    지금 두 타이틀을 만들고 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {games.map((g) => (
                      <span key={g.id} className="tag gap-2 bg-black/40">
                        {g.title}<span className="text-white/45">{g.status}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 lg:text-right">
                  <p className="font-en font-mono-stat text-[32px] leading-none tracking-[-0.04em] text-[var(--text-1)]">
                    {games.length}종
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.02em] text-white/60">제작 중인 타이틀</p>
                </div>
              </div>

              <p className="relative mt-10 font-mono text-[12px] tracking-[0.01em] text-white/60">
                <span className="mono-bullet" />자체 IP · 공개할 수 있는 단계가 되면 여기에 올립니다
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
