'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, clipUp, stagger, inView } from '@/lib/motion';

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="프로젝트 포트폴리오"
        description="다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다. Unity 게임 · AR/VR · 웹 · 앱 · 강의까지, 검증된 결과물을 확인하세요."
      />

      {/* ━━ 프로젝트 그리드 (light) ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ CTA — 볼드 블루 풀블리드 ━━ */}
      <section className="relative py-24 sm:py-32 bg-[#4f46ff] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-[3rem] bg-[#d4ff3d] rotate-12 opacity-90 pointer-events-none" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] font-semibold text-white/80 mb-5">Contact</p>
              <h2 className="text-white font-extrabold tracking-[-0.035em] leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span></span>
                <span className="block overflow-hidden"><motion.span variants={clipUp} className="block text-white/60">계획 중이신가요?</motion.span></span>
              </h2>
              <motion.p variants={fadeUp} className="text-lg text-white/75 max-w-md">
                게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-14 px-8 rounded-2xl text-[15px] font-bold text-[#4f46ff] bg-white hover:bg-[#d4ff3d] hover:text-[#0f0f19] transition-colors">
                무료 상담 신청
                <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
