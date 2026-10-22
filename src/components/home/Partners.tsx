'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import SectionHead from '@/components/ui/SectionHead';
import { partners } from '@/data/partners';
import { fadeUp, staggerRows, inView } from '@/lib/motion';
import { arrowHover, container } from '@/lib/styles';

/**
 * 함께한 곳 - 가는 선으로 나눈 칸마다 이름 하나 (Figma 1-7. Partners).
 * Figma 는 칸에 로고를 넣었다. 받은 로고가 없어 이름과 함께 한 일을 글자로 적는다.
 * 네 칸씩 채우고 남는 칸에는 문의로 가는 칸을 둔다.
 */
export default function Partners() {
  const filler = (4 - (partners.length % 4)) % 4;
  return (
    <section id="partners" data-header="light" className="bg-white py-24 sm:py-32 xl:py-[170px]">
      <div className={container}>
        <SectionHead align="center" eyebrow="Partners"
          title={<>학교와 기관, 기업이<br /><b>MATE와 함께했습니다</b></>} />

        <motion.ul {...inView} variants={staggerRows}
          className="mx-auto mt-12 grid max-w-[1000px] grid-cols-2 border-l border-t border-line sm:mt-14 lg:grid-cols-4">
          {partners.map((p) => (
            <motion.li key={p.name} variants={fadeUp}
              className="flex h-[112px] flex-col items-center justify-center gap-1.5 border-b border-r border-line px-3 text-center sm:h-[130px]">
              <span className="text-[15px] font-bold leading-[1.35] text-ink sm:text-[17px]">{p.name}</span>
              <span className="text-[13px] text-gray-500">{p.role}</span>
            </motion.li>
          ))}
          {filler > 0 && (
            <motion.li variants={fadeUp}
              className="border-b border-r border-line"
              style={{ gridColumn: `span ${filler} / span ${filler}` }}>
              <Link href="/contact"
                className="group flex h-[112px] flex-col items-center justify-center gap-1.5 bg-gray-100 px-3 text-center transition-colors hover:bg-point-100 sm:h-[130px]">
                <span className="inline-flex items-center gap-1 text-[15px] font-bold text-point-200 sm:text-[17px]">
                  함께할 프로젝트 문의
                  <FiArrowUpRight size={16} className={arrowHover} />
                </span>
                <span className="text-[13px] text-gray-500">아이디어 단계여도 됩니다</span>
              </Link>
            </motion.li>
          )}
        </motion.ul>
      </div>
    </section>
  );
}
