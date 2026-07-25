'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { FiExternalLink, FiGithub, FiClock, FiArrowUpRight, FiImage } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import { easeEnter } from '@/lib/motion';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12%' }}
      transition={{ delay: index * 0.09, duration: 0.7, ease: easeEnter }}
      className="group h-full"
    >
      <Link href={`/projects/${project.id}`} className="block h-full">
        <div className="h-full rounded-sm border border-[#e4e4e4] bg-white overflow-hidden hover:border-[#0a0a0a] transition-colors flex flex-col">
          {/* 이미지 */}
          <div className="relative h-44 sm:h-48 overflow-hidden bg-[#f5f5f5] border-b border-[#e4e4e4]">
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-[cubic-bezier(0.2,0.6,0.25,1)]"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-[#c6c6c6]">
                  <FiImage size={32} />
                </div>
              }
            />
            {/* 카테고리 */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-sm text-[11px] font-medium text-[#0a0a0a] bg-white">
                {project.category}
              </span>
            </div>
            {/* 기간 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-sm bg-white text-[#52525b]">
              <FiClock size={11} />
              <span className="text-[11px] font-medium">{project.durationMonths}개월</span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-[15px] font-bold text-[#0a0a0a] transition-colors">
                {project.title}
              </h3>
              <FiArrowUpRight size={16} className="flex-shrink-0 mt-0.5 text-[#c6c6c6] transition-colors" />
            </div>
            <p className="text-[13px] text-[#52525b] mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
              {project.techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="tag tag-blue">{tech}</span>
              ))}
              {project.techStack.length > 3 && (
                <span className="tag">+{project.techStack.length - 3}</span>
              )}
            </div>

            {(project.liveUrl || project.githubUrl) && (
              <div className="flex items-center gap-4 pt-3.5 border-t border-[#e4e4e4]">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12px] text-[#52525b] hover:text-[#0a0a0a] transition-colors">
                    <FiExternalLink size={12} /> Live
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12px] text-[#52525b] hover:text-[#0a0a0a] transition-colors">
                    <FiGithub size={12} /> GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
