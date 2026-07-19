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

      {/* ━━ CTA (DARK) ━━ */}
      <section className="relative py-28 sm:py-40 bg-[#0a0a0a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[40vw] rounded-full opacity-[0.16]"
            style={{ background: 'radial-gradient(circle, #2a72e5 0%, transparent 60%)' }} />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <motion.span {...inView} variants={fadeUp} className="eyebrow text-[#5b9bff] mb-6 justify-center">Let&apos;s build together</motion.span>
          <motion.h2 {...inView} variants={stagger} className="display-hero text-white mb-8">
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">비슷한 프로젝트를</motion.span></span>
            <span className="block overflow-hidden"><motion.span variants={clipUp} className="block">계획 중이신가요?</motion.span></span>
          </motion.h2>
          <motion.p {...inView} variants={fadeUp} className="on-dark-2 text-lg mb-10 max-w-lg mx-auto">
            게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
          </motion.p>
          <motion.div {...inView} variants={fadeUp} className="flex justify-center">
            <Link href="/contact"
              className="group inline-flex items-center gap-2 h-14 px-9 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors">
              무료 상담 신청
              <FiArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
