'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { FiClock, FiArrowUpRight, FiImage } from 'react-icons/fi';
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
      viewport={{ once: true, margin: '-10%' }}
      transition={{ delay: (index % 3) * 0.12, duration: 1.05, ease: easeEnter }}
      className="group h-full"
    >
      <Link href={`/projects/${project.id}`} className="block h-full">
        <article className="h-full flex flex-col">
          {/* 대형 이미지 — 마스크 리빌 + 호버 스케일 */}
          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ delay: (index % 3) * 0.12 + 0.1, duration: 1.2, ease: easeEnter }}
            className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#f4f6f8] mb-6"
          >
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-[#d1d6db]">
                  <FiImage size={40} />
                </div>
              }
            />
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-[#191f28]/0 group-hover:bg-[#191f28]/15 transition-colors duration-500" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full text-[12px] font-bold text-[#3182f6] bg-white">
                {project.category}
              </span>
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 text-[#4e5968]">
                <FiClock size={11} />
                <span className="text-[12px] font-semibold">{project.durationMonths}개월</span>
              </span>
            </div>

            {/* 호버 시 나타나는 화살표 */}
            <span className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white flex items-center justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <FiArrowUpRight size={20} className="text-[#191f28]" />
            </span>
          </motion.div>

          {/* 콘텐츠 — 크게 */}
          <div className="flex flex-col flex-grow">
            <h3 className="text-[22px] sm:text-[26px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] mb-3 group-hover:text-[#3182f6] transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-[15px] text-[#4e5968] mb-5 line-clamp-2 leading-[1.7]">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
              {project.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="tag tag-blue">{tech}</span>
              ))}
              {project.techStack.length > 3 && (
                <span className="tag">+{project.techStack.length - 3}</span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
