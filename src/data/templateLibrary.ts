import type { TemplateItem } from '@/types';

/**
 * 디자인 템플릿 라이브러리 - 갤러리 데이터 (landingpage 하위 도메인의 /templates/).
 * template-library/gen/site-data.mjs 가 template-library/data/templates.json 에서 만든다. 손으로 고치지 않는다.
 * 사용권 검증 기록(내부용)은 template-library/data/templates.json 에만 있고 여기에는 싣지 않는다.
 */

/** 종류 - 필터 이름과 규격 */
export const templateFormats: { key: string; name: string; group: string; spec: string }[] = [
  {
    "key": "pt",
    "name": "프레젠테이션",
    "group": "문서 · 발표",
    "spec": "16:9 · 1920×1080px"
  },
  {
    "key": "cn",
    "name": "카드뉴스",
    "group": "문서 · 발표",
    "spec": "1:1 · 1080×1080px"
  },
  {
    "key": "dc",
    "name": "문서 서식",
    "group": "문서 · 발표",
    "spec": "A4 · 210×297mm"
  },
  {
    "key": "dp",
    "name": "상세페이지",
    "group": "문서 · 발표",
    "spec": "폭 860px · 세로 자유"
  },
  {
    "key": "lg",
    "name": "로고",
    "group": "문서 · 발표",
    "spec": "벡터 SVG · 적용 예시 포함"
  },
  {
    "key": "yt",
    "name": "유튜브 썸네일",
    "group": "영상 · SNS",
    "spec": "16:9 · 1280×720px"
  },
  {
    "key": "yv",
    "name": "유튜브 동영상",
    "group": "영상 · SNS",
    "spec": "16:9 · 1920×1080px · MP4"
  },
  {
    "key": "ig",
    "name": "인스타그램 피드",
    "group": "영상 · SNS",
    "spec": "4:5 · 1080×1350px"
  },
  {
    "key": "rl",
    "name": "인스타그램 릴스",
    "group": "영상 · SNS",
    "spec": "9:16 · 1080×1920px · MP4"
  },
  {
    "key": "bc",
    "name": "명함",
    "group": "인쇄물",
    "spec": "90×50mm"
  },
  {
    "key": "po",
    "name": "포스터",
    "group": "인쇄물",
    "spec": "A2 · 420×594mm"
  },
  {
    "key": "fl",
    "name": "전단지",
    "group": "인쇄물",
    "spec": "A4 · 210×297mm"
  },
  {
    "key": "pc",
    "name": "엽서카드",
    "group": "인쇄물",
    "spec": "148×105mm"
  },
  {
    "key": "hb",
    "name": "현수막",
    "group": "인쇄물",
    "spec": "5000×900mm"
  },
  {
    "key": "xb",
    "name": "배너",
    "group": "인쇄물",
    "spec": "X배너 600×1800mm"
  }
];

/** 업종 묶음 */
export const templateFields: { id: number; name: string }[] = [
  {
    "id": 1,
    "name": "음식·카페·매장"
  },
  {
    "id": 2,
    "name": "뷰티·건강·의료"
  },
  {
    "id": 3,
    "name": "교육·강의·코칭"
  },
  {
    "id": 4,
    "name": "전문·생활 서비스"
  },
  {
    "id": 5,
    "name": "쇼핑·제품·브랜드"
  },
  {
    "id": 6,
    "name": "IT·B2B·제조"
  },
  {
    "id": 7,
    "name": "정부·정책·모집"
  },
  {
    "id": 8,
    "name": "공공기관·대학·협회"
  },
  {
    "id": 9,
    "name": "크리에이터·아티스트"
  },
  {
    "id": 10,
    "name": "관광·행사·문화"
  }
];

/** 장르 */
export const templateGenres: { key: string; name: string }[] = [
  {
    "key": "minimal",
    "name": "미니멀"
  },
  {
    "key": "modern",
    "name": "모던"
  },
  {
    "key": "warm",
    "name": "감성"
  },
  {
    "key": "premium",
    "name": "프리미엄"
  },
  {
    "key": "bold",
    "name": "대담한"
  },
  {
    "key": "retro",
    "name": "레트로"
  },
  {
    "key": "playful",
    "name": "발랄한"
  },
  {
    "key": "natural",
    "name": "내추럴"
  }
];

