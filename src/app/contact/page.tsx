'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMail, FiPhone, FiSend, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import FAQAccordion from '@/components/FAQAccordion';
import FloatingNotice from '@/components/FloatingNotice';
import { faqs } from '@/data/faq';

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <FloatingNotice message="현재 '메시지 보내기' 기능의 서버 오류가 있습니다. 카카오톡 1대1 오픈채팅방을 이용해주시면 감사하겠습니다." />

      {/* 페이지 헤더 */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}>
            <span className="section-label mb-3">Contact Us</span>
            <h1 className="heading-lg text-[#262626] mb-3">프로젝트 문의</h1>
            <p className="text-[#5d5d5d] text-sm sm:text-base max-w-lg leading-relaxed">
              협업, 외주, 프로젝트에 대해 궁금한 점이 있으시면 언제든지 문의해주세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 문의 영역 */}
      <section className="py-12 sm:py-14" style={{ background: 'var(--surface)' }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="p-6 sm:p-8 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-lg sm:text-xl font-semibold text-[#262626] mb-6">문의 양식</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[#4c4c4c] mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#e1e1e1] rounded-lg focus:ring-1 focus:ring-[#2a72e5] focus:border-[#2a72e5] outline-none transition-all text-[#262626] placeholder:text-[#a3a3a3] text-sm"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-[#4c4c4c] mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#e1e1e1] rounded-lg focus:ring-1 focus:ring-[#2a72e5] focus:border-[#2a72e5] outline-none transition-all text-[#262626] placeholder:text-[#a3a3a3] text-sm"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-[#4c4c4c] mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-[#e1e1e1] rounded-lg focus:ring-1 focus:ring-[#2a72e5] focus:border-[#2a72e5] outline-none transition-all text-[#262626] placeholder:text-[#a3a3a3] text-sm"
                      placeholder="문의 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-[#4c4c4c] mb-2">
                      메시지
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white border border-[#e1e1e1] rounded-lg focus:ring-1 focus:ring-[#2a72e5] focus:border-[#2a72e5] outline-none transition-all resize-none text-[#262626] placeholder:text-[#a3a3a3] text-sm"
                      placeholder="문의 내용을 입력하세요"
                    />
                  </div>
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-[#bbecd7] text-[#058765] rounded-lg border border-[#bbecd7]">
                      메시지가 성공적으로 전송되었습니다!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-[#ffd8d7] text-[#da3944] rounded-lg border border-[#ffd8d7]">
                      {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3.5 bg-[#2a72e5] text-white rounded-lg font-semibold hover:bg-[#0957c8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                  >
                    {isSubmitting ? (
                      '전송 중...'
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        메시지 보내기
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* 카카오톡 오픈채팅 */}
              <a
                href={KAKAO_OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 rounded-xl bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-200 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#3C1E1E] rounded-xl flex items-center justify-center">
                    <RiKakaoTalkFill className="text-[#FEE500] text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3C1E1E]">카카오톡 문의</h3>
                    <p className="text-sm text-[#3C1E1E]/70">1:1 오픈채팅</p>
                  </div>
                </div>
                <p className="text-[#3C1E1E]/70 text-xs mb-3 leading-relaxed">
                  빠른 상담 — <span className="font-semibold text-[#3C1E1E]">평일 10:00–18:00</span> 실시간 응대
                </p>
                <div className="flex items-center gap-2 bg-[#3C1E1E] text-[#FEE500] py-2.5 px-4 rounded-lg text-sm font-semibold group-hover:bg-[#2D1616] transition-colors">
                  <FiMessageCircle />
                  <span>채팅 시작하기</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* 연락처 정보 */}
              <div className="p-6 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-base font-semibold text-[#262626] mb-5">연락처 정보</h2>
                <div className="space-y-5">
                  <a href="mailto:hsib1212@naver.com" className="flex items-start group">
                    <div className="w-9 h-9 rounded-lg bg-[#c6e6ff] flex items-center justify-center mr-3.5 flex-shrink-0">
                      <FiMail className="text-[#2a72e5]" size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#262626] mb-1">이메일</p>
                      <p className="text-[#4c4c4c] group-hover:text-[#2a72e5] transition-colors text-sm break-all">
                        hsib1212@naver.com
                      </p>
                    </div>
                  </a>
                  <a href="tel:0507-1339-9141" className="flex items-start group">
                    <div className="w-9 h-9 rounded-lg bg-[#c6e6ff] flex items-center justify-center mr-3.5 flex-shrink-0">
                      <FiPhone className="text-[#2a72e5]" size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#262626] mb-1">전화</p>
                      <p className="text-[#4c4c4c] group-hover:text-[#2a72e5] transition-colors text-sm">
                        0507-1339-9141
                      </p>
                    </div>
                  </a>
                </div>

                <div className="border-t border-[#e1e1e1] my-6" />

                <div className="p-3.5 rounded-lg bg-[#c6e6ff] border border-[#c6e6ff]">
                  <p className="text-xs text-[#0043b3]">
                    <span className="font-semibold">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <span className="section-label mb-3" style={{ color: '#2a72e5' }}>FAQ</span>
            <h2 className="heading-md text-[#262626] mb-2">자주 묻는 질문</h2>
            <p className="text-[#4c4c4c] text-sm">궁금한 점이 있으시면 FAQ를 확인해보세요.</p>
          </motion.div>
          <div className="max-w-2xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
