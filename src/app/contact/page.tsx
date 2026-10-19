'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowRight } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import PageHeader from '@/components/PageHeader';
import FAQAccordion from '@/components/FAQAccordion';
import SectionHead from '@/components/ui/SectionHead';
import { faqs } from '@/data/faq';
import { domains } from '@/data/domains';
import { fadeLeft, fadeRight, stagger, inView } from '@/lib/motion';
import {
  arrowHover, btnPrimary, container, sectionPad,
  CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL,
} from '@/lib/styles';

const GOOGLE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  process.env.NEXT_PUBLIC_GAS_WEB_APP_URL;

export default function ContactPage() {
  const [formData, setFormData] = useState({
    domain: '',
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('domain');
    if (q && domains.some((d) => d.key === q)) {
      setFormData((prev) => ({ ...prev, domain: q }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /** 폼 내용을 메일 초안으로 옮긴다 - 전송 서버 없이도 문의가 실제로 도착한다 */
  const openMailDraft = () => {
    const domainLabel = domains.find((d) => d.key === formData.domain)?.kr ?? '미지정';
    const subject = `[문의] ${formData.subject || '프로젝트 문의'}`;
    const body = [
      `문의 영역: ${domainLabel}`,
      `이름: ${formData.name}`,
      `회신 이메일: ${formData.email}`,
      '',
      formData.message,
    ].join('\n');
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 전송 엔드포인트가 설정돼 있지 않으면 메일 초안으로 넘긴다
    if (!GOOGLE_SCRIPT_URL) {
      openMailDraft();
      return;
    }

    setIsSubmitting(true);

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
        domain: domains.find((d) => d.key === formData.domain)?.kr ?? '미지정',
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
      setFormData({ domain: '', name: '', email: '', subject: '', message: '' });
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
    'w-full h-14 px-5 bg-[var(--surface)] border border-white/15 rounded-[2px] text-[16px] text-[var(--text-1)] placeholder:text-white/40 outline-none transition-colors focus:border-[var(--blue-glow)] focus:ring-0';
  const labelClass = 'mb-2.5 block font-mono text-[11px] uppercase tracking-[0.02em] text-white/60';

  return (
    <>

      {/* ── 페이지 헤더 ── */}
      <PageHeader
        eyebrow="Contact"
        title="프로젝트 문의"
        description="만들려는 것만 알려주시면 됩니다. 기획이 정리되지 않았어도 괜찮습니다. 요구사항과 목표는 첫 상담에서 같이 정리합니다."
      />

      {/* ━━ Inquiry - 폼 좌 / 채널 우 ━━ */}
      <section className={sectionPad}>
        <div className={container}>
          <SectionHead num="01" label="Inquiry" title={<>어디서부터 말씀드릴까요</>} kr="정리되지 않은 상태로 보내주셔도 됩니다" />

          <motion.div {...inView} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-20">

            {/* 문의 양식 */}
            <motion.div variants={fadeLeft} className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-7">
                {/* 어느 영역 문의인지 먼저 고르게 해서 내부 배정이 바로 되도록 한다 */}
                <fieldset>
                  <legend className={labelClass}>
                    문의 영역 <span className="text-white/40">(선택)</span>
                  </legend>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                    {domains.map((d) => {
                      const on = formData.domain === d.key;
                      return (
                        <button
                          key={d.key} type="button" data-domain={d.key}
                          aria-pressed={on}
                          onClick={() => setFormData((prev) => ({ ...prev, domain: on ? '' : d.key }))}
                          className={`h-14 px-4 border text-left transition-colors ${
                            on
                              ? 'border-primary-200 bg-primary-200'
                              : 'border-white/15 bg-[var(--surface)] hover:border-white/40'
                          }`}>
                          <span className={`block type-b4 ${on ? 'text-[var(--text-1)]' : 'text-white/75'}`}>
                            {d.kr}
                          </span>
                          <span className={`block font-mono text-[11px] uppercase ${on ? 'text-white/80' : 'text-white/45'}`}>
                            {d.en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="name" className={labelClass}>이름</label>
                  <input
                    type="text" id="name" name="name"
                    value={formData.name} onChange={handleChange} required
                    className={inputClass} placeholder="홍길동"
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>이메일</label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange} required
                    className={inputClass} placeholder="회신받으실 주소"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className={labelClass}>제목</label>
                  <input
                    type="text" id="subject" name="subject"
                    value={formData.subject} onChange={handleChange} required
                    className={inputClass} placeholder="예) 사내 교육용 VR 콘텐츠 제작 문의"
                  />
                </div>
                <div>
                  <label htmlFor="message" className={labelClass}>메시지</label>
                  <textarea
                    id="message" name="message"
                    value={formData.message} onChange={handleChange} required rows={7}
                    className="w-full px-5 py-4 bg-[var(--surface)] border border-white/15 rounded-[2px] text-[16px] leading-[1.75] text-[var(--text-1)] placeholder:text-white/40 outline-none transition-colors resize-none focus:border-[var(--blue-glow)] focus:ring-0"
                    placeholder="만들려는 것과 생각하시는 일정을 편하게 적어 주세요."
                  />
                </div>

                {submitStatus === 'success' && (
                  <p className="border-l-2 border-[var(--success)] pl-4 text-[15px] font-medium text-[var(--success-on-dark)]">
                    메시지가 성공적으로 전송되었습니다.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className="border-l-2 border-[var(--danger)] pl-4 text-[15px] font-medium text-[var(--danger-on-dark)]">
                    {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
                  </p>
                )}

                {!GOOGLE_SCRIPT_URL && (
                  <p className="type-c1 text-white/55 leading-[1.7]">
                    버튼을 누르면 위 내용이 채워진 메일 초안이 열립니다. 바로 답장이 필요하시면
                    카카오톡 오픈채팅이 가장 빠릅니다.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${btnPrimary} justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    '전송 중...'
                  ) : (
                    <>
                      <FiSend size={17} className={arrowHover} />
                      {GOOGLE_SCRIPT_URL ? '메시지 보내기' : '메일로 보내기'}
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
                className="group block p-7 sm:p-9 bg-[#FEE500] hover:bg-[#FDD835] transition-colors duration-300"
              >
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <RiKakaoTalkFill className="text-[#3C1E1E]" size={26} />
                    <h3 className="text-[19px] font-medium text-[#3C1E1E] tracking-[-0.012em]">카카오톡 문의</h3>
                  </div>
                  <p className="font-mono text-[11px] uppercase text-[#3C1E1E]/60">1:1 오픈채팅</p>
                </div>
                <p className="text-[#3C1E1E]/70 text-[15px] mb-8 leading-[1.75]">
                  가장 빠른 창구입니다
                </p>
                <div className="inline-flex items-center gap-2.5 h-12 px-6 rounded-[2px] bg-[#3C1E1E] text-[#FEE500] text-[15px] font-medium group-hover:bg-[#2D1616] transition-colors duration-300">
                  <span>채팅 시작하기</span>
                  <FiArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </a>

              {/* 연락처 - 헤어라인 리스트 */}
              <div className="mt-14 sm:mt-16">
                <p className="mono-label pb-4 border-b border-white/[0.12]">Direct:</p>
                <a href={`mailto:${CONTACT_EMAIL}`}
                  className="group flex items-baseline justify-between gap-6 py-6 border-b border-white/10">
                  <span className="font-mono text-[11px] uppercase text-white/55 flex-shrink-0">Email</span>
                  <span className="text-[16px] sm:text-[17px] font-medium text-[var(--text-1)] group-hover:text-[var(--point)] transition-colors break-all text-right">
                    {CONTACT_EMAIL}
                  </span>
                </a>
                <a href={`tel:${CONTACT_PHONE}`}
                  className="group flex items-baseline justify-between gap-6 py-6 border-b border-white/10">
                  <span className="font-mono text-[11px] uppercase text-white/55 flex-shrink-0">Phone</span>
                  <span className="text-[16px] sm:text-[17px] font-medium text-[var(--text-1)] group-hover:text-[var(--point)] transition-colors text-right">
                    {CONTACT_PHONE}
                  </span>
                </a>
                <p className="pt-8 text-[15px] text-white/55 leading-[1.75]">
                  <span className="font-medium text-[var(--text-1)]">빠른 답변</span>을 원하시면 카카오톡 오픈채팅을 이용해주세요.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━ FAQ ━━ */}
      <section className={`${sectionPad} border-t border-white/10`}>
        <div className={container}>
          <SectionHead label="FAQ" title={<>자주 묻는 질문</>} kr="궁금한 점이 있으시면 먼저 읽어 보세요" />
          <div className="max-w-3xl">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
