import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';

/**
 * 웹사이트 화면 캡처를 담는 브라우저 틀. 주소줄에 실제 주소를 적는다.
 * 캡처는 원래 색 그대로 둔다 - 작업 결과물이다.
 */
export default function BrowserFrame({
  src,
  alt,
  url,
  className = '',
}: {
  src: string | undefined;
  alt: string;
  url: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-card-sm border border-line bg-white shadow-float-lg lg:rounded-card ${className}`}>
      <div className="flex h-10 items-center gap-3 border-b border-line bg-gray-100 px-4">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-pill bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-pill bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-pill bg-gray-300" />
        </span>
        <span className="truncate rounded-[4px] bg-white px-3 py-1 font-mono text-[11px] tracking-[0.02em] text-ink-3">{url}</span>
      </div>
      <div className="relative aspect-[16/10]">
        <SafeImage src={src} alt={alt} fill className="absolute inset-0 [&_img]:!object-top" placeholder={<ThumbFallback />} />
      </div>
    </div>
  );
}
