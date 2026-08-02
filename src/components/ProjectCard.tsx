'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { FiImage } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { easeEnter } from '@/lib/motion';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 72 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ delay: (index % 2) * 0.12, duration: 1.05, ease: easeEnter }}
      className="group"
    >
      <Link href={`/projects/${project.id}`} className="block">
        {/* 대형 이미지 — 마스크 리빌 + 호버 스케일 */}
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
          viewport={{ once: true, margin: '-8%' }}
          transition={{ delay: (index % 2) * 0.12 + 0.08, duration: 1.2, ease: easeEnter }}
          className="relative aspect-[16/11] overflow-hidden rounded-xl bg-[#f4f6f8] mb-6"
        >
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="absolute inset-0 object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center text-[#d1d6db]">
                <FiImage size={36} />
              </div>
            }
          />
        </motion.div>

        {/* 메타 행 — 모바일은 스택, sm부터 타이틀 좌 / 카테고리·기간 우 */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-6">
          <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] transition-colors duration-300 group-hover:text-[#3182f6]">
            {project.title}
          </h3>
          <p className="index-num sm:pt-2.5 sm:whitespace-nowrap sm:flex-shrink-0">
            {project.category} · {project.durationMonths}개월
          </p>
        </div>
        <p className="mt-2.5 text-[15px] text-[#4e5968] leading-[1.7] line-clamp-2 max-w-xl">
          {project.description}
        </p>
      </Link>
    </motion.div>
  );
}
