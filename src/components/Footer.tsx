'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import HorizonGlow from '@/components/visual/HorizonGlow';
import { business } from '@/data/business';
import { ctaFor } from '@/data/cta';
import { navItems } from '@/data/navigation';
import { easeEnter, fadeUp, stagger, staggerRows, rowIn, inView } from '@/lib/motion';
import { arrowTileDark, container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';
import { isToolScreen } from '@/lib/shell';

/**
 * 모든 페이지의 마지막 화면.
 * 위 - 문의 문장(페이지마다 src/data/cta.ts)과 연락 창구 네 줄.
 * 가운데 - 사업자 정보와 메뉴.
 * 아래 - 로고 뒤로 파란 수평선이 떠오르며 페이지를 닫는다.
 */
export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // 작업 관리 도구는 자체 셸을 쓴다
  if (isToolScreen(pathname)) return null;

  // 문의 페이지에서는 문의 칸을 다시 띄우지 않는다
  const isContact = /^\/contact\/?$/.test(pathname);
  const cta = ctaFor(pathname);

  // 실제로 연결되는 창구만 적는다 (미개설 SNS 링크는 두지 않음)
  const channels = [
    { href: cta.href, label: cta.button.join(' '), sub: '양식으로 보내기 · 기획이 정리되지 않았어도 괜찮습니다' },
    { href: KAKAO_OPEN_CHAT_URL, label: '카카오톡 오픈채팅', sub: '1:1 오픈채팅 · 가장 빠른 창구입니다', external: true },
    { href: `mailto:${CONTACT_EMAIL}`, label: '메일', sub: CONTACT_EMAIL },
    { href: `tel:${CONTACT_PHONE}`, label: '전화', sub: CONTACT_PHONE },
  ];

  const linkCls = 'transition-colors hover:text-white';

  return (
    <footer data-header="dark" className="on-night relative isolate overflow-hidden bg-night text-white">
      {!isContact && (
        <div className={`${container} grid gap-14 pt-24 sm:pt-32 lg:grid-cols-12 lg:gap-8 xl:pt-40`}>
          <motion.div {...inView} variants={stagger} className="lg:col-span-6">
            <motion.p variants={fadeUp} className="eyebrow mb-6">Contact:</motion.p>
            <motion.h2 variants={fadeUp} className="font-medium leading-[1.12] tracking-[-0.02em] text-white"
              style={{ fontSize: 'clamp(2.25rem, 1.2rem + 3vw, 4.25rem)' }}>
              {cta.line1}<br />
              <span className="text-point-light">{cta.line2}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-7 max-w-[30em] text-[16px] leading-[1.7] text-gray-300 sm:text-[17px]">
              {cta.desc}
            </motion.p>
          </motion.div>

          <motion.ul {...inView} variants={staggerRows} className="border-t border-white/15 lg:col-span-5 lg:col-start-8 lg:self-end">
            {channels.map((c) => (
              <motion.li key={c.label} variants={rowIn}>
                {c.href.startsWith('/') ? (
                  <Link href={c.href} className="group flex items-center justify-between gap-6 border-b border-white/15 py-5 sm:py-6">
                    <ChannelText label={c.label} sub={c.sub} />
                    <span aria-hidden className={arrowTileDark}><FiArrowUpRight size={18} /></span>
                  </Link>
                ) : (
                  <a href={c.href} className="group flex items-center justify-between gap-6 border-b border-white/15 py-5 sm:py-6"
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <ChannelText label={c.label} sub={c.sub} />
                    <span aria-hidden className={arrowTileDark}><FiArrowUpRight size={18} /></span>
                  </a>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      {/* 사업자 정보와 메뉴 */}
      <div className={`${container} ${isContact ? 'pt-20 sm:pt-24' : 'mt-24 sm:mt-32'}`}>
        <div className="grid gap-10 border-t border-white/[0.12] pt-10 text-[14px] text-gray-300 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-6">
            <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-white/45">Business:</p>
            <p className="mt-4 text-[16px] font-semibold text-white">{business.name} ({business.brand})</p>
            <p className="mt-2 leading-[1.7]">
              {business.address}<br />
              대표 {business.owner} · 사업자등록번호 {business.regNo}
            </p>
          </div>
          <div className="lg:col-span-3">
            <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-white/45">Pages:</p>
            <ul className="mt-4 space-y-2">
              {navItems.map((n) => (
                <li key={n.href}><Link href={n.href} className={linkCls}>{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3 lg:text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.06em] text-white/45">Direct:</p>
            <ul className="mt-4 space-y-2">
              <li><a href={`tel:${CONTACT_PHONE}`} className={linkCls}>{CONTACT_PHONE}</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className={`${linkCls} break-all`}>{CONTACT_EMAIL}</a></li>
              <li>
                <a href={KAKAO_OPEN_CHAT_URL} target="_blank" rel="noopener noreferrer" className={linkCls}>카카오톡 오픈채팅</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 마무리 - 로고 뒤로 수평선이 떠오른다 */}
      <div className="relative mt-16 h-[52vw] max-h-[520px] min-h-[280px] sm:mt-24">
        <HorizonGlow side="bottom" rim="62%" radius="max(92vw, 720px)" />
        <div className="relative flex h-full flex-col items-center pt-[9%] sm:pt-[6%]">
          <motion.div initial={{ opacity: 0, y: 48 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 1.4, ease: easeEnter }}>
            <Image src="/images/logo.png" alt="MATE" width={1991} height={493}
              className="h-auto w-[min(52vw,420px)] brightness-0 invert" />
          </motion.div>
        </div>
        <p className="absolute inset-x-0 bottom-5 text-center font-mono text-[11px] tracking-[0.04em] text-[rgba(7,11,29,0.65)]">
          © {year} {business.brand}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function ChannelText({ label, sub }: { label: string; sub: string }) {
  return (
    <span className="min-w-0">
      <span className="block text-[19px] font-medium tracking-[-0.01em] text-white sm:text-[21px]">{label}</span>
      <span className="mt-1.5 block truncate font-mono text-[12px] text-white/50">{sub}</span>
    </span>
  );
}
