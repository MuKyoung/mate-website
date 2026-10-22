'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import PillTabs from '@/components/ui/PillTabs';
import { Project } from '@/types';
import { domainLabel, domainOf, type ProjectDomain } from '@/data/projects';
import { staggerTight } from '@/lib/motion';
import { btnLine } from '@/lib/styles';

/* 헤더 메뉴와 같은 세 영역으로 나눈다 - 한 사이트에 분류가 둘이면 안 된다 */
const OPTIONS: ('all' | ProjectDomain)[] = ['all', 'web', 'game', 'edu'];
const PAGE = 9;

/**
 * 포트폴리오 목록 - 알약 탭으로 영역을 고르고, 세 줄 카드 격자에 아홉 장씩 (Figma 11-2. case).
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
      <PillTabs
        tabs={OPTIONS.map((k) => ({ key: k, label: k === 'all' ? '전체' : domainLabel[k], count: countOf(k) }))}
        active={selected}
        onSelect={(k) => { setSelected(k as 'all' | ProjectDomain); setLimit(PAGE); }}
      />

      <div className="mt-12 flex items-center justify-between border-b border-line pb-5 text-[14px] sm:mt-14">
        <p className="text-ink-2">
          {selected === 'all' ? '전체' : domainLabel[selected]} <b className="text-ink">{filtered.length}</b>건
        </p>
        <p className="text-gray-500">납품이 끝난 작업만 올립니다</p>
      </div>

      <motion.div key={selected} initial="hidden" animate="show" variants={staggerTight}
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {filtered.slice(0, limit).map((p) => <ProjectCard key={p.id} project={p} />)}
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-24 text-center text-[16px] text-gray-500">해당 영역의 프로젝트가 없습니다</p>
      )}

      {rest > 0 && (
        <div className="mt-12 flex justify-center sm:mt-16">
          <button type="button" onClick={() => setLimit((l) => l + PAGE)} className={btnLine}>
            더보기 <span className="text-point-200">+{rest}</span>
          </button>
        </div>
      )}
    </div>
  );
}
