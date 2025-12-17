'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMail, FiTwitter, FiArrowUpRight } from 'react-icons/fi';

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
    <footer className="relative bg-[#0a0a1a] border-t border-white/5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 sm:mb-6">
              <span className="text-3xl sm:text-4xl font-bold gradient-text">MATE</span>
            </Link>
            <p className="text-sm sm:text-base text-white/50 leading-relaxed mb-6">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4 sm:mb-6 text-sm uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    {link.label}
                    <FiArrowUpRight 
                      size={12} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 sm:mb-6 text-sm uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((service) => (
                <li key={service} className="text-white/50 text-sm sm:text-base">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-white font-semibold mb-4 sm:mb-6 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Email</p>
                <a 
                  href="mailto:team-mate@naver.com"
                  className="text-white/70 hover:text-white transition-colors text-sm sm:text-base break-all"
                >
                  team-mate@naver.com
                </a>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Phone</p>
                <a 
                  href="tel:010-5457-9141"
                  className="text-white/70 hover:text-white transition-colors text-sm sm:text-base"
                >
                  010-5457-9141
                </a>
              </div>
              
              {/* CTA Button */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                프로젝트 문의
                <FiArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-white/30">
              © {currentYear} Mate. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-white/20 font-mono">v0.1.0</span>
              <span className="text-xs text-white/30">Made with 💜 in Korea</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
