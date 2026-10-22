'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import type { Project } from '@/types';
import { staggerTight, inView } from '@/lib/motion';
import { container } from '@/lib/styles';

interface CaseRailProps {
  eyebrow: string;
  title: React.ReactNode;
  items: Project[];
  more?: { href: string; label: string };
  /** 바탕 - 앞뒤 칸과 번갈아 깐다 */
  tone?: 'white' | 'gray';
}

/**
 * 영역의 작업 - 카드가 가로로 흐른다.
 * 첫 카드는 컨테이너 왼쪽 선에 붙고, 오른쪽으로는 화면 밖까지 이어진다.
 */
export default function CaseRail({ eyebrow, title, items, more, tone = 'white' }: CaseRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  // 화면을 공개할 수 있는 작업을 앞에 세운다
  const ordered = [...items].sort((a, b) => Number(Boolean(b.thumbnail)) - Number(Boolean(a.thumbnail)));
  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };
  const navBtn = 'flex h-10 w-10 items-center justify-center rounded-pill bg-gray-300 text-white transition-colors hover:bg-primary-400';

  return (
    <section data-header="light" className={`${tone === 'gray' ? 'bg-gray-100' : 'bg-white'} py-24 sm:py-32 xl:py-40`}>
      <div className={container}>
        <SectionHead eyebrow={eyebrow} title={title} more={more} />
        <div className="mt-10 hidden justify-end gap-2 sm:flex">
          <button type="button" onClick={() => nudge(-1)} aria-label="이전 작업" className={navBtn}><FiChevronLeft size={20} /></button>
          <button type="button" onClick={() => nudge(1)} aria-label="다음 작업" className={navBtn}><FiChevronRight size={20} /></button>
        </div>
      </div>

      <motion.div {...inView} variants={staggerTight} ref={railRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-3 sm:mt-6 sm:scroll-px-8 sm:px-8 lg:scroll-px-10 lg:px-10 min-[1580px]:scroll-px-[calc((100vw-1500px)/2)] min-[1580px]:px-[calc((100vw-1500px)/2)]">
        {ordered.map((p) => (
          <div key={p.id} className="w-[290px] shrink-0 snap-start sm:w-[400px] xl:w-[490px]">
            <ProjectCard project={p} />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
