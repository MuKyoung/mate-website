import type { Metadata } from 'next';
import ShellScope from './ShellScope';

export const metadata: Metadata = {
  title: 'Hub',
  description: 'MATE 내부 Hub - 작업 · 위키 · 메모 · 보고',
  // 사내 도구는 검색에 노출하지 않는다
  robots: { index: false, follow: false, nocache: true },
};

/**
 * 작업 관리 도구 셸.
 *
 * 마케팅 사이트와 같은 루트 레이아웃을 쓰지만 보이는 것은 공유하지 않는다.
 * 아래 스크립트가 html 에 data-shell="app" 을 다는 순간
 * globals.css 가 다크 캔버스·필름 그레인·관성 스크롤을 전부 끈다.
 * (Header·Footer·플로팅 버튼은 각 컴포넌트가 이 경로에서 스스로 빠진다.)
 */
export default function TaskManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 첫 페인트 전에 셸을 전환해 다크 플래시를 막는다 */}
      <script
        dangerouslySetInnerHTML={{
          // 다크 모드도 같은 때 정한다(ShellScope.tsx 와 같은 규칙: 'tm-theme' 이 없으면 기기 설정)
          __html:
            "var d=document.documentElement;d.setAttribute('data-shell','app');" +
            "try{var t=localStorage.getItem('tm-theme');if(t!=='light'&&t!=='dark')" +
            "t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-tm-theme',t)}catch(e){}",
        }}
      />
      {/* 라우트를 떠날 때 속성을 떼어 마케팅 사이트가 라이트 셸을 물려받지 않게 한다 */}
      <ShellScope />
      {children}
    </>
  );
}
