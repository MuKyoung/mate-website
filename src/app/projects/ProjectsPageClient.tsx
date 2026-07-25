'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, stagger, inView } from '@/lib/motion';

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

      {/* ━━ CTA (DARK) — 좌측 정렬 ━━ */}
      <section className="py-24 sm:py-32 bg-[#0a0a0a] border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <motion.div {...inView} variants={stagger}>
              <p className="text-[13px] text-white/35 mb-5">Contact</p>
              <motion.h2 variants={fadeUp} className="text-white font-semibold tracking-[-0.03em] leading-[1.05] mb-5"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 3.25rem)' }}>
                비슷한 프로젝트를<br />
                <span className="text-white/35">계획 중이신가요?</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[15px] text-white/55 leading-[1.75] max-w-md">
                게임 · 웹 · 앱 · AR/VR — 무료 상담으로 가능성을 확인하세요.
              </motion.p>
            </motion.div>
            <motion.div {...inView} variants={fadeUp} className="flex-shrink-0">
              <Link href="/contact"
                className="group inline-flex items-center gap-2 h-12 px-7 rounded-sm text-[14px] font-medium text-[#0a0a0a] bg-white hover:bg-white/85 transition-colors">
                무료 상담 신청
                <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
