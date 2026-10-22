'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiPhone, FiMail, FiChevronDown, FiArrowUpRight } from 'react-icons/fi';
import { navItems, type NavItem } from '@/data/navigation';
import { CONTACT_EMAIL, CONTACT_PHONE, btnPoint, container } from '@/lib/styles';
import { isToolScreen } from '@/lib/shell';

/** '/web/' 처럼 끝에 붙는 빗금을 떼고 해시를 버린다 */
const norm = (p: string) => (p.split('#')[0].replace(/\/$/, '') || '/');

/**
 * 상단 바 - 로고 · 가운데 메뉴 넷 · 오른쪽 전화와 메일.
 *
 * 밑에 깔린 면을 보고 두 모습 중 하나가 된다 (Figma 헤더 light · dark).
 *   data-header="dark" 면 위  - 투명 바탕, 흰 글자, 흰 로고. 내려오면 남색 유리가 깔린다
 *   그 밖                      - 흰 바탕, 진회색 글자, 파란 로고
 * 메뉴에 마우스를 올리면 아래로 하위 메뉴 칸이 열린다.
 */
export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let last = window.scrollY;
    // 헤더 한가운데 높이에 걸린 면이 어두운지 본다
    const probe = () => {
      const line = 40;
      let dark = false;
      document.querySelectorAll<HTMLElement>('[data-header]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) dark = el.dataset.header === 'dark';
      });
      setOverDark(dark);
    };
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      probe();
      // 아래로 내리면 헤더를 감추고, 위로 올리면 즉시 되돌린다 (콘텐츠에 화면을 양보)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240);
        last = y;
      }
    };
    onScroll();
    // 새 페이지의 면이 그려진 뒤 한 번 더 본다
    const t = window.setTimeout(probe, 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', probe);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', probe);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setExpanded(null);
  }, [pathname]);

  // 모바일 메뉴가 열려 있는 동안 뒤 페이지가 밀리지 않게
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // 작업 관리 도구는 자체 셸을 쓴다 - 마케팅 헤더가 끼어들지 않게 한다
  if (isToolScreen(pathname)) return null;

  const current = norm(pathname);
  const isActive = (item: NavItem) =>
    current === norm(item.href) ||
    current.startsWith(`${norm(item.href)}/`) ||
    Boolean(item.children?.some((c) => norm(c.href) === current));

  const dark = overDark && !open;
  const surface = open
    ? 'bg-white'
    : dark
      ? scrolled ? 'bg-[rgba(7,11,29,0.72)] backdrop-blur-md' : 'bg-transparent'
      : scrolled ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_var(--line)]' : 'bg-transparent';
  const text = dark ? 'text-white' : 'text-gray-600';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${surface}`}
      style={{ transform: hidden && !open ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <nav className={`${container} grid h-[72px] grid-cols-[1fr_auto] items-center lg:h-20 lg:grid-cols-[1fr_auto_1fr]`}>
        <Link href="/" aria-label="MATE 홈" className="inline-flex w-fit items-center transition-opacity hover:opacity-75">
          <Image src="/images/logo.png" alt="MATE" width={1991} height={493} priority
            className={`h-6 w-auto transition-[filter] duration-300 lg:h-7 ${dark ? 'brightness-0 invert' : ''}`} />
        </Link>

        {/* 데스크톱 메뉴 - 큰 갈래 넷, 마우스를 올리면 하위 메뉴 칸 */}
        <ul className="hidden items-center gap-[clamp(2.5rem,5.2vw,6.875rem)] lg:flex">
          {navItems.map((item) => {
            const on = isActive(item);
            return (
              <li key={item.href} className="group relative">
                <Link href={item.href}
                  className={`relative block py-7 text-[16px] font-bold transition-colors duration-200 xl:text-[18px] ${
                    on ? (dark ? 'text-white' : 'text-point-200') : `${text} ${dark ? 'hover:text-white/70' : 'hover:text-point-200'}`
                  }`}>
                  {item.label}
                  {on && dark && <span aria-hidden className="absolute inset-x-0 bottom-5 h-0.5 bg-point-light" />}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 -translate-y-1 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    <ul className="min-w-[152px] rounded-card bg-white py-3.5 shadow-float-lg ring-1 ring-line">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href}
                            className={`block whitespace-nowrap px-6 py-2 text-[15px] transition-colors ${
                              norm(c.href) === current && !c.href.includes('#') ? 'font-bold text-ink' : 'text-gray-400 hover:text-ink'
                            }`}>
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-end gap-1">
          <a href={`tel:${CONTACT_PHONE}`} aria-label={`전화 ${CONTACT_PHONE}`}
            className={`hidden h-10 w-10 items-center justify-center rounded-pill transition-colors lg:flex ${text} ${dark ? 'hover:bg-white/10' : 'hover:text-point-200'}`}>
            <FiPhone size={20} />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`메일 ${CONTACT_EMAIL}`}
            className={`hidden h-10 w-10 items-center justify-center rounded-pill transition-colors lg:flex ${text} ${dark ? 'hover:bg-white/10' : 'hover:text-point-200'}`}>
            <FiMail size={20} />
          </a>

          {/* 모바일 메뉴 버튼 */}
          <button
            className={`-mr-2 flex h-11 w-11 items-center justify-center lg:hidden ${dark ? 'text-white' : 'text-ink'}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* 모바일 메뉴 - 갈래를 누르면 하위 메뉴가 펼쳐진다 */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            // 헤더가 transform 을 쓰므로 fixed 로 띄우면 헤더 상자에 갇힌다 - 헤더 아래로 이어 붙여 화면을 채운다
            className="h-[calc(100svh-72px)] overflow-y-auto overscroll-contain border-t border-line bg-white lg:hidden"
          >
            <ul className={`${container} py-4`}>
              {navItems.map((item) => {
                const isOpen = expanded === item.href;
                return (
                  <li key={item.href} className="border-b border-line">
                    <div className="flex items-center justify-between">
                      <Link href={item.href}
                        className={`flex-1 py-5 text-[20px] font-bold ${isActive(item) ? 'text-point-200' : 'text-ink'}`}>
                        {item.label}
                      </Link>
                      {item.children && (
                        <button type="button" onClick={() => setExpanded(isOpen ? null : item.href)}
                          aria-expanded={isOpen} aria-label={`${item.label} 하위 메뉴`}
                          className="flex h-11 w-11 items-center justify-center text-gray-400">
                          <FiChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {item.children && isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} onClick={() => setOpen(false)}
                                className="block py-2.5 pl-1 text-[16px] text-gray-500">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                          <li className="h-4" aria-hidden />
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
            <div className={`${container} pb-10`}>
              <div className="flex flex-col gap-1 text-[15px] text-gray-500">
                <a href={`tel:${CONTACT_PHONE}`} className="inline-flex items-center gap-2 py-1"><FiPhone size={16} />{CONTACT_PHONE}</a>
                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 py-1"><FiMail size={16} />{CONTACT_EMAIL}</a>
              </div>
              <Link href="/contact" onClick={() => setOpen(false)} className={`${btnPoint} mt-6 w-full`}>
                프로젝트 문의하기
                <FiArrowUpRight size={16} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
