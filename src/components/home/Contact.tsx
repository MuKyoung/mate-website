'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { Card, Row, Section } from '@/components/home/kit';
import { fadeUp, inView } from '@/lib/motion';
import { arrowHover, btnOnBrand, CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL } from '@/lib/styles';

/**
 * 문의 - 페이지의 맨 아래, 가장 중요한 동작이 놓이는 자리.
 *
 * 본문은 FAQ 9번의 답("요구사항을 파악하고 목표를 정하는 것이 첫 상담에서 하는 일")을
 * 옮긴 것이다. 응답 시간이나 비용 같은 조건은 회사가 정한 것이 없어 적지 않는다.
 * 연락처는 실제로 닿는 세 곳만 둔다.
 */
export default function Contact() {
  return (
    <Section id="contact" title="문의" summary="카카오톡, 이메일, 전화 가운데 편한 쪽으로 연락 주세요.">
      <motion.div {...inView} variants={fadeUp}
        className="on-brand -mx-3 rounded-block px-6 py-10 medium:mx-0 medium:px-9 medium:py-12">
        <h3 className="text-ext font-bold text-balance">아직 정리가 안 되셨어도 됩니다</h3>
        <p className="mt-4 max-w-md text-body text-[var(--text-2)]">
          요구사항과 목표는 첫 상담에서 같이 정리합니다.
        </p>
        <Link href="/contact" className={`${btnOnBrand} mt-8 w-full medium:w-auto`}>
          프로젝트 문의
          <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
        </Link>
      </motion.div>

      <Card>
        <ul>
          <Row main="카카오톡" trail="1:1 오픈채팅" href={KAKAO_OPEN_CHAT_URL} external />
          <Row main="이메일" trail={CONTACT_EMAIL} href={`mailto:${CONTACT_EMAIL}`} external />
          <Row main="전화" trail={CONTACT_PHONE} href={`tel:${CONTACT_PHONE}`} external />
        </ul>
      </Card>
    </Section>
  );
}
