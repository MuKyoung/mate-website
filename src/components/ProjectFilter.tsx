'use client';

import { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';
import { Project } from '@/types';
import { motion } from 'framer-motion';
import { fadeUp, stagger, inView } from '@/lib/motion';

// 카테고리 매핑
/* 헤더 내비와 같은 3도메인 체계를 쓴다 - 한 사이트에 분류가 둘이면 안 된다 */
const CATEGORY_MAP: Record<string, string> = {
  'Game Application': '게임 · XR',
  'VR Application': '게임 · XR',
  'AR Application': '게임 · XR',
  'Web Application': '웹 · 앱',
  'Website': '웹 · 앱',
  'Mobile Application': '웹 · 앱',
  'Education Content': '교육',
};

// 카테고리 옵션
const CATEGORY_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: '웹 · 앱', label: '웹 · 앱' },
  { value: '게임 · XR', label: '게임 · XR' },
  { value: '교육', label: '교육' },
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
      {/* 분류 - 각진 칩. 고른 칩은 파랗게 찬다 */}
      <motion.div {...inView} variants={stagger} className="mb-14 sm:mb-20">
        <motion.p variants={fadeUp} className="mono-label mb-6">Category:</motion.p>

        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 border-b border-white/[0.12] pb-6">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_OPTIONS.map((option) => {
              const active = selectedCategory === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  aria-pressed={active}
                  className={`inline-flex h-10 items-center gap-2 border px-4 text-[14px] transition-colors ${
                    active
                      ? 'border-primary-200 bg-primary-200 text-white'
                      : 'border-white/20 text-white/65 hover:border-white/50 hover:text-white'
                  }`}
                >
                  {option.label}
                  <span className="font-mono text-[11px] tabular-nums opacity-70">
                    {categoryCounts[option.value] || 0}
                  </span>
                </button>
              );
            })}
          </motion.div>

          <motion.p variants={fadeUp} className="mono-label ml-auto whitespace-nowrap">
            {selectedCategory === 'all' ? '전체' : selectedCategory} / {filteredProjects.length}건
          </motion.p>
        </div>
      </motion.div>

      {/* 프로젝트 그리드 - 넓은 칸과 좁은 칸을 엇갈려 놓는다 */}
      <div className="grid gap-x-6 gap-y-16 lg:grid-cols-12 lg:gap-y-20">
        {filteredProjects.map((project, index) => {
          const wide = index % 4 === 0 || index % 4 === 3;
          return (
            <div key={project.id} className={wide ? 'lg:col-span-7' : 'lg:col-span-5'}>
              <ProjectCard project={project} index={index} aspect={wide ? 'aspect-[16/10]' : 'aspect-[4/3]'} />
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-28 text-center">
          <p className="mono-label mb-6 justify-center">No results:</p>
          <h3 className="mb-4 text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[var(--text-1)] sm:text-[28px]">
            해당 카테고리의 프로젝트가 없습니다
          </h3>
          <p className="text-[16px] leading-[1.75] text-white/60">다른 카테고리를 선택해 보세요</p>
        </motion.div>
      )}
    </div>
  );
}
