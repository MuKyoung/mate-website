'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { domainLabel, domainOf } from '@/data/projects';
import type { Project } from '@/types';
import { fadeUp } from '@/lib/motion';
import { radiusCard } from '@/lib/styles';

/**
 * 포트폴리오 카드 - 테두리 상자 없이 화면 · 이름 · 한 줄 소개 · 분류.
 * 화면 왼쪽 위에 영역 꼬리표를 얹는다. 작업 화면은 원래 색 그대로 둔다.
 */
export default function ProjectCard({ project, className = '' }: { project: Project; className?: string }) {
  return (
    <motion.article variants={fadeUp} className={`group h-full ${className}`}>
      <Link href={`/projects/${project.id}`} className="flex h-full flex-col">
        <div className={`relative aspect-[16/11] overflow-hidden bg-gray-100 ${radiusCard}`}>
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            placeholder={<ThumbFallback label={project.category} />}
          />
          <span className="absolute left-3 top-3 rounded-[4px] bg-white/90 px-2 py-1 font-mono text-[11px] leading-none text-ink backdrop-blur-sm">
            {domainLabel[domainOf(project.category)]}
          </span>
        </div>
        <div className="flex items-start justify-between gap-4 pt-5">
          <h3 className="text-[19px] font-semibold leading-[1.35] tracking-[-0.01em] text-ink transition-colors duration-300 group-hover:text-point-200 sm:text-[21px]">
            {project.title}
          </h3>
          <FiArrowUpRight size={18}
            className="mt-1 shrink-0 text-gray-400 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-point-200" />
        </div>
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.65] text-ink-2">{project.description}</p>
        <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-3">{project.category}</p>
      </Link>
    </motion.article>
  );
}
