'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from '@/components/ProjectCard';
import FloatingNotice from '@/components/FloatingNotice';
import { Project } from '@/types';

// 카테고리 매핑
const CATEGORY_MAP: Record<string, string> = {
  'Game Application': '유니티',
  'VR Application': '유니티',
  'AR Application': '유니티',
  'Web Application': '웹/앱',
  'Mobile Application': '웹/앱',
  'Education Content': '강의',
};

// 카테고리 옵션
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

  // 프로젝트 필터링 및 정렬
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

  // 각 카테고리별 프로젝트 수 계산
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    projects.forEach((project) => {
      const mappedCategory = CATEGORY_MAP[project.category] || project.category;
      counts[mappedCategory] = (counts[mappedCategory] || 0) + 1;
    });
    return counts;
  }, [projects]);

  return (
    <div className="bg-[#0f0f23] min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              className="inline-block text-pink-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Portfolio
            </motion.span>
            <h1 className="heading-lg text-white mb-6">
              프로젝트 <span className="gradient-text">포트폴리오</span>
            </h1>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다
            </p>
          </motion.div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-8 sm:py-12 pb-20 sm:pb-28">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Filter Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  className={`
                    px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300
                    flex items-center gap-2 text-sm sm:text-base
                    ${
                      selectedCategory === option.value
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-xs font-medium
                      ${
                        selectedCategory === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-white/50'
                      }
                    `}
                  >
                    {categoryCounts[option.value] || 0}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <p className="text-white/50 text-sm sm:text-base">
              {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트{' '}
              <span className="font-bold text-purple-400">{filteredProjects.length}</span>개
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard project={project} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                해당 카테고리의 프로젝트가 없습니다
              </h3>
              <p className="text-white/50">다른 카테고리를 선택해 보세요</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Floating Notice */}
      <FloatingNotice message="정보를 추가 중입니다" />
    </div>
  );
}

