'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiSend, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import PageHeader from '@/components/PageHeader';
import FAQAccordion from '@/components/FAQAccordion';
import FloatingNotice from '@/components/FloatingNotice';
import { faqs } from '@/data/faq';
import { fadeUp, revealUp, stagger, inView } from '@/lib/motion';

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
    'w-full h-14 px-5 bg-white border border-[#e5e8eb] rounded-xl text-[16px] text-[#191f28] placeholder-[#adb5bd] outline-none transition-colors focus:border-[#3182f6] focus:ring-2 focus:ring-[#e8f3ff]';
  const labelClass = 'block text-[15px] font-semibold text-[#191f28] mb-2.5';

  return (
    <>
      <FloatingNotice message="현재 '메시지 보내기' 기능의 서버 오류가 있습니다. 카카오톡 1대1 오픈채팅방을 이용해주시면 감사하겠습니다." />

      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Contact Us"
        title="프로젝트 문의"
        description="협업, 외주, 프로젝트에 대해 궁금한 점이 있으시면 언제든지 문의해주세요."
      />

      {/* ── 문의 영역 (white) ── */}
      <section className="py-32 sm:py-44 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 문의 양식 */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <div className="p-10 sm:p-12 rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)]">
                <p className="index-num mb-6">01 — Inquiry</p>
                <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06] mb-10"
                  style={{ fontSize: 'clamp(1.875rem, 4vw, 3rem)' }}>
                  문의 양식
                </h2>
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
                      className="w-full px-5 py-4 bg-white border border-[#e5e8eb] rounded-xl text-[16px] leading-[1.75] text-[#191f28] placeholder-[#adb5bd] outline-none transition-colors resize-none focus:border-[#3182f6] focus:ring-2 focus:ring-[#e8f3ff]"
                      placeholder="문의 내용을 입력하세요"
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="w-full rounded-xl px-5 py-4 text-[15px] font-medium bg-[#d3f8df] text-[#12b76a]">
                      메시지가 성공적으로 전송되었습니다.
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="w-full rounded-xl px-5 py-4 text-[15px] font-medium bg-[#fee4e2] text-[#f04438]">
                      {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group h-16 px-10 inline-flex items-center justify-center gap-2.5 bg-[#3182f6] text-white rounded-2xl text-[17px] font-bold hover:bg-[#1b64da] transition-colors shadow-[0_8px_28px_rgba(49,130,246,0.32)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      '전송 중...'
                    ) : (
                      <>
                        <FiSend size={19} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                        메시지 보내기
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* 연락 수단 */}
            <motion.div variants={fadeUp} className="lg:col-span-1 space-y-6">
              {/* 카카오톡 오픈채팅 */}
              <a
                href={KAKAO_OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-10 rounded-[28px] bg-[#FEE500] hover:bg-[#FDD835] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#3C1E1E] rounded-2xl flex items-center justify-center">
                    <RiKakaoTalkFill className="text-[#FEE500] text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-[19px] font-extrabold text-[#3C1E1E] tracking-[-0.02em]">카카오톡 문의</h3>
                    <p className="text-[15px] text-[#3C1E1E]/70">1:1 오픈채팅</p>
                  </div>
                </div>
                <p className="text-[#3C1E1E]/70 text-[16px] mb-7 leading-[1.75]">
                  빠른 상담 — <span className="font-semibold text-[#3C1E1E]">평일 10:00–18:00</span> 실시간 응대
                </p>
                <div className="inline-flex items-center gap-2.5 bg-[#3C1E1E] text-[#FEE500] h-14 px-7 rounded-2xl text-[16px] font-bold group-hover:bg-[#2D1616] transition-colors">
                  <FiMessageCircle size={18} />
                  <span>채팅 시작하기</span>
                  <FiArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </a>

              {/* 연락처 정보 */}
              <div className="p-10 rounded-[28px] border border-[#e5e8eb] bg-white shadow-[0_1px_3px_rgba(25,31,40,0.05)] hover:shadow-[0_24px_56px_rgba(25,31,40,0.13)] hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                <h2 className="index-num mb-6">Direct</h2>
                <div className="divide-y divide-[#e5e8eb]">
                  <a href="mailto:hsib1212@naver.com" className="flex items-start gap-4 py-6 first:pt-0 group">
                    <FiMail className="text-[#adb5bd] mt-1 flex-shrink-0 group-hover:text-[#3182f6] transition-colors" size={20} />
                    <div>
                      <p className="text-[14px] text-[#6b7684] mb-1">이메일</p>
                      <p className="text-[17px] font-semibold text-[#191f28] break-all">
                        hsib1212@naver.com
                      </p>
                    </div>
                  </a>
                  <a href="tel:0507-1339-9141" className="flex items-start gap-4 py-6 group">
                    <FiPhone className="text-[#adb5bd] mt-1 flex-shrink-0 group-hover:text-[#3182f6] transition-colors" size={20} />
                    <div>
                      <p className="text-[14px] text-[#6b7684] mb-1">전화</p>
                      <p className="text-[17px] font-semibold text-[#191f28]">
                        0507-1339-9141
                      </p>
                    </div>
                  </a>
                </div>

                <p className="mt-8 pt-8 border-t border-[#e5e8eb] text-[16px] text-[#4e5968] leading-[1.75]">
                  <span className="font-semibold text-[#191f28]">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ (쿨 그레이 서피스 밴드) ── */}
      <section className="py-32 sm:py-44 bg-[#f4f6f8] border-t border-[#e5e8eb]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={revealUp}
            className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 mb-20">
            <div className="max-w-3xl">
              <p className="index-num mb-6">02 — FAQ</p>
              <h2 className="text-[#191f28] font-extrabold tracking-[-0.035em] leading-[1.06]"
                style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}>
                자주 묻는 질문
              </h2>
            </div>
            <p className="max-w-md text-xl text-[#4e5968] leading-[1.7] lg:pb-4">궁금한 점이 있으시면 FAQ를 확인해보세요.</p>
          </motion.div>
          <div className="max-w-3xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
