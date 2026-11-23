import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import SectionHead from '@/components/ui/SectionHead';
import { landingDesigns } from '@/data/landingDesigns';
import { landingSampleNotes, templateSampleNotes } from '@/data/landingService';
import { templates } from '@/data/templateLibrary';
import { LANDING_ORIGIN } from '@/lib/shell';
import { container } from '@/lib/styles';

export const metadata: Metadata = {
  title: '샘플 · 출처 안내',
  description: '랜딩페이지 디자인과 디자인 템플릿 갤러리의 샘플 안내, 디자인 · 사진 출처와 권리 표시입니다.',
  robots: { index: false, follow: true },
};

/** 외부 디자인 기반 샘플의 출처 - 같은 원본 파일은 한 줄로 묶는다 */
const templateCredits = (() => {
  const m = new Map<string, { text: string; sourceUrl: string; licenseUrl: string; ids: string[] }>();
  for (const d of landingDesigns) {
    if (d.kind !== 'template' || !d.credit) continue;
    const key = d.credit.sourceUrl;
    if (!m.has(key)) m.set(key, { text: d.credit.text, sourceUrl: d.credit.sourceUrl, licenseUrl: d.credit.licenseUrl, ids: [] });
    m.get(key)!.ids.push(d.id);
  }
  return [...m.values()];
})();
const krds = landingDesigns.filter((d) => d.kind === 'mate' && d.credit);
const photographerCount = new Set(templates.flatMap((t) => t.credits.map((c) => c.name))).size;

const link = 'underline hover:text-point-200';
const range = (ids: string[]) => (ids.length > 1 ? `${ids[0]}~${ids[ids.length - 1]}` : ids[0]);

/**
 * 샘플 · 출처 안내 - 랜딩페이지 하위 도메인 갤러리 아래에 있던 안내를 본 사이트로 옮겼다. 푸터의 '출처 안내'로 온다.
 * 디자인 · 템플릿마다의 출처는 각 상세 화면에도 그대로 있다.
 */
export default function CreditsPage() {
  return (
    <>
      <PageHeader eyebrow="안내" title={<><b>샘플 · 출처 안내</b></>}
        desc="랜딩페이지 디자인과 디자인 템플릿 갤러리의 샘플 안내, 디자인과 사진의 출처, 권리 표시입니다." />

      <section data-header="light" className="bg-white py-20 sm:py-24">
        <div className={container}>
          <SectionHead title={<><b>랜딩페이지 디자인</b></>}
            desc={<a href={`${LANDING_ORIGIN}/`} className={link}>{LANDING_ORIGIN.replace('https://', '')}</a>} />
          <div className="mt-8 grid max-w-[980px] gap-3 text-[15px] leading-[1.7] text-gray-500">
            {landingSampleNotes.map((n) => <p key={n}>{n}</p>)}
          </div>
          <ul className="mt-8 border-t border-gray-200 text-[13px] leading-[1.6] text-gray-500">
            {templateCredits.map((c) => (
              <li key={c.sourceUrl} className="border-b border-gray-200 py-3">
                <span className="mr-2 font-mono text-ink">{range(c.ids)}</span>
                {c.text}{' '}
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className={link}>원본</a>{' · '}
                <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className={link}>CC BY 4.0</a>
              </li>
            ))}
            {krds.length > 0 && krds[0].credit && (
              <li className="border-b border-gray-200 py-3">
                <span className="mr-2 font-mono text-ink">{range(krds.map((d) => d.id))}</span>
                {krds[0].credit.text}{' '}
                <a href={krds[0].credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={link}>원본</a>{' · '}
                <a href={krds[0].credit.licenseUrl} target="_blank" rel="noopener noreferrer" className={link}>{krds[0].credit.license}</a>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section data-header="light" className="bg-gray-100 py-20 sm:py-24">
        <div className={container}>
          <SectionHead title={<><b>디자인 템플릿</b></>}
            desc={<a href={`${LANDING_ORIGIN}/templates/`} className={link}>{LANDING_ORIGIN.replace('https://', '')}/templates</a>} />
          <div className="mt-8 grid max-w-[980px] gap-3 text-[15px] leading-[1.7] text-gray-500">
            {templateSampleNotes.map((n) => <p key={n}>{n}</p>)}
            <p>
              사진가 {photographerCount}명의 사진을 썼고, 사진가 이름과 원본 주소는 템플릿마다 상세 화면에 있습니다.{' '}
              <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className={link}>Unsplash License</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
