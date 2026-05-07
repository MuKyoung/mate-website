'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiTwitter, FiArrowUpRight } from 'react-icons/fi';

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as number[] },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { href: '/', label: '홈' },
      { href: '/services', label: '서비스' },
      { href: '/team', label: '팀' },
      { href: '/projects', label: '프로젝트' },
      { href: '/contact', label: '문의' },
    ],
    services: [
      '유니티 외주 개발',
      '개발 강의',
      'AR/VR 개발',
      '게임 서버 개발',
    ],
  };

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: FiMail, href: 'mailto:team-mate@naver.com', label: 'Email' },
  ];

  return (
    <footer className="relative bg-[#080812] border-t border-white/[0.05] overflow-hidden">
      {/* 상단 그라디언트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />

      {/* 배경 오브 */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* 메인 그리드 */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16"
        >
          {/* 브랜드 */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-5 group">
              <span className="text-3xl font-bold gradient-text glitch-hover">MATE</span>
            </Link>
            <p className="text-sm text-white/35 leading-relaxed mb-6">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다.
            </p>
            {/* 소셜 링크 */}
            <div className="flex gap-2.5">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300"
                  style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={15} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white/70 font-medium mb-5 text-xs uppercase tracking-[0.18em]">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-white/35 hover:text-white transition-colors text-sm hover-underline"
                  >
                    {link.label}
                    <FiArrowUpRight
                      size={11}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={fadeUp}>
            <h4 className="text-white/70 font-medium mb-5 text-xs uppercase tracking-[0.18em]">
              Services
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((service) => (
                <li key={service} className="text-white/35 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <h4 className="text-white/70 font-medium mb-5 text-xs uppercase tracking-[0.18em]">
              Contact
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Email</p>
                <a
                  href="mailto:team-mate@naver.com"
                  className="text-white/50 hover:text-white transition-colors text-sm break-all hover-underline"
                >
                  team-mate@naver.com
                </a>
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1">Phone</p>
                <a
                  href="tel:010-5457-9141"
                  className="text-white/50 hover:text-white transition-colors text-sm hover-underline"
                >
                  010-5457-9141
                </a>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 text-xs font-medium text-white btn-clip-sm bg-gradient-to-r from-purple-600/70 to-pink-600/70 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                프로젝트 문의
                <FiArrowUpRight size={12} />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* 하단 바 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-7 border-t border-white/[0.05]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/20">
              © {currentYear} Mate. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <span className="text-[10px] text-white/15 font-mono tracking-wider">v0.1.0</span>
              <span className="text-[10px] text-white/20">Made with 💜 in Korea</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
