import SafeImage from '@/components/SafeImage';
import ThumbFallback from '@/components/ThumbFallback';

/**
 * 파란 단색으로 누른 사진.
 *
 * 사이트가 파랑 하나로 묶여 있어서, 배경으로 깔리는 사진은 흑백으로 뺀 뒤
 * 파랑을 color 로 섞어 같은 색 안에 넣는다. reveal 을 켜면 호버할 때 원래 색이 돌아온다
 * (부모에 group 클래스가 있어야 한다). 작업물을 보여 주는 자리에서는 이걸 쓰지 않고
 * 원본 색 그대로 둔다 - 고객이 보는 것은 실제 결과물이어야 한다.
 */
export default function BlueImage({
  src,
  alt = '',
  className = '',
  reveal = false,
  label,
}: {
  src: string | undefined;
  alt?: string;
  className?: string;
  reveal?: boolean;
  /** 사진이 없을 때 대신 서는 면의 글자 */
  label?: string;
}) {
  const back = reveal ? 'transition-[filter,opacity] duration-700 group-hover:grayscale-0 group-hover:brightness-100' : '';
  const tint = reveal ? 'transition-opacity duration-700 group-hover:opacity-0' : '';
  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      <SafeImage src={src} alt={alt} fill
        className={`absolute inset-0 grayscale contrast-[1.15] brightness-[0.82] ${back}`}
        placeholder={<ThumbFallback label={label} />} />
      <div aria-hidden className={`absolute inset-0 bg-[#2a62ff] mix-blend-color ${tint}`} />
      <div aria-hidden className={`absolute inset-0 bg-[#061a5a] mix-blend-multiply opacity-30 ${tint}`} />
    </div>
  );
}
