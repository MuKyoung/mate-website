'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import { domainLabel, domainOf } from '@/data/projects';
import type { Project } from '@/types';
import { fadeUp } from '@/lib/motion';
import { arrowCircle, chip, radiusCard } from '@/lib/styles';

/**
 * 포트폴리오 카드 - Figma 「case card」.
 * 사진 · 회색 칩(영역) · 굵은 제목과 남색 화살표 원 · 한 줄 소개 · 가는 선 아래 분류와 주소.
 * 작업 화면은 원래 색 그대로 둔다 - 고객이 보는 것은 결과물이다.
 */
export default function ProjectCard({ project, className = '' }: { project: Project; className?: string }) {
  const host = project.liveUrl?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  return (
    <motion.article variants={fadeUp} className={`group h-full ${className}`}>
      <Link href={`/projects/${project.id}`}
        className={`flex h-full flex-col overflow-hidden border border-line bg-white transition-shadow duration-300 hover:shadow-float-lg ${radiusCard}`}>
        <div className="relative aspect-[490/252] overflow-hidden bg-gray-100">
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            placeholder={<ThumbFallback label={project.category} />}
          />
        </div>
        <div className="flex flex-1 flex-col px-5 pb-5 pt-5 sm:px-6">
          <span className={`${chip} self-start`}>{domainLabel[domainOf(project.category)]}</span>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h3 className="text-[19px] font-bold leading-[1.35] text-ink sm:text-[22px]">{project.title}</h3>
            <span aria-hidden className={arrowCircle}><FiChevronRight size={20} /></span>
          </div>
          <p className="mt-3 line-clamp-2 text-[14px] leading-[1.6] text-ink-2">{project.description}</p>
          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5 text-[12px]">
              <span className="font-bold text-ink">{project.category}</span>
              {host && <span className="truncate text-gray-500">{host}</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
