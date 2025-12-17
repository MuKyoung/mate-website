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
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative h-full"
    >
      <Link href={`/projects/${project.id}`}>
        <motion.div
          whileHover={{ y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative h-full rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden"
        >
          {/* Image Container */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
            <SafeImage
              src={project.thumbnail}
              alt={project.title}
              fill
              className="absolute inset-0 group-hover:scale-110 transition-transform duration-700"
              placeholder={
                <div className="absolute inset-0 flex items-center justify-center text-6xl text-white/20">
                  🎮
                </div>
              }
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-white border border-white/20">
                {project.category}
              </span>
            </div>

            {/* View Project Button */}
            <motion.div
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                <FiArrowUpRight size={18} />
              </span>
            </motion.div>

            {/* Duration */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-white/90">
              <FiClock size={14} />
              <span className="text-sm font-medium">{project.durationMonths}개월</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:gradient-text transition-all duration-300">
              {project.title}
            </h3>
            <p className="text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-lg border border-purple-500/20"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="px-2.5 py-1 bg-white/10 text-white/50 text-xs font-medium rounded-lg">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-sm text-white/60 hover:text-purple-400 transition-colors"
                >
                  <FiExternalLink size={14} />
                  <span>Live</span>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  <FiGithub size={14} />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
            }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
