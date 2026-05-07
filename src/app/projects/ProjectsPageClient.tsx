'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';

const CATEGORY_MAP: Record<string, string> = {
  'Game Application': '유니티',
  'VR Application': '유니티',
  'AR Application': '유니티',
  'Web Application': '웹/앱',
  'Mobile Application': '웹/앱',
  'Education Content': '강의',
};

const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체', icon: '📁' },
  { value: '유니티', label: '유니티', icon: '🎮' },
  { value: '웹/앱', label: '웹/앱', icon: '🌐' },
  { value: '강의', label: '강의', icon: '📚' },
];

interface ProjectsPageClientProps {
  projects: Project[];
}

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (selectedCategory !== 'all') {
      filtered = projects.filter((project) => {
        const mappedCategory = CATEGORY_MAP[project.category] || project.category;
        return mappedCategory === selectedCategory;
      });
    }
    return [...filtered].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }, [projects, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    projects.forEach((project) => {
      const mappedCategory = CATEGORY_MAP[project.category] || project.category;
      counts[mappedCategory] = (counts[mappedCategory] || 0) + 1;
    });
    return counts;
  }, [projects]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="section-label justify-center mb-4">Portfolio</span>
            <h1 className="heading-lg text-white mb-5">프로젝트 포트폴리오</h1>
            <p className="body-lg text-white/40 max-w-2xl mx-auto">
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects */}
      <section className="py-8 sm:py-12 pb-20 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    selectedCategory === option.value
                      ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-500/15'
                      : 'text-white/50 border border-white/[0.08] hover:border-white/[0.15] hover:text-white/80'
                  }`}
                  style={selectedCategory !== option.value ? { background: 'var(--surface)' } : {}}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    selectedCategory === option.value ? 'bg-white/20' : 'bg-white/[0.08]'
                  }`}>
                    {categoryCounts[option.value] || 0}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/35 text-sm mb-6 sm:mb-8"
          >
            {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트{' '}
            <span className="text-[#60a5fa] font-medium">{filteredProjects.length}</span>개
          </motion.p>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div key={project.id} layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}>
                  <ProjectCard project={project} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredProjects.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">해당 카테고리의 프로젝트가 없습니다</h3>
              <p className="text-white/35 text-sm">다른 카테고리를 선택해 보세요</p>
            </motion.div>
          )}
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </div>
  );
}
