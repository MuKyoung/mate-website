import type { Department } from '@/types';

export interface DepartmentInfo {
  id: Department;
  /** 부서명 (국문) */
  name: string;
  /** 부서명 (영문 라벨) */
  label: string;
  /** 담당 영역 요약 */
  description: string;
  /** 주요 담당 업무 */
  focus: string[];
}

/**
 * MATE 조직 구성.
 * 인원 수는 적지 않는다 (사용자 요청, 2026-10-16). 부서와 맡는 일만 둔다.
 */
export const departments: DepartmentInfo[] = [
  {
    id: 'development',
    name: '개발',
    label: 'Development',
    description: '웹 · 앱, 게임 · XR 양쪽에서 클라이언트와 서버를 모두 담당합니다.',
    focus: ['Unity 클라이언트', '웹 · 앱', '서버 · 인프라', 'AR / VR'],
  },
  {
    id: 'design',
    name: '디자인',
    label: 'Design',
    description: '사용자 흐름 설계부터 인터페이스와 그래픽 리소스까지 책임집니다.',
    focus: ['UX 설계', 'UI 디자인', '그래픽 리소스', '디자인 시스템'],
  },
  {
    id: 'operations',
    name: '운영',
    label: 'Operations',
    description: '일정과 커뮤니케이션을 관리해 프로젝트가 계획대로 굴러가게 합니다.',
    focus: ['프로젝트 관리', '일정 · 리스크', '고객 커뮤니케이션'],
  },
];
