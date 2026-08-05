'use client';

import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import FloatingNotice from '@/components/FloatingNotice';
import CtaSection from '@/components/ui/CtaSection';
import { Project } from '@/types';
import { container, sectionPad } from '@/lib/styles';

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
      <section className={sectionPad}>
        <div className={container}>
          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ (02) CTA ━━ */}
      <CtaSection
        num="02"
        kr="비슷한 프로젝트를 계획 중이신가요? 게임 · 웹 · 앱 · AR/VR, 무료 상담으로 가능성을 확인하세요"
        cta="문의하기"
      />

      <FloatingNotice message="정보를 추가 중입니다" />
    </>
  );
}
