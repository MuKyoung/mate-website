'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import ChipTabs from '@/components/ui/ChipTabs';
import { Project } from '@/types';
import { domainLabel, domainOf, type ProjectDomain } from '@/data/projects';
import { staggerTight } from '@/lib/motion';
import { btnLine } from '@/lib/styles';

/* 헤더 메뉴와 같은 세 영역으로 나눈다 - 한 사이트에 분류가 둘이면 안 된다 */
const OPTIONS: ('all' | ProjectDomain)[] = ['all', 'web', 'game', 'edu'];
const PAGE = 9;

/**
 * 포트폴리오 목록 - 분류 칩으로 영역을 고르고, 세 줄 격자에 아홉 장씩.
 */
export default function ProjectFilter({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<'all' | ProjectDomain>('all');
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const base = selected === 'all' ? projects : projects.filter((p) => domainOf(p.category) === selected);
    return [...base].sort((a, b) => parseInt(a.id) - parseInt(b.id));
  }, [projects, selected]);

  const countOf = (k: 'all' | ProjectDomain) =>
    k === 'all' ? projects.length : projects.filter((p) => domainOf(p.category) === k).length;

  const rest = filtered.length - limit;

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
        <ChipTabs
          tabs={OPTIONS.map((k) => ({ key: k, label: k === 'all' ? '전체' : domainLabel[k], count: countOf(k) }))}
          active={selected}
          onSelect={(k) => { setSelected(k as 'all' | ProjectDomain); setLimit(PAGE); }}
        />
        <p className="shrink-0 font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
          {selected === 'all' ? 'All' : domainLabel[selected]} / <span className="text-point-200">{String(filtered.length).padStart(2, '0')}</span>
        </p>
      </div>

      <motion.div key={selected} initial="hidden" animate="show" variants={staggerTight}
        className="mt-10 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
        {filtered.slice(0, limit).map((p) => <ProjectCard key={p.id} project={p} />)}
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-24 text-center text-[16px] text-ink-3">해당 영역의 프로젝트가 없습니다</p>
      )}

      {rest > 0 && (
        <div className="mt-14 flex justify-center sm:mt-16">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={btnLine}>
            더보기 <span className="font-mono text-[13px] text-point-200">+{rest}</span>
          </button>
        </div>
      )}
    </div>
  );
}
