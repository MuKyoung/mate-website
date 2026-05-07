'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { FiExternalLink, FiGithub, FiClock, FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className="group relative h-full"
    >
      <Link href={`/projects/${project.id}`}>
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] overflow-hidden"
        >
          {/* 상단 라인 드로우 */}
          <span className="absolute top-0 left-0 z-10 h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />

          {/* 이미지 영역 */}
          <div className="relative h-48 sm:h-52 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 to-pink-600/15" />
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-5xl text-white/15">
                  🎮
                </div>
              }
            />
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-55 group-hover:opacity-75 transition-opacity duration-400" />

            {/* 카테고리 배지 */}
            <div className="absolute top-3 left-3">
              <motion.span
                className="px-2.5 py-1 text-[10px] font-medium text-white/80 bg-black/40 border border-white/15 tracking-wider uppercase"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
              >
                {project.category}
              </motion.span>
            </div>

            {/* 뷰 버튼 — 호버시 등장 */}
            <motion.div
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <span className="flex items-center justify-center w-8 h-8 bg-white/15 border border-white/20 text-white"
                style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}>
                <FiArrowUpRight size={14} />
              </span>
            </motion.div>

            {/* 기간 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/80">
              <FiClock size={12} />
              <span className="text-xs font-medium tracking-wide">{project.durationMonths}개월</span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-5 sm:p-6">
            {/* 타이틀 — 아래에서 클립 */}
            <div style={{ overflow: 'hidden' }}>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
                {project.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-white/45 mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* 기술 스택 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 bg-purple-500/15 text-purple-300/80 text-[10px] font-medium border border-purple-500/15 tracking-wide"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="px-2 py-0.5 bg-white/[0.06] text-white/35 text-[10px] font-medium">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>

            {/* 링크 */}
            <div className="flex items-center gap-4 pt-3.5 border-t border-white/[0.07]">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors"
                >
                  <FiExternalLink size={12} />
                  <span>Live</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                >
                  <FiGithub size={12} />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
