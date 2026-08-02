'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiSend, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import PageHeader from '@/components/PageHeader';
import FAQAccordion from '@/components/FAQAccordion';
import FloatingNotice from '@/components/FloatingNotice';
import { faqs } from '@/data/faq';
import { fadeUp, stagger, inView } from '@/lib/motion';

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
    'w-full h-12 px-4 bg-white border border-[#e6e4f2] rounded-xl text-[15px] text-[#0f0f19] placeholder-[#b3b3c2] outline-none transition-colors focus:border-[#4f46ff] focus:ring-2 focus:ring-[#ecebff]';
  const labelClass = 'block text-sm font-semibold text-[#0f0f19] mb-2';

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
      <section className="py-24 sm:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={stagger} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 문의 양식 */}
            <motion.div variants={fadeUp} className="lg:col-span-2">
              <div className="p-6 sm:p-8 rounded-2xl border border-[#e6e4f2] bg-white">
                <p className="text-[13px] font-semibold text-[#4f46ff] mb-4">01 — Inquiry</p>
                <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em] mb-7"
                  style={{ fontSize: 'clamp(1.375rem, 2.5vw, 1.75rem)' }}>
                  문의 양식
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      value={formData.message} onChange={handleChange} required rows={6}
                      className="w-full px-4 py-3 bg-white border border-[#e6e4f2] rounded-xl text-[15px] text-[#0f0f19] placeholder-[#b3b3c2] outline-none transition-colors resize-none focus:border-[#4f46ff] focus:ring-2 focus:ring-[#ecebff]"
                      placeholder="문의 내용을 입력하세요"
                    />
                  </div>

                  {submitStatus === 'success' && (
                    <div className="w-full rounded-xl px-4 py-3 text-[13px] font-medium bg-[#d3f8df] text-[#12b76a]">
                      메시지가 성공적으로 전송되었습니다.
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="w-full rounded-xl px-4 py-3 text-[13px] font-medium bg-[#fee4e2] text-[#f04438]">
                      {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-6 inline-flex items-center justify-center gap-2 bg-[#4f46ff] text-white rounded-xl text-[15px] font-bold hover:bg-[#3d33e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      '전송 중...'
                    ) : (
                      <>
                        <FiSend size={16} />
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
                className="block p-5 rounded-2xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 bg-[#3C1E1E] rounded-xl flex items-center justify-center">
                    <RiKakaoTalkFill className="text-[#FEE500] text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#3C1E1E]">카카오톡 문의</h3>
                    <p className="text-[13px] text-[#3C1E1E]/70">1:1 오픈채팅</p>
                  </div>
                </div>
                <p className="text-[#3C1E1E]/70 text-xs mb-3 leading-relaxed">
                  빠른 상담 — <span className="font-semibold text-[#3C1E1E]">평일 10:00–18:00</span> 실시간 응대
                </p>
                <div className="inline-flex items-center gap-2 bg-[#3C1E1E] text-[#FEE500] h-10 px-4 rounded-xl text-[13px] font-medium group-hover:bg-[#2D1616] transition-colors">
                  <FiMessageCircle />
                  <span>채팅 시작하기</span>
                  <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>

              {/* 연락처 정보 */}
              <div className="p-6 rounded-2xl border border-[#e6e4f2] bg-white">
                <h2 className="text-[13px] font-semibold text-[#4f46ff] mb-5">Direct</h2>
                <div className="divide-y divide-[#e6e4f2]">
                  <a href="mailto:hsib1212@naver.com" className="flex items-start gap-3.5 py-4 first:pt-0 group">
                    <FiMail className="text-[#b3b3c2] mt-0.5 flex-shrink-0 group-hover:text-[#4f46ff] transition-colors" size={16} />
                    <div>
                      <p className="text-[13px] text-[#858594] mb-0.5">이메일</p>
                      <p className="text-[14px] font-medium text-[#0f0f19] break-all">
                        hsib1212@naver.com
                      </p>
                    </div>
                  </a>
                  <a href="tel:0507-1339-9141" className="flex items-start gap-3.5 py-4 group">
                    <FiPhone className="text-[#b3b3c2] mt-0.5 flex-shrink-0 group-hover:text-[#4f46ff] transition-colors" size={16} />
                    <div>
                      <p className="text-[13px] text-[#858594] mb-0.5">전화</p>
                      <p className="text-[14px] font-medium text-[#0f0f19]">
                        0507-1339-9141
                      </p>
                    </div>
                  </a>
                </div>

                <p className="mt-5 pt-5 border-t border-[#e6e4f2] text-[13px] text-[#5b5b6b] leading-relaxed">
                  <span className="font-semibold text-[#0f0f19]">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ (라벤더 서피스 밴드) ── */}
      <section className="py-24 sm:py-32 bg-[#f4f3ff]">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div {...inView} variants={fadeUp}
            className="flex flex-wrap items-baseline justify-between gap-4 mb-12">
            <div className="flex items-baseline gap-4">
              <span className="text-[13px] font-semibold text-[#4f46ff]">02</span>
              <h2 className="text-[#0f0f19] font-extrabold tracking-[-0.03em]"
                style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)' }}>
                자주 묻는 질문
              </h2>
            </div>
            <p className="text-[14px] text-[#5b5b6b]">궁금한 점이 있으시면 FAQ를 확인해보세요.</p>
          </motion.div>
          <div className="max-w-2xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
