'use client';

import { practices } from '@/data/practices';
import { Card, Row, Section } from '@/components/home/kit';

/**
 * 일하는 방식 - 프로젝트가 흘러가는 순서대로.
 *
 * 문장은 practices.ts 것을 그대로 쓴다. 고객이 계약 조건처럼 읽는 목록이라
 * 여기서 말을 보태지 않는다.
 */
export default function Practices() {
  return (
    <Section id="practices" title="일하는 방식" summary="프로젝트가 흘러가는 순서대로 적었습니다.">
      <Card>
        <ol>
          {practices.map((v) => (
            <Row key={v.title} main={v.title} sub={v.desc} />
          ))}
        </ol>
      </Card>
    </Section>
  );
}
