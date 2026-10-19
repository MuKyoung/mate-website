'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiArrowUpRight, FiBookOpen, FiCode, FiFolder, FiAward } from 'react-icons/fi';
import DomainSlabs from '@/components/DomainSlabs';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import CtaSection from '@/components/ui/CtaSection';
import HorizonGlow from '@/components/visual/HorizonGlow';
import StripeField from '@/components/visual/StripeField';
import AwardUnits from '@/components/visual/AwardUnits';
import BrandCube from '@/components/visual/BrandCube';
import ScrollCue from '@/components/motion/ScrollCue';
import Scramble from '@/components/motion/Scramble';
import ScrollWords from '@/components/motion/ScrollWords';
import Ticker from '@/components/motion/Ticker';
import { SplitText } from '@/components/motion/SplitText';
import { homeCredentials } from '@/data/domains';
import { affiliations, awards, counts, teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { games } from '@/data/games';
import {
  easeEnter, fadeUp, maskUp, rowIn, staggerRows, staggerTight, inView,
} from '@/lib/motion';
import { arrowHover, container, iconSquare, linkMore, numSquare, sectionPad } from '@/lib/styles';

/* 회사가 FAQ와 진행 절차(faq.ts, process.ts)에 밝혀 둔 것만 적는다.
   고객은 이 목록을 약속으로 읽으므로, 듣기 좋은 조건을 지어 넣지 않는다. */
const values = [
  {
    kr: '저장소를 열어 둡니다',
    desc: 'GitHub로 관리합니다. 프로젝트 기간 동안 진행 상황을 실시간으로 보실 수 있습니다.',
  },
  {
    kr: '매주 진행 상황을 공유합니다',
    desc: '개발 단계에서는 주 단위로 공유하고, 코드 리뷰를 거쳐 올립니다.',
  },
  {
    kr: '끝나면 소스와 문서를 드립니다',
    desc: '프로젝트가 끝나면 모든 소스 코드와 문서를 넘겨드립니다.',
  },
];

const capOf = (id: string) => teamCapabilities.capabilities.find((c) => c.id === id)?.projects ?? 0;

/* 공개 포트폴리오를 영역별로 센다 - 프로젝트 페이지의 분류와 같은 기준 */
const byDomain = [
  { label: '게임 · XR', n: projects.filter((p) => /Game|VR|AR/.test(p.category)).length },
  { label: '웹 · 앱', n: projects.filter((p) => /Web|Website|Mobile/.test(p.category)).length },
  { label: '교육', n: projects.filter((p) => /Education/.test(p.category)).length },
];

/* 슬래브 배경과 겹치지 않는 작업만 고른다 - 그림 한 장은 한 화면에 한 번만 */
const featuredIds = ['3', '2', '6', '5'];
const featured = featuredIds
  .map((id) => projects.find((p) => p.id === id))
  .filter((p): p is (typeof projects)[number] => Boolean(p));

/* 첫 화면 아래로 흐르는 띠 - 수상 · 전시 이력을 최근 것부터 */
const tickerItems = [...awards]
  .sort((a, b) => b.year - a.year)
  .map((a) => `${a.year} ${a.title} · ${a.rank}`);

const bigNum = { fontSize: 'clamp(3.5rem, 7vw, 6rem)' } as const;

/* 숫자 칸 - 아래에서 마스크가 열리며 들어온다 */
const cardIn = maskUp;

export default function Home() {
  const since = teamCapabilities.stats.since;

  // 첫 화면의 큐브와 스크롤 유도는 스크롤하면 빛보다 빠르게 위로 빠지며 옅어진다
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  // 큐브는 스크롤을 내리면 더 빨리 위로 빠지면서 반 바퀴 남짓 더 돈다
  const cubeY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const cubeSpin = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <>
      {/* ━━ 첫 화면 - 위에서 휘어 내려오는 빛, 한가운데 도는 큐브, 맨 아래 스크롤 유도 ━━ */}
      <section ref={heroRef} className="relative flex flex-col overflow-hidden" style={{ minHeight: '100svh' }}>
        <HorizonGlow side="top" rim="min(31vh, 15vw + 140px)" radius="max(96vw, 760px)" />
        <h1 className="sr-only">MATE는 웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱을 합니다</h1>

        {/* 큐브 - 헤더와 스크롤 유도 사이 남는 높이의 한가운데 */}
        <motion.div style={{ y: cubeY, opacity: heroFade }}
          className="relative flex flex-1 items-center justify-center pt-16">
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.6, delay: 0.3, ease: easeEnter }}>
            <BrandCube spin={cubeSpin} />
          </motion.div>
        </motion.div>

        {/* 스크롤 유도 - 첫 화면 맨 아래 가운데 */}
        <motion.div style={{ opacity: heroFade }} className="relative flex justify-center pb-6 pt-4 sm:pb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.5, ease: easeEnter }}>
            <ScrollCue target="after-hero" />
          </motion.div>
        </motion.div>
      </section>

      {/* ━━ 수상 · 전시 이력이 흘러가는 띠 - 스크롤 유도가 내려보내는 자리 ━━ */}
      {/* 스크롤 여백은 SmoothScroll(Lenis)이 -80 으로 따로 준다. scroll-margin 을 함께 두면 두 번 빠진다 */}
      <div id="after-hero">
        <Ticker items={tickerItems} />
      </div>

      <DomainSlabs withGames className="" />

      {/* ━━ 숫자 - 칸마다 다른 면. 값은 전부 데이터에서 센다 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead label="In numbers" title={<>숫자로 본 MATE</>} />

          <motion.div {...inView} variants={staggerTight} className="grid gap-2 lg:grid-cols-12">
            {/* 흰 칸 - 개발 납품 */}
            <motion.div variants={cardIn} data-surface="light"
              className="flex min-h-[300px] flex-col justify-between bg-white p-6 text-black sm:p-7 lg:col-span-4">
              <p className="flex items-center gap-3 text-[17px] font-medium tracking-[-0.012em]">
                <span className={iconSquare}><FiCode size={14} /></span>개발 프로젝트 납품
              </p>
              <div>
                <p className="font-en font-normal leading-none tracking-[-0.06em]" style={bigNum}>
                  <SplitText text={`${counts.devProjects}+`} by="char" delay={0.35} />
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.02em] text-black/55">
                  게임 · XR {capOf('unity')}+ / 웹 · 앱 {capOf('outsourcing')}+
                </p>
              </div>
            </motion.div>

            {/* 파란 칸 - 강의 */}
            <motion.div variants={cardIn}
              className="grain relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-primary-200 p-6 sm:p-7 lg:col-span-4">
              <div aria-hidden className="card-drift" />
              <p className="relative flex items-center gap-3 text-[17px] font-medium tracking-[-0.012em]">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-white text-primary-200"><FiBookOpen size={14} /></span>
                진행 강의
              </p>
              <div className="relative">
                <p className="font-en font-normal leading-none tracking-[-0.06em]" style={bigNum}>
                  <SplitText text={`${counts.lectures}+`} by="char" delay={0.45} />
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.02em] text-white/75">
                  For: 고등학교 · 대학교 · 기관
                </p>
              </div>
            </motion.div>

            {/* 어두운 칸 - 공개 포트폴리오 */}
            <motion.div variants={cardIn}
              className="sweep flex min-h-[300px] flex-col justify-between border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-7 lg:col-span-4">
              <p className="flex items-center gap-3 text-[17px] font-medium tracking-[-0.012em]">
                <span className={iconSquare}><FiFolder size={14} /></span>공개한 작업
              </p>
              <div>
                <p className="font-en font-normal leading-none tracking-[-0.06em]" style={bigNum}>
                  <SplitText text={`${projects.length}건`} by="char" delay={0.55} />
                </p>
                <ul className="mt-5 space-y-2">
                  {byDomain.map((b, i) => (
                    <li key={b.label} className="flex items-center gap-3 font-mono text-[11px] uppercase text-white/60">
                      <span className="w-16 shrink-0">{b.label}</span>
                      <motion.span
                        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, delay: 0.7 + i * 0.12, ease: easeEnter } } }}
                        className="h-[6px] origin-left bg-gradient-to-r from-[#1d4fe6] to-[#8fb0ff]"
                        style={{ width: `${(b.n / projects.length) * 100}%` }} />
                      <span className="tabular-nums text-white/80">{b.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* 넓은 칸 - 연도별 수상 · 전시 */}
            <motion.div variants={cardIn}
              className="border border-white/10 bg-[var(--surface)] p-6 sm:p-7 lg:col-span-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <p className="flex items-center gap-3 text-[17px] font-medium tracking-[-0.012em]">
                  <span className={iconSquare}><FiAward size={14} /></span>연도별 수상 · 전시
                </p>
                <Link href="/team" className={linkMore}>
                  전체 이력 <FiArrowUpRight size={13} className={arrowHover} />
                </Link>
              </div>
              <AwardUnits />
            </motion.div>

            {/* 회색 칸 - 시작한 해와 자체 게임 */}
            <motion.div variants={cardIn}
              className="grain relative flex min-h-[300px] flex-col justify-between overflow-hidden bg-[#5f6878] p-6 sm:p-7 lg:col-span-4">
              <div aria-hidden className="card-drift [animation-delay:-6s]" />
              <p className="relative font-mono text-[12px] uppercase tracking-[0.02em] text-white/80"><Scramble text="Since:" /></p>
              <div className="relative">
                <p className="font-en font-normal leading-none tracking-[-0.06em]" style={bigNum}>
                  <SplitText text={`${since}`} by="char" delay={0.65} />
                </p>
                <p className="mt-4 max-w-[16rem] text-[14px] leading-[1.6] text-white/85">
                  세 영역으로 넓혀 왔고, 지금은 자체 게임 {games.length}종을 만들고 있습니다.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━ 작업 - 넓은 칸과 좁은 칸을 엇갈려 놓는다 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead label="Selected work" href="/projects" more="전체 포트폴리오" title={<>최근 작업</>} />
          <div className="grid gap-x-6 gap-y-16 lg:grid-cols-12 lg:gap-y-24">
            {featured.map((p, i) => {
              const wide = i === 0 || i === 3;
              return (
                <div key={p.id} className={`${wide ? 'lg:col-span-7' : 'lg:col-span-5'} ${i === 1 ? 'lg:mt-32' : ''} ${i === 2 ? 'lg:-mt-8' : ''}`}>
                  <ProjectCard project={p} index={i} aspect={wide ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ 일하는 방식 - 스크롤을 따라 밝아지는 문장과 번호 칸 목록 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <div className="grid gap-x-gutter gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <motion.p {...inView} variants={fadeUp} className="mono-label mb-10 border-b border-white/[0.12] pb-4">
                <Scramble text="Why MATE:" />
              </motion.p>
              <ScrollWords
                className="font-medium leading-[1.2] tracking-[-0.025em] text-[var(--text-1)]"
                style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.875rem)' }}
                segments={[
                  { text: '납품으로 끝내지 않습니다.', br: true },
                  { text: '배포한 뒤에도' },
                  { text: '지켜봅니다.', className: 'text-[var(--point)]', br: true },
                  { text: '모니터링으로 안정성을 확인하고,', className: 'text-white/50', br: true },
                  { text: '유지보수도 이어서 맡습니다.', className: 'text-white/50' },
                ]}
              />
              <motion.div {...inView} variants={fadeUp} className="relative mt-12 h-44 sm:h-64">
                <StripeField seed={5} className="absolute inset-0" />
              </motion.div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <motion.p {...inView} variants={fadeUp} className="mono-label mb-10 border-b border-white/[0.12] pb-4">
                <Scramble text="How we work:" />
              </motion.p>
              <motion.ol {...inView} variants={staggerRows} className="space-y-2">
                {values.map((v, i) => (
                  <motion.li key={v.kr} variants={rowIn}
                    className="sweep border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-7">
                    <div className="mb-4 flex items-center gap-4">
                      <span className={numSquare}>{i + 1}</span>
                      <h3 className="type-h2 text-[var(--text-1)]">{v.kr}</h3>
                    </div>
                    <p className="type-b3 text-white/60 sm:pl-11">{v.desc}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ 밖에서 받은 평가 - 소속과 확인 가능한 심사 이력만 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead label="Recognition" title={<>밖에서 받은 평가</>} />

          <motion.div {...inView} variants={staggerRows} className="mb-14 grid gap-2 sm:grid-cols-2">
            {affiliations.map((a) => (
              <motion.div key={a.id} variants={rowIn}
                className="sweep border border-white/10 bg-[var(--surface)] p-6 transition-colors hover:border-white/25 sm:p-8">
                <p className="mono-label mb-8 text-[var(--point)]"><Scramble text={`${a.role}:`} /></p>
                <h3 className="text-[24px] font-medium tracking-[-0.02em] text-[var(--text-1)] sm:text-[30px]">{a.name}</h3>
              </motion.div>
            ))}
          </motion.div>

          <div className="mb-3 hidden grid-cols-12 gap-x-gutter font-mono text-[11px] uppercase tracking-[0.02em] text-white/45 sm:grid">
            <span className="col-span-2">Year</span>
            <span className="col-span-5">Title</span>
            <span className="col-span-3">Organization</span>
            <span className="col-span-2 text-right">Result</span>
          </div>
          <motion.div {...inView} variants={staggerRows} className="border-t border-white/[0.12]">
            {homeCredentials.map((a) => (
              <motion.div key={a.id} variants={rowIn}
                className="group grid grid-cols-12 items-baseline gap-x-gutter gap-y-1 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.02] sm:py-6">
                <p className="col-span-3 font-mono text-[13px] text-white/50 tabular-nums transition-colors group-hover:text-[var(--point)] sm:col-span-2">{a.year}</p>
                <h3 className="col-span-9 text-[16px] font-medium tracking-[-0.012em] text-[var(--text-1)] transition-transform duration-500 group-hover:translate-x-1.5 sm:col-span-5 sm:text-[17px]">{a.title}</h3>
                <p className="col-span-7 col-start-4 text-[14px] text-white/55 sm:col-span-3 sm:col-start-auto">{a.organization}</p>
                <p className="col-span-5 text-right font-mono text-[12px] text-[var(--point)] sm:col-span-2">{a.rank}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CtaSection line1="아직 정리가" line2="안 되셨어도"
        kr="요구사항과 목표는 첫 상담에서 같이 정리합니다" />
    </>
  );
}
