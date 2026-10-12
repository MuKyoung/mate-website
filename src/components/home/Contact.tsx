'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { stock } from '@/data/stock';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, rowIn, stagger, staggerRows, inView } from '@/lib/motion';
import { arrowHover, btnPrimary, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/**
 * 문의 - 마지막 화면. 가장 중요한 동작이 놓이는 자리다.
 *
 * 문장은 FAQ 9번의 답("요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일")을
 * 옮긴 것이다. 응답 시간이나 비용 같은 조건은 회사가 정한 것이 없어 적지 않는다.
 * 연락처는 실제로 닿는 세 곳만 둔다.
 */
const channels = [
  { name: '카카오톡', value: '1:1 오픈채팅', href: KAKAO_OPEN_CHAT_URL, external: true },
  { name: '이메일', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}`, external: false },
  { name: '전화', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE}`, external: false },
];

/** 사진 위 글자를 읽히게 하는 어두운 막 */
const scrim =
  'linear-gradient(90deg, rgba(8,8,8,0.78) 0%, rgba(8,8,8,0.50) 55%, rgba(8,8,8,0.38) 100%), ' +
  'linear-gradient(180deg, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0) 26%)';

export default function Contact() {
  return (
    <Screen id="contact" tone="photo">
      <Image src={stock.contact.src} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0" style={{ background: scrim }} />

      <ScreenBody>
        <div className="grid items-end gap-x-12 gap-y-9 wide:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">

          <motion.div {...inView} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow className="text-[var(--text-2)]">Contact</Eyebrow></motion.div>
            <motion.h2 id="contact-title" variants={fadeUp} className="type-screen mt-4">
              <span className="block">아직 정리가</span>
              <span className="block">안 되셨어도 됩니다</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-body text-[var(--text-2)] wide:mt-6">
              요구사항과 목표는 첫 상담에서 같이 정리합니다.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link href="/contact" className={`${btnPrimary} w-full medium:w-auto`}>
                프로젝트 문의
                <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.ul {...inView} variants={staggerRows} className="border-b border-[var(--border-2)]">
            {channels.map((c) => (
              <motion.li key={c.name} variants={rowIn} className="border-t border-[var(--border-2)]">
                <a href={c.href} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-baseline gap-x-5 py-4 wide:py-5">
                  <span className="w-16 shrink-0 text-sub text-[var(--text-2)]">{c.name}</span>
                  <span className="min-w-0 flex-1 break-all text-lst font-medium text-[var(--text-1)]">{c.value}</span>
                  <FiArrowUpRight aria-hidden size={17} className={`shrink-0 self-center text-[var(--text-2)] ${arrowHover}`} />
                </a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </ScreenBody>
    </Screen>
  );
}
