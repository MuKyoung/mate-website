'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import BrandOpening from '@/components/BrandOpening';
import DomainSlabs from '@/components/DomainSlabs';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import CtaSection from '@/components/ui/CtaSection';
import { homeCredentials } from '@/data/domains';
import { affiliations, teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { practices } from '@/data/practices';
import { fadeUp, fadeLeft, rowIn, stagger, staggerRows, inView } from '@/lib/motion';
import { arrowHover, container, linkMore, sectionPad } from '@/lib/styles';


const { since } = teamCapabilities.stats;

export default function Home() {
  const featured = projects.slice(0, 4);

  return (
    <>
      <BrandOpening />

      {/* 어떤 회사인가 - 서비스를 나열하기 전에 먼저 답한다 */}
      <section className="pb-20 pt-24 sm:pb-28 sm:pt-32">
        <div className={container}>
          <div className="grid gap-x-gutter gap-y-12 lg:grid-cols-12">
            <motion.div {...inView} variants={fadeLeft} className="lg:col-span-6">
              <p className="index-num font-en mb-6">About</p>
              <h2 className="font-bold leading-[1.16] tracking-[-0.018em] text-[var(--text-1)]"
                style={{ fontSize: 'clamp(2rem, 4.2vw, 3.5rem)' }}>
                <span className="block">맡아서 만들고,</span>
                <span className="block">저희 이름으로도 냅니다</span>
              </h2>
            </motion.div>

            <motion.div {...inView} variants={stagger} className="lg:col-span-5 lg:col-start-8">
              <motion.p variants={fadeUp}
                className="mb-7 text-[19px] font-semibold leading-[1.6] text-[var(--text-1)] sm:text-[21px]">
                MATE는 SI 개발과 자체 퍼블리싱을 함께 하는 팀입니다.
              </motion.p>
              <motion.p variants={fadeUp} className="type-b3 mb-5 leading-[1.9] text-white/72">
                {since}년에 시작해 웹 · 앱, 게임 · XR, 교육으로 영역을 넓혀 왔습니다.
                그와 별개로 저희 게임도 만듭니다. 지금 두 타이틀을 기획부터
                퍼블리싱까지 직접 하고 있습니다.
              </motion.p>
              <motion.p variants={fadeUp} className="type-b3 leading-[1.9] text-white/72">
                두 사업의 기준은 같습니다. 만든 것이 멈추지 않아야 한다는 것.
                개발 4 · 디자인 2 · 운영 1, 일곱 명이 한 팀으로 움직입니다.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9">
                <Link href="/team" className={linkMore}>
                  팀 전체 보기
                  <FiArrowUpRight size={15} className={arrowHover} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <DomainSlabs withGames className="pb-0" />

      {/* ━━ 최근 작업 - 비대칭 2열 ━━ */}
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

      {/* ━━ 일하는 방식 - 착수부터 배포 뒤까지, 순서대로 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="04" label="How we work" title={<>일하는 방식</>} />
          <motion.ol {...inView} variants={staggerRows} className="border-t border-white/10">
            {practices.map((v) => (
              <motion.li key={v.title} variants={rowIn}
                className="grid grid-cols-1 items-baseline gap-x-gutter gap-y-3 border-b border-white/10
                           py-7 sm:py-9 lg:grid-cols-12">
                <h3 className="type-h2 text-[var(--text-1)] lg:col-span-5">{v.title}</h3>
                <p className="type-b3 leading-[1.85] text-white/65 lg:col-span-6 lg:col-start-7">{v.desc}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* ━━ 밖에서 받은 평가 - 소속과 확인 가능한 심사 이력만 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="05" title={<>밖에서 받은 평가</>} />

          <motion.div {...inView} variants={staggerRows}
            className="mb-16 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
            {affiliations.map((a) => (
              <motion.div key={a.id} variants={rowIn} className="bg-[var(--canvas)] p-7 sm:p-9">
                <p className="type-c1 text-[var(--point)] mb-3">{a.role}</p>
                <h3 className="type-h2 text-[var(--text-1)] mb-3">{a.name}</h3>
                <p className="type-b3 text-white/50 leading-[1.8]">{a.note}</p>
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

      {/* ━━ 문의 ━━ */}
      <CtaSection line1="아직 정리가" line2="안 되셨어도"
        kr="요구사항과 목표는 첫 상담에서 같이 정리합니다" />
    </>
  );
}
