// lazygyu/roulette (MIT, ./LICENSE) 의 utils/utils.ts, utils/Vector.ts, utils/transformGuard.ts.
import type { VectorLike } from './types';

export function rad(degree: number) {
  return (Math.PI * degree) / 180;
}

function getRegexValue(regex: RegExp, str: string) {
  const result = regex.exec(str);
  return result ? result[1] : '';
}

/** '이름*개수/가중치' 를 나눈다. 개수만큼 구슬이 생기고, 가중치가 높을수록 스킬을 자주 쓴다 */
export function parseName(nameStr: string) {
  const weightRegex = /\/(\d+)/;
  const countRegex = /\*(\d+)/;
  const hasWeight = weightRegex.test(nameStr);
  const hasCount = countRegex.test(nameStr);
  const name = getRegexValue(/^\s*([^/*]+)?/, nameStr);
  if (!name) return null;
  const weight = hasWeight ? parseInt(getRegexValue(weightRegex, nameStr), 10) : 1;
  const count = hasCount ? parseInt(getRegexValue(countRegex, nameStr), 10) : 1;
  return {
    name,
    weight,
    count,
  };
}

export function pad(v: number) {
  return v.toString().padStart(2, '0');
}

export function shuffle<T>(originalArray: T[]): T[] {
  const array = originalArray.slice();
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function transformGuard(ctx: CanvasRenderingContext2D, func: (ctx: CanvasRenderingContext2D) => void): void {
  const originalTransform = ctx.getTransform();
  func(ctx);
  ctx.setTransform(originalTransform);
}

export class Vector {
  static sub(v1: VectorLike, v2: VectorLike): VectorLike {
    return { x: v2.x - v1.x, y: v2.y - v1.y };
  }

  static lenSq(v: VectorLike) {
    return v.x * v.x + v.y * v.y;
  }

  static mul(v: VectorLike, scalar: number) {
    return { x: v.x * scalar, y: v.y * scalar };
  }

  static add(v1: VectorLike, v2: VectorLike) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
}
