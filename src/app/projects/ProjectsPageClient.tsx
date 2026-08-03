'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';
import { FiArrowUpRight } from 'react-icons/fi';
import { fadeUp, fadeLeft, fadeRight, clipUp, clipLeft, stagger, inView } from '@/lib/motion';

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
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ (02) CTA ━━ */}
      <section className="py-32 sm:py-48 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.p {...inView} variants={fadeUp} className="index-num font-en mb-10">(02) Contact</motion.p>
          <motion.h2 {...inView} variants={stagger}
            className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.04em] leading-[0.98] mb-8"
            style={{ fontSize: 'clamp(2.5rem, 10vw, 9rem)' }}>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipLeft} className="block">Let&apos;s build</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
              <motion.span variants={clipUp} className="block text-[#3182f6]">together</motion.span>
            </span>
          </motion.h2>
          <motion.p {...inView} variants={fadeLeft} className="caption-kr mb-14 sm:mb-20">
            — 비슷한 프로젝트를 계획 중이신가요? 게임 · 웹 · 앱 · AR/VR, 무료 상담으로 가능성을 확인하세요
          </motion.p>
          <motion.div {...inView} variants={fadeRight} className="flex flex-wrap items-center gap-8">
            <Link href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300">
              문의하기
              <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
            <a href="mailto:hsib1212@naver.com"
              className="text-[15px] font-semibold text-white/60 hover:text-white border-b border-white/25 hover:border-white pb-0.5 transition-colors">
              hsib1212@naver.com
            </a>
          </motion.div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
