'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { href: '/services',  label: '서비스' },
  { href: '/web',       label: '웹 · 앱' },
  { href: '/game',      label: '게임 · XR' },
  { href: '/education', label: '교육' },
  { href: '/projects',  label: '프로젝트' },
  { href: '/team',      label: '팀' },
];

/** 히어로가 밝은 라우트 — 헤더를 라이트 변형으로 뒤집는다 (Figma DS header light) */
const LIGHT_ROUTES = ['/education'];

export default function Header() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isHidden, setHidden]               = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 16);
      // 아래로 내리면 헤더를 감추고, 위로 올리면 즉시 되돌린다 (콘텐츠에 화면을 양보)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // 작업 관리 도구는 자체 셸을 쓴다 — 마케팅 헤더가 끼어들지 않게 한다
  if (pathname.startsWith('/taskmanager')) return null;

  const solid = isScrolled || isMobileMenuOpen;
  const hidden = isHidden && !isMobileMenuOpen;
  const light = LIGHT_ROUTES.some((r) => pathname.startsWith(r));

  // 라이트 라우트에서는 표면·텍스트·로고를 모두 뒤집는다
  const surface = light ? 'rgba(255, 255, 255, 0.82)' : 'rgba(14, 17, 23, 0.72)';
  const hairline = light ? '1px solid rgba(14,17,23,0.10)' : '1px solid rgba(255,255,255,0.10)';
  const txtIdle = light ? 'text-[rgba(14,17,23,0.55)] hover:text-[var(--gray-600)]' : 'text-white/55 hover:text-white';
  const txtActive = light ? 'text-[var(--gray-600)]' : 'text-white';
  const barColor = light ? 'bg-[var(--gray-600)]' : 'bg-white';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-[transform,background,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        background: solid ? surface : 'transparent',
        backdropFilter: solid ? 'blur(14px)' : 'none',
        borderBottom: solid ? hairline : '1px solid transparent',
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* 로고 — 다크 위 화이트 */}
        <Link href="/" className="inline-flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.png"
            alt="MATE"
            width={88}
            height={28}
            className={`h-7 w-auto ${light ? 'brightness-0' : 'brightness-0 invert'}`}
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
                className={`relative px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                  active ? txtActive : txtIdle
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full ${barColor}`}
                    initial={false}
                    transition={{ duration: 0.2, ease: [0.2, 0.6, 0.25, 1] }}
                  />
                )}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className={`ml-4 px-6 h-10 inline-flex items-center rounded-full text-sm font-bold transition-colors duration-300 hover:bg-[var(--accent)] hover:text-white ${
              light ? 'text-white bg-[var(--gray-600)]' : 'text-[var(--canvas)] bg-white'
            }`}
          >
            상담 신청
          </Link>
        </div>

        {/* 모바일 버튼 */}
        <button
          className={`md:hidden w-9 h-9 flex items-center justify-center transition-colors rounded-lg ${
            light ? 'text-[rgba(14,17,23,0.7)] hover:bg-black/5' : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
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
            id="mobile-nav"
            className="md:hidden overflow-hidden"
            style={{
              background: light ? 'rgba(255,255,255,0.97)' : 'rgba(14,17,23,0.95)',
              backdropFilter: 'blur(14px)',
              borderTop: hairline,
            }}
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
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      pathname === item.href
                        ? (light ? 'text-[var(--gray-600)] bg-black/[0.05]' : 'text-white bg-white/[0.07]')
                        : (light ? 'text-[rgba(14,17,23,0.55)] hover:bg-black/[0.03]' : 'text-white/55 hover:text-white hover:bg-white/[0.04]')
                    }`}
                  >
                    {item.label}
                    {pathname === item.href && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--point)]" />
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
                  className={`block text-center px-4 py-3 rounded-full text-sm font-bold transition-colors hover:bg-[var(--accent)] hover:text-white ${
                    light ? 'text-white bg-[var(--gray-600)]' : 'text-[var(--canvas)] bg-white'
                  }`}
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
