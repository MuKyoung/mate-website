'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import PageHeader from '@/components/PageHeader';
import FAQAccordion from '@/components/FAQAccordion';
import FloatingNotice from '@/components/FloatingNotice';
import { faqs } from '@/data/faq';
import { fadeLeft, fadeRight, clipUp, clipLeft, lineDraw, stagger, inView } from '@/lib/motion';

// 카카오톡 오픈채팅 URL
const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/scVFEK3h';

const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_GAS_WEB_APP_URL;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!GOOGLE_SCRIPT_URL) {
      setSubmitStatus('error');
      setErrorMessage('연동 URL이 설정되어 있지 않습니다. NEXT_PUBLIC_GOOGLE_SCRIPT_URL 환경 변수를 확인해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'hidden_iframe';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SCRIPT_URL;
      form.target = 'hidden_iframe';

      Object.entries({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submittedAt: new Date().toISOString(),
      }).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);

      const submitPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('요청 시간 초과'));
        }, 10000);

        iframe.onload = () => {
          clearTimeout(timeout);
          resolve();
        };

        iframe.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('전송 실패'));
        };
      });

      form.submit();
      await submitPromise;

      document.body.removeChild(form);
      document.body.removeChild(iframe);

      setSubmitStatus('success');
      setErrorMessage(null);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-14 px-5 bg-white/[0.04] border border-white/15 rounded-[10px] text-[16px] text-[#f5f6f7] placeholder:text-white/25 outline-none transition-colors focus:border-white/60 focus:ring-0';
  const labelClass = 'block text-[13px] font-semibold text-white/85 mb-2.5';

  return (
    <>
      <FloatingNotice message="현재 '메시지 보내기' 기능의 서버 오류가 있습니다. 카카오톡 1대1 오픈채팅방을 이용해주시면 감사하겠습니다." />

      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Contact Us"
        title="프로젝트 문의"
        description="협업, 외주, 프로젝트에 대해 궁금한 점이 있으시면 언제든지 문의해주세요."
      />

      {/* ━━ (01) Inquiry — 폼 좌 / 채널 우 ━━ */}
      <section className="py-28 sm:py-40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-16 sm:mb-20">
            <div className="relative pb-6 mb-10 sm:mb-14">
              <div className="flex items-center justify-between">
                <motion.p {...inView} variants={fadeLeft} className="index-num font-en">(01) Inquiry</motion.p>
              </div>
              <motion.span {...inView} variants={lineDraw}
                className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
            </div>
            <motion.h2 {...inView} variants={stagger}
              className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.03em] leading-[1.04]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
              <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                <motion.span variants={clipUp} className="block">Get in Touch</motion.span>
              </span>
            </motion.h2>
            <motion.p {...inView} variants={fadeRight} className="caption-kr mt-6">— 문의 양식</motion.p>
          </div>

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-20">

            {/* 문의 양식 */}
            <motion.div variants={fadeLeft} className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label htmlFor="name" className={labelClass}>이름</label>
                  <input
                    type="text" id="name" name="name"
                    value={formData.name} onChange={handleChange} required
                    className={inputClass} placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>이메일</label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange} required
                    className={inputClass} placeholder="이메일을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className={labelClass}>제목</label>
                  <input
                    type="text" id="subject" name="subject"
                    value={formData.subject} onChange={handleChange} required
                    className={inputClass} placeholder="문의 제목을 입력하세요"
                  />
                </div>
                <div>
                  <label htmlFor="message" className={labelClass}>메시지</label>
                  <textarea
                    id="message" name="message"
                    value={formData.message} onChange={handleChange} required rows={7}
                    className="w-full px-5 py-4 bg-white/[0.04] border border-white/15 rounded-[10px] text-[16px] leading-[1.75] text-[#f5f6f7] placeholder:text-white/25 outline-none transition-colors resize-none focus:border-white/60 focus:ring-0"
                    placeholder="문의 내용을 입력하세요"
                  />
                </div>

                {submitStatus === 'success' && (
                  <p className="border-l-2 border-[#12b76a] pl-4 text-[15px] font-medium text-[#4ade80]">
                    메시지가 성공적으로 전송되었습니다.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="border-l-2 border-[#f04438] pl-4 text-[15px] font-medium text-[#f87171]">
                    {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center justify-center gap-2.5 h-14 px-9 rounded-full text-[15px] font-bold text-[#131518] bg-white hover:bg-[#3182f6] hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    '전송 중...'
                  ) : (
                    <>
                      <FiSend size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      메시지 보내기
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* 연락 수단 */}
            <motion.div variants={fadeRight} className="lg:col-span-5">
              {/* 카카오톡 오픈채팅 */}
              <a
                href={KAKAO_OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-8 sm:p-10 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-300"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <RiKakaoTalkFill className="text-[#3C1E1E]" size={26} />
                    <h3 className="text-[19px] font-extrabold text-[#3C1E1E] tracking-[-0.02em]">카카오톡 문의</h3>
                  </div>
                  <p className="text-[13px] font-semibold text-[#3C1E1E]/60">1:1 오픈채팅</p>
                </div>
                <p className="text-[#3C1E1E]/70 text-[15px] mb-8 leading-[1.75]">
                  빠른 상담 — <span className="font-semibold text-[#3C1E1E]">평일 10:00–18:00</span> 실시간 응대
                </p>
                <div className="inline-flex items-center gap-2.5 h-12 px-6 rounded-[10px] bg-[#3C1E1E] text-[#FEE500] text-[15px] font-bold group-hover:bg-[#2D1616] transition-colors duration-300">
                  <span>채팅 시작하기</span>
                  <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </a>

              {/* 연락처 — 헤어라인 리스트 */}
              <div className="mt-14 sm:mt-16">
                <p className="index-num font-en pb-6 border-b border-white/10">(02) Direct</p>
                <a href="mailto:hsib1212@naver.com"
                  className="group flex items-baseline justify-between gap-6 py-6 border-b border-white/10">
                  <span className="text-[13px] text-white/45 flex-shrink-0">이메일</span>
                  <span className="text-[16px] sm:text-[17px] font-semibold text-[#f5f6f7] group-hover:text-[#3182f6] transition-colors break-all text-right">
                    hsib1212@naver.com
                  </span>
                </a>
                <a href="tel:0507-1339-9141"
                  className="group flex items-baseline justify-between gap-6 py-6 border-b border-white/10">
                  <span className="text-[13px] text-white/45 flex-shrink-0">전화</span>
                  <span className="text-[16px] sm:text-[17px] font-semibold text-[#f5f6f7] group-hover:text-[#3182f6] transition-colors text-right">
                    0507-1339-9141
                  </span>
                </a>
                <p className="pt-8 text-[15px] text-white/55 leading-[1.75]">
                  <span className="font-semibold text-[#f5f6f7]">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━ (03) FAQ ━━ */}
      <section className="py-28 sm:py-40 border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-16 sm:mb-20">
            <div className="relative pb-6 mb-10 sm:mb-14">
              <div className="flex items-center justify-between">
                <motion.p {...inView} variants={fadeRight} className="index-num font-en">(03) FAQ</motion.p>
              </div>
              <motion.span {...inView} variants={lineDraw}
                className="absolute bottom-0 left-0 right-0 h-px bg-white/10 block" />
            </div>
            <motion.h2 {...inView} variants={stagger}
              className="font-en text-[#f5f6f7] font-extrabold tracking-[-0.03em] leading-[1.04]"
              style={{ fontSize: 'clamp(2.25rem, 6vw, 4.75rem)' }}>
              <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                <motion.span variants={clipLeft} className="block">FAQ</motion.span>
              </span>
            </motion.h2>
            <motion.p {...inView} variants={fadeLeft} className="caption-kr mt-6">
              — 자주 묻는 질문 · 궁금한 점이 있으시면 FAQ를 확인해보세요
            </motion.p>
          </div>
          <div className="max-w-3xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
