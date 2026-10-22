'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';
import SectionHead from '@/components/ui/SectionHead';
import { featuredLarge, featuredSmall } from '@/data/home';
import { domainLabel, domainOf, projects } from '@/data/projects';
import type { Project } from '@/types';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { arrowTile, chip, container, radiusCard } from '@/lib/styles';

const pick = (ids: string[]) =>
  ids.map((id) => projects.find((p) => p.id === id)).filter((p): p is Project => Boolean(p));

const large = pick(featuredLarge);
const small = pick(featuredSmall);
const countWord = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟'][large.length + small.length] ?? `${large.length + small.length}`;

/**
 * 고른 작업 - 큰 판 두 장(위에 제목, 아래에 화면)과 작은 판 네 장.
 * 작업 화면은 원래 색 그대로 둔다 - 고객이 보는 것은 결과물이다.
 */
export default function FeaturedWork() {
  return (
    <section id="work" data-header="light" className="bg-white py-24 sm:py-32 xl:py-40">
      <div className={container}>
        <SectionHead eyebrow="Selected work:"
          title={<>공개한 작업 {projects.length}건 가운데<br /><b>{countWord} 건</b>을 골랐습니다</>}
          more={{ href: '/projects', label: '전체 포트폴리오' }} />

        <motion.div {...inView} variants={staggerTight} className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-2 lg:gap-5">
          {large.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <Link href={`/projects/${p.id}`}
                className={`group flex h-full flex-col overflow-hidden border border-line bg-white transition-shadow duration-300 hover:shadow-float-lg ${radiusCard}`}>
                <div className="flex items-start justify-between gap-6 p-6 sm:p-8">
                  <div className="min-w-0">
                    <span className={chip}>{domainLabel[domainOf(p.category)]}</span>
                    <h3 className="type-h2 mt-3 text-ink transition-colors group-hover:text-point-200">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[15px] leading-[1.65] text-ink-2">{p.description}</p>
                  </div>
                  <span aria-hidden className={arrowTile}><FiArrowUpRight size={18} /></span>
                </div>
                <div className="relative mt-auto aspect-[16/9] overflow-hidden bg-gray-100">
                  <SafeImage src={p.thumbnail} alt={p.title} fill
                    className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    placeholder={<ThumbFallback label={p.category} />} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div {...inView} variants={staggerTight} className="mt-4 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:mt-5 lg:grid-cols-4 lg:gap-x-5">
          {small.map((p) => (
            <motion.div key={p.id} variants={fadeUp}>
              <Link href={`/projects/${p.id}`} className="group block">
                <div className={`relative aspect-[4/3] overflow-hidden bg-gray-100 ${radiusCard}`}>
                  <SafeImage src={p.thumbnail} alt={p.title} fill
                    className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    placeholder={<ThumbFallback label={p.category} />} />
                </div>
                <span className={`${chip} mt-4`}>{domainLabel[domainOf(p.category)]}</span>
                <p className="mt-2.5 flex items-start justify-between gap-3">
                  <span className="truncate text-[17px] font-semibold text-ink transition-colors group-hover:text-point-200">{p.title}</span>
                  <FiArrowUpRight size={16} className="mt-1 shrink-0 text-gray-400 transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-point-200" />
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.04em] text-ink-3">{p.category}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
