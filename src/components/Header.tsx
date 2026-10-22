'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiPhone, FiMail, FiChevronDown, FiArrowUpRight } from 'react-icons/fi';
import { navItems, type NavItem } from '@/data/navigation';
import { CONTACT_EMAIL, CONTACT_PHONE, arrowHover, btnPoint, container } from '@/lib/styles';
import { isToolScreen } from '@/lib/shell';

/** '/web/' 처럼 끝에 붙는 빗금을 떼고 해시를 버린다 */
const norm = (p: string) => (p.split('#')[0].replace(/\/$/, '') || '/');

/**
 * 상단 바 - 왼쪽 로고, 오른쪽에 메뉴 넷과 문의 버튼을 모아 둔다.
 * 지금 있는 갈래는 메뉴 앞에 파란 네모 점으로 찍는다.
 *
 * 밑에 깔린 면을 보고 두 모습 중 하나가 된다.
 *   data-header="dark" 면 위  - 투명 바탕, 흰 글자, 흰 로고. 내려오면 남색 유리가 깔린다
 *   그 밖                      - 흰 바탕, 남색 글자, 파란 로고
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${surface}`}
      style={{ transform: hidden && !open ? 'translateY(-100%)' : 'translateY(0)' }}
    >
      <nav className={`${container} flex h-[72px] items-center justify-between lg:h-20`}>
        <Link href="/" aria-label="MATE 홈" className="inline-flex items-center transition-opacity hover:opacity-75">
          <Image src="/images/logo.png" alt="MATE" width={1991} height={493} priority
            className={`h-6 w-auto transition-[filter] duration-300 lg:h-[26px] ${dark ? 'brightness-0 invert' : ''}`} />
        </Link>

        {/* 데스크톱 - 메뉴 넷과 문의 버튼을 오른쪽에 모은다 */}
        <div className="hidden items-center lg:flex">
          <ul className="flex items-center">
            {navItems.map((item) => {
              const on = isActive(item);
              return (
                <li key={item.href} className="group relative">
                  <Link href={item.href}
                    className={`flex items-center gap-2 px-4 py-7 text-[15px] font-medium transition-colors duration-200 xl:px-5 ${
                      dark
                        ? on ? 'text-white' : 'text-white/75 hover:text-white'
                        : on ? 'text-ink' : 'text-[rgba(22,29,60,0.68)] hover:text-ink'
                    }`}>
                    {on && (
                      <motion.span layoutId="nav-active" aria-hidden
                        className={`h-[5px] w-[5px] ${dark ? 'bg-point-light' : 'bg-point-200'}`}
                        initial={false} transition={{ duration: 0.2, ease: [0.2, 0.6, 0.25, 1] }} />
                    )}
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="invisible absolute left-2 top-full -translate-y-1 pt-1 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <ul className="min-w-[180px] overflow-hidden rounded-[10px] bg-white py-2 shadow-float-lg ring-1 ring-line">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href}
                              className={`flex items-center justify-between gap-6 whitespace-nowrap px-5 py-2.5 text-[14px] transition-colors hover:bg-gray-100 ${
                                norm(c.href) === current && !c.href.includes('#') ? 'font-semibold text-point-200' : 'text-ink-2'
                              }`}>
                              {c.label}
                              <FiArrowUpRight size={13} className="text-gray-400" />
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
          <Link href="/contact" className={`${btnPoint} ml-4 h-10 px-4 text-[14px]`}>
            프로젝트 문의
            <FiArrowUpRight size={15} className={arrowHover} />
          </Link>
        </div>

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
              {navItems.map((item, i) => {
                const isOpen = expanded === item.href;
                return (
                  <li key={item.href} className="border-b border-line">
                    <div className="flex items-center justify-between">
                      <Link href={item.href}
                        className={`flex flex-1 items-baseline gap-4 py-5 text-[20px] font-semibold ${isActive(item) ? 'text-point-200' : 'text-ink'}`}>
                        <span className="font-mono text-[11px] font-normal text-gray-400">0{i + 1}</span>
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
                                className="block py-2.5 pl-8 text-[16px] text-ink-3">
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
              <div className="flex flex-col gap-1 text-[15px] text-ink-3">
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
