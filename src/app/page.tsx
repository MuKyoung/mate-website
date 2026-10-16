'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import DomainSlabs from '@/components/DomainSlabs';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import CtaSection from '@/components/ui/CtaSection';
import { domains, homeCredentials } from '@/data/domains';
import { affiliations } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import {
  fadeUp, fadeLeft, fadeRight, riseTilt, clipUp, clipLeft, rowIn, stagger, staggerRows, inView,
} from '@/lib/motion';
import { arrowHover, container, sectionPad } from '@/lib/styles';


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

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <DomainSlabs eager withGames className="pb-0"
        heading="MATE는 웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱을 합니다" />

      {/* ━━ (02) Work - 비대칭 2열 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="02" label="Selected Work" href="/projects" more="전체 포트폴리오"
            title={<>최근 작업</>} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
            {featured.map((p, i) => (
              <div key={p.id} className={i % 2 === 1 ? 'md:mt-28' : ''}>
                <ProjectCard project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ (03) 매니페스토 ━━ */}
      <section className="pt-16 sm:pt-28 pb-10 sm:pb-14">
        <div className={container}>
          <motion.p {...inView} variants={fadeUp}
            className="index-num font-en pb-6 border-b border-white/10 mb-14 sm:mb-20">Why MATE</motion.p>

          {/* 라인마다 다른 방향으로 열리는 스테이트먼트 */}
          <motion.p {...inView} variants={stagger}
            className="font-bold text-[var(--text-1)] tracking-[-0.02em] leading-[1.22] max-w-5xl"
            style={{ fontSize: 'clamp(1.625rem, 3.6vw, 3rem)' }}>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipUp} className="block">납품으로 끝내지 않습니다.</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={clipLeft} className="block">
배포한 뒤에도 <span className="text-[var(--point)]">지켜봅니다</span>.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span variants={fadeRight} className="block text-white/50">
                모니터링으로 안정성을 확인하고,<br />유지보수도 이어서 맡습니다.
              </motion.span>
            </span>
          </motion.p>

        </div>
      </section>

      {/* ━━ (04) Rules - EN 키워드 + KR 부연 (레퍼런스 Vision 방식) ━━ */}
      <section className="pt-20 sm:pt-28 pb-24 sm:pb-32">
        <div className={container}>
          <SectionHead num="04" title={<>일하는 방식</>} />
          <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
            {values.map((v) => (
              <motion.div key={v.kr} variants={rowIn}
                className="grid grid-cols-1 items-baseline gap-x-gutter gap-y-3 border-b border-white/10
                           py-8 sm:py-10 lg:grid-cols-12">
                <h3 className="type-h2 text-[var(--text-1)] lg:col-span-4">{v.kr}</h3>
                <p className="type-b3 leading-[1.85] text-white/50 lg:col-span-7 lg:col-start-6">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━ (05) 밖에서 받은 평가 - 소속과 확인 가능한 심사 이력만 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="05" title={<>밖에서 받은 평가</>} />

          <motion.div {...inView} variants={staggerRows}
            className="mb-16 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
            {affiliations.map((a) => (
              <motion.div key={a.id} variants={rowIn} className="bg-[var(--canvas)] p-7 sm:p-9">
                <p className="type-c1 text-[var(--point)] mb-3">{a.role}</p>
                <h3 className="type-h2 text-[var(--text-1)]">{a.name}</h3>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...inView} variants={staggerRows} className="border-t border-white/10">
            {homeCredentials.map((a) => (
              <motion.div key={a.id} variants={rowIn}
                className="grid grid-cols-12 gap-x-gutter gap-y-1 py-6 sm:py-7 border-b border-white/10 items-baseline">
                <p className="col-span-3 sm:col-span-2 font-en type-b2 text-white/50 font-mono-stat">{a.year}</p>
                <h3 className="col-span-9 sm:col-span-5 type-b1 text-[var(--text-1)]">{a.title}</h3>
                <p className="col-span-7 sm:col-span-3 type-b3 text-white/55">{a.organization}</p>
                <p className="col-span-5 sm:col-span-2 type-b4 text-[var(--point)] sm:text-right">{a.rank}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p {...inView} variants={fadeUp} className="mt-8 type-c1 text-white/50">
            전시 참가 이력을 포함한 전체 목록은 팀 페이지에 있습니다.
          </motion.p>
        </div>
      </section>

      {/* ━━ (06) CTA ━━ */}
      <CtaSection num="06" line1="아직 정리가" line2="안 되셨어도"
        kr="요구사항과 목표는 첫 상담에서 같이 정리합니다" />
    </>
  );
}