export const templates: TemplateItem[] = [
  {
    "id": "PT-01",
    "title": "가맹 안내 · 크림색과 아치 사진",
    "summary": "크림색 바탕에 바탕체 제목과 아치 모양 사진, 가는 줄로 나눈 절차를 둔 브랜드 안내 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "카페 가맹 안내서",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 브랜드 이름, 소개 글, 숫자 3칸, 절차 4단계, 상담 연락처",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Batang"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Dragnar",
        "url": "https://unsplash.com/@djuka11",
        "photoUrl": "https://unsplash.com/photos/TNfgr9yDOiI"
      },
      {
        "name": "Fahmi Fakhrudin",
        "url": "https://unsplash.com/@fahmipaping",
        "photoUrl": "https://unsplash.com/photos/nzyzAUsbV0M"
      }
    ]
  },
  {
    "id": "PT-02",
    "title": "캠페인 제안 · 검정과 금색 세리프",
    "summary": "검은 바탕에 금색 가는 선과 세리프 글자, 큰 화보 사진과 채널 표를 둔 브랜드 캠페인 제안 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "뷰티 브랜드 캠페인 제안서",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 브랜드 · 캠페인 이름, 콘셉트 문장, 채널 계획 4줄, 담당자 연락처",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Rameez Remy",
        "url": "https://unsplash.com/@rameez_remy",
        "photoUrl": "https://unsplash.com/photos/BjD63CxMH10"
      },
      {
        "name": "Birgith Roosipuu",
        "url": "https://unsplash.com/@msbirgith",
        "photoUrl": "https://unsplash.com/photos/08LinF9-xOo"
      }
    ]
  },
  {
    "id": "PT-03",
    "title": "물의 여행 · 하늘색과 둥근 글자",
    "summary": "하늘색 바탕에 둥근 글자와 구름 모양, 원형 사진과 질문 카드를 둔 초등 수업용 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "초등 과학 수업 자료",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 단원 이름, 배울 것 3가지, 질문과 설명, 정리 문제",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Yoksel 🌿 Zok",
        "url": "https://unsplash.com/@yoksel",
        "photoUrl": "https://unsplash.com/photos/TNvJZK7fePk"
      },
      {
        "name": "Steve Gribble",
        "url": "https://unsplash.com/@steve_g_",
        "photoUrl": "https://unsplash.com/photos/oBG5nswvqS0"
      }
    ]
  },
  {
    "id": "PT-04",
    "title": "시공 포트폴리오 · 흰 여백과 가는 글자",
    "summary": "밝은 바탕에 가는 제목과 넓은 여백, 큰 시공 사진과 개요 표, 가는 줄로 나눈 진행 순서를 둔 포트폴리오 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "인테리어 회사 포트폴리오",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 회사 이름, 사례 이름과 개요 4줄, 진행 4단계, 연락처",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Pipcke",
        "url": "https://unsplash.com/@pipcke",
        "photoUrl": "https://unsplash.com/photos/g_5UyVBIX_k"
      },
      {
        "name": "Brian Zajac",
        "url": "https://unsplash.com/@brianzajac",
        "photoUrl": "https://unsplash.com/photos/kF3KNcoXQXY"
      }
    ]
  },
  {
    "id": "PT-05",
    "title": "론칭 기획 · 빨강 검정과 폭 좁은 큰 글자",
    "summary": "빨강과 검정, 폭 좁은 큰 영문과 굵은 한글 제목, 제품 사진과 일정 막대를 둔 론칭 기획 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "신제품 론칭 기획서",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 제품 이름, 대상과 핵심 문장, 일정 4줄, 다음 할 일",
    "fonts": [
      "Pretendard",
      "Anton",
      "Black Han Sans"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Luca Bravo",
        "url": "https://unsplash.com/@lucabravo",
        "photoUrl": "https://unsplash.com/photos/_XnDTTUuWSA"
      },
      {
        "name": "Zac Gudakov",
        "url": "https://unsplash.com/@zacgudakov",
        "photoUrl": "https://unsplash.com/photos/edP9ZXCXihY"
      }
    ]
  },
  {
    "id": "PT-06",
    "title": "서비스 소개 · 남색 격자와 파란 포인트",
    "summary": "남색 격자 표지와 밝은 본문, 굵은 제목과 문제 · 해결 두 칸, 숫자 세 칸을 둔 서비스 소개 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "SaaS 서비스 소개서",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 서비스 이름, 문제와 해결 문장, 숫자 3칸, 기능 3가지, 도입 문의",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/LzBMjkvZfh8"
      },
      {
        "name": "NordWood Themes",
        "url": "https://unsplash.com/@nordwood",
        "photoUrl": "https://unsplash.com/photos/BJx8whKXCgc"
      }
    ]
  },
  {
    "id": "PT-07",
    "title": "실천 계획 · 풀빛과 둥근 사진",
    "summary": "풀빛과 크림색 바탕에 돋움 제목, 둥근 풍경 사진과 과제 카드 세 장을 둔 정책 보고 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "탄소중립 실천 계획 보고",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 기관 이름, 추진 배경 글, 과제 3가지, 일정과 담당 부서",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "JIWON KANG",
        "url": "https://unsplash.com/@jiwon_kang",
        "photoUrl": "https://unsplash.com/photos/2csH9SjutAM"
      },
      {
        "name": "Alain ROUILLER",
        "url": "https://unsplash.com/@alainr",
        "photoUrl": "https://unsplash.com/photos/1PKZC9NiDdg"
      }
    ]
  },
  {
    "id": "PT-08",
    "title": "연구 발표 · 흰 바탕과 남색 세로 줄",
    "summary": "흰 바탕에 남색 세로 줄과 굵은 제목, 연구 개요 표와 막대 그래프를 둔 학술 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "연구 성과 발표",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 연구 제목 · 발표자, 개요 4줄, 그래프 값 4개, 결론 3줄",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Campaign Creators",
        "url": "https://unsplash.com/@campaign_creators",
        "photoUrl": "https://unsplash.com/photos/774sCXD0dDU"
      }
    ]
  },
  {
    "id": "PT-09",
    "title": "작가 포트폴리오 · 겨자색과 청록",
    "summary": "겨자색과 청록, 크림색을 큼직하게 나누고 옛 간판 같은 글자와 테두리 사진을 둔 작가 포트폴리오 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "일러스트레이터 포트폴리오",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 작가 이름, 소개 글, 작업 분야 3가지, 연락처",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Do Hyeon"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jonathan Borba",
        "url": "https://unsplash.com/@jonathanborba",
        "photoUrl": "https://unsplash.com/photos/lsGZlrdvd_c"
      },
      {
        "name": "Sincerely Media",
        "url": "https://unsplash.com/@sincerelymedia",
        "photoUrl": "https://unsplash.com/photos/eBeljLqtTFE"
      },
      {
        "name": "Bench Accounting",
        "url": "https://unsplash.com/@benchaccounting",
        "photoUrl": "https://unsplash.com/photos/unG80SBSfMU"
      }
    ]
  },
  {
    "id": "PT-10",
    "title": "축제 기획 · 보라 노랑과 큰 글자",
    "summary": "보라와 노랑, 분홍의 강한 대비에 굵은 큰 글자, 밤 축제 사진과 프로그램 세 칸을 둔 행사 기획 발표 자료.",
    "format": "pt",
    "formatLabel": "프레젠테이션",
    "spec": "16:9 · 1920×1080px",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "지역 축제 기획안",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 축제 이름, 개요 4줄, 프로그램 3가지, 준비 일정",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "PowerPoint(PPTX)",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vivu Vietnam",
        "url": "https://unsplash.com/@bttsg",
        "photoUrl": "https://unsplash.com/photos/WuyJK5_oSNg"
      },
      {
        "name": "Colin Lloyd",
        "url": "https://unsplash.com/@onthesearchforpineapples",
        "photoUrl": "https://unsplash.com/photos/8H72wMWxj90"
      }
    ]
  },
  {
    "id": "CN-01",
    "title": "겨울 메뉴 소개 · 아치 사진과 바탕체",
    "summary": "크림색 바탕에 아치 모양 사진과 바탕체 이름, 한 줄 설명으로 메뉴를 한 장씩 소개하는 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "카페 시즌 메뉴",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 메뉴 이름 · 설명 · 가격 2개, 판매 기간과 매장 정보",
    "fonts": [
      "Pretendard",
      "Gowun Batang",
      "Cormorant Garamond"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mekht",
        "url": "https://unsplash.com/@mekht",
        "photoUrl": "https://unsplash.com/photos/p5C7y-IGa_k"
      },
      {
        "name": "Sixteen Miles Out",
        "url": "https://unsplash.com/@sixteenmilesout",
        "photoUrl": "https://unsplash.com/photos/z4RgJD-UQSc"
      },
      {
        "name": "Demi DeHerrera",
        "url": "https://unsplash.com/@demidearest",
        "photoUrl": "https://unsplash.com/photos/L-sm1B4L1Ns"
      }
    ]
  },
  {
    "id": "CN-02",
    "title": "겨울 피부 습관 · 풀빛과 원형 사진",
    "summary": "연한 풀빛 바탕에 큰 순서 글자와 원형 사진, 짧은 설명으로 관리 습관을 알려 주는 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "피부 관리 정보",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 주제, 습관 2가지(제목 · 설명), 가게 이름과 예약 안내",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "PLANTADEA",
        "url": "https://unsplash.com/@plantadea",
        "photoUrl": "https://unsplash.com/photos/bMjbpyxt7JU"
      },
      {
        "name": "Manki Kim",
        "url": "https://unsplash.com/@kimdonkey",
        "photoUrl": "https://unsplash.com/photos/12Kb5ynfxso"
      },
      {
        "name": "Leighann Blackwood",
        "url": "https://unsplash.com/@ohleighann",
        "photoUrl": "https://unsplash.com/photos/lIi4yy4_vN8"
      }
    ]
  },
  {
    "id": "CN-03",
    "title": "시험 2주 전 · 노랑 검정과 체크 목록",
    "summary": "노란 바탕의 굵은 표지와 검은 머리띠, 체크 상자 목록으로 시험 준비 순서를 알려 주는 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "학원 시험 대비 정보",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 주제, 체크 항목 6개, 학원 이름과 상담 안내",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Yen Vu - 烟雨",
        "url": "https://unsplash.com/@yenvu2410",
        "photoUrl": "https://unsplash.com/photos/OEt8lStU-wA"
      }
    ]
  },
  {
    "id": "CN-04",
    "title": "연말정산 체크 · 흰 바탕과 가는 숫자",
    "summary": "흰 바탕에 가는 큰 숫자와 굵은 제목, 파란 짧은 줄만으로 정보를 정리하는 전문 서비스 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "세무 정보 안내",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 주제, 항목 2개(제목 · 설명), 사무소 이름과 연락처",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mediamodifier",
        "url": "https://unsplash.com/@mediamodifier",
        "photoUrl": "https://unsplash.com/photos/I3HPUolh5hA"
      }
    ]
  },
  {
    "id": "CN-05",
    "title": "새 향 출시 · 검정과 금색 세리프",
    "summary": "검은 바탕에 금색 가는 선과 세리프 글자, 제품 사진으로 향의 구성을 소개하는 출시 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "향수 신제품",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 제품 이름, 향 구성 3단, 용량 · 가격, 출시일과 판매처",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Joppe Spaa",
        "url": "https://unsplash.com/@spaablauw",
        "photoUrl": "https://unsplash.com/photos/Y8kwv9_Vay8"
      },
      {
        "name": "Heather Newsom",
        "url": "https://unsplash.com/@native7photo",
        "photoUrl": "https://unsplash.com/photos/bephZ6leq-k"
      }
    ]
  },
  {
    "id": "CN-06",
    "title": "우리 팀 소개 · 둥근 글자와 색면",
    "summary": "장마다 바탕색을 바꾸고 둥근 글자와 기울인 사진으로 팀 문화를 소개하는 채용 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "스타트업 채용",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 회사 이름, 문화 2가지(제목 · 설명), 모집 직무와 지원 방법",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Austin Distel",
        "url": "https://unsplash.com/@austindistel",
        "photoUrl": "https://unsplash.com/photos/mpN7xjKQ_Ns"
      },
      {
        "name": "Walls.io",
        "url": "https://unsplash.com/@walls_io",
        "photoUrl": "https://unsplash.com/photos/XOdheNZtUBs"
      },
      {
        "name": "Helena Lopes",
        "url": "https://unsplash.com/@helenalopesph",
        "photoUrl": "https://unsplash.com/photos/RgPQNvoIcdg"
      }
    ]
  },
  {
    "id": "CN-07",
    "title": "달라지는 지원 · 살구색과 전후 비교",
    "summary": "살구색 바탕에 돋움 제목과 지금까지 · 앞으로는 두 상자로 달라진 점을 보여 주는 정책 안내 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "육아 지원 제도 안내",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 주제, 달라지는 점 2가지(전 · 후), 담당 부서와 문의처",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Alexander Mass",
        "url": "https://unsplash.com/@alexandermassph",
        "photoUrl": "https://unsplash.com/photos/ovwv8Nm9fv8"
      }
    ]
  },
  {
    "id": "CN-08",
    "title": "별 보는 밤 · 남색과 겨자색",
    "summary": "남색과 겨자색, 크림색으로 옛 우주 포스터처럼 꾸미고 일정과 준비물을 표로 정리한 행사 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "과학관 별 관측회",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 행사 이름, 일정 3줄, 준비물 3줄, 신청 방법",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Do Hyeon"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Josh Behunin",
        "url": "https://unsplash.com/@joshuabehunin",
        "photoUrl": "https://unsplash.com/photos/sL47NI870f0"
      }
    ]
  },
  {
    "id": "CN-09",
    "title": "숏폼 편집 팁 · 어두운 바탕과 진행 막대",
    "summary": "어두운 바탕에 굵은 흰 제목과 보라 포인트, 아래 진행 막대로 순서를 보여 주는 크리에이터 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "영상 크리에이터 팁",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 주제, 팁 2가지(제목 · 설명), 채널 이름과 계정",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mark Cruz",
        "url": "https://unsplash.com/@mark_crz",
        "photoUrl": "https://unsplash.com/photos/VW2oU66mwbc"
      },
      {
        "name": "Peter Stumpf",
        "url": "https://unsplash.com/@peter_s",
        "photoUrl": "https://unsplash.com/photos/yk9VXp4W5-Q"
      },
      {
        "name": "Babak Eshaghian",
        "url": "https://unsplash.com/@babak22ir",
        "photoUrl": "https://unsplash.com/photos/McNPAXmBhUY"
      }
    ]
  },
  {
    "id": "CN-10",
    "title": "야시장 가이드 · 검정에 분홍 노랑",
    "summary": "밤 사진 표지 뒤로 검은 바탕에 분홍과 노랑 굵은 글자 목록이 이어지는 행사 안내 카드뉴스.",
    "format": "cn",
    "formatLabel": "카드뉴스",
    "spec": "1:1 · 1080×1080px",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "야시장 안내",
    "pages": [
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ],
      [
        1080,
        1080
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 행사 이름 · 기간, 먹거리 4줄, 공연 4줄, 오시는 길",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "yeojin yun",
        "url": "https://unsplash.com/@seoul_lover_lily",
        "photoUrl": "https://unsplash.com/photos/BZJG8eDA0d4"
      }
    ]
  },
  {
    "id": "DC-01",
    "title": "메뉴판 · 크림색과 점선 가격",
    "summary": "위에 가게 사진 띠를 두고 아래 두 단에 갈래별 메뉴와 점선 가격을 정리한 한 장짜리 메뉴판.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "카페 메뉴판",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 가게 이름, 갈래 4개와 메뉴 · 가격, 안내 한 줄",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Batang"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Haberdoedas",
        "url": "https://unsplash.com/@haberdoedas",
        "photoUrl": "https://unsplash.com/photos/g-e_v_aDb9E"
      }
    ]
  },
  {
    "id": "DC-02",
    "title": "상담 카드 · 흰 바탕과 가는 밑줄",
    "summary": "흰 바탕에 가는 밑줄 칸과 체크 상자로 고객 정보 · 피부 고민 · 동의를 받는 한 장짜리 상담 서식.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "피부 관리 상담 카드",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 가게 이름, 질문 항목, 동의 문구",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "MAURIZIO VELE",
        "url": "https://unsplash.com/@fiamma_91",
        "photoUrl": "https://unsplash.com/photos/SxkqtJAY9Ic"
      }
    ]
  },
  {
    "id": "DC-03",
    "title": "달마다 소식지 · 노랑 머리와 둥근 칸",
    "summary": "노란 머리 면에 둥근 글자 제목과 원형 사진, 이달의 일정 표와 알림 칸을 둔 학부모 안내 소식지.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "학원 소식지",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 학원 이름 · 달, 인사 글, 일정 5줄, 알림 3가지",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "National Cancer Institute",
        "url": "https://unsplash.com/@nci",
        "photoUrl": "https://unsplash.com/photos/N_aihp118p8"
      }
    ]
  },
  {
    "id": "DC-04",
    "title": "견적서 · 남색 머리 줄과 품목 표",
    "summary": "남색 머리 줄과 굵은 제목, 받는 분 · 공급자 칸, 품목 표와 합계, 안내 사항을 둔 한 장짜리 견적서.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "인테리어 견적서",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 회사 정보, 받는 분, 품목 8줄, 합계, 안내 사항",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Janay Peters",
        "url": "https://unsplash.com/@jpetersbydesign",
        "photoUrl": "https://unsplash.com/photos/epznqEMFdcA"
      }
    ]
  },
  {
    "id": "DC-05",
    "title": "상품 소개서 · 흙빛과 사양 표",
    "summary": "흙빛 바탕에 큰 제품 사진과 돋움 제목, 사양 표와 거래 조건을 둔 입점 · 도매 제안용 한 장 소개서.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "도매 상품 소개서",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 브랜드 · 상품 이름, 소개 글, 사양 5줄, 거래 조건 4줄, 담당자",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Diana Light",
        "url": "https://unsplash.com/@dreamcatchlight",
        "photoUrl": "https://unsplash.com/photos/u_jt9A7FADk"
      }
    ]
  },
  {
    "id": "DC-06",
    "title": "회사 소개서 · 파랑 머리와 큰 제목",
    "summary": "파란 머리 면에 굵은 큰 제목, 걸쳐 놓은 사진, 숫자 세 칸과 하는 일 네 줄을 둔 한 장짜리 회사 소개서.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "회사 소개 한 장",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 회사 이름, 한 줄 소개, 숫자 3칸, 하는 일 4가지, 연락처",
    "fonts": [
      "Pretendard",
      "JetBrains Mono",
      "Black Han Sans"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Marvin Meyer",
        "url": "https://unsplash.com/@marvelous",
        "photoUrl": "https://unsplash.com/photos/SYTO3xs06fU"
      }
    ]
  },
  {
    "id": "DC-07",
    "title": "보도자료 · 기본 틀과 사진 한 장",
    "summary": "기관 이름과 배포 정보 표, 굵은 제목과 본문, 설명 붙은 사진, 담당자 칸을 갖춘 기본형 보도자료.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "보도자료",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 배포 일시 · 담당, 제목 · 부제, 본문 3단락, 사진 설명",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mirza Polat",
        "url": "https://unsplash.com/@mirzapolat",
        "photoUrl": "https://unsplash.com/photos/IKf-H_mPoh0"
      }
    ]
  },
  {
    "id": "DC-08",
    "title": "초청장 · 남색과 금색 세리프",
    "summary": "남색 바탕에 금색 가는 테두리와 세리프 제목, 행사장 사진과 순서 표, 회신 안내를 둔 한 장짜리 초청장.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "학술 심포지엄 초청장",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 행사 이름, 인사말, 순서 5줄, 일시 · 장소 · 회신",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Noto Serif KR",
      "Cormorant Garamond"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Hayk Badalyan",
        "url": "https://unsplash.com/@hayko_badalyan",
        "photoUrl": "https://unsplash.com/photos/5nGCyV51P60"
      }
    ]
  },
  {
    "id": "DC-09",
    "title": "이력서 · 왼쪽 사진 띠와 경력 줄",
    "summary": "왼쪽 어두운 띠에 사진과 연락처 · 기술을, 오른쪽에 소개와 경력 · 학력을 줄 맞춰 둔 한 장짜리 이력서.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "디자이너 이력서",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 인물 사진 1장, 이름 · 직무, 소개 글, 경력 3건, 학력, 기술 · 도구",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Thanh Duc PHAN",
        "url": "https://unsplash.com/@stiffduc",
        "photoUrl": "https://unsplash.com/photos/_mLkvtEJsao"
      }
    ]
  },
  {
    "id": "DC-10",
    "title": "공연 프로그램 · 남색 겨자색과 곡 목록",
    "summary": "남색과 겨자색, 크림색으로 옛 음반 표지처럼 꾸미고 공연 사진과 곡 목록, 연주자 소개를 둔 한 장짜리 프로그램.",
    "format": "dc",
    "formatLabel": "문서 서식",
    "spec": "A4 · 210×297mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "재즈 공연 프로그램",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 공연 이름 · 일시, 곡 목록 6곡, 연주자 4명, 안내 한 줄",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Shrikhand",
      "Do Hyeon"
    ],
    "outputs": [
      "Word(DOCX)",
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jens Thekkeveettil",
        "url": "https://unsplash.com/@jensth",
        "photoUrl": "https://unsplash.com/photos/dBWvUqBoOU8"
      }
    ]
  },
  {
    "id": "DP-01",
    "title": "그래놀라 상세 · 크림색과 바탕체",
    "summary": "음식 사진을 크게 열고 크림색 바탕에 바탕체 제목, 재료 이야기와 먹는 법, 상품 정보 표를 차례로 둔 식품 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "수제 그래놀라",
    "pages": [
      [
        860,
        4778
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 상품 이름, 특징 3가지, 재료 글, 먹는 법 3줄, 상품 정보 표",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Batang"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Svitlana",
        "url": "https://unsplash.com/@kekse_und_ich",
        "photoUrl": "https://unsplash.com/photos/BZsbYIHCKRg"
      },
      {
        "name": "Maria Petersson",
        "url": "https://unsplash.com/@mariaspics",
        "photoUrl": "https://unsplash.com/photos/S6RlgBvQ53E"
      },
      {
        "name": "Uliana Kopanytsia",
        "url": "https://unsplash.com/@ulian_ka",
        "photoUrl": "https://unsplash.com/photos/glRW5ivpwEM"
      }
    ]
  },
  {
    "id": "DP-02",
    "title": "세럼 상세 · 풀빛과 원형 성분 칸",
    "summary": "풀빛 바탕에 둥근 제품 사진과 돋움 제목, 성분 세 줄과 바르는 순서, 권하는 분 목록을 둔 화장품 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "진정 세럼",
    "pages": [
      [
        860,
        5392
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 제품 이름, 성분 3가지, 사용 순서 3단계, 권하는 분 4줄, 제품 정보 표",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Nataliya Melnychuk",
        "url": "https://unsplash.com/@natinati",
        "photoUrl": "https://unsplash.com/photos/5M3V2HKGdns"
      },
      {
        "name": "PLANTADEA",
        "url": "https://unsplash.com/@plantadea",
        "photoUrl": "https://unsplash.com/photos/xn7ZrZl1K5E"
      },
      {
        "name": "kevin laminto",
        "url": "https://unsplash.com/@kxvn_lx",
        "photoUrl": "https://unsplash.com/photos/LL1vA5sUs6g"
      }
    ]
  },
  {
    "id": "DP-03",
    "title": "강의 상세 · 검정 노랑과 굵은 목차",
    "summary": "검은 바탕에 노란 굵은 글자와 강사 사진, 대상 세 칸과 번호 붙은 목차, 수강 안내 띠를 둔 온라인 강의 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "온라인 엑셀 강의",
    "pages": [
      [
        860,
        4729
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 강의 이름, 대상 3가지, 목차 5장, 강사 소개, 수강료 · 기간",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "khaled elshamy",
        "url": "https://unsplash.com/@khaled_elshamy20",
        "photoUrl": "https://unsplash.com/photos/LrDzMgYlVoQ"
      },
      {
        "name": "Gorilla ROI Data Connector",
        "url": "https://unsplash.com/@gorillaroi",
        "photoUrl": "https://unsplash.com/photos/9fZuqBYlV1w"
      }
    ]
  },
  {
    "id": "DP-04",
    "title": "촬영 서비스 상세 · 흰 바탕과 파란 요금 칸",
    "summary": "큰 인물 사진으로 열고 요금 세 칸, 진행 네 단계, 결과 사진 두 장, 예약 안내를 둔 서비스 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "프로필 사진 촬영",
    "pages": [
      [
        860,
        4293
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 서비스 이름, 요금 3종(구성 · 가격), 진행 4단계, 위치 · 예약 방법",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Christian Agbede",
        "url": "https://unsplash.com/@chriscreations__",
        "photoUrl": "https://unsplash.com/photos/ZdyMKMQ5ZuM"
      },
      {
        "name": "Kawê Rodrigues",
        "url": "https://unsplash.com/@kawerodriguess",
        "photoUrl": "https://unsplash.com/photos/ERbgk96BOGg"
      },
      {
        "name": "Ernest Flowers",
        "url": "https://unsplash.com/@ernestflowerss",
        "photoUrl": "https://unsplash.com/photos/QAbh1ataz-E"
      }
    ]
  },
  {
    "id": "DP-05",
    "title": "의류 상세 · 흰 여백과 사이즈 표",
    "summary": "큰 착용 사진과 넓은 흰 여백, 가는 제목과 짧은 설명, 사이즈 표와 세탁 안내만 둔 의류 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "울 니트",
    "pages": [
      [
        860,
        4521
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 상품 이름 · 가격, 설명 글, 소재 · 색상, 사이즈 표, 세탁 안내",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Daniel Lincoln",
        "url": "https://unsplash.com/@danny_lincoln",
        "photoUrl": "https://unsplash.com/photos/AeC0HMhdTwA"
      },
      {
        "name": "Elena Rabkina",
        "url": "https://unsplash.com/@rabkina",
        "photoUrl": "https://unsplash.com/photos/blZTVlCRaZA"
      },
      {
        "name": "Debby Hudson",
        "url": "https://unsplash.com/@hudsoncrafted",
        "photoUrl": "https://unsplash.com/photos/14gB2NZ3zqk"
      }
    ]
  },
  {
    "id": "DP-06",
    "title": "기기 상세 · 검은 바탕과 큰 숫자",
    "summary": "검은 바탕에 제품 사진과 금빛 가는 글자, 큰 숫자 세 칸과 기능 사진, 사양 표를 둔 전자 기기 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "무선 이어폰",
    "pages": [
      [
        860,
        4507
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 제품 이름, 숫자 3칸, 기능 2가지(제목 · 설명), 사양 표",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "James Gibson",
        "url": "https://unsplash.com/@gibson_photographic",
        "photoUrl": "https://unsplash.com/photos/dQiqWGj847c"
      },
      {
        "name": "eldhose kuriyan",
        "url": "https://unsplash.com/@eldhosekuriyan",
        "photoUrl": "https://unsplash.com/photos/7kJVhA8VIaQ"
      },
      {
        "name": "Yogesh Rahamatkar",
        "url": "https://unsplash.com/@2wenty6thstreet",
        "photoUrl": "https://unsplash.com/photos/uc5NVFumeZs"
      }
    ]
  },
  {
    "id": "DP-07",
    "title": "지원사업 상세 · 파랑 노랑과 둥근 카드",
    "summary": "파란 머리에 둥근 글자 제목과 원형 사진, 대상 · 내용 · 방법 카드와 신청 순서, 자주 묻는 질문을 둔 정책 안내 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "청년 지원사업 안내",
    "pages": [
      [
        860,
        4539
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 사업 이름, 대상 · 내용 · 기간 카드, 신청 4단계, 질문 3개, 문의처",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Priscilla Du Preez 🇨🇦",
        "url": "https://unsplash.com/@priscilladupreez",
        "photoUrl": "https://unsplash.com/photos/NjirplnVra8"
      },
      {
        "name": "Irish83",
        "url": "https://unsplash.com/@irish83",
        "photoUrl": "https://unsplash.com/photos/7XHOT7vRjiU"
      }
    ]
  },
  {
    "id": "DP-08",
    "title": "강좌 안내 상세 · 남색 줄과 강좌 표",
    "summary": "수업 사진으로 열고 남색 줄 제목, 강좌 표와 수강 안내 네 칸, 신청 순서를 정돈해 둔 교육 프로그램 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "평생교육원 강좌 안내",
    "pages": [
      [
        860,
        3845
      ]
    ],
    "video": 0,
    "swap": "사진 2장, 기관 · 학기, 강좌 6줄(요일 · 시간 · 수강료), 안내 4칸, 신청 방법",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Quilia",
        "url": "https://unsplash.com/@heyquilia",
        "photoUrl": "https://unsplash.com/photos/1-aA2Fadydc"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/BH32pHRs-HQ"
      }
    ]
  },
  {
    "id": "DP-09",
    "title": "달력 굿즈 상세 · 크림색과 붉은 도장",
    "summary": "크림색 바탕에 옛 인쇄물 같은 글자와 테두리 사진, 구성 세 칸과 도장 모양 안내, 배송 표를 둔 굿즈 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "일러스트 달력",
    "pages": [
      [
        860,
        4708
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 상품 이름, 소개 글, 구성 3가지, 사양 · 배송 표",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Do Hyeon"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mille Sanders",
        "url": "https://unsplash.com/@millesanders",
        "photoUrl": "https://unsplash.com/photos/oWpartNqAnM"
      },
      {
        "name": "Anna Ansone",
        "url": "https://unsplash.com/@simplyanna",
        "photoUrl": "https://unsplash.com/photos/nt0m1OgjE_8"
      },
      {
        "name": "Fiona Murray-deGraaff",
        "url": "https://unsplash.com/@fionamurrayphoto",
        "photoUrl": "https://unsplash.com/photos/eMqEsBs1eb4"
      }
    ]
  },
  {
    "id": "DP-10",
    "title": "숙소 상세 · 풍경 사진과 흙빛 바탕",
    "summary": "풍경 사진으로 크게 열고 흙빛 바탕에 바탕체 제목, 객실 소개와 시설 목록, 이용 안내 표를 둔 숙소 상세페이지.",
    "format": "dp",
    "formatLabel": "상세페이지",
    "spec": "폭 860px · 세로 자유",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "숲속 숙소",
    "pages": [
      [
        860,
        4958
      ]
    ],
    "video": 0,
    "swap": "사진 3장, 숙소 이름, 소개 글, 객실 2종(인원 · 요금), 시설 6가지, 이용 안내 표",
    "fonts": [
      "Pretendard",
      "Gowun Batang",
      "Cormorant Garamond"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Zachary Kyra-Derksen",
        "url": "https://unsplash.com/@zachaery",
        "photoUrl": "https://unsplash.com/photos/ajqDp29Pz7M"
      },
      {
        "name": "Valeriia Miller",
        "url": "https://unsplash.com/@valeriiamiller",
        "photoUrl": "https://unsplash.com/photos/6XgZmJvIxD4"
      },
      {
        "name": "Nerissa J",
        "url": "https://unsplash.com/@nerissa_j_photography",
        "photoUrl": "https://unsplash.com/photos/y_ha2xvdciY"
      }
    ]
  },
  {
    "id": "LG-01",
    "title": "빵집 로고 · 둥근 배지와 식빵 모양",
    "summary": "두 겹 원 안에 식빵 모양과 둥글게 두른 영문, 바탕체 상호를 넣은 배지형 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "베이커리",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "상호, 둘레 영문, 색 2가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Batang",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitalii Abakumov",
        "url": "https://unsplash.com/@scoutori",
        "photoUrl": "https://unsplash.com/photos/luNZR9Mcys4"
      }
    ]
  },
  {
    "id": "LG-02",
    "title": "살롱 로고 · 가는 원과 기울인 머리글자",
    "summary": "가는 원 안에 기울인 세리프 머리글자와 작은 반짝임, 아래에 넓게 띄운 영문 상호를 둔 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "뷰티 살롱",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "머리글자, 상호 영문 · 한글, 색 2가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Bodoni Moda",
      "Cinzel",
      "Noto Serif KR",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Natalia Rüdisüli",
        "url": "https://unsplash.com/@nruedisueli",
        "photoUrl": "https://unsplash.com/photos/vs__Yc3EXWo"
      }
    ]
  },
  {
    "id": "LG-03",
    "title": "학원 로고 · 겹친 세 원과 웃는 선",
    "summary": "삼원색 원 세 개를 겹치고 아래에 웃는 선을 그은 심벌, 둥근 글자 상호를 둔 어린이 교육 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "어린이 학원",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "상호, 색 3가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Jua",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Brando Makes Branding",
        "url": "https://unsplash.com/@brandomakesbranding",
        "photoUrl": "https://unsplash.com/photos/smTDI-z1rlY"
      }
    ]
  },
  {
    "id": "LG-04",
    "title": "스튜디오 로고 · 네모 틀과 사선 하나",
    "summary": "네모 틀 한쪽을 열고 사선 하나를 그은 기하 심벌과 넓게 띄운 가는 영문을 둔 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "건축 · 인테리어 스튜디오",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "상호 영문 · 한글, 색 1가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "grey wight",
        "url": "https://unsplash.com/@greyxwight",
        "photoUrl": "https://unsplash.com/photos/YREw6bUXAT8"
      }
    ]
  },
  {
    "id": "LG-05",
    "title": "브랜드 로고 · 마주 보는 잎과 소문자",
    "summary": "마주 보는 잎 두 장으로 새싹을 그린 심벌과 기울인 소문자 워드마크를 둔 자연주의 브랜드 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "스킨케어 브랜드",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "브랜드 이름, 설명 한 줄, 색 2가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Fraunces",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Kelly Sikkema",
        "url": "https://unsplash.com/@kellysikkema",
        "photoUrl": "https://unsplash.com/photos/1Pgq9ZpIatI"
      }
    ]
  },
  {
    "id": "LG-06",
    "title": "스타트업 로고 · 둥근 네모와 오르는 막대",
    "summary": "둥근 네모 안에 오르는 막대 세 개를 비운 심벌과 굵은 소문자 워드마크를 가로로 둔 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "IT 스타트업",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "서비스 이름, 색 1가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Sora",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Andrew Neel",
        "url": "https://unsplash.com/@andrewtneel",
        "photoUrl": "https://unsplash.com/photos/DLD5LvnFblU"
      }
    ]
  },
  {
    "id": "LG-07",
    "title": "캠페인 엠블럼 · 해와 산과 강",
    "summary": "굵은 원 안에 해와 산, 물결을 색면으로 넣고 아래에 굵은 구호를 둔 지역 캠페인 엠블럼.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "지자체 캠페인",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "구호, 지역 이름, 색 4가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Avtar Singh",
        "url": "https://unsplash.com/@avtar9w",
        "photoUrl": "https://unsplash.com/photos/8ACmRoleM24"
      }
    ]
  },
  {
    "id": "LG-08",
    "title": "학회 로고 · 육각 틀과 펼친 책",
    "summary": "육각 틀 안에 펼친 책을 선으로 그린 심벌과 세리프 한글, 넓게 띄운 영문을 둔 학술 기관 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "학회 · 연구소",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "기관 이름 한글 · 영문, 색 1가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Noto Serif KR",
      "Cinzel",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Thought Catalog",
        "url": "https://unsplash.com/@thoughtcatalog",
        "photoUrl": "https://unsplash.com/photos/Q7sGp9MStSY"
      }
    ]
  },
  {
    "id": "LG-09",
    "title": "사진관 로고 · 톱니 원과 렌즈",
    "summary": "톱니 모양 원 안에 렌즈를 겹친 원으로 그리고 옛 간판 글자로 상호를 넣은 배지형 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "필름 사진관",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "상호, 영문, 색 3가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Do Hyeon",
      "Righteous",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "David Foodphototasty",
        "url": "https://unsplash.com/@phototastyfood",
        "photoUrl": "https://unsplash.com/photos/OuMzcJIWS94"
      }
    ]
  },
  {
    "id": "LG-10",
    "title": "축제 로고 · 떠오르는 반원과 물결",
    "summary": "겹쳐 떠오르는 반원과 물결 세 줄을 강한 색으로 쌓고 두꺼운 둥근 글자 이름을 둔 축제 로고.",
    "format": "lg",
    "formatLabel": "로고",
    "spec": "벡터 SVG · 적용 예시 포함",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "지역 축제",
    "pages": [
      [
        1600,
        1000
      ]
    ],
    "video": 0,
    "swap": "축제 이름, 연도, 색 4가지, 적용 예시 사진 1장",
    "fonts": [
      "Pretendard",
      "Bagel Fat One",
      "Anton",
      "JetBrains Mono"
    ],
    "outputs": [
      "벡터 SVG",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "personalgraphic.com",
        "url": "https://unsplash.com/@personal_graphic",
        "photoUrl": "https://unsplash.com/photos/91sY2Ch6CT0"
      }
    ]
  },
  {
    "id": "YT-01",
    "title": "빵집 7곳 · 노란 테두리 글자와 배지",
    "summary": "음식 클로즈업 사진 위에 검은 테두리를 두른 노란 글자와 붉은 원형 배지를 얹은 리뷰 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "빵집 탐방 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 큰 글자 2줄, 배지 문구, 회차",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Alicia Christin Gerald",
        "url": "https://unsplash.com/@allysphotos",
        "photoUrl": "https://unsplash.com/photos/IuJKcV7K52U"
      }
    ]
  },
  {
    "id": "YT-02",
    "title": "하루 10분 · 반반 나눔과 원형 시간표",
    "summary": "왼쪽 연한 풀빛 면에 굵은 제목, 오른쪽에 사진, 이음매에 시간 원을 얹은 운동 영상 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "홈 트레이닝 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 제목 2줄, 난이도 칩, 원 안 숫자",
    "fonts": [
      "Pretendard",
      "Anton"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "GMB Fitness",
        "url": "https://unsplash.com/@gmb",
        "photoUrl": "https://unsplash.com/photos/1bRVFKDnrYY"
      }
    ]
  },
  {
    "id": "YT-03",
    "title": "미적분 · 칠판 바탕과 형광 띠",
    "summary": "칠판 초록 바탕에 굵은 흰 글자와 노란 형광 띠, 오른쪽에 반원으로 딴 강사 사진을 둔 강의 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "수능 수학 강의",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "정사각 인물 사진 1장, 강의 이름, 큰 글자, 형광 띠 문구",
    "fonts": [
      "Pretendard",
      "Do Hyeon",
      "Black Han Sans"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/NGxk5h3fVYQ"
      }
    ]
  },
  {
    "id": "YT-04",
    "title": "상속세 · 남색 바탕과 아치 사진",
    "summary": "남색 바탕에 금색 가는 테두리, 세리프 제목과 아치 모양 인물 사진을 둔 전문가 채널 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "세무사 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "세로 인물 사진 1장, 채널 · 회차, 제목 2줄",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Noto Serif KR"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Zulfugar Karimov",
        "url": "https://unsplash.com/@zulfugarkarimov",
        "photoUrl": "https://unsplash.com/photos/W00KNqGWyJI"
      }
    ]
  },
  {
    "id": "YT-05",
    "title": "운동화 리뷰 · 분홍 바탕과 별 모양",
    "summary": "분홍 바탕에 노란 별 모양을 깔고 기울인 제품 사진과 두꺼운 둥근 글자를 둔 언박싱 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "신제품 리뷰 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "정사각 제품 사진 1장, 제목 2줄, 스티커 문구",
    "fonts": [
      "Pretendard",
      "Bagel Fat One"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Nadine E",
        "url": "https://unsplash.com/@nadineshaabana",
        "photoUrl": "https://unsplash.com/photos/pywan95C6lU"
      }
    ]
  },
  {
    "id": "YT-06",
    "title": "30분 만에 배포 · 어두운 바탕과 명령 줄",
    "summary": "어두운 바탕에 명령 줄 모양 칩과 굵은 흰 제목, 오른쪽으로 스며드는 작업 사진을 둔 강좌 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "개발 강좌 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 명령 줄 문구, 제목 2줄, 한 줄 설명",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Abu Saeid",
        "url": "https://unsplash.com/@abusaeid01",
        "photoUrl": "https://unsplash.com/photos/fdGTi4IcaJc"
      }
    ]
  },
  {
    "id": "YT-07",
    "title": "청년 월세 지원 · 흰 바탕과 파란 줄",
    "summary": "흰 바탕에 파란 세로 줄과 굵은 제목, 둥근 사진, 질문 칩 세 개를 둔 정책 안내 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "정책 설명 영상",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 기관 이름, 제목 2줄, 칩 3개",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Cabri Caldwell",
        "url": "https://unsplash.com/@minimizethenorganize",
        "photoUrl": "https://unsplash.com/photos/PfGs06UwMgc"
      }
    ]
  },
  {
    "id": "YT-08",
    "title": "연구실의 하루 · 영화 장면 같은 사진",
    "summary": "영화 장면 같은 사진을 가득 채우고 왼쪽 아래에 세리프 제목과 한 줄 문장을 둔 다큐 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "대학 연구실 다큐",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 제목, 한 줄 문장",
    "fonts": [
      "Pretendard",
      "Noto Serif KR"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "DIANA HAUAN",
        "url": "https://unsplash.com/@amelune",
        "photoUrl": "https://unsplash.com/photos/YNZW7KW0uqs"
      }
    ]
  },
  {
    "id": "YT-09",
    "title": "브이로그 · 손글씨와 종이테이프",
    "summary": "창가 책상 사진 위에 기울인 손글씨 제목과 종이테이프 모양 회차 꼬리표를 얹은 브이로그 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "일상 브이로그",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 손글씨 제목, 회차 꼬리표",
    "fonts": [
      "Pretendard",
      "Caveat",
      "Nanum Pen Script",
      "Gowun Dodum"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Brendan Sapp",
        "url": "https://unsplash.com/@hypelights",
        "photoUrl": "https://unsplash.com/photos/igf2Wko-1M8"
      }
    ]
  },
  {
    "id": "YT-10",
    "title": "제주 3박 4일 · 즉석 사진 두 장과 도장",
    "summary": "청록 바탕에 즉석 사진처럼 흰 테를 두른 사진 두 장을 기울여 겹치고 점선 도장을 둔 여행 썸네일.",
    "format": "yt",
    "formatLabel": "유튜브 썸네일",
    "spec": "16:9 · 1280×720px",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "여행 채널",
    "pages": [
      [
        1280,
        720
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 2장, 제목 2줄, 도장 문구",
    "fonts": [
      "Pretendard",
      "Do Hyeon",
      "Righteous"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Ezgi Deliklitas",
        "url": "https://unsplash.com/@ezgideliklitas",
        "photoUrl": "https://unsplash.com/photos/itS3BI5Gsic"
      },
      {
        "name": "남휴 김",
        "url": "https://unsplash.com/@skagb15",
        "photoUrl": "https://unsplash.com/photos/FngJfCVqxOQ"
      }
    ]
  },
  {
    "id": "YV-01",
    "title": "레시피 영상 · 바탕체 제목과 재료 카드",
    "summary": "음식 사진 위로 바탕체 제목이 올라오고, 재료 목록 카드가 밀려 들어온 뒤 구독 안내로 끝나는 요리 영상 오프닝.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "요리 채널 오프닝",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 채널 이름, 요리 이름, 재료 5가지, 마무리 문구",
    "fonts": [
      "Pretendard",
      "Gowun Batang",
      "Cormorant Garamond"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Homescreenify",
        "url": "https://unsplash.com/@homescreenify",
        "photoUrl": "https://unsplash.com/photos/sA3wymYqyaI"
      },
      {
        "name": "Fer Troulik",
        "url": "https://unsplash.com/@fertroulik",
        "photoUrl": "https://unsplash.com/photos/oJNui63TybQ"
      }
    ]
  },
  {
    "id": "YV-02",
    "title": "뷰티 영상 · 반반 나눔과 순서 줄",
    "summary": "흰 면의 가는 제목 옆으로 사진이 열리고, 순서 세 줄이 가는 선과 함께 차례로 나타나는 뷰티 튜토리얼 오프닝.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "메이크업 튜토리얼",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 채널 이름, 제목 2줄, 순서 3가지, 계정",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Darren Nunis",
        "url": "https://unsplash.com/@dnunis",
        "photoUrl": "https://unsplash.com/photos/GpVCM7qzGss"
      },
      {
        "name": "MaxeyLash",
        "url": "https://unsplash.com/@maxeylash",
        "photoUrl": "https://unsplash.com/photos/JNuPhasKGbU"
      }
    ]
  },
  {
    "id": "YV-03",
    "title": "강의 영상 · 남색 격자와 차시 카드",
    "summary": "남색 격자 위에 차시 번호와 굵은 제목이 뜨고, 배울 것 세 장이 튀어 오른 뒤 강사 이름 띠로 끝나는 강의 오프닝.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "온라인 강의 오프닝",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 1장, 강의 이름 · 차시, 배울 것 3가지, 강사 이름 · 소속",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/OyAk8R-EwYc"
      }
    ]
  },
  {
    "id": "YV-04",
    "title": "시공 사례 영상 · 금색 선과 전후 비교",
    "summary": "공간 사진 위로 금색 선이 그어지며 세리프 제목이 뜨고, 시공 전후 사진이 나란히 열린 뒤 상담 안내로 끝나는 사례 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "인테리어 시공 사례 영상",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장(전 · 후), 회사 이름, 사례 이름, 한 줄 설명, 상담 연락처",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "POOJAN THANEKAR",
        "url": "https://unsplash.com/@poojanclicks",
        "photoUrl": "https://unsplash.com/photos/XWRW66qiRp8"
      },
      {
        "name": "Anatoliy Shostak",
        "url": "https://unsplash.com/@photogolic",
        "photoUrl": "https://unsplash.com/photos/IasjS2LqqIc"
      }
    ]
  },
  {
    "id": "YV-05",
    "title": "제품 광고 · 빨강 검정과 큰 낱말",
    "summary": "빨간 화면에 큰 글자가 튀어나오고 제품 사진과 특징 낱말이 빠르게 이어진 뒤 출시일로 끝나는 짧은 광고 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "신제품 광고 영상",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 1장, 제품 이름, 특징 낱말 3개, 출시일 · 판매처",
    "fonts": [
      "Pretendard",
      "Anton",
      "Black Han Sans"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Manki Kim",
        "url": "https://unsplash.com/@kimdonkey",
        "photoUrl": "https://unsplash.com/photos/IdeukDnXUDs"
      }
    ]
  },
  {
    "id": "YV-06",
    "title": "서비스 소개 · 말풍선 질문과 알약 칩",
    "summary": "말풍선 질문이 튀어 오르고 둥근 사진 카드 옆으로 기능 칩이 들어온 뒤 시작 안내로 끝나는 서비스 소개 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "서비스 소개 영상",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 1장, 질문 문장, 기능 3가지, 서비스 이름, 시작 안내",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Walls.io",
        "url": "https://unsplash.com/@walls_io",
        "photoUrl": "https://unsplash.com/photos/yMDlCJaLvYc"
      }
    ]
  },
  {
    "id": "YV-07",
    "title": "정책 홍보 영상 · 풍경과 풀빛 안내 띠",
    "summary": "들판 풍경 위로 돋움 제목이 뜨고, 지원 내용 세 가지가 풀빛 띠로 차례로 들어온 뒤 문의처로 끝나는 정책 홍보 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "귀농 지원 정책 영상",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 기관 이름, 제목 2줄, 지원 내용 3가지, 문의처",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Koji Igarashi",
        "url": "https://unsplash.com/@igarashi_koji",
        "photoUrl": "https://unsplash.com/photos/d0z-euLVlOc"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/sBkZeWpGxoI"
      }
    ]
  },
  {
    "id": "YV-08",
    "title": "대학 홍보 영상 · 테두리 연도와 세 칸",
    "summary": "캠퍼스 사진 위로 테두리만 있는 큰 연도와 굵은 제목이 뜨고, 소개 세 칸이 줄과 함께 나타난 뒤 학교 이름으로 끝나는 홍보 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "대학 홍보 영상 오프닝",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 학교 이름, 연도, 제목, 소개 3칸, 마무리 문장",
    "fonts": [
      "Pretendard",
      "Archivo Black"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "ran liwen",
        "url": "https://unsplash.com/@nikol_royce",
        "photoUrl": "https://unsplash.com/photos/84OlXDdlvbo"
      },
      {
        "name": "Falaq Lazuardi",
        "url": "https://unsplash.com/@falaqkun",
        "photoUrl": "https://unsplash.com/photos/dZz16D0ke1A"
      }
    ]
  },
  {
    "id": "YV-09",
    "title": "브이로그 타이틀 · 캠코더 화면과 즉석 사진",
    "summary": "옛 캠코더 화면처럼 꾸민 사진 위에 노란 제목이 뜨고, 즉석 사진 두 장이 떨어진 뒤 다음 영상 안내로 끝나는 브이로그 타이틀.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "브이로그 타이틀",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 날짜, 제목, 한 줄 문구, 마무리 인사",
    "fonts": [
      "Pretendard",
      "JetBrains Mono",
      "Do Hyeon",
      "Nanum Pen Script"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jason An",
        "url": "https://unsplash.com/@jasonan",
        "photoUrl": "https://unsplash.com/photos/ZQGlMS5FuEU"
      },
      {
        "name": "tommao wang",
        "url": "https://unsplash.com/@tommaomaoer",
        "photoUrl": "https://unsplash.com/photos/g5F2sEwXctM"
      }
    ]
  },
  {
    "id": "YV-10",
    "title": "축제 영상 · 흐르는 큰 글자와 날짜",
    "summary": "밤 축제 사진 위로 큰 글자 띠가 옆으로 흐르고, 날짜와 장소가 튀어나온 뒤 예매 안내로 끝나는 행사 홍보 영상.",
    "format": "yv",
    "formatLabel": "유튜브 동영상",
    "spec": "16:9 · 1920×1080px · MP4",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "축제 하이라이트 영상",
    "pages": [
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ],
      [
        1920,
        1080
      ]
    ],
    "video": 8,
    "swap": "사진 2장, 축제 이름, 흐르는 영문, 날짜 · 장소, 예매 주소",
    "fonts": [
      "Pretendard",
      "Anton",
      "Black Han Sans"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "noodle kimm",
        "url": "https://unsplash.com/@noodlekim",
        "photoUrl": "https://unsplash.com/photos/lpWDJfq1URk"
      },
      {
        "name": "Tim Winkler",
        "url": "https://unsplash.com/@timdannmalweg",
        "photoUrl": "https://unsplash.com/photos/kv4nO9JWt1I"
      }
    ]
  },
  {
    "id": "IG-01",
    "title": "주말 브런치 · 사진 위 크림색 카드",
    "summary": "위에서 찍은 식탁 사진을 가득 채우고 아래에 크림색 안내 카드를 얹은 새 메뉴 공지.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "브런치 카페",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 가게 이름, 제목 2줄, 메뉴 · 시간",
    "fonts": [
      "Pretendard",
      "Gowun Dodum",
      "Gowun Batang"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jingxi Lau",
        "url": "https://unsplash.com/@imajingation",
        "photoUrl": "https://unsplash.com/photos/WfcBiBvcZ04"
      }
    ]
  },
  {
    "id": "IG-02",
    "title": "가을 컬러 · 검은 세로 띠와 세로 영문",
    "summary": "검은 세로 띠에 세로로 돌린 영문을 두고 오른쪽에 머릿결 사진을 채운 예약 공지.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "헤어 살롱",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 살롱 이름, 세로 영문, 제목 2줄, 안내 1줄",
    "fonts": [
      "Pretendard",
      "Bodoni Moda",
      "Noto Serif KR"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Nasim Keshmiri",
        "url": "https://unsplash.com/@nasimkeshmiri",
        "photoUrl": "https://unsplash.com/photos/EsqgrDmVQcE"
      }
    ]
  },
  {
    "id": "IG-03",
    "title": "퇴근 후 영어 · 원형 사진과 말풍선",
    "summary": "보라 바탕에 원형 사진과 말풍선 두 개, 아래에 흰 안내 띠를 둔 모임 모집 글.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "영어 회화 모임",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 제목 2줄, 말풍선 2개, 일정 안내",
    "fonts": [
      "Pretendard",
      "Jua",
      "Pacifico"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Johan Mouchet",
        "url": "https://unsplash.com/@johanmouchet",
        "photoUrl": "https://unsplash.com/photos/5ZiegzbHGak"
      }
    ]
  },
  {
    "id": "IG-04",
    "title": "이사 견적 · 노랑 검정과 빗금 띠",
    "summary": "위는 노란 바탕의 굵은 제목, 아래는 작업 사진, 사이에 빗금 띠를 둔 서비스 안내.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "이사 업체",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 제목 3줄, 서비스 꼬리표, 원형 배지 문구",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Richard Stachmann",
        "url": "https://unsplash.com/@stachmann",
        "photoUrl": "https://unsplash.com/photos/GgmZ23grWNY"
      }
    ]
  },
  {
    "id": "IG-05",
    "title": "오늘 밤은 천천히 · 손글씨 캡션",
    "summary": "베이지 바탕에 둥근 모서리 사진과 손글씨 한 줄, 가격 알약을 둔 제품 소개.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "수제 캔들 가게",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 손글씨 한 줄, 제품 이름, 가격",
    "fonts": [
      "Pretendard",
      "Nanum Pen Script",
      "Gowun Dodum"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jessica Mangano",
        "url": "https://unsplash.com/@jfdelp",
        "photoUrl": "https://unsplash.com/photos/aJ2A7SRp8Js"
      }
    ]
  },
  {
    "id": "IG-06",
    "title": "기능 업데이트 · 창 모양 카드",
    "summary": "연한 남보라 바탕에 굵은 제목과 창 모양 사진 카드, 기능 세 줄을 둔 업데이트 공지.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "협업 도구 SaaS",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장(화면 캡처로 바꿔도 됨), 판 번호, 제목 2줄, 기능 3개",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Carlos Muza",
        "url": "https://unsplash.com/@kmuza",
        "photoUrl": "https://unsplash.com/photos/hpjSkU2UYSU"
      }
    ]
  },
  {
    "id": "IG-07",
    "title": "폭염 행동 요령 · 큰 숫자와 세 줄",
    "summary": "흰 바탕에 가는 큰 숫자와 작은 사진, 행동 요령 세 줄만 둔 안전 안내.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "폭염 안전 안내",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 기관 이름, 숫자, 제목, 요령 3줄",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Mineragua Sparkling Water",
        "url": "https://unsplash.com/@mineragua",
        "photoUrl": "https://unsplash.com/photos/YoUmTMW0FJA"
      }
    ]
  },
  {
    "id": "IG-08",
    "title": "가을밤 인문학 · 초록 테두리와 도장",
    "summary": "크림색 바탕에 초록 테두리, 옛 책 표지 같은 제목과 붉은 테두리 사진, 도장을 둔 강좌 안내.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "도서관 인문학 강좌",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 제목 2줄, 일정, 도장 문구",
    "fonts": [
      "Pretendard",
      "Song Myung"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Tat Linh Nguyen",
        "url": "https://unsplash.com/@niko_nguyen_10",
        "photoUrl": "https://unsplash.com/photos/9pIQqsbceHY"
      }
    ]
  },
  {
    "id": "IG-09",
    "title": "개인전 · 주황 면과 세로 영문",
    "summary": "검은 바탕에 주황 면을 어긋나게 깐 사진과 세로 영문, 고정폭 글꼴 전시 정보를 둔 전시 공지.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "사진작가 개인전",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 전시 이름, 기간 · 장소 · 관람 안내",
    "fonts": [
      "Pretendard",
      "Syne",
      "JetBrains Mono"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Dynamic Wang",
        "url": "https://unsplash.com/@dynamicwang",
        "photoUrl": "https://unsplash.com/photos/T6-j6stu8ZE"
      }
    ]
  },
  {
    "id": "IG-10",
    "title": "고요한 하룻밤 · 위 사진 아래 바탕체",
    "summary": "위에 한옥 사진을 두고 아래 베이지 면에 바탕체 제목과 세 칸 정보를 둔 숙소 소개.",
    "format": "ig",
    "formatLabel": "인스타그램 피드",
    "spec": "4:5 · 1080×1350px",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "한옥 스테이",
    "pages": [
      [
        1080,
        1350
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 제목, 한 줄 소개, 정보 3칸",
    "fonts": [
      "Pretendard",
      "Gowun Batang"
    ],
    "outputs": [
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Soyoung HAN",
        "url": "https://unsplash.com/@soflightsto",
        "photoUrl": "https://unsplash.com/photos/D7CtUmSy0_I"
      }
    ]
  },
  {
    "id": "RL-01",
    "title": "오늘의 점심 · 노란 스티커와 큰 가격",
    "summary": "음식 사진 위에 노란 스티커와 굵은 메뉴 이름이 튀어나오고, 구성과 가격, 가게 위치가 이어지는 점심 메뉴 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "식당 오늘의 메뉴",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 2장, 메뉴 이름, 구성 3가지, 가격, 가게 이름 · 위치",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "BRALRO",
        "url": "https://unsplash.com/@bralro",
        "photoUrl": "https://unsplash.com/photos/LniQ7Z7rJPk"
      },
      {
        "name": "Daniel",
        "url": "https://unsplash.com/@unsplashbydan",
        "photoUrl": "https://unsplash.com/photos/QcfJl9QQbWk"
      }
    ]
  },
  {
    "id": "RL-02",
    "title": "관리 과정 · 금색 선과 세리프 자막",
    "summary": "어두운 사진 위에 금색 가는 선과 세리프 제목이 뜨고, 관리 순서가 자막처럼 바뀐 뒤 예약 안내로 끝나는 살롱 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "피부 관리 과정",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 9,
    "swap": "사진 2장, 가게 이름, 프로그램 이름, 순서 3단계, 예약 안내",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "kimia kazemi",
        "url": "https://unsplash.com/@kimick",
        "photoUrl": "https://unsplash.com/photos/RbIcMsh0NSk"
      },
      {
        "name": "Anna Keibalo",
        "url": "https://unsplash.com/@anyutakejbalo",
        "photoUrl": "https://unsplash.com/photos/BJ7i-96glwM"
      }
    ]
  },
  {
    "id": "RL-03",
    "title": "오늘의 표현 · 말풍선과 뜻 카드",
    "summary": "밝은 바탕에 표현이 말풍선으로 튀어나오고, 뜻과 예문 카드가 올라온 뒤 저장 안내로 끝나는 짧은 교육 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "1분 영어 표현",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 1장, 영어 표현, 뜻, 예문 2줄, 계정",
    "fonts": [
      "Pretendard",
      "Jua",
      "Pacifico"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Brooke Cagle",
        "url": "https://unsplash.com/@brookecagle",
        "photoUrl": "https://unsplash.com/photos/evjOJMOEViE"
      }
    ]
  },
  {
    "id": "RL-04",
    "title": "오늘 들어온 꽃 · 손글씨와 이름표",
    "summary": "꽃 사진 위에 손글씨 제목이 뜨고, 꽃 이름이 종이 이름표처럼 하나씩 붙은 뒤 주문 안내로 끝나는 꽃집 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "꽃집 오늘의 꽃",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 2장, 손글씨 제목, 꽃 이름 3가지, 주문 안내, 가게 이름",
    "fonts": [
      "Pretendard",
      "Nanum Pen Script",
      "Gowun Batang"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Ксения Лапшина",
        "url": "https://unsplash.com/@nekandinskaya",
        "photoUrl": "https://unsplash.com/photos/chiwfy2ZF30"
      },
      {
        "name": "Volodymyr Lymariev",
        "url": "https://unsplash.com/@vlmrv",
        "photoUrl": "https://unsplash.com/photos/kDeW2wMjiY8"
      }
    ]
  },
  {
    "id": "RL-05",
    "title": "신상 소개 · 흰 여백과 가는 자막",
    "summary": "흰 여백의 제품 사진에 가는 제목이 뜨고, 세부 설명이 가는 선과 함께 바뀐 뒤 가격과 링크로 끝나는 제품 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "신상 가방 소개",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 9,
    "swap": "사진 2장, 브랜드 이름, 제품 이름, 설명 3줄, 가격",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Ugluk Potroshitel",
        "url": "https://unsplash.com/@uglug",
        "photoUrl": "https://unsplash.com/photos/XwjrPFW7xw0"
      },
      {
        "name": "Josh Marty",
        "url": "https://unsplash.com/@jaym30",
        "photoUrl": "https://unsplash.com/photos/OtzYV6uMT-E"
      }
    ]
  },
  {
    "id": "RL-06",
    "title": "앱 소개 · 휴대폰 틀과 기능 칩",
    "summary": "남색 격자 위에 휴대폰 틀이 올라오고 그 옆으로 기능 칩이 차례로 붙은 뒤 내려받기 안내로 끝나는 앱 소개 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "앱 기능 소개",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 1장(앱 화면으로 바꿔도 됨), 앱 이름, 제목 2줄, 기능 3가지, 내려받기 안내",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "nobleseed nobleseed",
        "url": "https://unsplash.com/@nobleseed",
        "photoUrl": "https://unsplash.com/photos/suYD1MCLU4g"
      }
    ]
  },
  {
    "id": "RL-07",
    "title": "줍깅 캠페인 · 풀빛 띠와 세 가지 순서",
    "summary": "공원 사진 위에 돋움 제목이 뜨고, 참여 순서 세 가지가 풀빛 띠로 들어온 뒤 날짜와 장소로 끝나는 주민 참여 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "줍깅 캠페인",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 2장, 기관 이름, 제목, 순서 3가지, 일시 · 장소",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Hạnh Kiều",
        "url": "https://unsplash.com/@hanhkv67",
        "photoUrl": "https://unsplash.com/photos/A_hX_MBKck0"
      },
      {
        "name": "Elbert Lora",
        "url": "https://unsplash.com/@elbertlora",
        "photoUrl": "https://unsplash.com/photos/BEh2OUtmDTw"
      }
    ]
  },
  {
    "id": "RL-08",
    "title": "이달의 책 · 초록 테두리와 책 목록",
    "summary": "옛 책 표지 같은 초록 테두리 화면에 제목이 뜨고, 추천 책 세 권이 도장과 함께 차례로 나온 뒤 대출 안내로 끝나는 도서관 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "도서관 이달의 책",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 7,
    "swap": "사진 1장, 기관 이름 · 달, 책 3권(제목 · 한 줄), 안내 문구",
    "fonts": [
      "Pretendard",
      "Song Myung"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jelezniac Bianca",
        "url": "https://unsplash.com/@jelezniac_bianca",
        "photoUrl": "https://unsplash.com/photos/IiSDINHBh-M"
      }
    ]
  },
  {
    "id": "RL-09",
    "title": "작업 과정 · 어두운 바탕과 시간 표시",
    "summary": "어두운 작업실 사진 위에 굵은 제목이 뜨고, 고정폭 글꼴 시간 표시와 함께 과정 세 장면이 이어진 뒤 계정으로 끝나는 작가 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "작업 과정 기록",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 9,
    "swap": "사진 2장, 제목 2줄, 과정 3단계(시간 · 설명), 계정",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Raymond Petrik",
        "url": "https://unsplash.com/@raymondpetrik",
        "photoUrl": "https://unsplash.com/photos/Gc6-JR_23oQ"
      },
      {
        "name": "Jason Leung",
        "url": "https://unsplash.com/@ninjason",
        "photoUrl": "https://unsplash.com/photos/fHARer-KO3E"
      }
    ]
  },
  {
    "id": "RL-10",
    "title": "주말 여행지 · 큰 숫자와 지역 이름",
    "summary": "풍경 사진 위에 굵은 제목이 튀어나오고, 큰 숫자와 함께 추천 장소 세 곳이 바뀐 뒤 저장 안내로 끝나는 여행 릴스.",
    "format": "rl",
    "formatLabel": "인스타그램 릴스",
    "spec": "9:16 · 1080×1920px · MP4",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "여행지 추천",
    "pages": [
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ],
      [
        1080,
        1920
      ]
    ],
    "video": 9,
    "swap": "사진 2장, 제목 2줄, 장소 3곳(이름 · 한 줄), 계정",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "MP4 영상",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vincent Yap",
        "url": "https://unsplash.com/@chonky_films",
        "photoUrl": "https://unsplash.com/photos/-Qw4PCq_5Uo"
      },
      {
        "name": "Marisca Kadharmestan",
        "url": "https://unsplash.com/@marisca_kadharmestan",
        "photoUrl": "https://unsplash.com/photos/HmNssAygTlw"
      }
    ]
  },
  {
    "id": "BC-01",
    "title": "셰프 명함 · 크림색과 바탕체",
    "summary": "앞은 크림색 바탕에 바탕체 이름과 가는 줄, 뒤는 음식 사진을 가득 채운 식당 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "레스토랑 셰프",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 가게 이름, 이름 · 직함, 전화 · 주소 · 계정",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Scott Greer",
        "url": "https://unsplash.com/@sgreer",
        "photoUrl": "https://unsplash.com/photos/81yZExqt-J8"
      }
    ]
  },
  {
    "id": "BC-02",
    "title": "디자이너 명함 · 검정과 금색 머리글자",
    "summary": "앞은 검은 바탕에 금색 세리프 머리글자와 가는 테두리, 뒤는 세로 사진과 연락처를 나눠 둔 살롱 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "헤어 디자이너",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 머리글자, 살롱 이름, 이름 · 직함, 예약 연락처",
    "fonts": [
      "Pretendard",
      "Playfair Display",
      "Cinzel",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "mojtaba mosayebzadeh",
        "url": "https://unsplash.com/@mojiw",
        "photoUrl": "https://unsplash.com/photos/P6LQsWcbbmM"
      }
    ]
  },
  {
    "id": "BC-03",
    "title": "강사 명함 · 노랑 보라와 말풍선",
    "summary": "앞은 노란 바탕에 원형 인물 사진과 말풍선, 뒤는 보라 바탕에 둥근 글자 이름과 연락처를 둔 강사 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "영어 강사",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "정사각 인물 사진 1장, 이름, 하는 일, 전화 · 계정",
    "fonts": [
      "Pretendard",
      "Pacifico",
      "Jua"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "SYLE STUDIO",
        "url": "https://unsplash.com/@syle_studio",
        "photoUrl": "https://unsplash.com/photos/lijVRKA-kxs"
      }
    ]
  },
  {
    "id": "BC-04",
    "title": "중개사 명함 · 흰 바탕과 남색 띠",
    "summary": "앞은 흰 바탕에 굵은 이름과 남색 세로 띠, 뒤는 건물 사진 위에 상호와 한 줄 소개를 둔 중개사무소 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "공인중개사",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 상호, 이름 · 자격, 전화 · 주소 · 등록 번호",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Hans Eiskonen",
        "url": "https://unsplash.com/@eiskonen",
        "photoUrl": "https://unsplash.com/photos/q7dmr-o4GiM"
      }
    ]
  },
  {
    "id": "BC-05",
    "title": "가게 명함 · 풀빛과 둥근 사진",
    "summary": "앞은 연한 풀빛 바탕에 돋움 상호와 둥근 제품 사진, 뒤는 영업 정보와 계정을 둔 작은 가게 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "수제 비누 가게",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 가게 이름, 한 줄 소개, 주소 · 영업 시간 · 계정",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Chris Ross-Lewin",
        "url": "https://unsplash.com/@chrisrl",
        "photoUrl": "https://unsplash.com/photos/EVlB4PwK4dg"
      }
    ]
  },
  {
    "id": "BC-06",
    "title": "개발자 명함 · 빨강 검정과 큰 머리글자",
    "summary": "앞은 빨간 바탕에 화면을 채우는 큰 머리글자, 뒤는 검은 바탕의 고정폭 글꼴 연락처와 작업 사진을 둔 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "소프트웨어 엔지니어",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 머리글자, 이름 · 직함, 메일 · 전화 · 저장소 주소",
    "fonts": [
      "Pretendard",
      "Archivo Black",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Nubelson Fernandes",
        "url": "https://unsplash.com/@nublson",
        "photoUrl": "https://unsplash.com/photos/fUWz3rwA8Ag"
      }
    ]
  },
  {
    "id": "BC-07",
    "title": "공무원 명함 · 흰 바탕과 가는 구분선",
    "summary": "앞은 흰 바탕에 부서 · 이름 · 연락처를 가는 구분선으로 나눈 기본형, 뒤는 도시 풍경 사진과 한 줄 문구를 둔 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "지자체 공무원",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 부서 · 직급 · 이름, 전화 · 메일 · 주소",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Alexandr K",
        "url": "https://unsplash.com/@ator",
        "photoUrl": "https://unsplash.com/photos/p8dCtIfY86o"
      }
    ]
  },
  {
    "id": "BC-08",
    "title": "교수 명함 · 아이보리와 두 나라 말",
    "summary": "앞은 아이보리 바탕에 세리프로 한글 · 영문을 나란히 둔 형식, 뒤는 캠퍼스 사진과 학교 이름을 둔 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "대학 교수",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 학교 · 학과, 이름 · 직함(한글 · 영문), 연구실 · 메일 · 전화",
    "fonts": [
      "Pretendard",
      "Noto Serif KR",
      "Cinzel",
      "Cormorant Garamond"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt",
        "photoUrl": "https://unsplash.com/photos/7Pbixyo4fME"
      }
    ]
  },
  {
    "id": "BC-09",
    "title": "세로 명함 · 사진 가득과 세로 이름",
    "summary": "세로 명함 앞에 작품 사진을 가득 채우고 세로 영문 이름을 얹고, 뒤는 흰 바탕에 하는 일과 연락처를 둔 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "사진작가",
    "pages": [
      [
        591,
        1063
      ],
      [
        591,
        1063
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 이름(영문 · 한글), 하는 일 3가지, 메일 · 전화 · 계정",
    "fonts": [
      "Pretendard",
      "Syne",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Brooke Balentine",
        "url": "https://unsplash.com/@brookebalentine",
        "photoUrl": "https://unsplash.com/photos/ei-UPr5BsAs"
      }
    ]
  },
  {
    "id": "BC-10",
    "title": "캠핑장 명함 · 옛 배지와 줄무늬",
    "summary": "앞은 크림색 바탕에 옛 야영 배지 모양과 줄무늬, 뒤는 캠핑장 사진과 예약 정보를 나눠 둔 명함.",
    "format": "bc",
    "formatLabel": "명함",
    "spec": "90×50mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "캠핑장",
    "pages": [
      [
        1063,
        591
      ],
      [
        1063,
        591
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 캠핑장 이름, 한 줄 소개, 예약 전화 · 주소 · 계정",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Do Hyeon"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Dex Ezekiel",
        "url": "https://unsplash.com/@dexezekiel",
        "photoUrl": "https://unsplash.com/photos/DjJgphP2EuQ"
      }
    ]
  },
  {
    "id": "PO-01",
    "title": "갓 구운 아침 · 아치 사진",
    "summary": "아치 모양 사진 아래에 바탕체 제목을 둔 동네 가게 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "베이커리",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 가게 이름, 제목, 영업 정보 3칸",
    "fonts": [
      "Pretendard",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Kavita Joshi Rai",
        "url": "https://unsplash.com/@kjrai",
        "photoUrl": "https://unsplash.com/photos/lE5O9DktAQY"
      }
    ]
  },
  {
    "id": "PO-02",
    "title": "몸의 중심 · 여백과 세로 사진",
    "summary": "흰 여백에 세로 사진 한 장과 가는 제목만 둔 스튜디오 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "필라테스 스튜디오",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 스튜디오 이름, 제목 2줄, 모집 문구",
    "fonts": [
      "Pretendard",
      "Italiana"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "ROXANA POPOVICI",
        "url": "https://unsplash.com/@roxanarxx",
        "photoUrl": "https://unsplash.com/photos/cZ0WYsBFHhs"
      }
    ]
  },
  {
    "id": "PO-03",
    "title": "코딩 처음부터 · 기울인 사진",
    "summary": "파란 바탕에 굵은 제목을 쌓고 기울인 사진과 스티커를 겹친 모집 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "코딩 학원",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 제목 3줄, 스티커 문구, 대상 · 정원 · 문의",
    "fonts": [
      "Pretendard",
      "JetBrains Mono",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/EA0-iajPYFE"
      }
    ]
  },
  {
    "id": "PO-04",
    "title": "머무는 공간 · 어두운 바탕과 금색 선",
    "summary": "어두운 바탕에 공간 사진을 크게 깔고 금색 가는 선과 세리프 제목을 둔 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "인테리어 스튜디오",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 제목 2줄, 영문 한 줄, 상담 연락처",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Roberto Nickson",
        "url": "https://unsplash.com/@rpnickson",
        "photoUrl": "https://unsplash.com/photos/rEJxpBskj3Q"
      }
    ]
  },
  {
    "id": "PO-05",
    "title": "자연에서 온 한 병 · 둥근 사진과 알약 칩",
    "summary": "연한 풀빛 바탕에 둥근 제품 사진과 성분 칩을 둔 신제품 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "스킨케어 브랜드",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 제품 사진 1장, 제품 이름, 제목, 특징 칩 3개",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Nataliya Melnychuk",
        "url": "https://unsplash.com/@natinati",
        "photoUrl": "https://unsplash.com/photos/j7AuEdr36W8"
      }
    ]
  },
  {
    "id": "PO-06",
    "title": "AI로 만드는 다음 제품 · 격자와 원형 사진",
    "summary": "남색 격자 바탕에 굵은 제목, 원형 사진, 고정폭 글꼴 정보를 둔 행사 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "개발자 컨퍼런스",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "사진 1장, 행사 이름, 제목 2줄, 일시 · 장소 · 참가 방법",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Headway",
        "url": "https://unsplash.com/@headwayio",
        "photoUrl": "https://unsplash.com/photos/F2KRf_QfCqw"
      }
    ]
  },
  {
    "id": "PO-07",
    "title": "청년 일자리 박람회 · 노랑과 파랑",
    "summary": "노란 바탕에 둥근 제목과 기울인 사진, 흰 정보 카드 3장을 둔 지자체 행사 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "청년 일자리 박람회",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 행사 이름, 말풍선 문구, 일시 · 장소 · 신청",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Helena Lopes",
        "url": "https://unsplash.com/@helenalopesph",
        "photoUrl": "https://unsplash.com/photos/e3OUQGT9bWU"
      }
    ]
  },
  {
    "id": "PO-08",
    "title": "입학설명회 · 사진 위 테두리 숫자",
    "summary": "위쪽 캠퍼스 사진에 테두리 숫자를 걸치고 아래에 제목과 정보 표를 둔 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "대학 입학처",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 학년도, 제목, 정보 4줄, 기관 이름",
    "fonts": [
      "Pretendard",
      "Archivo Black"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Wonderlane",
        "url": "https://unsplash.com/@wonderlane",
        "photoUrl": "https://unsplash.com/photos/6zlgM-GUd6I"
      }
    ]
  },
  {
    "id": "PO-09",
    "title": "단독 공연 · 햇살 무늬와 원형 사진",
    "summary": "크림색 바탕의 방사 무늬 한가운데 원형 사진을 두고 아래를 입장권처럼 꾸민 공연 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "인디 뮤지션 공연",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 공연 이름, 아티스트 이름, 일시 · 장소 · 예매",
    "fonts": [
      "Pretendard",
      "Shrikhand",
      "Do Hyeon"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Matthew Lancaster",
        "url": "https://unsplash.com/@matthewelancaster",
        "photoUrl": "https://unsplash.com/photos/V_LrP7TyJRo"
      }
    ]
  },
  {
    "id": "PO-10",
    "title": "여름 음악 축제 · 사진 가득 큰 영문",
    "summary": "관객 사진을 가득 채우고 폭 좁은 큰 영문 제목과 출연진 줄을 얹은 축제 포스터.",
    "format": "po",
    "formatLabel": "포스터",
    "spec": "A2 · 420×594mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "여름 음악 축제",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 축제 이름, 출연진 줄, 일시 · 장소",
    "fonts": [
      "Pretendard",
      "Black Han Sans",
      "Anton"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jorik Kleen",
        "url": "https://unsplash.com/@jorikkleen",
        "photoUrl": "https://unsplash.com/photos/3iFgZwVgwLM"
      }
    ]
  },
  {
    "id": "FL-01",
    "title": "오픈 전단 · 빨강 노랑과 오려 쓰는 쿠폰",
    "summary": "빨간 바탕에 큰 영문과 원형 음식 사진, 메뉴 네 칸, 점선 쿠폰을 둔 가게 오픈 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "수제버거 가게",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 가게 이름 · 오픈 날짜, 메뉴 4개와 가격, 쿠폰 문구, 주소 · 전화",
    "fonts": [
      "Pretendard",
      "Anton",
      "Black Han Sans",
      "Do Hyeon"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "engin akyurt",
        "url": "https://unsplash.com/@enginakyurt",
        "photoUrl": "https://unsplash.com/photos/-LXbCRmEJDk"
      }
    ]
  },
  {
    "id": "FL-02",
    "title": "쉬어 가는 한 시간 · 살구빛과 가격표",
    "summary": "살구빛 바탕에 한쪽이 둥근 사진과 바탕체 제목, 프로그램 가격표를 둔 관리실 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "피부 관리실",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 가게 이름, 제목 2줄, 프로그램 4개(시간 · 가격), 예약 방법",
    "fonts": [
      "Pretendard",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Abiwin Krisna",
        "url": "https://unsplash.com/@abiwin",
        "photoUrl": "https://unsplash.com/photos/LcX6tUGKPuI"
      }
    ]
  },
  {
    "id": "FL-03",
    "title": "신학기 모집 · 파란 머리와 시간표",
    "summary": "파란 머리 면에 굵은 제목과 걸쳐 놓은 수업 사진, 아래에 시간표와 특징 세 칸을 둔 모집 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "수학 학원",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 학원 이름 · 학기, 시간표 4줄, 특징 3개, 상담 연락처",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Taylor Flowe",
        "url": "https://unsplash.com/@taypaigey",
        "photoUrl": "https://unsplash.com/photos/4nKOEAQaTgA"
      }
    ]
  },
  {
    "id": "FL-04",
    "title": "반짝반짝 입주 청소 · 민트와 별",
    "summary": "민트 바탕에 둥근 제목과 원형 사진, 청소 범위 목록과 평수별 가격, 할인 쿠폰을 둔 생활 서비스 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "입주 청소 업체",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 제목, 청소 범위 4개, 평수별 가격 3칸, 쿠폰 · 연락처",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Anton",
        "url": "https://unsplash.com/@uniqueton",
        "photoUrl": "https://unsplash.com/photos/SnKfmC1I9fU"
      }
    ]
  },
  {
    "id": "FL-05",
    "title": "제철 과일 큰잔치 · 옛 마트 전단",
    "summary": "크림색 바탕에 붉은 머리띠와 바둑판 띠, 상품 세 칸과 원형 가격표를 둔 옛 마트풍 할인 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "과일 가게",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 3장, 행사 이름 · 기간, 상품 3개(이름 · 단위 · 가격), 가게 정보",
    "fonts": [
      "Pretendard",
      "Do Hyeon",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Terra Slaybaugh",
        "url": "https://unsplash.com/@terras",
        "photoUrl": "https://unsplash.com/photos/LCDYCLEJlEo"
      },
      {
        "name": "Reuben",
        "url": "https://unsplash.com/@re",
        "photoUrl": "https://unsplash.com/photos/vAdBSX2PSMs"
      },
      {
        "name": "Yasaman Abedini",
        "url": "https://unsplash.com/@yas_abedini",
        "photoUrl": "https://unsplash.com/photos/MfrXtyOe8vw"
      }
    ]
  },
  {
    "id": "FL-06",
    "title": "도입 안내 · 흰 여백과 가는 줄",
    "summary": "흰 바탕에 가는 제목과 세로 제품 사진, 특징 세 줄과 사양 표만 둔 B2B 도입 안내문.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "무인 주문기 솔루션",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 회사 이름, 제목 2줄, 특징 3개, 사양 4줄, 상담 연락처",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Onesix",
        "url": "https://unsplash.com/@onesix",
        "photoUrl": "https://unsplash.com/photos/LBikV4HMGwM"
      }
    ]
  },
  {
    "id": "FL-07",
    "title": "지원사업 안내 · 남색 바탕과 노란 마감 띠",
    "summary": "남색 바탕에 굵은 흰 제목과 기울인 노란 마감 띠, 사진과 흰 정보 카드 네 장을 둔 지원사업 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "소상공인 지원사업",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 사업 이름, 마감일, 정보 카드 4개, 기관 이름 · 전화",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/4Ln5tLKUDrw"
      }
    ]
  },
  {
    "id": "FL-08",
    "title": "옛 그릇 이야기 · 올리브색과 일정 목록",
    "summary": "연한 올리브색 바탕에 체험 사진과 돋움 제목, 회차별 일정 목록을 둔 교육 프로그램 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "박물관 어린이 교육",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 프로그램 이름, 회차 4줄, 대상 · 참가비 · 신청, 기관 이름",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Karen Maes",
        "url": "https://unsplash.com/@karen1974",
        "photoUrl": "https://unsplash.com/photos/9bnJPZdU_pU"
      }
    ]
  },
  {
    "id": "FL-09",
    "title": "흙을 만지는 토요일 · 흙빛과 세로 영문",
    "summary": "흙빛 바탕에 한쪽이 둥근 큰 사진과 세로 영문, 바탕체 제목, 수업 정보와 작은 사진을 둔 클래스 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "도예 공방 원데이 클래스",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장 · 가로 사진 1장, 제목 2줄, 수업 정보 3줄, 계정 · 위치",
    "fonts": [
      "Pretendard",
      "Fraunces",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Courtney Cook",
        "url": "https://unsplash.com/@courtneymcook",
        "photoUrl": "https://unsplash.com/photos/nXYmYO_-JUk"
      },
      {
        "name": "Vladimir Gladkov",
        "url": "https://unsplash.com/@vovkapanda",
        "photoUrl": "https://unsplash.com/photos/NPPIq1XFdck"
      }
    ]
  },
  {
    "id": "FL-10",
    "title": "겨울밤 패키지 · 진초록과 금색",
    "summary": "진초록 바탕에 객실 사진과 금색 기울임 영문, 구성 표와 요금을 둔 호텔 패키지 전단.",
    "format": "fl",
    "formatLabel": "전단지",
    "spec": "A4 · 210×297mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "호텔 겨울 패키지",
    "pages": [
      [
        1240,
        1754
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 패키지 이름, 구성 3줄, 요금 · 기간, 예약 연락처",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Irwan Rosyadi",
        "url": "https://unsplash.com/@yrvvan12",
        "photoUrl": "https://unsplash.com/photos/Malq0qB8028"
      }
    ]
  },
  {
    "id": "PC-01",
    "title": "고맙습니다 · 손글씨와 도장 칸",
    "summary": "앞은 커피 사진 위 손글씨 인사, 뒤는 도장 열 칸과 가게 정보를 둔 단골 쿠폰 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "카페 쿠폰 카드",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 인사말, 가게 이름, 쿠폰 조건, 주소 · 영업 시간",
    "fonts": [
      "Pretendard",
      "Nanum Pen Script",
      "Gowun Batang",
      "Cormorant Garamond"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Christopher Chung",
        "url": "https://unsplash.com/@christopher_chung_photography",
        "photoUrl": "https://unsplash.com/photos/lMSmhRDS0Ik"
      }
    ]
  },
  {
    "id": "PC-02",
    "title": "봄 네일 · 파스텔 색면과 둥근 사진",
    "summary": "앞은 파스텔 색면과 둥근 사진, 둥근 글자 제목, 뒤는 가격 세 줄과 예약 안내를 둔 이벤트 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "네일 숍",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 제목, 메뉴 3개와 가격, 예약 방법",
    "fonts": [
      "Pretendard",
      "Jua"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "한별 정",
        "url": "https://unsplash.com/@jung07011",
        "photoUrl": "https://unsplash.com/photos/-4T7M75CLU4"
      }
    ]
  },
  {
    "id": "PC-03",
    "title": "그림 전시 초대 · 크레용 색 띠",
    "summary": "앞은 아이들이 그리는 사진과 크레용 색 띠, 손글씨 제목, 뒤는 초대 글과 일시 장소를 둔 전시 초대장.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "미술학원 전시 초대",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 전시 이름, 초대 글, 일시 · 장소",
    "fonts": [
      "Pretendard",
      "Gaegu",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Sarah Brown",
        "url": "https://unsplash.com/@sweetpagesco",
        "photoUrl": "https://unsplash.com/photos/RapDxBSMKzQ"
      }
    ]
  },
  {
    "id": "PC-04",
    "title": "꽃과 함께 · 세로 사진과 편지 줄",
    "summary": "세로 엽서 앞에 꽃다발 사진과 작은 영문, 뒤에 받는 사람 · 보내는 사람과 편지 줄을 둔 메시지 카드.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "꽃집 메시지 카드",
    "pages": [
      [
        1240,
        1748
      ],
      [
        1240,
        1748
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 가게 이름, 앞면 한 줄, 뒷면 안내",
    "fonts": [
      "Pretendard",
      "Cormorant Garamond",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Carrie Beth Williams",
        "url": "https://unsplash.com/@caribou15",
        "photoUrl": "https://unsplash.com/photos/s3AFTBZ3cnc"
      }
    ]
  },
  {
    "id": "PC-05",
    "title": "구매 감사 · 흰 여백과 작은 사진",
    "summary": "앞은 흰 여백에 가는 영문과 작은 제품 사진, 뒤는 짧은 감사 글과 재구매 코드를 둔 택배 동봉 카드.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "브랜드 감사 카드",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 브랜드 이름, 감사 글, 코드 · 고객센터",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Ruta Gudeliene",
        "url": "https://unsplash.com/@rutaurban",
        "photoUrl": "https://unsplash.com/photos/NPPlYOnhBuQ"
      }
    ]
  },
  {
    "id": "PC-06",
    "title": "새해 인사 · 테두리 숫자와 도시 사진",
    "summary": "앞은 새벽 도시 사진 위에 테두리만 있는 큰 연도, 뒤는 남색 면에 인사말과 서명을 둔 회사 연하장.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "회사 새해 인사 카드",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 연도, 인사말, 회사 이름 · 보내는 사람",
    "fonts": [
      "Pretendard",
      "Archivo Black",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "NK Lee",
        "url": "https://unsplash.com/@nlee02",
        "photoUrl": "https://unsplash.com/photos/HMVuLRoKFbM"
      }
    ]
  },
  {
    "id": "PC-07",
    "title": "걷기 대회 안내 · 초록 주황과 큰 글자",
    "summary": "앞은 걷는 사람들 사진 위 굵은 글자와 주황 띠, 뒤는 참가 방법 세 단계와 일시 장소를 둔 참가 안내 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "시민 걷기 대회",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 행사 이름, 날짜, 참가 방법 3줄, 문의처",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/goav65V51AI"
      }
    ]
  },
  {
    "id": "PC-08",
    "title": "소장품 엽서 · 어두운 바탕과 금색 선",
    "summary": "앞은 어두운 바탕의 소장품 사진과 금색 가는 선, 뒤는 소장품 설명과 주소 줄, 우표 칸을 둔 기념 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "박물관 기념 엽서",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 소장품 이름 · 전시실, 설명 글, 기관 이름",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Feodor Chistyakov",
        "url": "https://unsplash.com/@feodorchistyakov",
        "photoUrl": "https://unsplash.com/photos/akEnEeUVmQk"
      }
    ]
  },
  {
    "id": "PC-09",
    "title": "사진 엽서 · 흰 테두리와 고정폭 캡션",
    "summary": "앞은 흰 테두리 안의 사진과 고정폭 글꼴 캡션, 뒤는 작가 이름과 주소 줄을 둔 작품 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "사진작가 엽서",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 작품 제목 · 연도, 작가 이름 · 계정",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "João Marcelo Martins",
        "url": "https://unsplash.com/@johnnyhammer",
        "photoUrl": "https://unsplash.com/photos/C-pj1Qtne1g"
      }
    ]
  },
  {
    "id": "PC-10",
    "title": "여행지 엽서 · 글자 속 사진",
    "summary": "앞은 큰 영문 글자 속에 풍경 사진을 채운 옛 관광 엽서, 뒤는 한 줄 소개와 주소 줄을 둔 기념 엽서.",
    "format": "pc",
    "formatLabel": "엽서카드",
    "spec": "148×105mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "관광 기념 엽서",
    "pages": [
      [
        1748,
        1240
      ],
      [
        1748,
        1240
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 지역 이름(영문 큰 글자), 한 줄 소개, 발행처",
    "fonts": [
      "Pretendard",
      "Pacifico",
      "Anton",
      "Do Hyeon",
      "Righteous"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jinhan Moon",
        "url": "https://unsplash.com/@jinhan_photo",
        "photoUrl": "https://unsplash.com/photos/oE2p4CP_VoA"
      }
    ]
  },
  {
    "id": "HB-01",
    "title": "오픈 현수막 · 빨강 노랑과 비스듬한 사진",
    "summary": "빨간 바탕에 노란 굵은 글자를 크게 두고 오른쪽에 비스듬히 자른 음식 사진을 붙인 오픈 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "정육 식당",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 가게 이름, 오픈 날짜, 한 줄 안내, 전화",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Himal Rana",
        "url": "https://unsplash.com/@himal_r",
        "photoUrl": "https://unsplash.com/photos/Fy1DsvIY5Tc"
      }
    ]
  },
  {
    "id": "HB-02",
    "title": "회원 모집 · 남색과 주황 선",
    "summary": "남색 바탕 왼쪽에 운동 사진, 가운데 굵은 제목과 주황 알약, 오른쪽에 연락처를 둔 모집 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "헬스장",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 지점 이름, 제목, 혜택 한 줄, 전화 · 위치",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Victor Freitas",
        "url": "https://unsplash.com/@victorfreitas",
        "photoUrl": "https://unsplash.com/photos/WvDYdXDzkhs"
      }
    ]
  },
  {
    "id": "HB-03",
    "title": "개원 현수막 · 하늘색과 구름",
    "summary": "하늘색 바탕에 흰 구름 모양과 둥근 글자, 원형 아이 사진, 노란 알약을 둔 개원 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "영어 교습소",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 교습소 이름, 모집 대상, 전화",
    "fonts": [
      "Pretendard",
      "Pacifico",
      "Jua"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Susan Holt Simpson",
        "url": "https://unsplash.com/@shs521",
        "photoUrl": "https://unsplash.com/photos/Rd01U0tPmQI"
      }
    ]
  },
  {
    "id": "HB-04",
    "title": "카센터 · 크림색과 경주 줄무늬",
    "summary": "크림색 바탕에 빨강 남색 줄무늬를 깔고 옛 간판 같은 글자와 원형 사진 배지를 둔 정비소 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "자동차 정비소",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "정사각 사진 1장, 가게 이름, 서비스 3가지, 전화",
    "fonts": [
      "Pretendard",
      "Do Hyeon",
      "Righteous"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Kato Blackmore 🇺🇦",
        "url": "https://unsplash.com/@katoblackmore",
        "photoUrl": "https://unsplash.com/photos/qcF-19BvViE"
      }
    ]
  },
  {
    "id": "HB-05",
    "title": "신상품 전시 · 숯색과 금색 세리프",
    "summary": "숯색 바탕에 금색 가는 테두리와 세리프 영문, 오른쪽에 가구 사진을 둔 쇼룸 전시 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "가구 쇼룸",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 브랜드 이름, 행사 이름 · 기간, 위치",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Guillermo Naranjo Pérez",
        "url": "https://unsplash.com/@will90",
        "photoUrl": "https://unsplash.com/photos/c9GpH7zXQWk"
      }
    ]
  },
  {
    "id": "HB-06",
    "title": "기술 설명회 · 흰 바탕과 파란 줄",
    "summary": "흰 바탕에 검은 굵은 제목과 파란 가는 줄, 오른쪽 작은 사진과 일시 장소만 둔 설명회 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "스마트 공장 설명회",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 주최 이름, 행사 이름, 일시 · 장소",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Simon Kadula",
        "url": "https://unsplash.com/@simonkadula",
        "photoUrl": "https://unsplash.com/photos/8gr6bObQLOI"
      }
    ]
  },
  {
    "id": "HB-07",
    "title": "나무 심는 날 · 풀빛과 둥근 사진",
    "summary": "연한 풀빛 바탕에 한쪽이 둥근 사진과 돋움 제목, 초록 알약 안내를 둔 주민 참여 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "나무 심기 행사",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 행사 이름, 일시 · 장소 · 준비물",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Hammilton Ojijo",
        "url": "https://unsplash.com/@ojijohammilton",
        "photoUrl": "https://unsplash.com/photos/OQC1dP2fL80"
      }
    ]
  },
  {
    "id": "HB-08",
    "title": "졸업 축하 · 따뜻한 베이지와 바탕체",
    "summary": "따뜻한 베이지 바탕에 졸업 사진과 바탕체 축하 문구, 작은 색종이 조각을 둔 축하 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "대학 학위수여식",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 축하 문구, 학교 이름 · 행사 이름 · 일시",
    "fonts": [
      "Pretendard",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Bunly Hort",
        "url": "https://unsplash.com/@bunly1998",
        "photoUrl": "https://unsplash.com/photos/o9olH5LziVg"
      }
    ]
  },
  {
    "id": "HB-09",
    "title": "팝업 스토어 · 분홍 파랑과 스티커",
    "summary": "분홍 바탕에 두꺼운 둥근 글자와 파란 그림자, 기울인 사진과 스티커 모양 안내를 둔 팝업 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "작가 팝업 스토어",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 작가 · 브랜드 이름, 기간, 장소",
    "fonts": [
      "Pretendard",
      "Bagel Fat One"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Sticker it",
        "url": "https://unsplash.com/@stickerit_co",
        "photoUrl": "https://unsplash.com/photos/nTLxaQn5xxk"
      }
    ]
  },
  {
    "id": "HB-10",
    "title": "마라톤 대회 · 기울인 큰 글자와 달리는 사진",
    "summary": "파란 바탕에 기울인 굵은 글자와 형광 띠, 오른쪽에 비스듬히 자른 달리기 사진을 둔 대회 현수막.",
    "format": "hb",
    "formatLabel": "현수막",
    "spec": "5000×900mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "마라톤 대회",
    "pages": [
      [
        3000,
        540
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 대회 이름, 일시 · 출발지, 접수 주소",
    "fonts": [
      "Pretendard",
      "Anton",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Henry Ren",
        "url": "https://unsplash.com/@henryren",
        "photoUrl": "https://unsplash.com/photos/8pNsZRjxtnw"
      }
    ]
  },
  {
    "id": "XB-01",
    "title": "딸기 시즌 · 아치 사진과 메뉴 줄",
    "summary": "크림색 바탕에 아치 모양 사진과 바탕체 제목, 점선 가격 줄을 둔 매장 앞 시즌 메뉴 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "genre": "warm",
    "genreLabel": "감성",
    "business": "카페 시즌 메뉴",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 가게 이름, 제목, 메뉴 4개와 가격, 안내 한 줄",
    "fonts": [
      "Pretendard",
      "Gowun Batang",
      "Cormorant Garamond"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Heather Barnes",
        "url": "https://unsplash.com/@heatherbarnes",
        "photoUrl": "https://unsplash.com/photos/UNavhaEHzaA"
      }
    ]
  },
  {
    "id": "XB-02",
    "title": "진료 안내 · 흰 바탕과 파란 줄",
    "summary": "흰 바탕에 원형 인물 사진과 굵은 병원 이름, 진료 과목과 시간표를 가는 줄로 정리한 진료 안내 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "genre": "minimal",
    "genreLabel": "미니멀",
    "business": "치과 의원",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "정사각 인물 사진 1장, 병원 이름, 진료 과목 4개, 진료 시간, 전화",
    "fonts": [
      "Pretendard"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Divaris Shirichena",
        "url": "https://unsplash.com/@divaris",
        "photoUrl": "https://unsplash.com/photos/EVcTjiaq4NE"
      }
    ]
  },
  {
    "id": "XB-03",
    "title": "입시 설명회 · 주황 검정과 기울인 띠",
    "summary": "주황 바탕에 검은 굵은 글자를 쌓고 기울인 검은 띠와 사진, 순서 목록을 둔 설명회 안내 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "genre": "bold",
    "genreLabel": "대담한",
    "business": "입시 학원 설명회",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 학원 이름, 제목 3줄, 순서 3줄, 일시 · 장소 · 신청",
    "fonts": [
      "Pretendard",
      "Black Han Sans"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Dom Fou",
        "url": "https://unsplash.com/@domlafou",
        "photoUrl": "https://unsplash.com/photos/YRMWVcdyhmI"
      }
    ]
  },
  {
    "id": "XB-04",
    "title": "웨딩 페어 · 검정과 금색 가는 테두리",
    "summary": "검은 바탕에 금색 가는 테두리와 세리프 영문, 큰 인물 사진과 혜택 줄을 둔 박람회 입구 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "genre": "premium",
    "genreLabel": "프리미엄",
    "business": "웨딩 박람회",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 행사 이름, 혜택 3줄, 일시 · 장소, 예약 안내",
    "fonts": [
      "Pretendard",
      "Cinzel",
      "Playfair Display",
      "Noto Serif KR"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "farinaz athari",
        "url": "https://unsplash.com/@farinazzathari",
        "photoUrl": "https://unsplash.com/photos/OwEL5Z5cA48"
      }
    ]
  },
  {
    "id": "XB-05",
    "title": "신제품 팝업 · 색면과 스티커",
    "summary": "노랑과 파랑 색면을 나누고 두꺼운 둥근 글자와 원형 제품 사진, 스티커를 둔 팝업 스토어 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "genre": "playful",
    "genreLabel": "발랄한",
    "business": "음료 신제품 팝업",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "정사각 제품 사진 1장, 제품 이름, 맛 3가지, 팝업 기간 · 이벤트",
    "fonts": [
      "Pretendard",
      "Bagel Fat One"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Zhang liven",
        "url": "https://unsplash.com/@lvenfoto",
        "photoUrl": "https://unsplash.com/photos/C_M1QPj4mY4"
      }
    ]
  },
  {
    "id": "XB-06",
    "title": "전시 부스 · 남색 격자와 특징 세 줄",
    "summary": "남색 격자 바탕에 굵은 제목과 제품 사진, 고정폭 글꼴 번호를 붙인 특징 세 줄을 둔 전시 부스 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "전시회 부스",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 회사 이름, 제목 3줄, 특징 3개, 부스 번호 · 연락처",
    "fonts": [
      "Pretendard",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "ZHENYU LUO",
        "url": "https://unsplash.com/@mrnuclear",
        "photoUrl": "https://unsplash.com/photos/kE0JmtbvXxM"
      }
    ]
  },
  {
    "id": "XB-07",
    "title": "분리배출 · 풀빛과 네 칸 안내",
    "summary": "연한 풀빛 바탕에 돋움 제목과 둥근 사진, 품목별 버리는 법 네 칸을 둔 주민 안내 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "분리배출 안내",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 기관 이름, 제목, 품목 4개(이름 · 방법), 문의처",
    "fonts": [
      "Pretendard",
      "Gowun Dodum"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jonathan Chng",
        "url": "https://unsplash.com/@jon_chng",
        "photoUrl": "https://unsplash.com/photos/OTDyDgPoJ_0"
      }
    ]
  },
  {
    "id": "XB-08",
    "title": "학술대회 · 흰 위와 남색 아래 일정",
    "summary": "위는 흰 바탕의 굵은 제목과 사진, 아래는 남색 면의 일정 표와 등록 안내를 둔 학술대회 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "genre": "modern",
    "genreLabel": "모던",
    "business": "학술대회 등록 안내",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "가로 사진 1장, 학회 이름, 대회 이름, 일정 4줄, 등록 위치",
    "fonts": [
      "Pretendard",
      "Archivo Black",
      "JetBrains Mono"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Jametlene Reskp",
        "url": "https://unsplash.com/@reskp",
        "photoUrl": "https://unsplash.com/photos/9zutjaUEN3Q"
      }
    ]
  },
  {
    "id": "XB-09",
    "title": "드로잉 전시 · 겨자색과 어긋난 사진",
    "summary": "겨자색 바탕에 옛 인쇄물 같은 글자와 남색 면을 어긋나게 깐 사진, 점선 관람 안내를 둔 전시 입구 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "genre": "retro",
    "genreLabel": "레트로",
    "business": "드로잉 전시",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 전시 이름, 작가 이름, 기간 · 장소 · 관람 시간",
    "fonts": [
      "Pretendard",
      "Righteous",
      "Do Hyeon"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Evheniia Hladunova",
        "url": "https://unsplash.com/@eeeeevvgesha",
        "photoUrl": "https://unsplash.com/photos/0CR9v6wThQ4"
      }
    ]
  },
  {
    "id": "XB-10",
    "title": "둘레길 · 풍경 사진과 구간 표",
    "summary": "위쪽 풍경 사진 아래 흙빛 면에 바탕체 제목과 구간별 거리 표, 지키는 약속을 둔 탐방 안내 배너.",
    "format": "xb",
    "formatLabel": "배너",
    "spec": "X배너 600×1800mm",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "genre": "natural",
    "genreLabel": "내추럴",
    "business": "둘레길 안내",
    "pages": [
      [
        1200,
        3600
      ]
    ],
    "video": 0,
    "swap": "세로 사진 1장, 길 이름, 구간 3줄(거리 · 시간), 약속 한 줄, 안내소 전화",
    "fonts": [
      "Pretendard",
      "Gowun Batang"
    ],
    "outputs": [
      "인쇄용 PDF",
      "JPG 이미지",
      "편집용 HTML"
    ],
    "credits": [
      {
        "name": "Tom Patmore",
        "url": "https://unsplash.com/@tompatmore",
        "photoUrl": "https://unsplash.com/photos/znEjIb1yfdc"
      }
    ]
  }
];

export const templateById = (id: string) => templates.find((t) => t.id === id);

/** 미리보기 파일 주소 (public/template-gallery) */
export const templateThumb = (id: string) => `/template-gallery/${id}/t.jpg`;
export const templatePage = (id: string, n: number) => `/template-gallery/${id}/p${n}.jpg`;
export const templateVideo = (id: string) => `/template-gallery/${id}/video.mp4`;
