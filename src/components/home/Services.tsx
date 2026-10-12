'use client';

import { domains } from '@/data/domains';
import { games } from '@/data/games';
import { Badge, Card, GroupLabel, Row, Section } from '@/components/home/kit';

/**
 * 하는 일 - 맡는 세 영역과, 그와 나란한 자체 게임.
 *
 * 자체 게임은 외주에서 나온 것이 아니라 따로 하는 사업이다. 같은 목록에 넣지 않고
 * 묶음을 나눈다. 두 타이틀 다 제작 중이라 보낼 스토어도 상세 페이지도 아직 없어
 * 누르는 줄로 만들지 않는다.
 */
export default function Services() {
  return (
    <Section id="services" title="하는 일" summary="웹 · 앱, 게임 · XR, 교육. 어느 영역이든 창구는 하나입니다.">
      <Card>
        <ul>
          {domains.map((d) => (
            <Row key={d.key} main={d.kr} sub={d.lead} href={`/${d.slug}`} />
          ))}
        </ul>
      </Card>

      <GroupLabel>자체 게임 제작 · 퍼블리싱</GroupLabel>
      <Card>
        <ul>
          {games.map((g) => (
            <Row key={g.id} main={g.title} trail={<Badge>{g.status}</Badge>} />
          ))}
        </ul>
        <p className="px-6 pb-6 pt-1 text-sub text-[var(--text-3)] medium:px-7">
          MATE 이름으로 내는 게임입니다. 기획부터 퍼블리싱까지 직접 합니다.
          공개할 수 있는 단계가 되면 여기에 올립니다.
        </p>
      </Card>
    </Section>
  );
}
