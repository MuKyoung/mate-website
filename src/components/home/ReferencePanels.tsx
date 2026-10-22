'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { referenceIds } from '@/data/home';
import { domainLabel, domainOf, projects } from '@/data/projects';
import type { Project } from '@/types';
import { fadeUp, staggerTight, inView } from '@/lib/motion';

const items = referenceIds
  .map((id) => projects.find((p) => p.id === id))
  .filter((p): p is Project => Boolean(p?.thumbnail));

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * References - 왼쪽 남색 칸에 제목, 오른쪽에 작업 다섯 장이 세로 판으로 선다 (Figma 1-4. references).
 * 판은 남색에 덮여 있다가 올리면 걷히고, 가운데 화살표 원이 뜨며 이름이 아래로 내려간다.
 * 좁은 화면에서는 판을 가로 띠로 쌓는다.
 */
export default function ReferencePanels() {
  return (
    <section id="references" data-header="dark" className="relative overflow-hidden bg-night lg:flex lg:h-[max(720px,min(100vh,1080px))]">
      <div className="relative flex items-center py-24 sm:py-28 lg:w-[44.6%] lg:shrink-0 lg:border-r lg:border-[rgba(215,220,228,0.4)] lg:py-0">
        <div className="w-full px-5 sm:px-8 lg:pl-[max(2.5rem,calc((100vw-1500px)/2))] lg:pr-12">
          <SectionHead dark eyebrow="References"
            title={<><b>납품이 끝난 작업</b>만<br />포트폴리오에 올립니다</>}
            desc="공개되지 않은 화면은 싣지 않고, 무엇을 만들었는지만 적습니다."
            more={{ href: '/projects', label: '전체 포트폴리오' }} />
        </div>
      </div>

      <motion.ul {...inView} variants={staggerTight} className="flex flex-col lg:flex-1 lg:flex-row">
        {items.map((p, i) => (
          <motion.li key={p.id} variants={fadeUp} className="relative lg:flex-1">
            <Link href={`/projects/${p.id}`}
              className="group relative block h-[150px] overflow-hidden border-t border-white/20 sm:h-[190px] lg:h-full lg:border-l lg:border-t-0 lg:border-white/50">
              <Image src={p.thumbnail!} alt={p.title} fill sizes="(min-width: 1024px) 12vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" />
              <div aria-hidden className="absolute inset-0 bg-[rgba(7,11,29,0.8)] transition-opacity duration-500 group-hover:opacity-25" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(7,11,29,0.9)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* 가운데 화살표 원 - 올렸을 때만 */}
              <span aria-hidden
                className="absolute left-1/2 top-1/2 hidden h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-pill border-2 border-white bg-[rgba(51,51,51,0.5)] text-white opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 lg:flex">
                <FiArrowUpRight size={28} />
              </span>

              {/* 이름 - 넓은 화면: 가운데에 있다가 올리면 아래로 */}
              <div className="absolute inset-x-0 top-1/2 hidden -translate-y-1/2 px-2 text-center transition-[top,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:top-[calc(100%-56px)] group-hover:-translate-y-full lg:block">
                <p className="text-[14px] font-bold text-point-light xl:text-[16px] 2xl:text-[18px]">References {pad(i + 1)}</p>
                {/* 판 폭에 맞춰 글자 크기를 정한다 - '세종호이스트크레인' 아홉 자가 한 줄에 들어가게 */}
                <p className="mt-3 font-medium leading-[1.3] text-white" style={{ fontSize: 'clamp(15px, 1.1vw, 22px)' }}>{p.title}</p>
                <p className="mt-2 text-[13px] text-white/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {domainLabel[domainOf(p.category)]}
                </p>
              </div>

              {/* 이름 - 좁은 화면: 왼쪽에 늘 보이고 오른쪽에 화살표 */}
              <div className="absolute inset-0 flex items-center justify-between gap-4 px-5 sm:px-8 lg:hidden">
                <div>
                  <p className="text-[13px] font-bold text-point-light">References {pad(i + 1)} · {domainLabel[domainOf(p.category)]}</p>
                  <p className="mt-1.5 text-[20px] font-medium text-white">{p.title}</p>
                </div>
                <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill border border-white/70 text-white">
                  <FiArrowUpRight size={20} />
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
