'use client';

import PageHeader from '@/components/PageHeader';
import ProjectFilter from '@/components/ProjectFilter';
import CtaSection from '@/components/ui/CtaSection';
import { Project } from '@/types';
import { container, sectionPad } from '@/lib/styles';

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  // 설명 문구의 숫자가 목록과 어긋나지 않도록 실제 데이터에서 센다
  const count = (re: RegExp) => projects.filter((p) => re.test(p.category)).length;
  const gameCount = count(/Game|VR/);
  const webCount = count(/Web/);
  const eduCount = count(/Education/);
  const months = projects.map((p) => p.durationMonths);

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="프로젝트 포트폴리오"
        description={`게임 · VR ${gameCount}건, 웹 · 앱 ${webCount}건, 강의 ${eduCount}건. 기간은 ${Math.min(...months)}개월에서 ${Math.max(...months)}개월까지였고, 전부 납품이 끝난 것들입니다.`}
      />

      {/* ━━ (01) Work - 텍스트 탭 필터 + 비대칭 2열 그리드 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <ProjectFilter projects={projects} />
        </div>
      </section>

      {/* ━━ (02) CTA ━━ */}
      <CtaSection
        num="02"
        line1="다음 줄에"
        line2="들어갈 프로젝트"
        kr={`여기 올라온 ${projects.length}건은 전부 납품이 끝난 것입니다`}
        cta="문의하기"
      />
    </>
  );
}
