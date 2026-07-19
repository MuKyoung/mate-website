'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiTwitter, FiArrowUpRight } from 'react-icons/fi';

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

  const social = [
    { icon: FiGithub,   href: 'https://github.com',   label: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiTwitter,  href: 'https://twitter.com',  label: 'Twitter' },
    { icon: FiMail,     href: 'mailto:hsib1212@naver.com', label: 'Email' },
  ];

  return (
    <footer className="relative bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">

        {/* 대형 CTA 스테이트먼트 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-16 mb-16 border-b border-white/10"
        >
          <div>
            <p className="eyebrow text-[#5b9bff] mb-5">Let&apos;s work together</p>
            <a href="mailto:hsib1212@naver.com"
              className="display-section text-white hover:text-[#5b9bff] transition-colors break-all">
              hsib1212@naver.com
            </a>
          </div>
          <Link href="/contact"
            className="group inline-flex items-center gap-2 h-14 px-8 rounded-full font-semibold text-[#0a0a0a] bg-white hover:bg-[#5b9bff] hover:text-white transition-colors flex-shrink-0">
            프로젝트 문의
            <FiArrowUpRight size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-75 transition-opacity">
              <Image src="/images/logo.png" alt="MATE" width={80} height={26}
                className="h-6 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm on-dark-3 leading-relaxed mb-5">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀.
            </p>
            <div className="flex gap-2">
              {social.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 border border-white/15 transition-colors duration-150">
                  <s.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* 네비게이션 */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 tracking-[0.15em] uppercase mb-5">Navigation</h4>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
                    {l.label}
                    <FiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="text-xs font-semibold text-white/40 tracking-[0.15em] uppercase mb-5">Services</h4>
            <ul className="space-y-2.5">
              {svcs.map((s) => (
                <li key={s} className="text-sm on-dark-3">{s}</li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-semibold text-white/40 tracking-[0.15em] uppercase mb-5">Contact</h4>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Email</p>
                <a href="mailto:hsib1212@naver.com"
                  className="text-sm text-white/60 hover:text-white transition-colors break-all">
                  hsib1212@naver.com
                </a>
              </div>
              <div>
                <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">Phone</p>
                <a href="tel:0507-1339-9141"
                  className="text-sm text-white/60 hover:text-white transition-colors">
                  0507-1339-9141
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10">
          <p className="text-xs text-white/35">© {year} Mate. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-white/25 font-mono">v0.1.0</span>
            <span className="text-[10px] text-white/35">Made in Korea</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
