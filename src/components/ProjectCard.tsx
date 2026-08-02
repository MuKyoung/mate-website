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
        <div className="h-full rounded-2xl border border-[#e6e4f2] bg-white overflow-hidden hover:border-[#4f46ff] hover:shadow-[0_8px_28px_-8px_rgba(79,70,255,0.25)] transition-all duration-200 flex flex-col">
          {/* 이미지 */}
          <div className="relative h-48 sm:h-52 overflow-hidden bg-[#f4f3ff]">
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-[cubic-bezier(0.2,0.6,0.25,1)]"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-[#cfcbe8]">
                  <FiImage size={32} />
                </div>
              }
            />
            {/* 카테고리 */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold text-[#4f46ff] bg-white">
                {project.category}
              </span>
            </div>
            {/* 기간 */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#5b5b6b]">
              <FiClock size={11} />
              <span className="text-[11px] font-semibold">{project.durationMonths}개월</span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="text-[16px] font-bold text-[#0f0f19] transition-colors">
                {project.title}
              </h3>
              <FiArrowUpRight size={18} className="flex-shrink-0 mt-0.5 text-[#cfcbe8] group-hover:text-[#4f46ff] transition-colors" />
            </div>
            <p className="text-[13px] text-[#5b5b6b] mb-4 line-clamp-2 leading-relaxed">
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
              <div className="flex items-center gap-4 pt-3.5 border-t border-[#e6e4f2]">
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12px] font-medium text-[#5b5b6b] hover:text-[#4f46ff] transition-colors">
                    <FiExternalLink size={12} /> Live
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[12px] font-medium text-[#5b5b6b] hover:text-[#4f46ff] transition-colors">
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
