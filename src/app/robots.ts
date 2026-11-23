import { MetadataRoute } from 'next';

/**
 * AI 학습용 수집 로봇 - 사이트 전체를 막는다(2026-11-24 사용자 결정).
 * AI 검색 · 사용자 요청 로봇(OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot 등)은
 * AI 검색 답에 MATE 가 나오도록 열어 둔다. 규칙을 지키지 않는 로봇은 Vercel 방화벽 사용자 규칙
 * 'AI 학습 수집 차단' 이 같은 이름으로 거절한다 - 목록을 바꾸면 그 규칙도 같이 고친다.
 * Google-Extended · Applebot-Extended 는 따로 수집하지 않고 이 규칙만 읽는 이름이다(검색 노출과 무관).
 */
const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'FacebookBot',
  'cohere-training-data-crawler',
  'Diffbot',
  'AI2Bot',
  'Ai2Bot-Dolma',
  'omgili',
  'omgilibot',
  'img2dataset',
  'PanguBot',
  'Timpibot',
  'ImagesiftBot',
  'Kangaroo Bot',
  'Webzio-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // 사내 도구(Hub, 예전 주소 /taskmanager 는 /hub 로 넘어간다)와 내기용 핀볼 게임 - 색인 대상이 아니다
        disallow: ['/hub/', '/taskmanager/', '/pinball/'],
      },
      { userAgent: AI_TRAINING_BOTS, disallow: '/' },
    ],
    sitemap: 'https://devteammate.co.kr/sitemap.xml',
  };
}

