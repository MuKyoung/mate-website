'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowUpRight } from 'react-icons/fi';

const navItems = [
  { href: '/services',  label: '서비스' },
  { href: '/web',       label: '웹 · 앱' },
  { href: '/game',      label: '게임 · XR' },
  { href: '/education', label: '교육' },
  { href: '/projects',  label: '프로젝트' },
  { href: '/team',      label: '팀' },
];

export default function Header() {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isHidden, setHidden]               = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [overLight, setOverLight]           = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let last = window.scrollY;
    /* 흰 면(data-header="light")이 헤더 밑을 지나는 동안만 헤더를 밝게 뒤집는다.
       페이지 단위로 정하면 검은 첫 화면 위에 흰 헤더가 뜬다. */
    const checkLight = () => {
      const els = document.querySelectorAll('[data-header="light"]');
      setOverLight(Array.from(els).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= 32 && r.bottom >= 32;
      }));
    };
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 16);
      checkLight();
      // 아래로 내리면 헤더를 감추고, 위로 올리면 즉시 되돌린다 (콘텐츠에 화면을 양보)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 160);
        last = y;
      }
    };
    checkLight();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // 작업 관리 도구는 자체 셸을 쓴다 - 마케팅 헤더가 끼어들지 않게 한다
  if (pathname.startsWith('/taskmanager')) return null;

  const solid = isScrolled || isMobileMenuOpen;
  const hidden = isHidden && !isMobileMenuOpen;
  const light = overLight && !isMobileMenuOpen;
  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

  const surface = light ? 'rgba(255,255,255,0.86)' : 'rgba(0,0,0,0.72)';
  const hairline = light ? '1px solid rgba(0,0,0,0.10)' : '1px solid rgba(255,255,255,0.10)';
  const txtIdle = light ? 'text-black/60 hover:text-black' : 'text-white/75 hover:text-white';
  const txtActive = light ? 'text-black' : 'text-white';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-[transform,background,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        /* 첫 화면의 빛이 화면 위쪽 모서리까지 휘어 올라온다. 맨 위에서도 어두운 유리를 깔아
           로고와 메뉴가 빛에 묻히지 않게 한다 */
        background: solid ? surface : (light ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
        backdropFilter: 'blur(14px)',
        borderBottom: solid ? hairline : '1px solid transparent',
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        <Link href="/" className="inline-flex items-center hover:opacity-75 transition-opacity">
          <Image
            src="/images/logo.png"
            alt="MATE"
            width={88}
            height={22}
            className={`h-[22px] w-auto ${light ? 'brightness-0' : 'brightness-0 invert'}`}
            priority
          />
        </Link>

        {/* 데스크톱 네비 - 지금 있는 곳은 파란 정사각형 점으로 표시 */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-[14px] transition-colors duration-150 ${
                  active ? txtActive : txtIdle
                }`}
              >
                {active && (
                  <motion.span layoutId="nav-active" className="h-[5px] w-[5px] bg-[var(--blue-glow)]"
                    initial={false} transition={{ duration: 0.2, ease: [0.2, 0.6, 0.25, 1] }} />
                )}
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/contact"
            className="group ml-4 inline-flex h-9 items-center gap-2 rounded-[2px] bg-primary-200 px-4 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-[var(--blue-glow)]"
          >
            상담 신청
            <FiArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* 모바일 버튼 - 각진 칸 */}
        <button
          className={`md:hidden w-9 h-9 flex items-center justify-center border transition-colors ${
            light ? 'border-black/15 text-black/70' : 'border-white/20 text-white/80 hover:border-white/50'
          }`}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
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
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(14px)', borderTop: hairline }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col">
              {navItems.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-baseline gap-4 border-b border-white/10 py-3.5 text-[18px] transition-colors ${
                    isActive(item.href) ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[11px] text-white/40 tabular-nums">0{i + 1}</span>
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-5 mb-1 flex h-12 items-center justify-center gap-2 rounded-[2px] bg-primary-200 text-[15px] font-medium text-white"
              >
                무료 상담 신청
                <FiArrowUpRight size={15} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
