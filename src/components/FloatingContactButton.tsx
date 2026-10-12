'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMessageCircle } from 'react-icons/fi';

/**
 * 떠 있는 문의 버튼 - 넓은 화면 전용.
 *
 * 좁은 화면에서는 아래 탭의 '문의'가 같은 자리를 맡으므로 띄우지 않는다.
 * 그림자 대신 색으로 띄운다. 파란 단색 면이라 어느 바탕에서도 구분된다.
 */
export default function FloatingContactButton() {
  const pathname = usePathname();

  if (pathname === '/contact' || pathname === '/contact/') return null;
  if (pathname.startsWith('/taskmanager') || pathname.startsWith('/company-profile')) return null;

  return (
    <Link href="/contact"
      className="fixed bottom-8 right-6 z-50 hidden h-14 items-center gap-2 rounded-pill bg-[var(--brand-fill)] px-6
                 text-btn font-medium text-gray-50 transition-[background-color,transform] duration-150 ease-calm
                 hover:bg-[var(--brand-fill-hover)] active:scale-[0.97] expanded:inline-flex">
      <FiMessageCircle size={18} />
      문의하기
    </Link>
  );
}
