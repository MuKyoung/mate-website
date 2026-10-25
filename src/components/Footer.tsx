'use client';

import Image from 'next/image';
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
 * 위에는 왼쪽 문의 문구(페이지마다 src/data/cta.ts) + 오른쪽 연락 창구 목록(문의 양식 · 전화 · 메일 · 카카오톡),
 * 아래에는 로고 + 바로가기 한 줄, 그 밑에 사업자 정보 · 저작권 작은 글씨.
 * 그 사이로 어두운 행성이 떠오르고 가장자리에서 로고 파랑 빛이 번진다.
 * 세종호이스트크레인 사이트 푸터(문구 + 큰 원 버튼 하나, 구분선 아래 회사 정보 · 연락처 좌우 두 칸)와 짜임을 다르게 둔다.
 */
export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // 작업 관리 도구는 자체 셸을 쓴다
  if (isToolScreen(pathname)) return null;

  // 문의 페이지에서는 문의 칸을 다시 띄우지 않는다
  const isContact = /^\/contact\/?$/.test(pathname);
  const cta = ctaFor(pathname);
  const channels = [
    { label: '문의 양식', value: cta.button.join(' '), href: cta.href, primary: true },
    { label: '전화', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}` },
    { label: '메일', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { label: '카카오톡', value: '오픈채팅', href: KAKAO_OPEN_CHAT_URL, external: true },
  ];
  // 모바일은 이름 | 값 | 화살표 한 줄, lg 부터는 이름 · 화살표 위 + 값 아래인 세로 칸
  const cellCls =
    'group grid h-full grid-cols-[4.5em_minmax(0,1fr)_auto] items-center gap-4 border-t py-5 transition-colors duration-200 ' +
    'sm:grid-cols-[6em_minmax(0,1fr)_auto] sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-4 lg:gap-y-10 lg:pb-0 lg:pt-6';

  return (
    <footer data-header="dark" className="relative isolate overflow-hidden bg-night text-white">
      <div aria-hidden className="stars" />

      {!isContact && (
        <div className={`${container} relative pt-24 sm:pt-32 xl:pt-[200px]`}>
          <motion.div {...inView} variants={stagger}>
            <motion.p variants={fadeUp} className="eyebrow on-night mb-3">Contact</motion.p>
            <motion.h2 variants={fadeUp} className="type-h1 font-bold text-white">
              {cta.line1}<br />{cta.line2}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-6 max-w-[30em] text-[16px] leading-[1.6] text-gray-200 sm:text-[18px]">
              {cta.desc}
            </motion.p>
          </motion.div>

          {/* 연락 창구 - 모바일은 목록, lg 부터 가로 네 칸. 첫 칸(문의 양식)만 로고 파랑 선 · 원 */}
          <motion.ul {...inView} variants={stagger}
            className="mt-12 grid border-b border-white/15 sm:mt-16 lg:grid-cols-4 lg:gap-x-8 lg:border-b-0">
            {channels.map((c) => {
              const cls = `${cellCls} ${c.primary ? 'border-point-light' : 'border-white/15 hover:border-white/60'}`;
              const body = (
                <>
                  <span className="text-[13px] text-gray-400 sm:text-[14px]">{c.label}</span>
                  <span className="break-words lg:order-last text-[17px] font-bold text-white sm:text-[20px] lg:col-span-2">
                    {c.value}
                  </span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-pill text-white transition-colors duration-200 sm:h-12 sm:w-12 ${
                    c.primary ? 'bg-point-200 group-hover:bg-point-300' : 'border border-white/25 group-hover:border-point-200 group-hover:bg-point-200'}`}>
                    <FiArrowUpRight size={20} className={arrowHover} />
                  </span>
                </>
              );
              return (
                <motion.li key={c.label} variants={fadeUp}>
                  {c.href.startsWith('/') ? (
                    <Link href={c.href} className={cls}>{body}</Link>
                  ) : (
                    <a href={c.href} className={cls}
                      {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                      {body}
                    </a>
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
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

          {/* 로고 + 바로가기 한 줄 */}
          <div className="mt-10 flex flex-col gap-6 sm:mt-12 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" aria-label="MATE 홈" className="w-fit transition-opacity hover:opacity-75">
              <Image src="/images/logo.png" alt="MATE" width={1991} height={493} className="h-6 w-auto brightness-0 invert lg:h-7" />
            </Link>
            <nav aria-label="바로가기">
              <ul className="flex flex-wrap gap-x-8 gap-y-3 text-[15px] font-bold text-gray-200 sm:gap-x-10">
                {navItems.map((n) => (
                  <li key={n.href}><Link href={n.href} className="transition-colors hover:text-white">{n.label}</Link></li>
                ))}
              </ul>
            </nav>
          </div>

          {/* 사업자 정보 · 저작권 - 작은 글씨 한 덩어리 */}
          {/* 오른쪽 아래는 떠 있는 문의 · 맨 위로 버튼 자리라 비워 둔다 */}
          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] leading-[1.7] text-gray-400">
            <p>
              {business.name} ({business.brand}) · 대표 {business.owner} · 사업자등록번호 {business.regNo}<br />
              {business.address}
            </p>
            <p>© {year} {business.brand}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
