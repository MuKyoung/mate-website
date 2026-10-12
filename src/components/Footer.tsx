'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMail, FiPhone, FiArrowUpRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { domains } from '@/data/domains';
import { container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // 작업 관리 도구는 자체 셸을 쓴다
  if (pathname.startsWith('/taskmanager')) return null;

  const nav = [
    { href: '/',         label: '홈' },
    { href: '/services', label: '서비스' },
    { href: '/projects', label: '프로젝트' },
    { href: '/team',     label: '팀' },
    { href: '/contact',  label: '문의' },
  ];

  // 실제로 연결되는 채널만 노출한다 (미개설 SNS 링크는 두지 않음)
  const social = [
    { icon: RiKakaoTalkFill, href: KAKAO_OPEN_CHAT_URL,          label: '카카오톡 오픈채팅' },
    { icon: FiMail,          href: `mailto:${CONTACT_EMAIL}`,    label: '이메일' },
    { icon: FiPhone,         href: `tel:${CONTACT_PHONE}`,       label: '전화' },
  ];

  return (
    <footer className="relative border-t border-white/10">
      <div className={`${container} pt-20 sm:pt-28 pb-16 sm:pb-20`}>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-16">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 hover:opacity-75 transition-opacity">
              <Image src="/images/logo.png" alt="MATE" width={80} height={26} className="h-6 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm text-white/55 leading-relaxed mb-5">
              웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱.
            </p>
            <div className="flex gap-1">
              {social.map((s) => {
                const external = s.href.startsWith('http');
                return (
                  <a key={s.label} href={s.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={s.label} title={s.label}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors duration-200">
                    <s.icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 네비게이션 */}
          <div>
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Navigation</h4>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="group inline-flex items-center gap-1 text-sm text-white/55 hover:text-white transition-colors">
                    {l.label}
                    <FiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 도메인 */}
          <div>
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Domains</h4>
            <ul className="space-y-2.5">
              {domains.map((d) => (
                <li key={d.key}>
                  <Link href={`/${d.slug}`}
                    className="group inline-flex items-center gap-1 text-sm text-white/55 hover:text-white transition-colors">
                    {d.kr}
                    <FiArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-en text-xs font-bold text-white/85 tracking-[0.05em] uppercase mb-5">Contact</h4>
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Email</p>
                <a href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-white/55 hover:text-white transition-colors break-all">
                  {CONTACT_EMAIL}
                </a>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Phone</p>
                <a href={`tel:${CONTACT_PHONE}`}
                  className="text-sm text-white/55 hover:text-white transition-colors">
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="pt-8 border-t border-white/10">
          <dl className="flex flex-wrap gap-x-8 gap-y-2 mb-6">
            {[
              ['상호', 'MATE 외주개발팀'],
              ['이메일', CONTACT_EMAIL],
              ['대표번호', CONTACT_PHONE],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <dt className="text-[11px] font-semibold text-white/50">{k}</dt>
                <dd className="text-[12px] text-white/55">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-white/50">© {year} MATE. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
