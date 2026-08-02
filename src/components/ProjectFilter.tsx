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
      {/* 카테고리 필터 + 결과 수 */}
      <motion.div {...inView} variants={fadeUp} className="mb-14 sm:mb-20">
        <p className="index-num mb-6">Category</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map((option) => {
              const active = selectedCategory === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  className={`inline-flex items-center gap-2.5 h-12 px-6 rounded-full text-[15px] font-semibold transition-colors ${
                    active
                      ? 'bg-[#3182f6] text-white'
                      : 'bg-white border border-[#e5e8eb] text-[#4e5968] hover:border-[#3182f6] hover:text-[#3182f6]'
                  }`}
                >
                  <span>{option.label}</span>
                  <span
                    className={`text-[13px] tabular-nums ${
                      active ? 'text-white/70' : 'text-[#adb5bd]'
                    }`}
                  >
                    {categoryCounts[option.value] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[15px] text-[#6b7684]">
            {selectedCategory === 'all' ? '전체' : selectedCategory} 프로젝트{' '}
            <span className="font-semibold text-[#191f28] tabular-nums">{filteredProjects.length}</span>개
          </p>
        </div>
      </motion.div>

      {/* 프로젝트 그리드 — 대형 2열 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20">
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* 결과 없음 */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 px-8 rounded-[28px] border border-[#e5e8eb] bg-[#f4f6f8] text-center"
        >
          <div className="mb-8 text-[#adb5bd] flex justify-center">
            <FiSearch size={48} />
          </div>
          <h3 className="text-[24px] sm:text-[28px] font-extrabold text-[#191f28] tracking-[-0.025em] leading-[1.2] mb-4">
            해당 카테고리의 프로젝트가 없습니다
          </h3>
          <p className="text-[17px] text-[#6b7684] leading-[1.75]">다른 카테고리를 선택해 보세요</p>
        </motion.div>
      )}
    </div>
  );
}
