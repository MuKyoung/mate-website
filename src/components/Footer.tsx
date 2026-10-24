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
 * 모든 페이지의 마지막 화면.
 * 위에는 가운데 정렬 문의 칸(문구는 페이지마다 src/data/cta.ts), 아래에는 회사 정보 · 바로가기 · 연락처 세 칸.
 * 그 사이로 어두운 행성이 떠오르고 가장자리에서 로고 파랑 빛이 번진다.
 * 세종호이스트크레인 사이트 푸터(좌우로 나눈 문구 + 큰 원 버튼, 좌우 정보 + 링크 한 줄)와 짜임을 다르게 둔다.
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
  const colHead = 'mb-4 text-[14px] font-bold text-white';

  return (
    <footer data-header="dark" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden className="stars" />

      {!isContact && (
        <div className={`${container} relative pt-24 sm:pt-32 xl:pt-[200px]`}>
          <motion.div {...inView} variants={stagger}
            className="mx-auto flex max-w-[760px] flex-col items-center text-center">
            <motion.p variants={fadeUp} className="eyebrow on-night mb-3">Contact</motion.p>
            <motion.h2 variants={fadeUp} className="type-h1 font-bold text-white">
              {cta.line1}<br />{cta.line2}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-[30em] text-[16px] leading-[1.6] text-gray-200 sm:text-[18px]">
              {cta.desc}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10 sm:mt-12">
              <Link href={cta.href}
                className="group inline-flex h-14 items-center gap-4 rounded-pill bg-point-200 pl-8 pr-2 text-[16px] font-bold text-white shadow-[0_20px_60px_rgba(38,68,203,0.45)] transition-colors duration-200 hover:bg-point-300 sm:h-16 sm:pl-9 sm:text-[18px]">
                {cta.button.join(' ')}
                <span className="flex h-10 w-10 items-center justify-center rounded-pill bg-white text-point-200 sm:h-12 sm:w-12">
                  <FiArrowUpRight size={22} className={arrowHover} />
                </span>
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

          {/* 회사 정보 · 바로가기 · 연락처 세 칸 */}
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div className="flex flex-col gap-2.5 sm:col-span-2 lg:col-span-1">
              <p className="type-b2 text-white">{business.name} ({business.brand})</p>
              <p className="text-[14px] leading-[1.6] text-gray-200">
                {business.address}<br />
                대표 {business.owner} · 사업자등록번호 {business.regNo}
              </p>
            </div>
            <nav aria-label="바로가기">
              <p className={colHead}>바로가기</p>
              <ul className="flex flex-col gap-2.5 text-[14px] text-gray-200">
                {navItems.map((n) => (
                  <li key={n.href}><Link href={n.href} className={linkCls}>{n.label}</Link></li>
                ))}
              </ul>
            </nav>
            <div>
              <p className={colHead}>연락처</p>
              <ul className="flex flex-col gap-2.5 text-[14px] text-gray-200">
                <li><a href={`tel:${CONTACT_PHONE}`} className={linkCls}>TEL {CONTACT_PHONE}</a></li>
                <li><a href={`mailto:${CONTACT_EMAIL}`} className={`${linkCls} break-all`}>{CONTACT_EMAIL}</a></li>
                <li>
                  <a href={KAKAO_OPEN_CHAT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    카카오톡 오픈채팅
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-12 border-t border-white/10 pt-6 text-[13px] text-gray-400">
            © {year} {business.brand}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
