'use client';

import { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';
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
      {/* 카테고리 — 텍스트 탭 + 헤어라인 */}
      <motion.div {...inView} variants={fadeUp} className="mb-16 sm:mb-24">
        <p className="index-num font-en mb-8">(01) Category</p>

        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3 border-b border-white/10">
          <div className="flex flex-wrap items-end gap-x-6 sm:gap-x-9 gap-y-3">
            {CATEGORY_OPTIONS.map((option) => {
              const active = selectedCategory === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  className={`pb-4 -mb-px border-b-2 text-[15px] font-semibold transition-colors ${
                    active
                      ? 'border-white text-white'
                      : 'border-transparent text-white/30 hover:text-white'
                  }`}
                >
                  {option.label}
                  <span className="ml-1.5 text-[12px] font-semibold tabular-nums opacity-50">
                    {categoryCounts[option.value] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="index-num pb-4 ml-auto whitespace-nowrap">
            {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트 {filteredProjects.length}개
          </p>
        </div>
      </motion.div>

      {/* 프로젝트 그리드 — 비대칭 2열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
        {filteredProjects.map((project, index) => (
          <div key={project.id} className={index % 2 === 1 ? 'md:mt-28' : ''}>
            <ProjectCard project={project} index={index} />
          </div>
        ))}
      </div>

      {/* 결과 없음 — 플레인 텍스트 */}
      {filteredProjects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center">
          <p className="index-num font-en justify-center mb-6">No results</p>
          <h3 className="text-[24px] sm:text-[28px] font-extrabold text-[#f5f6f7] tracking-[-0.025em] leading-[1.2] mb-4">
            해당 카테고리의 프로젝트가 없습니다
          </h3>
          <p className="text-[16px] text-white/45 leading-[1.75]">다른 카테고리를 선택해 보세요</p>
        </motion.div>
      )}
    </div>
  );
}
