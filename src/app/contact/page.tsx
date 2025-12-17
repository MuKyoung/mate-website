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
    <div className="bg-[#0f0f23] min-h-screen">
      {/* Server Error Notice */}
      <FloatingNotice message="현재 '메시지 보내기' 기능의 서버 오류가 있습니다. 카카오톡 1대1 오픈채팅방을 이용해주시면 감사하겠습니다." />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span 
              className="inline-block text-purple-400 text-sm sm:text-base font-medium tracking-widest uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Contact Us
            </motion.span>
            <h1 className="heading-lg text-white mb-6">
              프로젝트 <span className="gradient-text">문의</span>
            </h1>
            <p className="body-lg text-white/60 max-w-2xl mx-auto">
              협업, 외주, 프로젝트에 대해 궁금한 점이 있으시면 언제든지 문의해주세요
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">문의 양식</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                      이름
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-white/30"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-white/30"
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-white/80 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder:text-white/30"
                      placeholder="문의 제목을 입력하세요"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-white/80 mb-2">
                      메시지
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none text-white placeholder:text-white/30"
                      placeholder="문의 내용을 입력하세요"
                    />
                  </div>
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-500/20 text-green-300 rounded-xl border border-green-500/20">
                      메시지가 성공적으로 전송되었습니다!
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-500/20 text-red-300 rounded-xl border border-red-500/20">
                      {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-purple-500/25"
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
                className="block p-6 rounded-3xl bg-[#FEE500] hover:bg-[#FDD835] transition-all duration-300 group"
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
                <div className="bg-[#3C1E1E]/10 rounded-xl p-4 mb-4">
                  <p className="text-[#3C1E1E] text-sm leading-relaxed">
                    빠른 상담을 원하시면 카카오톡 오픈채팅으로 문의해주세요.
                    <br />
                    <span className="font-bold">평일 10:00 - 18:00</span> 실시간 응대
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 bg-[#3C1E1E] text-[#FEE500] py-3 px-6 rounded-xl font-semibold group-hover:bg-[#2D1616] transition-colors">
                  <FiMessageCircle />
                  <span>채팅 시작하기</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              {/* 연락처 정보 */}
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6">연락처 정보</h2>
                <div className="space-y-5">
                  <a href="mailto:team-mate@naver.com" className="flex items-start group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiMail className="text-purple-400" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">이메일</p>
                      <p className="text-white/60 group-hover:text-purple-400 transition-colors text-sm break-all">
                        team-mate@naver.com
                      </p>
                    </div>
                  </a>
                  <a href="tel:010-5457-9141" className="flex items-start group">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <FiPhone className="text-pink-400" size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-white mb-1">전화</p>
                      <p className="text-white/60 group-hover:text-pink-400 transition-colors text-sm">
                        010-5457-9141
                      </p>
                    </div>
                  </a>
                </div>

                <div className="border-t border-white/10 my-6" />

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-300">
                    💡 <span className="font-bold">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-block text-purple-600 text-sm font-medium tracking-widest uppercase mb-4">
              FAQ
            </span>
            <h2 className="heading-md text-gray-900 mb-4">
              자주 묻는 <span className="gradient-text">질문</span>
            </h2>
            <p className="body-lg text-gray-600 max-w-2xl mx-auto">
              궁금한 점이 있으시면 FAQ를 확인해보세요
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-[#0f0f23]">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              아직 궁금한 점이 있으신가요?
            </h2>
            <p className="text-white/60 mb-8">
              언제든지 연락주시면 친절하게 답변드리겠습니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              <FiArrowRight className="rotate-180" />
              홈으로 돌아가기
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
