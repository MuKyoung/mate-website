import type { Department } from '@/types';

export interface DepartmentInfo {
  id: Department;
  /** 부서명 (국문) */
  name: string;
  /** 부서명 (영문 라벨) */
  label: string;
  /** 실제 인원 수 */
  headcount: number;
  /** 담당 영역 요약 */
  description: string;
  /** 주요 담당 업무 */
  focus: string[];
}

/** MATE 조직 구성 — 총 7명 (개발 4 · 디자인 2 · 운영 1) */
export const departments: DepartmentInfo[] = [
  {
    id: 'development',
    name: '개발',
    label: 'Development',
    headcount: 4,
    description: 'Unity 게임 · AR/VR · 웹 · 앱까지 클라이언트와 서버를 모두 담당합니다.',
    focus: ['Unity 클라이언트', '웹 · 앱', '서버 · 인프라', 'AR / VR'],
  },
  {
    id: 'design',
    name: '디자인',
    label: 'Design',
    headcount: 2,
    description: '사용자 흐름 설계부터 인터페이스와 그래픽 리소스까지 책임집니다.',
    focus: ['UX 설계', 'UI 디자인', '그래픽 리소스', '디자인 시스템'],
  },
  {
    id: 'operations',
    name: '운영',
    label: 'Operations',
    headcount: 1,
    description: '일정과 커뮤니케이션을 관리해 프로젝트가 계획대로 굴러가게 합니다.',
    focus: ['프로젝트 관리', '일정 · 리스크', '고객 커뮤니케이션'],
  },
];

/** 전체 인원 */
export const totalHeadcount = departments.reduce((sum, d) => sum + d.headcount, 0);

/**
 * 프로젝트 참여자 ID → 소속 부서 매핑.
 * 실명·프로필을 노출하지 않기 위해, 프로젝트 상세에서는 이 매핑으로
 * 참여 인원 수와 부서 구성만 표시한다.
 */
export const memberDepartments: Record<string, Department> = {
  '1': 'development',
  '2': 'development',
  '3': 'design',
  '4': 'development',
};

/** 참여자 ID 목록 → 부서별 인원 집계 */
export function summarizeDepartments(memberIds: string[]) {
  const counts = new Map<Department, number>();
  memberIds.forEach((id) => {
    const dept = memberDepartments[id];
    if (dept) counts.set(dept, (counts.get(dept) ?? 0) + 1);
  });
  return departments
    .filter((d) => counts.has(d.id))
    .map((d) => ({ ...d, count: counts.get(d.id) as number }));
}
