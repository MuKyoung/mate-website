// lazygyu/roulette (MIT, ./LICENSE) 의 particle.ts, particleManager.ts, skillEffect.ts, zoomZone.ts.
import type { ZoomZone } from './maps';
import type { ColorTheme, GameObject, VectorLike } from './types';
import { rad, Vector } from './utils';

const particleLifetime = 3000;

/** 당첨 때 화면 오른쪽 아래에서 터지는 색종이 */
class Particle {
  private _elapsed: number = 0;
  position: VectorLike = { x: 0, y: 0 };
  force: VectorLike = { x: 0, y: 0 };
  color: string = '';
  isDestroy: boolean = false;

  constructor(x: number, y: number) {
    this.position.x = x;
    this.position.y = y;

    const force = Math.random() * 250;
    const ang = rad(90 * Math.random() - 180);
    const fx = Math.cos(ang) * force;
    const fy = Math.sin(ang) * force;
    this.color = `hsl(${Math.random() * 360} 50% 50%)`;
    this.force = { x: fx, y: fy };
  }

  update(deltaTime: number) {
    this._elapsed += deltaTime;
    const delta = Vector.mul(this.force, deltaTime / 100);
    this.position = Vector.add(this.position, delta);
    this.force.y += (10 * deltaTime) / 100;
    if (this._elapsed > particleLifetime) {
      this.isDestroy = true;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 1 - (this._elapsed / particleLifetime) ** 2;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, 20, 20);
    ctx.restore();
  }
}

export class ParticleManager {
  private _particles: Particle[] = [];

  update(deltaTime: number) {
    this._particles.forEach((particle) => {
      particle.update(deltaTime);
    });
    this._particles = this._particles.filter((particle) => !particle.isDestroy);
  }

  render(ctx: CanvasRenderingContext2D) {
    this._particles.forEach((particle) => particle.render(ctx));
  }

  shot(x: number, y: number) {
    for (let i = 0; i < 200; i++) {
      this._particles.push(new Particle(x, y));
    }
  }
}

const skillLifetime = 500;

/** 구슬이 스킬(충격파)을 쓸 때 퍼지는 원 */
export class SkillEffect implements GameObject {
  private _size: number = 0;
  position: VectorLike;
  private _elapsed: number = 0;
  isDestroy: boolean = false;

  constructor(x: number, y: number) {
    this.position = { x, y };
  }

  update(deltaTime: number) {
    this._elapsed += deltaTime;
    this._size = (this._elapsed / skillLifetime) * 10;
    if (this._elapsed > skillLifetime) {
      this.isDestroy = true;
    }
  }

  render(ctx: CanvasRenderingContext2D, zoom: number, theme: ColorTheme) {
    ctx.save();
    const rate = this._elapsed / skillLifetime;
    ctx.globalAlpha = 1 - rate * rate;
    ctx.strokeStyle = theme.skillColor;
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this._size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * (x, y) 의 연출 강도. 구역 밖은 0, 가장자리 0 에서 가운데 1 까지 오른다 (사각형 모양으로).
 * 여러 구역에 걸치면 가장 센 값
 */
export function zoomZoneIntensity(zones: ZoomZone[], x: number, y: number): number {
  let best = 0;
  for (const z of zones) {
    const hw = z.w / 2;
    const hh = z.h / 2;
    if (hw <= 0 || hh <= 0) continue;
    const t = 1 - Math.max(Math.abs(x - z.x) / hw, Math.abs(y - z.y) / hh);
    if (t > best) best = t;
  }
  return best;
}
