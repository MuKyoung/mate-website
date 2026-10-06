'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { domains } from '@/data/domains';
import { games } from '@/data/games';
import { fadeUp, inView, onMount } from '@/lib/motion';
import { container } from '@/lib/styles';

/**
 * 영역별 슬래브 — 한 영역이 화면 한 칸을 통째로 쓴다.
 *
 * 홈과 /services 가 같은 블록을 쓴다. 홈은 이게 첫 화면이라
 * 스크롤을 기다리지 않고 바로 재생해야 하므로 `eager` 로 구분한다.
 */

const SLAB = {
  web: {
    href: '/web',
    bg: null as string | null,
    note: '설계 문서에서 시작해 배포까지',
  },
  game: {
    href: '/game',
    bg: '/images/projects/꼬꼬지생.webp',
    note: '두 번째 단계에서 이미 플레이 가능한 빌드',
  },
  edu: {
    href: '/education',
    bg: '/images/projects/미래산업과학고.webp',
    note: '기관 목표에 맞춰 커리큘럼을 다시 구성',
  },
} as const;

export default function DomainSlabs({
  eager = false,
  className = 'pb-8',
  heading,
  withGames = false,
}: {
  /** 첫 화면에 쓸 때 — 스크롤 진입을 기다리지 않는다 */
  eager?: boolean;
  className?: string;
  /** 이 블록이 페이지의 첫 내용일 때 넘기는 h1.
      슬래브 제목은 영역 이름이라 페이지 전체를 대표하지 못한다.
      화면에는 띄우지 않되 문서 구조와 검색엔진에는 남긴다. */
  heading?: string;
  /** 자체 게임 슬래브를 뒤에 붙인다 — 외주가 아닌 독립 사업이라 따로 둔다 */
  withGames?: boolean;
}) {
  return (
    <section className={className}>
      {heading && <h1 className="sr-only">{heading}</h1>}
      {domains.map((d, i) => {
        const s = SLAB[d.key];
        const play = eager ? onMount : inView;
        return (
          <motion.div key={d.key} {...play} variants={fadeUp} data-domain={d.key}>
            <Link href={s.href} className="group relative block overflow-hidden border-b border-white/10">
              {/* 배경 — 사진이 있는 영역만 깔고, 나머지는 호버 때 액센트 워시 */}
              {s.bg ? (
                <>
                  <div className="absolute inset-0 opacity-[0.26] transition-opacity duration-700 group-hover:opacity-[0.38]"
                    style={{ filter: 'saturate(0.85)' }}>
                    <SafeImage src={s.bg} alt="" fill className="absolute inset-0" />
                  </div>
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, var(--canvas) 22%, rgba(14,17,23,0.62) 72%)' }} />
                </>
              ) : (
                <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(90deg, var(--accent-dim), transparent 62%)' }} />
              )}

              <div className={`relative ${container} pb-12 pt-16 sm:pb-16 sm:pt-20 ${
                eager && i === 0 ? 'pt-28 sm:pt-36' : ''}`}>
                <div className="grid items-start gap-x-gutter gap-y-10 lg:grid-cols-12">

                  {/* 번호 + 영문 타이틀 — 번호는 흐름에서 빼내 좌우 기준선을 맞춘다 */}
                  <div className="relative lg:col-span-5">
                    <p className="index-num-lg font-en mb-5 lg:absolute lg:-top-9 lg:left-0 lg:mb-0">
                      0{i + 1}
                    </p>
                    <h2 className="font-en mb-4 font-bold leading-[0.95] tracking-[-0.02em] text-[var(--text-1)]
                                   transition-colors duration-300 group-hover:text-[var(--accent)]"
                      style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4.25rem)' }}>
                      {d.en}
                    </h2>
                    <p className="type-b1 text-white/50">{d.kr}</p>
                  </div>

                  {/* 설명 + 태그 */}
                  <div className="lg:col-span-5 lg:pl-6">
                    <p className="type-h3 mb-5 leading-[1.45] text-[var(--text-1)]">{d.lead}</p>
                    <p className="type-b3 mb-7 max-w-md leading-[1.85] text-white/50">{d.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {d.tags.map((t) => (
                        <span key={t}
                          className="type-c2 font-en rounded-[6px] border border-white/12 px-3 py-1.5 text-white/55">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 지표 + 진입 */}
                  <div className="flex justify-between gap-6 lg:col-span-2 lg:h-full lg:flex-col lg:items-end">
                    <div className="space-y-4 lg:text-right">
                      {d.stats.slice(0, 2).map((st) => (
                        <div key={st.label}>
                          <p className="font-en type-h3 font-mono-stat mb-1.5 font-bold leading-none text-[var(--text-1)]">
                            {st.value}
                          </p>
                          <p className="type-c2 text-white/55">{st.label}</p>
                        </div>
                      ))}
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20
                                     text-white/60 transition-all duration-300
                                     group-hover:rotate-45 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                      <FiArrowUpRight size={20} />
                    </span>
                  </div>
                </div>

                <p className="type-c1 relative mt-8 text-white/50">— {s.note}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}

      {withGames && (
        <motion.div {...(eager ? onMount : inView)} variants={fadeUp} data-domain="game">
          {/* 외주 세 영역과 나란히 두되 링크는 걸지 않는다 —
              두 타이틀 다 제작 중이라 보낼 스토어도 상세 페이지도 아직 없다 */}
          <div className="relative overflow-hidden border-b border-white/10">
            <div className="absolute inset-0 opacity-[0.55]"
              style={{ background: 'linear-gradient(90deg, var(--accent-dim), transparent 58%)' }} />

            <div className={`relative ${container} pb-12 pt-16 sm:pb-16 sm:pt-20`}>
              <div className="grid items-start gap-x-gutter gap-y-10 lg:grid-cols-12">
                <div className="relative lg:col-span-5">
                  <p className="index-num-lg font-en mb-5 lg:absolute lg:-top-9 lg:left-0 lg:mb-0">
                    0{domains.length + 1}
                  </p>
                  <h2 className="font-en mb-4 font-bold leading-[0.95] tracking-[-0.02em] text-[var(--text-1)]"
                    style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4.25rem)' }}>
                    Original Games
                  </h2>
                  <p className="type-b1 text-white/50">자체 게임 제작 · 퍼블리싱</p>
                </div>

                <div className="lg:col-span-5 lg:pl-6">
                  <p className="type-h3 mb-5 leading-[1.45] text-[var(--text-1)]">
                    MATE 이름으로 내는 게임
                  </p>
                  <p className="type-b3 mb-7 max-w-md leading-[1.85] text-white/50">
                    기획과 아트, 개발, 퍼블리싱까지 팀 안에서 끝냅니다. 판권도 저희가 쥡니다.
                    지금 두 타이틀을 만들고 있습니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {games.map((g) => (
                      <span key={g.id}
                        className="type-c2 inline-flex items-center gap-2 rounded-[6px] border border-white/12 px-3 py-1.5 text-white/70">
                        {g.title}
                        <span className="text-white/50">{g.status}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between gap-6 lg:col-span-2 lg:h-full lg:flex-col lg:items-end">
                  <div className="space-y-4 lg:text-right">
                    <div>
                      <p className="font-en type-h3 font-mono-stat mb-1.5 font-bold leading-none text-[var(--text-1)]">
                        {games.length}종
                      </p>
                      <p className="type-c2 text-white/55">제작 중인 타이틀</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="type-c1 relative mt-8 text-white/50">— 자체 IP · 공개할 수 있는 단계가 되면 여기에 올립니다</p>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
