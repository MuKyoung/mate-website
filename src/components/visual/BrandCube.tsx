'use client';

import Image from 'next/image';
import { motion, type MotionValue } from 'framer-motion';

/**
 * 첫 화면 가운데에서 천천히 도는 큐브.
 *
 * 세로축으로 돌고 위에서 내려다보도록 살짝 기울여, 옆면 넷이 차례로 앞에 오고 윗면이 늘 보인다.
 * 옆면 순서: 웹 · 앱 → 게임 · XR → 교육 · 브랜딩 → MATE 로고. 윗면과 밑면은 수평선 빛.
 * 마우스를 올리면 멈춰 글자를 읽을 수 있다. 장식이라 스크린리더에는 숨긴다
 * (같은 영역 목록이 바로 아래 정보 줄에 링크로 있다).
 *
 * 회전은 세 겹으로 나눈다. 바깥 - 고정된 기울기, 가운데 - 스크롤이 더하는 회전(spin),
 * 안쪽 - 계속 도는 CSS 애니메이션. 기울기를 바깥에 두어야 스크롤 회전이 더해져도 축이 흔들리지 않는다.
 * 크기와 회전은 globals.css 의 .cube-* 에 있다.
 */

type Face = {
  side: 'front' | 'right' | 'back' | 'left';
  no: string;
  label: string;
  en: string;
  tone: 'blue' | 'dark' | 'light';
};

const SIDES: Face[] = [
  { side: 'front', no: '01', label: '웹 · 앱', en: 'Web & App', tone: 'blue' },
  { side: 'right', no: '02', label: '게임 · XR', en: 'Game & XR', tone: 'dark' },
  { side: 'back', no: '03', label: '교육 · 브랜딩', en: 'Education & Branding', tone: 'light' },
];

export default function BrandCube({ spin }: { spin?: MotionValue<number> }) {
  return (
    <div className="cube-wrap" aria-hidden>
      <div className="cube-stage">
        <div className="cube-tilt">
          <motion.div className="cube-scroll" style={spin ? { rotateY: spin } : undefined}>
            <div className="cube-spin">
              {SIDES.map((f) => (
                <div key={f.side} className={`cube-face cube-face--${f.side} cube-tone--${f.tone}`}>
                  <span className="cube-meta">
                    <span>{f.no}</span>
                    <span className="cube-dot" />
                  </span>
                  <span className="cube-label">{f.label}</span>
                  <span className="cube-meta">{f.en}</span>
                </div>
              ))}

              {/* 넷째 옆면 - 로고 */}
              <div className="cube-face cube-face--left cube-tone--dark">
                <span className="cube-meta"><span>04</span><span className="cube-dot" /></span>
                <Image src="/images/logo.png" alt="" width={1991} height={493}
                  className="mx-auto h-auto w-[72%] brightness-0 invert" />
                <span className="cube-meta">devteammate.co.kr</span>
              </div>

              {/* 윗면 · 밑면 - 수평선 빛을 작게 담는다 */}
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
