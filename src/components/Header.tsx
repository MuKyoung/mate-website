'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { href: '/',         label: '홈' },
  { href: '/services', label: '서비스' },
  { href: '/team',     label: '팀' },
  { href: '/projects', label: '프로젝트' },
  { href: '/contact',  label: '문의' },
];

export default function Header() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  const solid = isScrolled || isMobileMenuOpen;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: solid ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: solid ? 'blur(12px)' : 'none',
        borderBottom: solid ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.png"
            alt="MATE"
            width={88}
            height={28}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* 데스크톱 네비 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-150 ${
                  active
                    ? 'text-[#191f28]'
                    : 'text-[#6b7684] hover:text-[#191f28]'
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full bg-[#3182f6]"
                    initial={false}
                    transition={{ duration: 0.2, ease: [0.2, 0.6, 0.25, 1] }}
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="ml-4 px-5 h-10 inline-flex items-center rounded-[10px] text-sm font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors duration-300"
          >
            상담 신청
          </Link>
        </div>

        {/* 모바일 버튼 */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center transition-colors rounded-lg text-[#4e5968] hover:text-[#191f28] hover:bg-black/[0.04]"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="메뉴"
        >
          <AnimatePresence mode="wait">
            {isMobileMenuOpen ? (
              <motion.div key="x"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <FiX size={20} />
              </motion.div>
            ) : (
              <motion.div key="m"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <FiMenu size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden overflow-hidden border-t"
            style={{ background: 'rgba(255,255,255,0.97)', borderColor: 'var(--border)' }}
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-[10px] text-sm font-semibold transition-colors ${
                      pathname === item.href
                        ? 'text-[#191f28] bg-[#f4f6f8]'
                        : 'text-[#4e5968] hover:text-[#191f28] hover:bg-black/[0.03]'
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3182f6]" />
                    )}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navItems.length * 0.04 }}
                className="pt-2 pb-1"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-[10px] text-sm font-bold text-white bg-[#191f28] hover:bg-[#3182f6] transition-colors"
                >
                  무료 상담 신청
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
