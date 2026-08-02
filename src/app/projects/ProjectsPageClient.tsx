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

      {/* ━━ Portfolio 타이틀 + 카테고리 필터 + 3열 그리드 ━━ */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp} className="mb-14">
            <p className="index-num mb-5">Portfolio</p>
            <h2 className="display-xl">Work</h2>
          </motion.div>

          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ 대형 중앙 CTA (devigns 패턴) ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.08] mb-7 max-w-4xl mx-auto"
            style={{ fontSize: 'clamp(2rem, 5.5vw, 4.25rem)' }}>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span variants={clipUp} className="block">계획 중이신가요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp}
            className="text-[15px] sm:text-base text-[#4e5968] leading-[1.75] max-w-xl mx-auto mb-10">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-xl text-[15px] font-bold text-white bg-[#3182f6] hover:bg-[#1b64da] transition-colors shadow-[0_4px_14px_rgba(49,130,246,0.30)]">
              문의하기
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
