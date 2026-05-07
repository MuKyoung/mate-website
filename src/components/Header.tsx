'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { href: '/', label: '홈' },
  { href: '/services', label: '서비스' },
  { href: '/team', label: '팀' },
  { href: '/projects', label: '프로젝트' },
  { href: '/contact', label: '문의' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-[#0a0a1a]/90 backdrop-blur-xl border-b border-white/[0.06]'
          : 'bg-transparent'
      }`}
    >
      {/* 상단 얇은 그라디언트 라인 */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">

          {/* 로고 */}
          <Link href="/" className="relative group glitch-hover">
            <span className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">
              MATE
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-350 ease-[cubic-bezier(0.23,1,0.32,1)]" />
          </Link>

          {/* 데스크톱 네비 */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 group"
                >
                  <span
                    className={`relative z-10 text-sm font-medium transition-colors duration-200 ${
                      isActive ? 'text-white' : 'text-white/50 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* 활성 인디케이터 — 언더라인 스타일 */}
                  {isActive && (
                    <motion.span
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}

                  {/* 호버 배경 — 미묘한 fill */}
                  <span className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-white/[0.04] transition-opacity duration-200" />
                </Link>
              );
            })}

            {/* CTA 버튼 */}
            <Link
              href="/contact"
              className="ml-4 px-5 py-2 text-sm font-semibold text-white btn-clip-sm bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              상담 신청
            </Link>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴 토글"
          >
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <FiX size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <FiMenu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* 모바일 네비 */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, clipPath: 'inset(0 0 100% 0)' }}
              animate={{ opacity: 1, height: 'auto', clipPath: 'inset(0 0 0% 0)' }}
              exit={{ opacity: 0, height: 0, clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1 py-4 border-t border-white/[0.07]">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center justify-between px-4 py-3 transition-all duration-200 ${
                        pathname === item.href
                          ? 'text-white border-l-2 border-purple-500 bg-white/[0.04] pl-3'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent'
                      }`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {pathname === item.href && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {/* 모바일 CTA */}
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  className="mt-3 px-4"
                >
                  <Link
                    href="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-3 font-semibold text-white btn-clip bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    무료 상담 신청
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
