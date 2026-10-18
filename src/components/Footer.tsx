'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiArrowUpRight } from 'react-icons/fi';
import { domains } from '@/data/domains';
import { teamCapabilities } from '@/data/teamCapabilities';
import HorizonGlow from '@/components/visual/HorizonGlow';
import { container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/**
 * 모든 페이지의 마지막 화면.
 * 위에는 칸마다 이름을 붙인 정보 줄, 아래에는 로고 뒤로 파란 수평선이 떠오른다.
 */
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
  const channels = [
    { href: `mailto:${CONTACT_EMAIL}`, label: CONTACT_EMAIL },
    { href: `tel:${CONTACT_PHONE}`, label: CONTACT_PHONE },
    { href: KAKAO_OPEN_CHAT_URL, label: '카카오톡 오픈채팅', external: true },
  ];

  const linkCls = 'group inline-flex items-center gap-1.5 text-[14px] text-white/60 hover:text-white transition-colors';

  return (
    <footer className="relative overflow-hidden border-t border-white/10">
      <div className={`${container} pt-16 sm:pt-20`}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-3">
            <p className="mono-label text-white/80">DEVTEAMMATE.CO.KR</p>
          </div>

          <div className="col-span-2 lg:col-span-4">
            <p className="mono-label mb-3">Overview:</p>
            <p className="max-w-sm text-[14px] leading-[1.7] text-white/60">
              웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="mono-label mb-3">Pages:</p>
            <ul className="space-y-2">
              {nav.map((l) => (
                <li key={l.href}><Link href={l.href} className={linkCls}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="mono-label mb-3">Domains:</p>
            <ul className="space-y-2">
              {domains.map((d) => (
                <li key={d.key}><Link href={`/${d.slug}`} className={linkCls}>{d.kr}</Link></li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1 lg:text-right">
            <p className="mono-label lg:justify-end">©{year}</p>
          </div>

          <div className="col-span-2 lg:col-span-4 lg:col-start-4">
            <p className="mono-label mb-3">Contact:</p>
            <ul className="space-y-2">
              {channels.map((c) => (
                <li key={c.href}>
                  <a href={c.href} className={`${linkCls} break-all`}
                    {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    {c.label}
                    <FiArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-5">
            <p className="mono-label mb-3">Business:</p>
            <dl className="space-y-2 text-[13px] text-white/55">
              {[
                ['상호', 'MATE 외주개발팀'],
                ['시작한 해', `${teamCapabilities.stats.since}`],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-20 shrink-0 text-white/45">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* 마무리 - 로고 뒤로 수평선이 떠오른다 */}
      <div className="relative mt-20 h-[58vw] max-h-[560px] min-h-[300px] sm:mt-28">
        <HorizonGlow side="bottom" rim="62%" radius="max(92vw, 720px)" />
        <div className="relative flex h-full flex-col items-center pt-[10%] sm:pt-[7%]">
          <Image src="/images/logo.png" alt="MATE" width={1991} height={493}
            className="h-auto w-[min(52vw,420px)] brightness-0 invert" />
        </div>
        <p className="absolute bottom-5 left-0 right-0 text-center font-mono text-[11px] tracking-[0.02em] text-black/60">
          © {year} MATE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
