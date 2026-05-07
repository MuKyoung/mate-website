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
  { value: 'all',   label: '전체' },
  { value: '유니티', label: '유니티' },
  { value: '웹/앱',  label: '웹 / 앱' },
  { value: '강의',   label: '강의' },
];

interface ProjectsPageClientProps { projects: Project[] }

export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [selected, setSelected] = useState('all');

  const filtered = useMemo(() => {
    const base = selected === 'all'
      ? projects
      : projects.filter(p => (CATEGORY_MAP[p.category] || p.category) === selected);
    return [...base].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }, [projects, selected]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach(p => {
      const cat = CATEGORY_MAP[p.category] || p.category;
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [projects]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── 페이지 헤더 ── */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}>
            <span className="section-label mb-3">Portfolio</span>
            <h1 className="heading-lg text-white mb-3">프로젝트 포트폴리오</h1>
            <p className="text-white/40 text-sm sm:text-base max-w-lg leading-relaxed">
              다양한 산업 분야에서 성공적으로 완료한 프로젝트들을 소개합니다.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 프로젝트 목록 ── */}
      <section className="py-10 pb-20" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">

          {/* 필터 탭 */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="flex items-center gap-0 border-b mb-8"
            style={{ borderColor: 'var(--border)' }}>
            {CATEGORY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setSelected(opt.value)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  selected === opt.value
                    ? 'text-white'
                    : 'text-white/35 hover:text-white/65'
                }`}>
                {opt.label}
                <span className={`ml-1.5 text-xs tabular-nums ${
                  selected === opt.value ? 'text-[#60a5fa]' : 'text-white/20'
                }`}>
                  {counts[opt.value] || 0}
                </span>
                {selected === opt.value && (
                  <motion.span layoutId="tab-indicator"
                    className="absolute bottom-[-1px] left-0 right-0 h-[1.5px] bg-[#3b82f6]"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }} />
                )}
              </button>
            ))}
          </motion.div>

          {/* 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, index) => (
                <motion.div key={project.id} layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}>
                  <ProjectCard project={project} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
              <p className="text-sm text-white/30">해당 카테고리의 프로젝트가 없습니다.</p>
            </motion.div>
          )}
        </div>
      </section>

      <FloatingNotice message="정보를 추가 중입니다" />
    </div>
  );
}
