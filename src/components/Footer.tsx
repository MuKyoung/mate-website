'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { business } from '@/data/business';
import { ctaFor } from '@/data/cta';
import { navItems } from '@/data/navigation';
import { fadeUp, stagger, inView } from '@/lib/motion';
import { arrowHover, container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

import { isToolScreen } from '@/lib/shell';
/**
 * 모든 페이지의 마지막 화면 - Figma footer.
 * 위에는 문의 칸(문구는 페이지마다 src/data/cta.ts), 아래에는 사업자 정보.
 * 그 사이로 어두운 행성이 떠오르고 가장자리에서 로고 파랑 빛이 번진다.
 */
export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // 작업 관리 도구는 자체 셸을 쓴다
  if (isToolScreen(pathname)) return null;

  // 문의 페이지에서는 문의 칸을 다시 띄우지 않는다
  const isContact = /^\/contact\/?$/.test(pathname);
  const cta = ctaFor(pathname);
  const linkCls = 'transition-colors hover:text-white';

  return (
    <footer data-header="dark" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden className="stars" />

      {!isContact && (
        <div className={`${container} relative pt-24 sm:pt-32 xl:pt-[200px]`}>
          <motion.div {...inView} variants={stagger}
            className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[640px]">
              <motion.p variants={fadeUp} className="eyebrow on-night mb-3">Contact</motion.p>
              <motion.h2 variants={fadeUp} className="type-h1 font-bold text-white">
                {cta.line1}<br />{cta.line2}
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 max-w-[30em] text-[16px] leading-[1.6] text-gray-200 sm:text-[18px]">
                {cta.desc}
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="shrink-0">
              <Link href={cta.href}
                className="group flex h-[150px] w-[150px] flex-col items-center justify-center gap-3 rounded-pill bg-point-200 text-center text-white shadow-[0_20px_60px_rgba(38,68,203,0.45)] transition-[background-color,transform] duration-300 hover:scale-[1.04] hover:bg-point-300 sm:h-[180px] sm:w-[180px] xl:h-[210px] xl:w-[210px]">
                <span className="text-[18px] font-bold leading-[1.2] sm:text-[21px] xl:text-[24px]">
                  {cta.button[0]}<br />{cta.button[1]}
                </span>
                <FiArrowUpRight size={28} className={arrowHover} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      )}

      <div className={`relative ${isContact ? 'pt-32 sm:pt-36' : 'mt-28 sm:mt-40 xl:mt-[230px]'}`}>
        {/* 행성 - 가장자리가 구분선 조금 위를 지난다. 문의 칸이 없으면 푸터 안으로 내려 양 끝이 잘리지 않게 한다 */}
        <div aria-hidden className={`planet-anchor ${isContact ? 'top-[64px] sm:top-[72px]' : 'top-[-64px] sm:top-[-80px]'}`}>
          <div className="planet" />
          <div className="planet-flare" />
        </div>

        <div className={`${container} relative pb-14 sm:pb-20`}>
          <div className="h-px bg-[rgba(123,138,167,0.6)]" />

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:justify-between">
            <div className="flex flex-col gap-2.5">
              <p className="type-b2 text-white">{business.name} ({business.brand})</p>
              <p className="text-[14px] leading-[1.6] text-gray-200">
                {business.address}<br />
                대표 {business.owner} · 사업자등록번호 {business.regNo}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 text-[14px] text-gray-200 lg:text-right">
              <a href={`tel:${CONTACT_PHONE}`} className={linkCls}>TEL {CONTACT_PHONE}</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${linkCls} break-all`}>{CONTACT_EMAIL}</a>
              <p>© {year} {business.brand}. All rights reserved.</p>
            </div>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-[14px] text-gray-200">
            {navItems.map((n) => (
              <li key={n.href}><Link href={n.href} className={linkCls}>{n.label}</Link></li>
            ))}
            <li>
              <a href={KAKAO_OPEN_CHAT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                카카오톡 오픈채팅
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
