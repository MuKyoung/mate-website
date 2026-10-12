'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowSwap, Label, Magnetic } from '@/components/home/parts';
import { clipUp, fadeUp, rowIn, stagger, staggerTight, inView } from '@/lib/motion';
import { clipWrap, container, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/**
 * 문의 - 말하는 면이라 대표 색상을 쓴다.
 *
 * 본문 한 줄은 FAQ 9번의 답 그대로다 ("요구사항을 파악하고 목표를 정하는 것이
 * 첫 상담에서 하는 일입니다"). 응답 시간이나 비용 같은 조건은 회사가 정한 것이
 * 없으므로 적지 않는다.
 *
 * 연락처는 실제로 닿는 세 곳만 둔다.
 */
const channels = [
  { name: '카카오톡', value: '1:1 오픈채팅', href: KAKAO_OPEN_CHAT_URL, external: true },
  { name: '이메일', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false },
  { name: '전화', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}`, external: false },
];

export default function Closing() {
  return (
    <section className="surface-blue relative text-white">
      <div className={`${container} py-28 sm:py-36 lg:py-44`}>

        <motion.div {...inView} variants={fadeUp}>
          <Label className="text-white/90">문의</Label>
        </motion.div>

        <motion.h2 {...inView} variants={stagger} className="font-display mt-8"
          style={{ fontSize: 'clamp(2.375rem, 7vw, 6.75rem)', lineHeight: 1.16 }}>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block">기획이 정리되지</motion.span>
          </span>
          <span className={clipWrap}>
            <motion.span variants={clipUp} className="block lg:pl-[0.82em]">않았어도 괜찮습니다.</motion.span>
          </span>
        </motion.h2>

        <div className="mt-12 grid gap-x-gutter gap-y-14 lg:mt-20 lg:grid-cols-12">
          <motion.div {...inView} variants={stagger} className="lg:col-span-5">
            <motion.p variants={fadeUp} className="max-w-md text-[17px] leading-[1.8] text-white/90 sm:text-[19px]">
              요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일입니다.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Magnetic>
                <Link href="/contact" className="group btn-sweep btn-on-blue">
                  프로젝트 이야기하기
                  <ArrowSwap />
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>

          <motion.ul {...inView} variants={staggerTight} className="border-t border-white/30 lg:col-span-6 lg:col-start-7">
            {channels.map((c) => (
              <motion.li key={c.name} variants={rowIn}>
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-baseline gap-x-6 border-b border-white/30 py-5 sm:py-6">
                  <span className="w-[4.5rem] shrink-0 text-[13px] font-semibold text-white/85">{c.name}</span>
                  <span className="font-display display-s min-w-0 flex-1 break-all transition-transform duration-500
                                   ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                    {c.value}
                  </span>
                  <ArrowSwap size={17} />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
