'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { container } from '@/lib/styles';

/** 넓은 화면의 상단 메뉴. 좁은 화면에서는 아래 탭(BottomNav)이 대신한다. */
const navItems = [
  { href: '/services',  label: '서비스' },
  { href: '/web',       label: '웹 · 앱' },
  { href: '/game',      label: '게임 · XR' },
  { href: '/education', label: '교육' },
  { href: '/projects',  label: '프로젝트' },
  { href: '/team',      label: '팀' },
  { href: '/contact',   label: '문의' },
];

/** 현재 경로가 이 메뉴에 속하는지. 정적 내보내기는 경로 끝에 '/' 를 붙인다. */
export const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

/**
 * 상단 바.
 *
 * 늘 보인다. 맨 위에서는 바탕과 같은 면이고, 내려가면 뒤가 비치는 흐린 면이 되어
 * 지나온 화면과 이어져 보인다. 그림자는 쓰지 않는다.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 작업 관리 도구는 자체 셸을 쓴다 - 마케팅 헤더가 끼어들지 않게 한다
  if (pathname.startsWith('/taskmanager')) return null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300 ease-calm ${
        scrolled ? 'border-[var(--border)] bg-canvas/80 backdrop-blur-xl' : 'border-transparent bg-canvas'
      }`}>
      <nav aria-label="주 메뉴" className={`${container} flex h-16 items-center justify-between gap-4`}>

        <Link href="/" aria-label="MATE 홈" className="inline-flex items-center transition-opacity duration-150 hover:opacity-70">
          <Image src="/images/logo.png" alt="MATE" width={88} height={28} className="logo-auto h-7 w-auto" priority />
        </Link>

        <div className="flex items-center gap-1">
          {/* 메뉴 - 글자만 쓴다. 지금 있는 곳은 색만이 아니라 굵기와 밑줄로도 알린다. */}
          <ul className="hidden items-center gap-2 expanded:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? 'page' : undefined}
                    className={`relative inline-flex h-10 items-center px-2.5 text-btn transition-colors duration-150 ${
                      active ? 'font-bold text-[var(--text-1)]' : 'font-normal text-[var(--text-2)] hover:text-[var(--text-1)]'
                    }`}>
                    {item.label}
                    {active && <span aria-hidden className="absolute inset-x-2.5 bottom-1 h-[2px] rounded-full bg-[var(--accent)]" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle className="expanded:ml-2" />
        </div>
      </nav>
    </header>
  );
}
