'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowUpRight } from 'react-icons/fi';
import { Project } from '@/types';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { fadeUp, inView } from '@/lib/motion';

interface ProjectCardProps {
  project: Project;
  index: number;
  /** 썸네일 비율 - 큰 칸은 넓게, 작은 칸은 4:3 */
  aspect?: string;
}

/**
 * 포트폴리오 카드. 작업 화면은 원래 색 그대로 둔다 - 고객이 보는 것은 결과물이다.
 * 카드 위 등폭 줄에 번호와 분류를 적는다.
 */
export default function ProjectCard({ project, index, aspect = 'aspect-[4/3]' }: ProjectCardProps) {
  return (
    <motion.div {...inView} variants={fadeUp} className="group">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="mb-4 flex items-center justify-between gap-4 border-t border-white/15 pt-3">
          <p className="mono-label">
            <span className="text-white/40 tabular-nums">{String(index + 1).padStart(2, '0')}</span>
            {project.category}
          </p>
          <FiArrowUpRight size={15}
            className="text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
        </div>

        <div className={`relative ${aspect} mb-5 overflow-hidden bg-[var(--surface)]`}>
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            placeholder={<ThumbFallback label={project.category} />}
          />
        </div>

        <h3 className="mb-2 text-[21px] font-medium leading-[1.25] tracking-[-0.03em] text-[var(--text-1)] transition-colors duration-300 group-hover:text-[var(--point)] sm:text-[24px]">
          {project.title}
        </h3>
        <p className="line-clamp-2 max-w-xl text-[15px] leading-[1.7] text-white/55">
          {project.description}
        </p>
      </Link>
    </motion.div>
  );
}
