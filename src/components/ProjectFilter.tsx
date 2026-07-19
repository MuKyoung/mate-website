'use client';

import { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';
import { FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { fadeUp, inView } from '@/lib/motion';

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
  { value: 'all', label: '전체' },
  { value: '유니티', label: '유니티' },
  { value: '웹/앱', label: '웹 / 앱' },
  { value: '강의', label: '강의' },
];

interface ProjectFilterProps {
  projects: Project[];
}

export default function ProjectFilter({ projects }: ProjectFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 프로젝트 필터링 및 정렬
  const filteredProjects = useMemo(() => {
    const base =
      selectedCategory === 'all'
        ? projects
        : projects.filter(
            (project) => (CATEGORY_MAP[project.category] || project.category) === selectedCategory
          );
    return [...base].sort((a, b) => parseInt(a.id) - parseInt(b.id));
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
    <div>
      {/* 필터 바 + 결과 수 */}
      <motion.div
        {...inView}
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 sm:mb-14"
      >
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_OPTIONS.map((option) => {
            const active = selectedCategory === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedCategory(option.value)}
                className={`inline-flex items-center gap-2 h-10 px-5 rounded-full text-[13px] font-medium transition-colors ${
                  active
                    ? 'bg-[#0a0a0a] text-white'
                    : 'bg-white border border-[#e4e4e4] text-[#52525b] hover:border-[#0a0a0a]'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`text-[11px] tabular-nums ${
                    active ? 'text-white/60' : 'text-[#a1a1aa]'
                  }`}
                >
                  {categoryCounts[option.value] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[13px] text-[#a1a1aa]">
          {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트{' '}
          <span className="font-semibold text-[#0a0a0a] tabular-nums">{filteredProjects.length}</span>개
        </p>
      </motion.div>

      {/* 프로젝트 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* 결과 없음 */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center rounded-2xl border border-[#e4e4e4] bg-[#f5f5f5]"
        >
          <div className="flex justify-center mb-4 text-[#a1a1aa]">
            <FiSearch size={40} />
          </div>
          <h3 className="text-[15px] font-bold text-[#0a0a0a] mb-1.5">
            해당 카테고리의 프로젝트가 없습니다
          </h3>
          <p className="text-[13px] text-[#52525b]">다른 카테고리를 선택해 보세요</p>
        </motion.div>
      )}
    </div>
  );
}
