'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';
import { FiArrowUpRight } from 'react-icons/fi';
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

      {/* ━━ (01) Work — 텍스트 탭 필터 + 비대칭 2열 그리드 ━━ */}
      <section className="py-28 sm:py-40 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ (02) CTA ━━ */}
      <section className="py-32 sm:py-48 bg-white border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num mb-10">(02) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="text-[#191f28] font-extrabold tracking-[-0.05em] leading-[0.96] mb-10 sm:mb-14"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.07em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">계획 중이신가요?</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp}
            className="text-lg sm:text-xl text-[#4e5968] leading-[1.75] max-w-2xl mb-12 sm:mb-16">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 rounded-[10px] text-[15px] font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300">
              문의하기
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-[#4e5968] hover:text-[#191f28] border-b border-[#d1d6db] hover:border-[#191f28] pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
