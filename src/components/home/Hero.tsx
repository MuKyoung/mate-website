'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiChevronDown } from 'react-icons/fi';
import { teamCapabilities } from '@/data/teamCapabilities';
import { projects } from '@/data/projects';
import { stock } from '@/data/stock';
import { Eyebrow, Screen, ScreenBody } from '@/components/home/kit';
import { fadeUp, stagger, onMount } from '@/lib/motion';
import { arrowHover, btnOnPhotoQuiet, btnPrimary } from '@/lib/styles';

/**
 * 첫 화면 - 사진 한 장과 문장 하나.
 *
 * 사진은 밤의 도로를 지나는 불빛이다. 멈추지 않고 흐르는 것이 캐치프레이즈
 * ("멈추지 않게 만듭니다")와 맞는다. 스톡 사진이고 분위기만 잡는다.
 *
 * 사진 위의 어두운 막은 꾸밈이 아니라 글자를 읽히게 하려는 것이다.
 * 글자와 버튼이 놓이는 쪽만 누르고 불빛이 지나는 자리는 비워 둔다.
 *
 * 넓은 화면: 글과 버튼이 왼쪽 가운데에 모인다.
 * 좁은 화면: 글은 위에, 버튼은 아래(엄지가 닿는 곳)에 두고 그 사이로 불빛이 지나간다.
 *            그러려고 사진을 조금 키워 불빛을 화면 가운데 아래로 내린다.
 */

const { since } = teamCapabilities.stats;

/** 넓은 화면 - 왼쪽(글자가 놓이는 쪽)과 위아래를 누른다. 값은 글자 뒤 픽셀로 대비를 재서 정했다. */
const scrimWide =
  'linear-gradient(90deg, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0.70) 30%, rgba(8,8,8,0.22) 58%, rgba(8,8,8,0) 100%), ' +
  'linear-gradient(180deg, rgba(8,8,8,0.50) 0%, rgba(8,8,8,0) 22%, rgba(8,8,8,0) 64%, rgba(8,8,8,0.60) 100%)';
/** 좁은 화면 - 위(글)와 아래(버튼)를 누른다 */
const scrimNarrow =
  'linear-gradient(180deg, rgba(8,8,8,0.74) 0%, rgba(8,8,8,0.56) 38%, rgba(8,8,8,0.06) 56%, rgba(8,8,8,0.10) 68%, rgba(8,8,8,0.78) 100%)';

export default function Hero() {
  return (
    <Screen id="top" tone="photo">
      {/* 사진은 움직임 없이 바로 보인다. 스크립트가 늦게 와도 첫 화면이 비어 있지 않다. */}
      <div className="absolute inset-0 origin-top scale-[1.3] expanded:scale-100">
        <Image src={stock.hero.src} alt="" fill priority sizes="100vw" className="object-cover object-[72%_50%]" />
      </div>
      <div aria-hidden className="absolute inset-0 expanded:hidden" style={{ background: scrimNarrow }} />
      <div aria-hidden className="absolute inset-0 hidden expanded:block" style={{ background: scrimWide }} />

      <ScreenBody>
        <motion.div {...onMount} variants={stagger}
          className="flex max-w-[46rem] flex-1 flex-col justify-between expanded:flex-none expanded:justify-start">
          <div>
            <motion.div variants={fadeUp}>
              <Eyebrow className="text-[var(--text-2)]">SI · Publishing · Since {since}</Eyebrow>
            </motion.div>

            <motion.h1 id="top-title" variants={fadeUp} className="type-hero mt-5">
              <span className="block">멈추지 않게</span>
              <span className="block">만듭니다</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-body text-[var(--text-2)] expanded:text-lst">
              {/* 문장 단위로 끊는다 - 흘려 두면 마지막 낱말만 다음 줄로 떨어진다 */}
              <span className="block">만드는 것과 돌아가게 하는 것은 다릅니다.</span>
              <span className="block">그래서 배포한 뒤까지 봅니다.</span>
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="mt-9 grid gap-2 medium:flex medium:flex-wrap">
            <Link href="/contact" className={btnPrimary}>
              프로젝트 문의
              <FiArrowUpRight aria-hidden size={17} className={arrowHover} />
            </Link>
            <Link href="/projects" className={btnOnPhotoQuiet}>포트폴리오 {projects.length}건</Link>
          </motion.div>
        </motion.div>
      </ScreenBody>

      {/* 아래에 화면이 더 있다는 표시. 움직이지 않는다 - 계속 까딱이는 것은 읽는 데 방해가 된다. */}
      <p aria-hidden
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-1.5 text-min font-medium text-[var(--text-3)] expanded:flex">
        아래로
        <FiChevronDown size={15} />
      </p>
    </Screen>
  );
}
