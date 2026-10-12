'use client';

import { counts, teamCapabilities } from '@/data/teamCapabilities';
import { departments, totalHeadcount } from '@/data/organization';
import { Card, Row, Section } from '@/components/home/kit';

/**
 * 소개 - 서비스를 나열하기 전에 어떤 회사인지부터 답한다.
 *
 * 숫자(연도, 건수, 인원)는 적어 넣지 않고 데이터에서 가져온다.
 * 두 축의 문장은 진행 절차의 '배포 후 모니터링' 과 FAQ 의 '완료 후 유지보수' 에서 온 것이다.
 */

const { since } = teamCapabilities.stats;
const roster = departments.map((d) => `${d.name} ${d.headcount}`).join(' · ');

export default function About() {
  return (
    <Section id="about" title="소개" summary="맡아서 만들고, 저희 이름으로도 냅니다.">
      <Card className="px-6 py-7 medium:px-7 medium:py-8">
        <p className="text-dlg font-medium text-[var(--text-1)]">
          MATE는 SI 개발과 자체 퍼블리싱을 함께 하는 팀입니다.
        </p>
        <p className="mt-4 text-body text-[var(--text-2)]">
          {since}년에 시작해 웹 · 앱, 게임 · XR, 교육으로 영역을 넓혀 왔습니다.
          그와 별개로 저희 게임도 만듭니다. 지금 두 타이틀을 기획부터 퍼블리싱까지 직접 하고 있습니다.
        </p>
        <p className="mt-3 text-body text-[var(--text-2)]">
          두 사업의 기준은 같습니다. 만든 것이 멈추지 않아야 한다는 것.
          {' '}{roster}, {totalHeadcount}명이 한 팀으로 움직입니다.
        </p>
      </Card>

      <Card>
        <ul>
          <Row main="개발 전문성"
            sub={`${since}년부터 웹 · 앱과 게임 · XR ${counts.devProjects}건을 납품하고, 강의 ${counts.lectures}건을 진행했습니다.`} />
          <Row main="배포 안정성"
            sub="배포한 뒤에도 모니터링으로 안정성을 확인합니다. 끝난 뒤의 버그 수정과 업데이트도 이어서 맡습니다." />
          <Row main="팀 전체 보기" href="/team" />
        </ul>
      </Card>
    </Section>
  );
}
