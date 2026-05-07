'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiTwitter, FiArrowUpRight } from 'react-icons/fi';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } },
};
const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

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
    { icon: FiMail,     href: 'mailto:team-mate@naver.com', label: 'Email' },
  ];

  return (
    <footer className="relative border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">

        <motion.div
          variants={stagger} initial="initial" whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12"
        >
          {/* 브랜드 */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-75 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="MATE"
                width={80}
                height={26}
                className="h-6 w-auto"
                style={{ mixBlendMode: 'screen' }}
              />
            </Link>
            <p className="text-sm text-white/30 leading-relaxed mb-5">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀.
            </p>
            <div className="flex gap-2">
              {social.map((s) => (
                <motion.a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] border border-white/[0.07] transition-all duration-200">
                  <s.icon size={14} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* 네비게이션 */}
          <motion.div variants={fadeUp}>
            <h4 className="text-xs font-medium text-white/30 tracking-[0.15em] uppercase mb-5">Navigation</h4>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/35 hover:text-white/70 transition-colors hover-underline">
                    {l.label}
                    <FiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* 서비스 */}
          <motion.div variants={fadeUp}>
            <h4 className="text-xs font-medium text-white/30 tracking-[0.15em] uppercase mb-5">Services</h4>
            <ul className="space-y-2.5">
              {svcs.map((s) => (
                <li key={s} className="text-sm text-white/30">{s}</li>
              ))}
            </ul>
          </motion.div>

          {/* 연락처 */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-medium text-white/30 tracking-[0.15em] uppercase mb-5">Contact</h4>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-white/18 uppercase tracking-wider mb-0.5">Email</p>
                <a href="mailto:team-mate@naver.com"
                  className="text-sm text-white/35 hover:text-white/65 transition-colors hover-underline break-all">
                  team-mate@naver.com
                </a>
              </div>
              <div>
                <p className="text-[10px] text-white/18 uppercase tracking-wider mb-0.5">Phone</p>
                <a href="tel:010-5457-9141"
                  className="text-sm text-white/35 hover:text-white/65 transition-colors hover-underline">
                  010-5457-9141
                </a>
              </div>
              <Link href="/contact"
                className="inline-flex items-center gap-1.5 mt-1 px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors duration-200">
                프로젝트 문의
                <FiArrowUpRight size={11} />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* 하단 */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs text-white/18">© {year} Mate. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span className="text-[10px] text-white/15 font-mono">v0.1.0</span>
            <span className="text-[10px] text-white/18">Made with 💙 in Korea</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
