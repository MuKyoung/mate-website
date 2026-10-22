// lazygyu/roulette (MIT, ./LICENSE) 의 physics-box2d.ts.
// 원본은 box2d-wasm 을 쓰는데, 웹어셈블리 파일을 따로 서빙하지 않으려고 같은 Box2D 를 옮긴 planck.js 로 바꿨다.
// 중력, 반지름, 밀도, 반발 계수, 반복 횟수 같은 수치는 원본 그대로다.
import { Box, Circle, Edge, World, type Body } from 'planck';
import type { StageDef } from './maps';
import type { MapEntity, MapEntityState } from './types';

/** box2d 의 b2Vec2::Normalize 가 길이를 0 으로 보는 문턱 */
const EPSILON = 1.1920929e-7;

export class Physics {
  private world = new World({ gravity: { x: 0, y: 10 } });

  private marbleMap: { [id: number]: Body } = {};
  private entities: ({ body: Body } & MapEntityState)[] = [];

  private deleteCandidates: Body[] = [];

  clear(): void {
    this.clearEntities();
  }

  clearMarbles(): void {
    Object.values(this.marbleMap).forEach((body) => {
      this.world.destroyBody(body);
    });
    this.marbleMap = {};
  }

  createStage(stage: StageDef): void {
    this.createEntities(stage.entities);
  }

  private createEntities(entities?: MapEntity[]) {
    if (!entities) return;

    entities.forEach((entity) => {
      const body = this.world.createBody({ type: entity.type });
      const { density, restitution } = entity.props;
      const shape = entity.shape;

      switch (shape.type) {
        case 'box':
          body.createFixture({
            shape: new Box(shape.width, shape.height, { x: 0, y: 0 }, shape.rotation),
            density,
            restitution,
          });
          break;
        case 'polyline':
          // 원본처럼 선분마다 밀도 1 인 양면 선을 붙인다. 반발 계수는 엔티티 값이 아니라 기본값(0)이다
          for (let i = 0; i < shape.points.length - 1; i++) {
            const [x1, y1] = shape.points[i];
            const [x2, y2] = shape.points[i + 1];
            body.createFixture(new Edge({ x: x1, y: y1 }, { x: x2, y: y2 }), 1);
          }
          break;
        case 'circle':
          body.createFixture({ shape: new Circle(shape.radius), density, restitution });
          break;
      }

      body.setAngularVelocity(entity.props.angularVelocity);
      body.setTransform({ x: entity.position.x, y: entity.position.y }, 0);
      this.entities.push({
        body,
        x: entity.position.x,
        y: entity.position.y,
        angle: 0,
        shape,
        life: entity.props.life ?? -1,
      });
    });
  }

  private clearEntities() {
    this.entities.forEach((entity) => {
      this.world.destroyBody(entity.body);
    });
    this.entities = [];
  }

  createMarble(id: number, x: number, y: number): void {
    const body = this.world.createBody({ type: 'dynamic', position: { x, y } });
    body.createFixture(new Circle(0.25), 1 + Math.random());
    body.setAwake(false);
    body.setActive(false);
    this.marbleMap[id] = body;
  }

  shakeMarble(id: number): void {
    const body = this.marbleMap[id];
    if (body) {
      body.applyLinearImpulse(
        { x: Math.random() * 10 - 5, y: Math.random() * 10 - 5 },
        body.getWorldCenter(),
        true
      );
    }
  }

  removeMarble(id: number): void {
    const marble = this.marbleMap[id];
    if (marble) {
      this.world.destroyBody(marble);
      delete this.marbleMap[id];
    }
  }

  getMarblePosition(id: number): { x: number; y: number; angle: number } {
    const marble = this.marbleMap[id];
    if (marble) {
      const pos = marble.getPosition();
      return { x: pos.x, y: pos.y, angle: marble.getAngle() };
    } else {
      return { x: 0, y: 0, angle: 0 };
    }
  }

  getEntities(): MapEntityState[] {
    return this.entities.map((entity) => {
      return {
        ...entity,
        angle: entity.body.getAngle(),
      };
    });
  }

  impact(id: number): void {
    const src = this.marbleMap[id];
    if (!src) return;
    const origin = src.getPosition();

    Object.values(this.marbleMap).forEach((body) => {
      if (body === src) return;

      const pos = body.getPosition();
      let dx = pos.x - origin.x;
      let dy = pos.y - origin.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < 100) {
        // 원본은 방향을 단위 벡터로 만든 뒤 그 길이로 세기를 구한다. 그래서 거리 10 안이면 모두 같은 세기로 밀린다
        const len = Math.sqrt(distSq);
        if (len >= EPSILON) {
          dx /= len;
          dy /= len;
        }
        const power = 1 - Math.sqrt(dx * dx + dy * dy) / 10;
        const scale = power * power * 5;
        body.applyLinearImpulse({ x: dx * scale, y: dy * scale }, body.getWorldCenter(), true);
      }
    });
  }

  start(): void {
    for (const key in this.marbleMap) {
      const marble = this.marbleMap[key];
      marble.setAwake(true);
      marble.setActive(true);
    }
  }

  step(deltaSeconds: number): void {
    this.deleteCandidates.forEach((body) => {
      this.world.destroyBody(body);
    });
    this.deleteCandidates = [];

    this.world.step(deltaSeconds, 6, 2);

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      if (entity.life > 0 && isTouching(entity.body)) {
        this.deleteCandidates.push(entity.body);
        this.entities.splice(i, 1);
      }
    }
  }
}

/** 부서지는 벽에 구슬이 닿았는지 */
function isTouching(body: Body): boolean {
  for (let edge = body.getContactList(); edge; edge = edge.next) {
    if (edge.contact.isTouching()) return true;
  }
  return false;
}
