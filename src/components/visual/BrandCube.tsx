'use client';

import Image from 'next/image';
import { motion, type MotionValue } from 'framer-motion';

/**
 * 첫 화면 가운데에서 천천히 도는 큐브.
 *
 * 세로축으로 돌고 위에서 내려다보도록 살짝 기울여, 옆면 넷이 차례로 앞에 오고 윗면이 늘 보인다.
 * 옆면 순서: 웹 · 앱 → 게임 · XR → 교육 · 브랜딩 → MATE 로고. 윗면과 밑면은 수평선 빛.
 * 마우스를 올리면 멈춰 글자와 그림을 볼 수 있다. 장식이라 스크린리더에는 숨긴다.
 *
 * 면마다 그 영역의 실제 작업 화면을 담는다. 홈 아래쪽(영역 슬래브, 최근 작업)에 이미 쓰인
 * 그림은 고르지 않는다 - 한 화면에 같은 그림이 두 번 나오지 않게 한다.
 * 작업 화면이라 파랗게 누르지 않고 원래 색 그대로 둔다.
 *
 * 회전은 세 겹으로 나눈다. 바깥 - 고정된 기울기, 가운데 - 스크롤이 더하는 회전(spin),
 * 안쪽 - 계속 도는 CSS 애니메이션. 기울기를 바깥에 두어야 스크롤 회전이 더해져도 축이 흔들리지 않는다.
 * 크기와 회전은 globals.css 의 .cube-* 에 있다.
 */

type Face = {
  side: 'front' | 'right' | 'back';
  no: string;
  label: string;
  en: string;
  tone: 'blue' | 'dark' | 'light';
  img: string;
  /** 그림에서 보여 줄 부분 (object-position) */
  focus: string;
};

const SIDES: Face[] = [
  // 세종호이스트크레인 홈페이지 - 고객사가 게재를 허락했다 (2026-10-16)
  { side: 'front', no: '01', label: '웹 · 앱', en: 'Web & App', tone: 'blue',
    img: '/images/projects/세종호이스트크레인.webp', focus: '50% 30%' },
  // VR 중고차 구매 가이드 - 포스터의 VR 장면 칸이 보이도록 아래쪽을 잡는다
  { side: 'right', no: '02', label: '게임 · XR', en: 'Game & XR', tone: 'dark',
    img: '/images/projects/VR 중고차 구매 가이드.webp', focus: '50% 54%' },
  // ITLand - 저소득층 아동을 위한 VR 코딩 교육 프로그램
  { side: 'back', no: '03', label: '교육 · 브랜딩', en: 'Education & Branding', tone: 'light',
    img: '/images/projects/햄부기.webp', focus: '50% 62%' },
];

export default function BrandCube({ spin }: { spin?: MotionValue<number> }) {
  return (
    <div className="cube-wrap" aria-hidden>
      <div className="cube-stage">
        <div className="cube-tilt">
          <motion.div className="cube-scroll" style={spin ? { rotateY: spin } : undefined}>
            <div className="cube-spin">
              {SIDES.map((f, i) => (
                <div key={f.side} className={`cube-face cube-face--${f.side} cube-tone--${f.tone}`}>
                  <span className="cube-meta">
                    <span>{f.no}</span>
                    <span className="cube-dot" />
                  </span>
                  <span className="cube-media">
                    <Image src={f.img} alt="" fill priority={i === 0} sizes="440px"
                      className="object-cover" style={{ objectPosition: f.focus }} />
                  </span>
                  <span className="cube-caption">
                    <span className="cube-label">{f.label}</span>
                    <span className="cube-meta">{f.en}</span>
                  </span>
                </div>
              ))}

              {/* 넷째 옆면 - 수평선 빛 위의 로고 */}
              <div className="cube-face cube-face--left cube-tone--dark">
                <span className="cube-meta"><span>04</span><span className="cube-dot" /></span>
                <span className="cube-media cube-media--glow">
                  <Image src="/images/logo.png" alt="" width={1991} height={493}
                    className="relative h-auto w-[62%] brightness-0 invert" />
                </span>
                <span className="cube-caption">
                  <span className="cube-label">MATE</span>
                  <span className="cube-meta">devteammate.co.kr</span>
                </span>
              </div>

              {/* 윗면 · 밑면 - 수평선 빛 */}
              <div className="cube-face cube-face--top cube-tone--glow" />
              <div className="cube-face cube-face--bottom cube-tone--glow" />
            </div>
          </motion.div>
        </div>
      </div>
      {/* 바닥의 파란 그림자 - 큐브가 떠오를 때 작아지고 내려앉을 때 커진다 */}
      <div className="cube-shadow" />
    </div>
  );
}
