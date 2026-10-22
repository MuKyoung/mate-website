'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import BlockMosaic from '@/components/visual/BlockMosaic';
import { domains } from '@/data/domains';
import { fadeUp, staggerTight, inView } from '@/lib/motion';
import { arrowTileDark } from '@/lib/styles';

interface Strip {
  key: string;
  href: string;
  en: string;
  kr: string;
  lead: string;
  img?: { src: string; alt: string; position?: string };
}

/* 영역마다 한 장 - 사진 한 장은 이 페이지에서 한 자리만 쓴다 */
const IMG: Record<string, Strip['img']> = {
  web: { src: '/images/projects/세종호이스트크레인.webp', alt: '(주)세종호이스트크레인 홈페이지 화면', position: 'top' },
  game: { src: '/images/projects/꼬꼬지생.webp', alt: '꼬꼬지생 타이틀 화면' },
  edu: { src: '/images/projects/미래산업과학고.webp', alt: '미래산업과학고등학교 수업 현장', position: '50% 42%' },
};

const STRIPS: Strip[] = [
  ...domains.map((d) => ({ key: d.key, href: `/${d.slug}`, en: d.en, kr: d.kr, lead: d.lead, img: IMG[d.key] })),
  // 자체 게임은 공개할 화면이 아직 없어 블록 모자이크를 깐다
  { key: 'originals', href: '#originals', en: 'Original Games', kr: '자체 게임 제작 · 퍼블리싱', lead: 'MATE 이름으로 내는 게임' },
];

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * 영역 네 칸을 세로 판으로 나란히 세운다. 판에 올리면 넓어지며 사진이 밝아지고 한 줄 소개가 올라온다.
 * 좁은 화면에서는 가로 띠로 쌓는다.
 */
export default function DomainStrips() {
  return (
    <motion.ul {...inView} variants={staggerTight}
      className="flex flex-col gap-2 lg:h-[560px] lg:flex-row lg:gap-0 lg:overflow-hidden lg:rounded-card">
      {STRIPS.map((s, i) => (
        <motion.li key={s.key} variants={fadeUp}
          className="relative h-[230px] overflow-hidden rounded-card-sm lg:h-auto lg:flex-1 lg:rounded-none lg:transition-[flex-grow] lg:duration-700 lg:ease-[cubic-bezier(0.16,1,0.3,1)] lg:hover:flex-[1.7]">
          <Link href={s.href} className="group absolute inset-0 block overflow-hidden bg-night">
            {s.img ? (
              <Image src={s.img.src} alt={s.img.alt} fill sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                style={{ objectPosition: s.img.position ?? 'center' }} />
            ) : (
              <BlockMosaic seed={17} rows={10} className="absolute inset-0" />
            )}
            <div aria-hidden className="absolute inset-0 bg-[rgba(7,11,29,0.72)] transition-opacity duration-500 group-hover:opacity-40" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night to-transparent" />
            {/* 판 사이 가는 선 */}
            {i > 0 && <span aria-hidden className="absolute inset-y-0 left-0 hidden w-px bg-white/25 lg:block" />}

            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
              <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-white/70">{pad(i + 1)} / {s.en}</p>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[24px] font-medium leading-[1.25] tracking-[-0.016em] text-white sm:text-[28px]">{s.kr}</h3>
                  <p className="mt-2 max-w-[22em] text-[14px] leading-[1.6] text-white/75 transition-all duration-500 lg:max-h-0 lg:translate-y-2 lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                    {s.lead}
                  </p>
                </div>
                <span aria-hidden className={arrowTileDark}><FiArrowUpRight size={18} /></span>
              </div>
            </div>
          </Link>
        </motion.li>
      ))}
    </motion.ul>
  );
}
