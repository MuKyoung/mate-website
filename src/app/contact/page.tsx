'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiSend, FiMessageCircle } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import FAQAccordion from '@/components/FAQAccordion';
import FloatingNotice from '@/components/FloatingNotice';
import { faqs } from '@/data/faq';

// 카카오톡 오픈채팅 URL (실제 URL로 교체해주세요)
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
      // URL 파라미터로 데이터 전송 (CORS 우회)
      const params = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submittedAt: new Date().toISOString(),
      });

      // iframe을 사용한 폼 제출 방식으로 CORS 우회
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'hidden_iframe';
      document.body.appendChild(iframe);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = GOOGLE_SCRIPT_URL;
      form.target = 'hidden_iframe';

      // 폼 데이터 추가
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
      
      // 타임아웃으로 성공/실패 판단
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

      // 정리
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
    <div className="pt-20">
      {/* Server Error Notice */}
      <FloatingNotice message="현재 '메시지 보내기' 기능의 서버 오류가 있습니다.
      카카오톡 1대1 오픈채팅방을 이용해주시면 감사하겠습니다." />

      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            문의
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            협업, 외주, 프로젝트에 대해 궁금한 점이 있으시면 언제든지 문의해주세요
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">문의 양식</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                      placeholder="문의 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      메시지
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                      placeholder="문의 내용을 입력하세요"
                    />
                  </div>
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                      메시지가 성공적으로 전송되었습니다!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                      {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* 카카오톡 오픈채팅 */}
              <motion.a
                href={KAKAO_OPEN_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block bg-[#FEE500] rounded-xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#3C1E1E] rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <RiKakaoTalkFill className="text-[#FEE500] text-2xl sm:text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#3C1E1E]">카카오톡 문의</h3>
                    <p className="text-xs sm:text-sm text-[#3C1E1E]/80">1:1 오픈채팅</p>
                  </div>
                </div>
                <div className="bg-[#3C1E1E]/15 rounded-lg p-3 sm:p-4 mb-4">
                  <p className="text-[#3C1E1E] text-xs sm:text-sm leading-relaxed">
                    빠른 상담을 원하시면 카카오톡 오픈채팅으로 문의해주세요. 
                    <br />
                    <span className="font-bold">평일 10:00 - 18:00</span> 실시간 응대
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#3C1E1E] text-[#FEE500] py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold group-hover:bg-[#2D1616] transition-colors text-sm sm:text-base">
                  <FiMessageCircle className="text-base sm:text-lg" />
                  <span>채팅 시작하기</span>
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </div>
              </motion.a>

              {/* 연락처 정보 */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">연락처 정보</h2>
                <div className="space-y-5 sm:space-y-6">
                  <div className="flex items-start">
                    <FiMail className="text-purple-600 mr-3 sm:mr-4 mt-1 flex-shrink-0" size={22} />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">이메일</p>
                      <a
                        href="mailto:team-mate@naver.com"
                        className="text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base break-all"
                      >
                        team-mate@naver.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiPhone className="text-purple-600 mr-3 sm:mr-4 mt-1 flex-shrink-0" size={22} />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">전화</p>
                      <a
                        href="tel:010-5457-9141"
                        className="text-gray-700 hover:text-purple-600 transition-colors text-sm sm:text-base"
                      >
                        010-5457-9141
                      </a>
                    </div>
                  </div>
                </div>

                {/* 구분선 */}
                <div className="border-t border-gray-200 my-5 sm:my-6" />

                {/* 빠른 문의 안내 */}
                <div className="bg-purple-100 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-purple-800">
                    💡 <span className="font-bold">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-14 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              궁금한 점이 있으시면 FAQ를 확인해보세요
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </div>
  );
}

