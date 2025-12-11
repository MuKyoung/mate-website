'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project } from '@/types';
import { FiExternalLink, FiGithub, FiClock } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <Link href={`/projects/${project.id}`}>
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
          <SafeImage
            src={project.thumbnail}
            alt={project.title}
            fill
            className="absolute inset-0"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center text-5xl sm:text-6xl text-white/30">
                🚀
              </div>
            }
          />
        </div>
        <div className="p-4 sm:p-5 md:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1.5 sm:mb-2">{project.title}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{project.description}</p>
          
          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-[10px] sm:text-xs font-medium rounded-full"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 text-gray-700 text-[10px] sm:text-xs font-medium rounded-full">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>

          {/* Info & Links */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs text-gray-600 font-medium">{project.category}</span>
              <span className="flex items-center text-[10px] sm:text-xs text-purple-700 font-medium">
                <FiClock className="mr-0.5 sm:mr-1" size={10} />
                {project.durationMonths}개월
              </span>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                  aria-label="Live Demo"
                >
                  <FiExternalLink size={16} />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-500 hover:text-gray-900 transition-colors p-1"
                  aria-label="GitHub"
                >
                  <FiGithub size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

