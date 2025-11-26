'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectCard from './ProjectCard';
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

interface ProjectFilterProps {
  projects: Project[];
}

export default function ProjectFilter({ projects }: ProjectFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 프로젝트 필터링 및 정렬
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = projects.filter((project) => {
        const mappedCategory = CATEGORY_MAP[project.category] || project.category;
        return mappedCategory === selectedCategory;
      });
    }

    // id 순 정렬
    return [...filtered].sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id);
    });
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
    <>
      {/* 필터 버튼 */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedCategory(option.value)}
              className={`
                px-3 sm:px-5 py-2 sm:py-3 rounded-full font-medium transition-all duration-300
                flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base
                ${
                  selectedCategory === option.value
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 hover:border-purple-300'
                }
              `}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              <span
                className={`
                  px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium
                  ${
                    selectedCategory === option.value
                      ? 'bg-white/25 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {categoryCounts[option.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 정보 */}
      <div className="mb-6 sm:mb-8">
        <p className="text-gray-700">
          {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트{' '}
          <span className="font-bold text-purple-700">{filteredProjects.length}</span>개
        </p>
      </div>

      {/* 프로젝트 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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

      {/* 결과 없음 */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            해당 카테고리의 프로젝트가 없습니다
          </h3>
          <p className="text-gray-500">다른 카테고리를 선택해 보세요</p>
        </motion.div>
      )}
    </>
  );
}

