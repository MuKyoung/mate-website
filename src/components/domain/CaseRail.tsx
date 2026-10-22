'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowUpRight } from 'react-icons/fi';
import ProjectCard from '@/components/ProjectCard';
import SectionHead from '@/components/ui/SectionHead';
import type { Project } from '@/types';
import { staggerTight, inView } from '@/lib/motion';
import { arrowHover, btnPoint, btnSm, container } from '@/lib/styles';

interface CaseRailProps {
  title: React.ReactNode;
  items: Project[];
  more?: { href: string; label: string };
}

/**
 * 영역의 작업 - 회색 면 위에 카드가 가로로 흐른다 (Figma 6-4. case).
 * 첫 카드는 컨테이너 왼쪽 선에 붙고, 오른쪽으로는 화면 밖까지 이어진다.
 */
export default function CaseRail({ title, items, more }: CaseRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  // 화면을 공개할 수 있는 작업을 앞에 세운다
  const ordered = [...items].sort((a, b) => Number(Boolean(b.thumbnail)) - Number(Boolean(a.thumbnail)));
  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <section data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[160px]">
      <div className={container}>
        <SectionHead align="center" title={title} />
      </div>

      <motion.div {...inView} variants={staggerTight} ref={railRef}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mt-16 sm:px-8 sm:scroll-px-8 lg:px-10 lg:scroll-px-10 min-[1580px]:px-[calc((100vw-1500px)/2)] min-[1580px]:scroll-px-[calc((100vw-1500px)/2)] scroll-px-5">
        {ordered.map((p) => (
          <div key={p.id} className="w-[290px] shrink-0 snap-start sm:w-[400px] xl:w-[490px]">
            <ProjectCard project={p} />
          </div>
        ))}
      </motion.div>

      <div className={`${container} mt-8 flex items-center justify-between gap-4`}>
        <div className="flex gap-2">
          <button type="button" onClick={() => nudge(-1)} aria-label="이전 작업"
            className="flex h-10 w-10 items-center justify-center rounded-pill bg-gray-300 text-white transition-colors hover:bg-primary-400">
            <FiChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="다음 작업"
            className="flex h-10 w-10 items-center justify-center rounded-pill bg-gray-300 text-white transition-colors hover:bg-primary-400">
            <FiChevronRight size={20} />
          </button>
        </div>
        {more && (
          <Link href={more.href} className={`${btnPoint} ${btnSm}`}>
            {more.label}
            <FiArrowUpRight size={15} className={arrowHover} />
          </Link>
        )}
      </div>
    </section>
  );
}
