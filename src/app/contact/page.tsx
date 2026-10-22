'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowRight, FiMail, FiPhone } from 'react-icons/fi';
import { RiKakaoTalkFill } from 'react-icons/ri';
import FAQAccordion from '@/components/FAQAccordion';
import SectionHead from '@/components/ui/SectionHead';
import { faqs } from '@/data/faq';
import { domains } from '@/data/domains';
import { fadeUp, stagger, onMount, inView } from '@/lib/motion';
import {
  btnPoint, container, radiusCard,
  CONTACT_EMAIL, CONTACT_PHONE, KAKAO_OPEN_CHAT_URL,
} from '@/lib/styles';

/**
 * 프로젝트 문의 - 가운데 좁은 양식 하나 (Figma 「온라인 견적 접수하기」).
 * 보내기는 /api/contact (Resend). 메일 전송이 설정되지 않았으면 메일 초안으로 넘긴다.
 */
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

  /** 폼 내용을 메일 초안으로 옮긴다 - 메일 전송(RESEND_API_KEY)이 설정되기 전에도 문의가 도착한다 */
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 봇 걸러내기 칸 - await 뒤에는 currentTarget 이 비므로 먼저 읽는다
    const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value ?? '';

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage(null);

    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website }),
      });

      // 메일 전송이 아직 설정되지 않았으면 메일 초안으로 넘긴다 (src/app/api/contact/route.ts)
      if (res.status === 503) {
        openMailDraft();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSubmitStatus('success');
      setFormData({ domain: '', name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage('전송 중 오류가 발생했습니다. 잠시 후 다시 시도하시거나 메일 · 카카오톡 오픈채팅으로 연락해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 밑줄만 있는 칸 - 고르면 밑줄이 로고 파랑으로 */
  const inputClass =
    'w-full border-0 border-b border-gray-200 bg-transparent px-0 py-3.5 text-[16px] text-ink placeholder:text-gray-400 outline-none transition-colors focus:border-point-200 focus:ring-0';
  const labelClass = 'block text-[15px] font-bold text-ink';
  const req = <span className="ml-0.5 text-point-200">*</span>;

  return (
    <>
      <section data-header="light" className="bg-white pb-24 pt-32 sm:pb-32 sm:pt-40 xl:pb-[140px]">
        <div className={container}>
          <motion.div {...onMount} variants={stagger} className="text-center">
            <motion.p variants={fadeUp} className="eyebrow mb-3">Contact</motion.p>
            <motion.h1 variants={fadeUp} className="type-h1 font-bold text-ink">프로젝트 문의</motion.h1>
            <motion.p variants={fadeUp} className="type-b3 mx-auto mt-5 max-w-xl text-ink-2">
              만들려는 것만 알려주시면 됩니다. 기획이 정리되지 않았어도 괜찮습니다.
              요구사항과 목표는 첫 상담에서 같이 정리합니다.
            </motion.p>
          </motion.div>

          <motion.form {...onMount} variants={fadeUp} onSubmit={handleSubmit}
            className="relative mx-auto mt-14 max-w-[640px] space-y-9 sm:mt-16">
            {/* 어느 영역 문의인지 먼저 고르게 해서 내부 배정이 바로 되도록 한다 */}
            <fieldset>
              <legend className={labelClass}>
                문의 영역 <span className="text-[13px] font-normal text-gray-500">(선택)</span>
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {domains.map((d) => {
                  const on = formData.domain === d.key;
                  return (
                    <button
                      key={d.key} type="button" data-domain={d.key}
                      aria-pressed={on}
                      onClick={() => setFormData((prev) => ({ ...prev, domain: on ? '' : d.key }))}
                      className={`inline-flex h-11 items-center rounded-pill border px-5 text-[15px] transition-colors ${
                        on
                          ? 'border-point-200 bg-point-200 font-bold text-white'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-point-200 hover:text-point-200'
                      }`}>
                      {d.kr}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="name" className={labelClass}>이름{req}</label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange} required maxLength={100}
                className={inputClass} placeholder="이름을 입력해 주세요"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>이메일{req}</label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange} required maxLength={200}
                className={inputClass} placeholder="회신받으실 주소"
              />
            </div>
            <div>
              <label htmlFor="subject" className={labelClass}>제목{req}</label>
              <input
                type="text" id="subject" name="subject"
                value={formData.subject} onChange={handleChange} required maxLength={200}
                className={inputClass} placeholder="예) 사내 교육용 VR 콘텐츠 제작 문의"
              />
            </div>
            <div>
              <label htmlFor="message" className={labelClass}>문의 내용{req}</label>
              <textarea
                id="message" name="message"
                value={formData.message} onChange={handleChange} required rows={7} maxLength={5000}
                className={`mt-3 w-full resize-none rounded-card-sm border border-gray-200 bg-white px-4 py-3.5 text-[16px] leading-[1.7] text-ink placeholder:text-gray-400 outline-none transition-colors focus:border-point-200 focus:ring-0`}
                placeholder="만들려는 것과 생각하시는 일정을 편하게 적어 주세요."
              />
            </div>
            {/* 봇 걸러내기 - 사람에게는 보이지 않는 칸. 채워져 오면 서버가 보내지 않는다 */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="website">웹사이트</label>
              <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>

            {submitStatus === 'success' && (
              <p className="rounded-card-sm bg-[#e8f8f0] px-5 py-4 text-[15px] font-bold text-[#0b7a47]">
                메시지가 성공적으로 전송되었습니다.
              </p>
            )}
            {submitStatus === 'error' && (
              <p className="rounded-card-sm bg-[#fdeeee] px-5 py-4 text-[15px] font-bold text-[#c2373b]">
                {errorMessage || '오류가 발생했습니다. 다시 시도해주세요.'}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <button type="submit" disabled={isSubmitting} className={`${btnPoint} min-w-[200px]`}>
                {isSubmitting ? '전송 중...' : (
                  <>
                    <FiSend size={16} />
                    문의 보내기
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* 다른 창구 */}
          <motion.div {...inView} variants={stagger} className="mx-auto mt-20 grid max-w-[880px] gap-3 sm:mt-24 md:grid-cols-2">
            <motion.a variants={fadeUp} href={KAKAO_OPEN_CHAT_URL} target="_blank" rel="noopener noreferrer"
              className={`group flex flex-col justify-between gap-8 bg-[#FEE500] p-7 transition-colors hover:bg-[#FDD835] sm:p-8 ${radiusCard}`}>
              <div>
                <p className="flex items-center gap-2.5 text-[18px] font-bold text-[#3C1E1E]">
                  <RiKakaoTalkFill size={24} /> 카카오톡 문의
                </p>
                <p className="mt-2 text-[15px] text-[#3C1E1E]/70">1:1 오픈채팅 · 가장 빠른 창구입니다</p>
              </div>
              <span className="inline-flex items-center gap-2 text-[15px] font-bold text-[#3C1E1E]">
                채팅 시작하기
                <FiArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </motion.a>
            <motion.div variants={fadeUp} className={`flex flex-col justify-between gap-6 border border-line bg-gray-100 p-7 sm:p-8 ${radiusCard}`}>
              <p className="text-[18px] font-bold text-ink">바로 연락하기</p>
              <div className="space-y-3">
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 break-all text-[16px] text-ink-2 hover:text-point-200">
                  <FiMail size={18} className="shrink-0 text-point-200" />{CONTACT_EMAIL}
                </a>
                <a href={`tel:${CONTACT_PHONE}`} className="flex items-center gap-3 text-[16px] text-ink-2 hover:text-point-200">
                  <FiPhone size={18} className="shrink-0 text-point-200" />{CONTACT_PHONE}
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ━━ FAQ ━━ */}
      <section id="faq" data-header="light" className="bg-gray-100 py-24 sm:py-32 xl:py-[140px]">
        <div className={container}>
          <SectionHead align="center" eyebrow="FAQ" title={<b>자주 묻는 질문</b>}
            desc="궁금한 점이 있으시면 먼저 읽어 보세요." />
          <div className="mx-auto mt-12 max-w-[880px] sm:mt-14">
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>
    </>
  );
}
