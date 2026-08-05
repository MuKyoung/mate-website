'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiArrowUpRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

export default function Footer() {
  const year = new Date().getFullYear();

  const nav = [
    { href: '/',         label: '홈' },
    { href: '/services', label: '서비스' },
    { href: '/team',     label: '팀' },
    { href: '/projects', label: '프로젝트' },
    { href: '/contact',  label: '문의' },
  ];

  const svcs = ['유니티 외주 개발', '개발 강의', 'AR/VR 개발', '게임 서버 개발'];

  // 실제로 연결되는 채널만 노출한다 (미개설 SNS 링크는 두지 않음)
  const social = [
    { icon: RiKakaoTalkFill, href: KAKAO_OPEN_CHAT_URL,          label: '카카오톡 오픈채팅' },
    { icon: FiMail,          href: `mailto:${CONTACT_EMAIL}`,    label: '이메일' },
    { icon: FiPhone,         href: `tel:${CONTACT_PHONE}`,       label: '전화' },
  ];

  return (
    <footer className="relative border-t border-white/10">
      <div className={`${container} py-16 sm:py-24`}>

        {/* 대형 CTA 스테이트먼트 */}
        <motion.div
          initial={{ opacity: 0, y: 64, rotate: 1.2, transformOrigin: '0% 100%' }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-16 mb-16 border-b border-white/10"
        >
          <div>
            <p className="index-num mb-6">Let&apos;s work together</p>
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.04em] hover:text-[#3182f6] transition-colors break-all"
              style={{ fontSize: 'clamp(1.75rem, 4.5vw, 4rem)' }}>
              {CONTACT_EMAIL}
            </a>
          </div>
          <Link href="/contact"
            className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[14px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300 flex-shrink-0">
            프로젝트 문의
            <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-75 transition-opacity">
              <Image src="/images/logo.png" alt="MATE" width={80} height={26} className="h-6 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-white/45 leading-relaxed mb-5">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀.
            </p>
            <div className="flex gap-1">
              {social.map((s) => {
                const external = s.href.startsWith('http');
                return (
                  <a key={s.label} href={s.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={s.label} title={s.label}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                    <s.icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 네비게이션 */}
          <div>
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Navigation</h4>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/55 hover:text-white transition-colors">
                    {l.label}
                    <FiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Services</h4>
            <ul className="space-y-2.5">
              {svcs.map((s) => (
                <li key={s} className="text-sm text-white/45">{s}</li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Contact</h4>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Email</p>
                <a href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-white/55 hover:text-white transition-colors break-all">
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Phone</p>
                <a href={`tel:${CONTACT_PHONE}`}
                  className="text-sm text-white/55 hover:text-white transition-colors">
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="pt-8 border-t border-white/10">
          <dl className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
            <div className="flex items-center gap-2">
              <dt className="text-[11px] font-semibold text-white/30">상호</dt>
              <dd className="text-[12px] text-white/55">MATE 외주개발팀</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-[11px] font-semibold text-white/30">이메일</dt>
              <dd className="text-[12px] text-white/55">{CONTACT_EMAIL}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="text-[11px] font-semibold text-white/30">대표번호</dt>
              <dd className="text-[12px] text-white/55">{CONTACT_PHONE}</dd>
            </div>
          </dl>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-white/30">© {year} MATE. All rights reserved.</p>
            <span className="text-[10px] text-white/30">Made in Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
