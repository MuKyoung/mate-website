'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiMail, FiPhone } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { domains } from '@/data/domains';
import { container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

const groupTitle = 'mb-4 text-sub font-medium text-[var(--text-3)]';
const groupLink = 'text-btn text-[var(--text-2)] transition-colors duration-150 hover:text-[var(--text-1)]';

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
    // 좁은 화면에서는 아래 탭 높이만큼 더 띄운다. 마지막 줄이 탭에 가리면 안 된다.
    <footer className="border-t border-[var(--border)] pb-14 expanded:pb-0">
      <div className={`${container} pb-12 pt-16 sm:pt-20`}>

        <div className="mb-14 grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" aria-label="MATE 홈" className="mb-4 inline-block transition-opacity duration-150 hover:opacity-70">
              <Image src="/images/logo.png" alt="MATE" width={80} height={26} className="logo-auto h-6 w-auto" />
            </Link>
            <p className="mb-5 max-w-[16rem] text-sub leading-[1.7] text-[var(--text-3)]">
              웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱.
            </p>
            {/* 누르는 것끼리는 8px 이상 띄운다 */}
            <div className="flex gap-2">
              {social.map((s) => {
                const external = s.href.startsWith('http');
                return (
                  <a key={s.label} href={s.href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={s.label} title={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-fg/[0.06] text-[var(--text-2)]
                               transition-colors duration-150 hover:bg-fg/[0.12] hover:text-[var(--text-1)]">
                    <s.icon size={17} />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className={groupTitle}>둘러보기</h4>
            <ul className="space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}><Link href={l.href} className={groupLink}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={groupTitle}>하는 일</h4>
            <ul className="space-y-2.5">
              {domains.map((d) => (
                <li key={d.key}><Link href={`/${d.slug}`} className={groupLink}>{d.kr}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className={groupTitle}>연락처</h4>
            <ul className="space-y-2.5">
              <li><a href={`mailto:${CONTACT_EMAIL}`} className={`${groupLink} break-all`}>{CONTACT_EMAIL}</a></li>
              <li><a href={`tel:${CONTACT_PHONE}`} className={groupLink}>{CONTACT_PHONE}</a></li>
            </ul>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-[var(--border)] pt-7">
          <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-2">
            {[
              ['상호', 'MATE 외주개발팀'],
              ['이메일', CONTACT_EMAIL],
              ['대표번호', CONTACT_PHONE],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 text-min text-[var(--text-3)]">
                <dt className="font-medium">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-min text-[var(--text-3)]">© {year} MATE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
