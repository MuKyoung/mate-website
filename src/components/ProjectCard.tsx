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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link href={`/projects/${project.id}`}>
        <div
          className="relative h-full rounded-xl border overflow-hidden transition-all duration-300"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          }}
        >
          {/* 이미지 */}
          <div className="relative h-44 sm:h-48 overflow-hidden bg-[#0d0d10]">
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-white/10">
                  🎮
                </div>
              }
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            {/* 카테고리 */}
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium text-white/60 bg-black/50 border border-white/[0.09] tracking-wide">
                {project.category}
              </span>
            </div>

            {/* 외부 링크 아이콘 — 호버 시 */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="flex items-center justify-center w-7 h-7 rounded-md bg-black/60 border border-white/[0.12] text-white/70">
                <FiArrowUpRight size={13} />
              </span>
            </div>

            {/* 기간 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white/50">
              <FiClock size={11} />
              <span className="text-xs">{project.durationMonths}개월</span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-white mb-1.5 group-hover:text-[#93c5fd] transition-colors duration-200">
              {project.title}
            </h3>
            <p className="text-xs text-white/35 mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* 기술 태그 */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {project.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="tag tag-blue">{tech}</span>
              ))}
              {project.techStack.length > 3 && (
                <span className="tag">+{project.techStack.length - 3}</span>
              )}
            </div>

            {/* 링크 */}
            <div className="flex items-center gap-4 pt-3.5 border-t" style={{ borderColor: 'var(--border)' }}>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-[#60a5fa] transition-colors">
                  <FiExternalLink size={11} /> Live
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-white/30 hover:text-white/70 transition-colors">
                  <FiGithub size={11} /> GitHub
                </a>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
