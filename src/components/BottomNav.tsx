'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActivePath } from '@/components/Header';

/**
 * 아래 탭 - 좁은 화면의 주 메뉴.
 *
 * 한 손으로 쥐었을 때 엄지가 닿는 곳에 둔다. 탭은 글자만 쓰고 다섯 개를 넘기지 않는다.
 * 옆으로 밀어 넘기는 동작은 붙이지 않는다. 웹 · 앱, 게임 · XR, 교육은 '서비스' 안에 있다.
 *
 * 홈(풀페이지)에서는 지금 밑에 놓인 화면의 색을 입는다 (fp-foot - globals.css).
 */
const tabs = [
  { href: '/services', label: '서비스', also: ['/web', '/game', '/education'] },
  { href: '/projects', label: '프로젝트', also: [] as string[] },
  { href: '/team',     label: '팀', also: [] as string[] },
  { href: '/contact',  label: '문의', also: [] as string[] },
];

export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith('/taskmanager') || pathname.startsWith('/company-profile')) return null;

  return (
    <nav aria-label="주 메뉴"
      className={`pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-canvas/90 backdrop-blur-xl
                  transition-colors duration-300 ease-calm expanded:hidden ${pathname === '/' ? 'fp-foot' : ''}`}>
      <ul className="mx-auto flex h-14 max-w-[600px] items-stretch gap-2 px-6">
        {tabs.map((t) => {
          const active = [t.href, ...t.also].some((h) => isActivePath(pathname, h));
          return (
            <li key={t.href} className="flex-1">
              <Link href={t.href} aria-current={active ? 'page' : undefined}
                className={`relative flex h-full items-center justify-center text-btn transition-colors duration-150 ${
                  active ? 'font-bold text-[var(--text-1)]' : 'font-normal text-[var(--text-3)]'
                }`}>
                {t.label}
                {/* 고른 탭은 색만이 아니라 굵기와 밑줄로도 알린다 */}
                {active && <span aria-hidden className="absolute bottom-2 h-[2px] w-5 rounded-full bg-[var(--accent)]" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
