'use client';

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { easeEnter, inView } from '@/lib/motion';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  // 열 위치에 따라 이미지 마스크가 다른 방향에서 열림 — 좌열: 아래→위, 우열: 좌→우
  const fromSide = index % 2 === 1;
  const delay = (index % 2) * 0.12;

  const card: Variants = {
    hidden: fromSide ? { opacity: 0, x: 72 } : { opacity: 0, y: 72 },
    show: { opacity: 1, x: 0, y: 0, transition: { delay, duration: 1.05, ease: easeEnter } },
  };

  /* 마스크는 부모의 상태를 물려받는다.
     닫힌 클립은 면적이 0이라 IntersectionObserver가 교차를 보고하지 못하므로,
     클립된 요소를 직접 관측하면 리빌이 영영 발화하지 않는다. */
  const mask: Variants = {
    hidden: { clipPath: fromSide ? 'inset(0 0 0 100%)' : 'inset(100% 0 0 0)' },
    show: {
      clipPath: fromSide ? 'inset(0 0 0 0%)' : 'inset(0% 0 0 0)',
      transition: { delay: delay + 0.08, duration: 1.2, ease: easeEnter },
    },
  };

  return (
    <motion.div {...inView} variants={card} className="group">
      <Link href={`/projects/${project.id}`} className="block">
        {/* 대형 이미지 — 방향 교차 마스크 리빌 + 호버 스케일·틸트 */}
        <motion.div variants={mask}
          className="relative aspect-[16/11] overflow-hidden rounded-xl bg-[var(--surface)] mb-6">
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="absolute inset-0 object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] group-hover:rotate-[0.6deg]"
            placeholder={<ThumbFallback label={project.category} />}
          />
        </motion.div>

        {/* 메타 행 — 모바일은 스택, sm부터 타이틀 좌 / 카테고리·기간 우 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6">
          <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[var(--text-1)] tracking-[-0.025em] leading-[1.2] transition-colors duration-300 group-hover:text-[var(--accent)]">
            {project.title}
          </h3>
          <p className="index-num sm:pt-2.5 sm:whitespace-nowrap sm:flex-shrink-0">
            {project.category} · {project.durationMonths}개월
          </p>
        </div>
        <p className="mt-2.5 text-[15px] text-white/55 leading-[1.7] line-clamp-2 max-w-xl">
          {project.description}
        </p>
      </Link>
    </motion.div>
  );
}
