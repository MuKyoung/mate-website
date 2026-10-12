'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { homeCredentials } from '@/data/domains';
import { affiliations, type Award } from '@/data/teamCapabilities';
import { Card, GroupLabel, Row, Section } from '@/components/home/kit';
import { fadeUp, inView } from '@/lib/motion';
import { btnOutline } from '@/lib/styles';

/**
 * 밖에서 받은 평가 - 소속과, 확인할 수 있는 심사 · 전시 이력.
 *
 * 소속은 이름과 관계만 적는다. 상대 기관과 무엇을 함께 하는지는 받은 내용이 없다.
 * 이력은 해마다 묶는다.
 */

/** 연도별 묶음 - homeCredentials 는 이미 최근 순이다 */
const byYear = homeCredentials.reduce<{ year: number; items: Award[] }[]>((groups, a) => {
  const group = groups.find((g) => g.year === a.year);
  if (group) group.items.push(a);
  else groups.push({ year: a.year, items: [a] });
  return groups;
}, []);

export default function Recognition() {
  return (
    <Section id="recognition" title="밖에서 받은 평가"
      summary="전시 참가 이력을 포함한 전체 목록은 팀 페이지에 있습니다.">
      <GroupLabel>소속</GroupLabel>
      <Card>
        <ul>
          {affiliations.map((a) => <Row key={a.id} main={a.name} trail={a.role} />)}
        </ul>
      </Card>

      {byYear.map((g) => (
        <div key={g.year} className="space-y-4">
          <GroupLabel>{g.year}년</GroupLabel>
          <Card>
            <ul>
              {g.items.map((a) => (
                <Row key={a.id} main={a.title} sub={a.organization} trail={a.rank} />
              ))}
            </ul>
          </Card>
        </div>
      ))}

      <motion.div {...inView} variants={fadeUp} className="pt-1">
        <Link href="/team" className={`${btnOutline} w-full medium:w-auto`}>수상 · 전시 전체 보기</Link>
      </motion.div>
    </Section>
  );
}
