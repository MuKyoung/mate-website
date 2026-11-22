import type { LandingDesign } from '@/types';

/**
 * 단일 랜딩페이지 제작 - 스타일 갤러리 데이터.
 * landing-library/scripts/site-data.mjs 가 landing-library/data/designs.public.json 에서 만든다. 손으로 고치지 않는다.
 * 사용권 검증 기록(내부용)은 designs.internal.json 에만 있고 여기에는 싣지 않는다.
 */

/** 업종 묶음 - 필터 이름 */
export const landingFields: Record<number, string> = {
  "1": "음식·카페·매장",
  "2": "뷰티·건강·의료",
  "3": "교육·강의·코칭",
  "4": "전문·생활 서비스",
  "5": "쇼핑·제품·브랜드",
  "6": "IT·B2B·제조",
  "7": "정부·정책·모집",
  "8": "공공기관·대학·협회",
  "9": "크리에이터·아티스트",
  "10": "관광·행사·문화"
};

/** 필터 낱말 */
export const landingVocab = {
  "purposes": [
    "소개",
    "문의",
    "예약",
    "구매",
    "신청",
    "모집",
    "행사"
  ],
  "moods": [
    "따뜻한",
    "신뢰감 있는",
    "프리미엄",
    "대담한",
    "미니멀",
    "발랄한",
    "내추럴"
  ],
  "visualStyles": [
    "사진 중심",
    "타이포 중심",
    "일러스트 중심"
  ]
} as const;

export const landingDesigns: LandingDesign[] = [
  {
    "id": "LP-001",
    "title": "해변 다이닝 · 세리프와 도형",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "레스토랑",
      "해산물·오이스터 바",
      "다이닝 바"
    ],
    "purposes": [
      "소개",
      "예약",
      "구매"
    ],
    "moods": [
      "프리미엄",
      "내추럴"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "사진 없이 도형으로 바닷가 분위기를 만든 시안. 도형 자리에 셰프·요리·공간 사진을 넣으면 사람과 공간이 보이는 페이지로 바뀜.",
    "thumb": "/landing-gallery/LP-001/thumb.jpg",
    "desktop": "/landing-gallery/LP-001/desktop.jpg",
    "mobile": "/landing-gallery/LP-001/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Oceanside Restaurant Free Website Template\" by CCasalme (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "CCasalme",
      "sourceUrl": "https://www.figma.com/community/file/1638381785075377576",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-002",
    "title": "웨비나 행사 · 보랏빛 무대",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "웨비나",
      "컨퍼런스",
      "교육 행사"
    ],
    "purposes": [
      "신청",
      "행사"
    ],
    "moods": [
      "대담한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "연사 얼굴과 일정이 앞에 서는 구성. 실제 연사 사진과 행사장 사진을 찍어 넣기 좋음.",
    "thumb": "/landing-gallery/LP-002/thumb.jpg",
    "desktop": "/landing-gallery/LP-002/desktop.jpg",
    "mobile": "/landing-gallery/LP-002/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Responsive Landing Page Design | Webinar Event Website UI Design | Free Figma Template\" by Publish Ninja (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Publish Ninja",
      "sourceUrl": "https://www.figma.com/community/file/1433089452383535100",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-003",
    "title": "스킨케어 쇼핑 · 분홍 쇼룸",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "스킨케어",
      "화장품 쇼핑몰"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "미니멀",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "제품 사진과 실제 사용 후기 자리가 중심. 제품 질감 촬영과 실제 구매 후기를 받아 넣는 업체에 맞음.",
    "thumb": "/landing-gallery/LP-003/thumb.jpg",
    "desktop": "/landing-gallery/LP-003/desktop.jpg",
    "mobile": "/landing-gallery/LP-003/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Free Skincare E-Commerce Landing Page (Web and Mobile Responsiveness)\" by Abiola Babatunde (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Abiola Babatunde",
      "sourceUrl": "https://www.figma.com/community/file/1448238939856956662",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-004",
    "title": "기술 기업 · 사진과 팀 소개",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "IT 기업",
      "기술 컨설팅"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "팀 4인의 얼굴과 일하는 과정이 들어가는 구성이라 구성원 촬영과 잘 맞음.",
    "thumb": "/landing-gallery/LP-004/thumb.jpg",
    "desktop": "/landing-gallery/LP-004/desktop.jpg",
    "mobile": "/landing-gallery/LP-004/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #1\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-005",
    "title": "앱 개발사 · 화면 콜라주",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "앱 개발사",
      "디지털 에이전시"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "대담한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "작업 화면과 기기 사진을 크게 쓰는 구성. 실제 만든 앱 화면과 작업 모습 촬영이 있으면 살아남.",
    "thumb": "/landing-gallery/LP-005/thumb.jpg",
    "desktop": "/landing-gallery/LP-005/desktop.jpg",
    "mobile": "/landing-gallery/LP-005/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #2\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-006",
    "title": "에듀테크 · 가운데 정렬 소개",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "에듀테크",
      "온라인 평가 서비스"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "교사·학생이 쓰는 장면 사진 9칸을 넣는 갤러리형. 실제 수업·사용 장면 촬영과 맞음.",
    "thumb": "/landing-gallery/LP-006/thumb.jpg",
    "desktop": "/landing-gallery/LP-006/desktop.jpg",
    "mobile": "/landing-gallery/LP-006/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #3\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-007",
    "title": "디자인 스튜디오 · 짧은 포트폴리오",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "디자이너 포트폴리오",
      "디자인 스튜디오"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "미니멀",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "작가 본인 사진과 작업물 3개만으로 끝나는 짧은 구성. 1인 디자이너·작가의 첫 페이지에 맞음.",
    "thumb": "/landing-gallery/LP-007/thumb.jpg",
    "desktop": "/landing-gallery/LP-007/desktop.jpg",
    "mobile": "/landing-gallery/LP-007/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #4\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-008",
    "title": "스포츠 브랜드 · 컬렉션 격자",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "스포츠 의류",
      "퍼포먼스 브랜드"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "대담한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "제품과 착용 인물 사진 12장이 격자로 서는 구성. 제품 촬영·모델 촬영을 함께 하는 브랜드에 맞음.",
    "thumb": "/landing-gallery/LP-008/thumb.jpg",
    "desktop": "/landing-gallery/LP-008/desktop.jpg",
    "mobile": "/landing-gallery/LP-008/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #5\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-009",
    "title": "반려동물 사료 · 초록 카드",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "반려동물 사료",
      "유기농 D2C"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "보호자와 반려동물 사진이 앞에 서는 구성. 실제 고객의 반려동물 촬영을 넣으면 이야기가 생김.",
    "thumb": "/landing-gallery/LP-009/thumb.jpg",
    "desktop": "/landing-gallery/LP-009/desktop.jpg",
    "mobile": "/landing-gallery/LP-009/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #6\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-010",
    "title": "온라인 강의 · 강사 얼굴",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "온라인 강의",
      "학습 플랫폼"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "강사 8인의 얼굴이 중심이 되는 구성. 강사 프로필 촬영과 잘 맞음.",
    "thumb": "/landing-gallery/LP-010/thumb.jpg",
    "desktop": "/landing-gallery/LP-010/desktop.jpg",
    "mobile": "/landing-gallery/LP-010/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #7\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-011",
    "title": "스킨케어 브랜드 · 연둣빛 성분",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "스킨케어 브랜드",
      "뷰티"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "발랄한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "사용 장면 인물 사진과 성분 이야기가 번갈아 나오는 구성. 원료·제조 과정 촬영을 넣기 좋음.",
    "thumb": "/landing-gallery/LP-011/thumb.jpg",
    "desktop": "/landing-gallery/LP-011/desktop.jpg",
    "mobile": "/landing-gallery/LP-011/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #8\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-012",
    "title": "식물 가게 · 실내 정원",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "식물 가게",
      "꽃집·화원"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "매장 안 식물과 고객 집 사진을 넣는 구성. 동네 화원·식물 가게의 실제 공간 촬영과 맞음.",
    "thumb": "/landing-gallery/LP-012/thumb.jpg",
    "desktop": "/landing-gallery/LP-012/desktop.jpg",
    "mobile": "/landing-gallery/LP-012/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #9\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-013",
    "title": "럭셔리 여행 · 어두운 갤러리",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "여행사",
      "맞춤 여행"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "여행지 풍경과 상담 직원 사진이 들어가는 구성. 실제 다녀온 현장 사진을 쓰는 여행사에 맞음.",
    "thumb": "/landing-gallery/LP-013/thumb.jpg",
    "desktop": "/landing-gallery/LP-013/desktop.jpg",
    "mobile": "/landing-gallery/LP-013/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #10\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-014",
    "title": "요가 스튜디오 · 보랏빛 둥근 카드",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "요가 스튜디오",
      "필라테스·명상"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "강사와 수강생 사진을 둥근 틀에 담는 구성. 실제 수업 장면 촬영과 강사 소개에 맞음.",
    "thumb": "/landing-gallery/LP-014/thumb.jpg",
    "desktop": "/landing-gallery/LP-014/desktop.jpg",
    "mobile": "/landing-gallery/LP-014/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Figma design - Responsive yoga website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1229610063156797225",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-015",
    "title": "비영리 단체 · 묵직한 세리프",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "비영리 단체",
      "자선·후원"
    ],
    "purposes": [
      "소개",
      "모집"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "현장 활동 사진과 구성원 얼굴이 길게 이어지는 구성. 실제 봉사·활동 현장을 기록하는 단체에 맞음.",
    "thumb": "/landing-gallery/LP-015/thumb.jpg",
    "desktop": "/landing-gallery/LP-015/desktop.jpg",
    "mobile": "/landing-gallery/LP-015/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Charity- Responsive Website Design\" by Joou Designs (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Joou Designs",
      "sourceUrl": "https://www.figma.com/community/file/1374427178022270099",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-016",
    "title": "시계 브랜드 · 주황 제품 카드",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "시계·잡화 브랜드",
      "제품 출시"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "미니멀",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "제품 한 개를 크게 세우고 이야기 섹션을 둔 구성. 제품 질감 촬영과 출시 소개에 맞음.",
    "thumb": "/landing-gallery/LP-016/thumb.jpg",
    "desktop": "/landing-gallery/LP-016/desktop.jpg",
    "mobile": "/landing-gallery/LP-016/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Design in Figma - Responsive watches website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098395559253476",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-017",
    "title": "친환경 생활용품 · 초록 상점",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "친환경 생활용품",
      "온라인 상점"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "내추럴",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "생활 속 사용 장면과 상품 사진이 많은 상점형 구성. 직접 만든 생활용품을 파는 작은 브랜드에 맞음.",
    "thumb": "/landing-gallery/LP-017/thumb.jpg",
    "desktop": "/landing-gallery/LP-017/desktop.jpg",
    "mobile": "/landing-gallery/LP-017/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"ECO Shop - Eco Friendly Store Responsive Website\" by Bima Agustian Wanaputra (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Bima Agustian Wanaputra",
      "sourceUrl": "https://www.figma.com/community/file/1318227406178520862",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-018",
    "title": "커피 전문점 · 둥근 갈색 섹션",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "카페",
      "원두 판매"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "가게 이야기와 원두를 다루는 과정이 섹션으로 나뉘어 있어 사장님·로스팅 과정 촬영과 잘 맞음.",
    "thumb": "/landing-gallery/LP-018/thumb.jpg",
    "desktop": "/landing-gallery/LP-018/desktop.jpg",
    "mobile": "/landing-gallery/LP-018/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Figma Design - Responsive coffee website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098100611718626",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-019",
    "title": "연말 선물전 · 붉은 이벤트",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "시즌 행사",
      "선물 기획전"
    ],
    "purposes": [
      "행사",
      "구매"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "행사 인사와 선물 상품이 이어지는 시즌 기획전 구성. 매장의 연말 행사나 지역 축제 안내로 바꾸기 좋음.",
    "thumb": "/landing-gallery/LP-019/thumb.jpg",
    "desktop": "/landing-gallery/LP-019/desktop.jpg",
    "mobile": "/landing-gallery/LP-019/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Design in Figma - Responsive christmas website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098233587105251",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-020",
    "title": "부동산 분양 · 큰 대문자 제목",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "부동산 분양",
      "주택·건축"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "프리미엄",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "실제 매물과 시공 과정을 단계로 보여 주는 구성. 현장 사진과 담당자 상담 문의로 이어짐.",
    "thumb": "/landing-gallery/LP-020/thumb.jpg",
    "desktop": "/landing-gallery/LP-020/desktop.jpg",
    "mobile": "/landing-gallery/LP-020/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Real Estate Landing Page\" by Sergei Evdokimov (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Sergei Evdokimov",
      "sourceUrl": "https://www.figma.com/community/file/1379119736954724263",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-021",
    "title": "법률사무소 · 짙은 남색 세리프",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "법률사무소",
      "변호사"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "프리미엄"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "변호사 얼굴과 약력이 중심인 구성. 실제 프로필 촬영과 사무실 사진을 넣기 좋음.",
    "thumb": "/landing-gallery/LP-021/thumb.jpg",
    "desktop": "/landing-gallery/LP-021/desktop.jpg",
    "mobile": "/landing-gallery/LP-021/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Diseño Web Abogados / Web Design Lawyers\" by Matias Gomez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Matias Gomez",
      "sourceUrl": "https://www.figma.com/community/file/1085677230028305615",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-022",
    "title": "집수리 출장 서비스 · 견적 카드",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "집수리·설비",
      "출장 생활서비스"
    ],
    "purposes": [
      "예약",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "'작업 전에 가격부터 적어 드린다'는 하나의 약속을 견적서 카드로 보여 주는 구성. 기사 얼굴과 실제 견적 사례를 넣으면 신뢰가 생김.",
    "thumb": "/landing-gallery/LP-022/thumb.jpg",
    "desktop": "/landing-gallery/LP-022/desktop.jpg",
    "mobile": "/landing-gallery/LP-022/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Home Services Website & Booking Flow — Desktop + Mobile\" by Keshley Nitz Martinez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Keshley Nitz Martinez",
      "sourceUrl": "https://www.figma.com/community/file/1685698519894048991",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-023",
    "title": "치과 · 둥근 하늘색 원",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "치과",
      "의원·클리닉"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "신뢰감 있는",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "template",
    "kindLabel": "외부 디자인 기반 제작 스타일 샘플",
    "summary": "원장 얼굴·약력과 병원 공간 사진이 차례로 나오는 구성. 실제 진료실 촬영과 원장 인터뷰에 맞음.",
    "thumb": "/landing-gallery/LP-023/thumb.jpg",
    "desktop": "/landing-gallery/LP-023/desktop.jpg",
    "mobile": "/landing-gallery/LP-023/mobile.jpg",
    "credit": {
      "text": "디자인 원작: \"Landing Page For Dentist with Mobile Version | Landing Page para Dentistas con Version Movil\" by Matias Gomez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Matias Gomez",
      "sourceUrl": "https://www.figma.com/community/file/1244357573623602317",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  },
  {
    "id": "LP-024",
    "title": "청년 창업 지원사업 모집 · KRDS 파랑",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "창업 지원사업",
      "지자체 공고"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "선정 기업 대표가 작업하는 모습과 센터 입구 사진 자리. 지원받은 실제 창업자를 찍어 넣는 공고형 페이지.",
    "thumb": "/landing-gallery/LP-024/thumb.jpg",
    "desktop": "/landing-gallery/LP-024/desktop.jpg",
    "mobile": "/landing-gallery/LP-024/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-025",
    "title": "청년 월세 지원 정책 · 남색 표",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "청년 정책",
      "주거 지원"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "지원받은 청년 인터뷰 자리를 정책 설명 한가운데 둔 구성. 실제 수혜자 동의를 받아 사진과 말을 넣음.",
    "thumb": "/landing-gallery/LP-025/thumb.jpg",
    "desktop": "/landing-gallery/LP-025/desktop.jpg",
    "mobile": "/landing-gallery/LP-025/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-026",
    "title": "지역 봄꽃 축제 · 포스터형",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "지역 축제",
      "지자체 행사"
    ],
    "purposes": [
      "행사",
      "소개"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "지난 축제 사진 6장과 마을 사람들이 준비한 먹거리 사진이 중심. 실제 행사 기록 사진을 쓰는 지자체 축제에 맞음.",
    "thumb": "/landing-gallery/LP-026/thumb.jpg",
    "desktop": "/landing-gallery/LP-026/desktop.jpg",
    "mobile": "/landing-gallery/LP-026/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-027",
    "title": "탄소중립 시민 캠페인 · 초록 배너",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "공공 캠페인",
      "환경 정책"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "내추럴",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "장바구니를 든 시민과 참여 시민 인터뷰가 앞에 서는 캠페인. 실제 참여자 사진·인증 사진을 모아 넣음.",
    "thumb": "/landing-gallery/LP-027/thumb.jpg",
    "desktop": "/landing-gallery/LP-027/desktop.jpg",
    "mobile": "/landing-gallery/LP-027/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-028",
    "title": "주민참여예산 위원 모집 · 하늘색",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "주민 참여",
      "위원 모집"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "주민들이 둘러앉은 회의와 놀이터 현장 방문 사진이 들어가는 구성. 실제 위원 활동 사진으로 채움.",
    "thumb": "/landing-gallery/LP-028/thumb.jpg",
    "desktop": "/landing-gallery/LP-028/desktop.jpg",
    "mobile": "/landing-gallery/LP-028/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-029",
    "title": "디지털 배움터 수강생 모집 · 큰 글씨",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "디지털 교육",
      "어르신 교육"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "어르신이 강사 옆에서 배우는 모습을 크게 쓰고 본문 글자를 키운 접근성 우선 구성.",
    "thumb": "/landing-gallery/LP-029/thumb.jpg",
    "desktop": "/landing-gallery/LP-029/desktop.jpg",
    "mobile": "/landing-gallery/LP-029/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-030",
    "title": "공공기관 채용 공고 · 각진 남색",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "공공기관 채용",
      "채용 공고"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "사진 없이 표와 절차로 신뢰를 주는 공고형. 필요하면 실제 직원 인터뷰 섹션을 더함.",
    "thumb": "/landing-gallery/LP-030/thumb.jpg",
    "desktop": "/landing-gallery/LP-030/desktop.jpg",
    "mobile": "/landing-gallery/LP-030/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-031",
    "title": "폭염 행동 요령 안내 · 경보형",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "재난 안전 안내",
      "지자체 공지"
    ],
    "purposes": [
      "소개"
    ],
    "moods": [
      "대담한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "경보처럼 빠르게 읽히는 안내형. 실제 무더위 쉼터 사진과 지자체 연락처로 채움.",
    "thumb": "/landing-gallery/LP-031/thumb.jpg",
    "desktop": "/landing-gallery/LP-031/desktop.jpg",
    "mobile": "/landing-gallery/LP-031/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-032",
    "title": "찾아가는 복지 상담 · 부드러운 초록",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "복지 서비스",
      "방문 상담"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "상담사가 집을 찾아가 이야기를 듣는 장면이 중심. 실제 상담사와 동의한 주민 사례로 채움.",
    "thumb": "/landing-gallery/LP-032/thumb.jpg",
    "desktop": "/landing-gallery/LP-032/desktop.jpg",
    "mobile": "/landing-gallery/LP-032/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-033",
    "title": "농특산물 직거래 장터 · 흙빛 명조",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "농특산물 장터",
      "지자체 행사"
    ],
    "purposes": [
      "행사",
      "구매"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 (KRDS 기반)",
    "summary": "농부 얼굴과 밭·작물 사진이 카드마다 들어가는 구성. 참여 농가를 직접 찾아가 촬영하는 작업과 맞음.",
    "thumb": "/landing-gallery/LP-033/thumb.jpg",
    "desktop": "/landing-gallery/LP-033/desktop.jpg",
    "mobile": "/landing-gallery/LP-033/mobile.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    }
  },
  {
    "id": "LP-034",
    "title": "대학 학과 입학 안내 · 명조와 남색",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "대학 학과",
      "입학 안내"
    ],
    "purposes": [
      "소개",
      "모집"
    ],
    "moods": [
      "신뢰감 있는",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "실기실의 학생, 교수 얼굴, 졸업 작품이 차례로 나오는 구성. 학과 촬영과 작품 사진 정리에 맞음.",
    "thumb": "/landing-gallery/LP-034/thumb.jpg",
    "desktop": "/landing-gallery/LP-034/desktop.jpg",
    "mobile": "/landing-gallery/LP-034/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-035",
    "title": "대학원 입시 설명회 · 보라 포스터",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "대학원",
      "입시 설명회"
    ],
    "purposes": [
      "행사",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "발표 교수의 얼굴과 설명회 순서가 핵심인 짧은 행사 페이지.",
    "thumb": "/landing-gallery/LP-035/thumb.jpg",
    "desktop": "/landing-gallery/LP-035/desktop.jpg",
    "mobile": "/landing-gallery/LP-035/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-036",
    "title": "연구소 공동연구 · 어두운 실험실",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "연구소",
      "공동연구"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "프리미엄",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "연구원이 장비를 다루는 장면과 연구진 얼굴이 중심. 실제 연구실 촬영에 맞음.",
    "thumb": "/landing-gallery/LP-036/thumb.jpg",
    "desktop": "/landing-gallery/LP-036/desktop.jpg",
    "mobile": "/landing-gallery/LP-036/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-037",
    "title": "협회 회원 모집 · 청록 카드",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "협회",
      "회원 모집"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "회원들이 사례를 나누는 정기 모임 사진과 회원 인터뷰가 들어가는 구성.",
    "thumb": "/landing-gallery/LP-037/thumb.jpg",
    "desktop": "/landing-gallery/LP-037/desktop.jpg",
    "mobile": "/landing-gallery/LP-037/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-038",
    "title": "학술대회 사전 등록 · 검정과 노랑",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "학회",
      "학술대회"
    ],
    "purposes": [
      "행사",
      "신청"
    ],
    "moods": [
      "대담한",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "연설자 얼굴과 굵은 제목으로 행사 성격을 세우는 학회 페이지.",
    "thumb": "/landing-gallery/LP-038/thumb.jpg",
    "desktop": "/landing-gallery/LP-038/desktop.jpg",
    "mobile": "/landing-gallery/LP-038/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-039",
    "title": "도서관 독서 프로그램 · 고운 바탕",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "공공 도서관",
      "독서 프로그램"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사서가 그림책을 읽어 주는 장면, 독서 모임, 창가 열람석 사진이 들어가는 구성.",
    "thumb": "/landing-gallery/LP-039/thumb.jpg",
    "desktop": "/landing-gallery/LP-039/desktop.jpg",
    "mobile": "/landing-gallery/LP-039/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-040",
    "title": "박물관 기획전시 · 흑백 갤러리",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "박물관",
      "기획전시"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "유물과 전시실 사진이 주인공인 갤러리형. 학예사 해설과 전시 촬영에 맞음.",
    "thumb": "/landing-gallery/LP-040/thumb.jpg",
    "desktop": "/landing-gallery/LP-040/desktop.jpg",
    "mobile": "/landing-gallery/LP-040/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-041",
    "title": "산학협력 기술이전 · 정돈된 파랑",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "산학협력단",
      "기술이전"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사진 없이 기술 분야와 절차를 분명히 보여 주는 B2B형. 담당자 사진 섹션을 더해도 됨.",
    "thumb": "/landing-gallery/LP-041/thumb.jpg",
    "desktop": "/landing-gallery/LP-041/desktop.jpg",
    "mobile": "/landing-gallery/LP-041/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-042",
    "title": "장학생 선발 공고 · 명조 초록",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "장학재단",
      "장학생 선발"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "따뜻한"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "공고 정보가 중심인 차분한 구성. 장학생 인터뷰 섹션을 더하면 이야기가 생김.",
    "thumb": "/landing-gallery/LP-042/thumb.jpg",
    "desktop": "/landing-gallery/LP-042/desktop.jpg",
    "mobile": "/landing-gallery/LP-042/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-043",
    "title": "연구 참여자 모집 · 청록 안내",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "대학 연구팀",
      "연구 참여자 모집"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "연구원이 참여자에게 설명하는 장면 하나로 신뢰를 주는 구성. 실제 연구팀 촬영에 맞음.",
    "thumb": "/landing-gallery/LP-043/thumb.jpg",
    "desktop": "/landing-gallery/LP-043/desktop.jpg",
    "mobile": "/landing-gallery/LP-043/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-044",
    "title": "사진작가 포트폴리오 · 흑백 에디토리얼",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "사진작가",
      "브랜드 촬영"
    ],
    "purposes": [
      "소개",
      "문의",
      "예약"
    ],
    "moods": [
      "미니멀",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사진가가 찍은 사람·가게·제품 사진이 그대로 페이지가 되는 구성. 실제 작업물로 채움.",
    "thumb": "/landing-gallery/LP-044/thumb.jpg",
    "desktop": "/landing-gallery/LP-044/desktop.jpg",
    "mobile": "/landing-gallery/LP-044/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-045",
    "title": "일러스트레이터 작업 의뢰 · 노랑 손그림",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "일러스트레이터",
      "그림 작가"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "일러스트 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "작가의 그림과 작업 책상이 주인공. 실제 그림 파일을 넣으면 바로 포트폴리오가 됨.",
    "thumb": "/landing-gallery/LP-045/thumb.jpg",
    "desktop": "/landing-gallery/LP-045/desktop.jpg",
    "mobile": "/landing-gallery/LP-045/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-046",
    "title": "크리에이터 미디어킷 · 빨강 강조",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "유튜브 크리에이터",
      "광고 협업"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "대담한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "크리에이터가 촬영하는 모습과 실제 채널 지표로 광고주를 설득하는 미디어킷.",
    "thumb": "/landing-gallery/LP-046/thumb.jpg",
    "desktop": "/landing-gallery/LP-046/desktop.jpg",
    "mobile": "/landing-gallery/LP-046/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-047",
    "title": "작가 신간 소개 · 잉크 파랑",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "작가",
      "출판·신간"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "미니멀",
      "따뜻한"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "책 표지와 작가 사진, 책 속 문장 하나로 이야기를 여는 출간 페이지.",
    "thumb": "/landing-gallery/LP-047/thumb.jpg",
    "desktop": "/landing-gallery/LP-047/desktop.jpg",
    "mobile": "/landing-gallery/LP-047/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-048",
    "title": "음악가 공연과 앨범 · 어두운 무대",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "음악가",
      "공연·앨범"
    ],
    "purposes": [
      "행사",
      "구매"
    ],
    "moods": [
      "대담한",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "무대 조명 속 음악가 사진과 공연 일정이 중심. 실제 공연 사진과 앨범 사진으로 채움.",
    "thumb": "/landing-gallery/LP-048/thumb.jpg",
    "desktop": "/landing-gallery/LP-048/desktop.jpg",
    "mobile": "/landing-gallery/LP-048/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-049",
    "title": "인플루언서 링크 모음 · 연보라",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "인플루언서",
      "생활 크리에이터"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "본인 얼굴과 직접 쓰는 물건 사진이 전부인 짧은 페이지. SNS 프로필 링크로 쓰기 좋음.",
    "thumb": "/landing-gallery/LP-049/thumb.jpg",
    "desktop": "/landing-gallery/LP-049/desktop.jpg",
    "mobile": "/landing-gallery/LP-049/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-050",
    "title": "공예가 작업실과 클래스 · 올리브",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "공예가",
      "원데이 클래스"
    ],
    "purposes": [
      "소개",
      "예약",
      "구매"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "흙을 빚는 손, 작업실, 작가 얼굴이 이어지는 구성. 작업 과정 촬영과 클래스 예약을 한 페이지에서.",
    "thumb": "/landing-gallery/LP-050/thumb.jpg",
    "desktop": "/landing-gallery/LP-050/desktop.jpg",
    "mobile": "/landing-gallery/LP-050/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-051",
    "title": "팟캐스트 소개 · 주황 라디오",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "팟캐스트",
      "오디오 콘텐츠"
    ],
    "purposes": [
      "소개"
    ],
    "moods": [
      "발랄한",
      "대담한"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "인터뷰한 가게 사장님과 진행자 얼굴로 쇼의 성격을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-051/thumb.jpg",
    "desktop": "/landing-gallery/LP-051/desktop.jpg",
    "mobile": "/landing-gallery/LP-051/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-052",
    "title": "배우 프로필 · 흑백 무대",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "배우",
      "캐스팅 프로필"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "대담한",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "배우 얼굴과 작품 속 장면이 전부인 캐스팅용 프로필. 공개하기로 한 정보만 적음.",
    "thumb": "/landing-gallery/LP-052/thumb.jpg",
    "desktop": "/landing-gallery/LP-052/desktop.jpg",
    "mobile": "/landing-gallery/LP-052/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-053",
    "title": "SaaS 업무 도구 출시 · 인디고",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "SaaS",
      "업무 관리 도구"
    ],
    "purposes": [
      "소개",
      "신청",
      "구매"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "실제 제품 화면 캡처가 주인공인 출시 페이지. 사용하는 팀의 실제 화면과 후기로 채움.",
    "thumb": "/landing-gallery/LP-053/thumb.jpg",
    "desktop": "/landing-gallery/LP-053/desktop.jpg",
    "mobile": "/landing-gallery/LP-053/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-054",
    "title": "부품 제조 기업 · 공장 배너",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "정밀 부품 제조",
      "B2B 제조"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "공장에서 일하는 사람과 측정실 장면을 보여 주는 제조 기업 소개. 현장 촬영과 잘 맞음.",
    "thumb": "/landing-gallery/LP-054/thumb.jpg",
    "desktop": "/landing-gallery/LP-054/desktop.jpg",
    "mobile": "/landing-gallery/LP-054/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-055",
    "title": "앱 출시 사전 신청 · 민트",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "모바일 앱",
      "헬스케어 스타트업"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "발랄한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "휴대폰을 든 손과 실제 앱 화면으로 쓰임을 보여 주는 사전 신청 페이지.",
    "thumb": "/landing-gallery/LP-055/thumb.jpg",
    "desktop": "/landing-gallery/LP-055/desktop.jpg",
    "mobile": "/landing-gallery/LP-055/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-056",
    "title": "문서 자동화 B2B · 어두운 호박색",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "B2B SaaS",
      "전자계약·문서 자동화"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "프리미엄",
      "대담한"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "실제 문서 양식 화면과 도입 팀의 후기로 설득하는 B2B 페이지.",
    "thumb": "/landing-gallery/LP-056/thumb.jpg",
    "desktop": "/landing-gallery/LP-056/desktop.jpg",
    "mobile": "/landing-gallery/LP-056/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-057",
    "title": "물류 대행 서비스 · 파랑과 노랑",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "물류 대행",
      "풀필먼트"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "창고에서 포장하는 직원과 택배 차량 사진으로 일하는 현장을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-057/thumb.jpg",
    "desktop": "/landing-gallery/LP-057/desktop.jpg",
    "mobile": "/landing-gallery/LP-057/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-058",
    "title": "개발 외주 스튜디오 · 굵은 고딕",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "개발 스튜디오",
      "IT 외주"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "대담한",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "팀이 화이트보드 앞에서 일하는 장면과 팀원 얼굴로 '누가 만드는지'를 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-058/thumb.jpg",
    "desktop": "/landing-gallery/LP-058/desktop.jpg",
    "mobile": "/landing-gallery/LP-058/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-059",
    "title": "산업 장비 신제품 · 어두운 주황",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "산업 장비 제조",
      "신제품 출시"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "대담한",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "공장에 놓인 실제 장비와 시연 영상이 중심인 B2B 출시 페이지.",
    "thumb": "/landing-gallery/LP-059/thumb.jpg",
    "desktop": "/landing-gallery/LP-059/desktop.jpg",
    "mobile": "/landing-gallery/LP-059/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-060",
    "title": "스타트업 채용 · 따뜻한 주홍",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "스타트업",
      "채용 페이지"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "팀원 얼굴과 현장 방문 장면으로 회사 문화를 보여 주는 채용 페이지.",
    "thumb": "/landing-gallery/LP-060/thumb.jpg",
    "desktop": "/landing-gallery/LP-060/desktop.jpg",
    "mobile": "/landing-gallery/LP-060/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-061",
    "title": "동네 빵집 · 버터 노랑",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "빵집",
      "베이커리"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "새벽에 반죽하는 사장님 손과 빵 나오는 시간표로 가게의 하루를 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-061/thumb.jpg",
    "desktop": "/landing-gallery/LP-061/desktop.jpg",
    "mobile": "/landing-gallery/LP-061/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-062",
    "title": "정갈한 한식당 · 어두운 초록",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "한식당",
      "예약제 식당"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "주방장과 장독대, 제철 상차림 사진이 이야기를 끌고 가는 예약제 식당 페이지.",
    "thumb": "/landing-gallery/LP-062/thumb.jpg",
    "desktop": "/landing-gallery/LP-062/desktop.jpg",
    "mobile": "/landing-gallery/LP-062/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-063",
    "title": "로스터리 카페 · 흑백과 민트",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "카페",
      "로스터리"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "미니멀",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "원두를 볶는 바리스타와 바 좌석 사진, 짧은 문장 하나로 가게 성격을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-063/thumb.jpg",
    "desktop": "/landing-gallery/LP-063/desktop.jpg",
    "mobile": "/landing-gallery/LP-063/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-064",
    "title": "분식 배달 전문점 · 노랑 빨강",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "분식",
      "배달 전문점"
    ],
    "purposes": [
      "구매",
      "소개"
    ],
    "moods": [
      "대담한",
      "발랄한"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "음식 사진과 매운맛 단계로 고르는 재미를 주는 배달 가게 페이지.",
    "thumb": "/landing-gallery/LP-064/thumb.jpg",
    "desktop": "/landing-gallery/LP-064/desktop.jpg",
    "mobile": "/landing-gallery/LP-064/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-065",
    "title": "꽃집 주문 · 장밋빛 아치",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "꽃집",
      "플라워숍"
    ],
    "purposes": [
      "구매",
      "예약"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "꽃다발과 가게 앞 사진, 주문 양식이 한 흐름으로 이어지는 동네 꽃집 페이지.",
    "thumb": "/landing-gallery/LP-065/thumb.jpg",
    "desktop": "/landing-gallery/LP-065/desktop.jpg",
    "mobile": "/landing-gallery/LP-065/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-066",
    "title": "동네 반찬가게 · 붉은 고딕",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "반찬가게",
      "시장 가게"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "반찬을 담는 사장님과 진열대 사진, 사장님의 말로 동네 단골을 부르는 구성.",
    "thumb": "/landing-gallery/LP-066/thumb.jpg",
    "desktop": "/landing-gallery/LP-066/desktop.jpg",
    "mobile": "/landing-gallery/LP-066/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-067",
    "title": "와인바 · 버건디 밤",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "와인바",
      "바·주점"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "어두운 바와 촛불, 잔 사진으로 분위기를 먼저 보여 주는 저녁 가게 페이지.",
    "thumb": "/landing-gallery/LP-067/thumb.jpg",
    "desktop": "/landing-gallery/LP-067/desktop.jpg",
    "mobile": "/landing-gallery/LP-067/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-068",
    "title": "헤어살롱 · 흑백과 분홍",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "헤어살롱",
      "미용실"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "미니멀",
      "프리미엄"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "상담하는 디자이너와 손님 사진, 디자이너 얼굴이 중심인 살롱 페이지.",
    "thumb": "/landing-gallery/LP-068/thumb.jpg",
    "desktop": "/landing-gallery/LP-068/desktop.jpg",
    "mobile": "/landing-gallery/LP-068/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-069",
    "title": "필라테스 스튜디오 · 세이지",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "필라테스",
      "운동 스튜디오"
    ],
    "purposes": [
      "소개",
      "신청",
      "구매"
    ],
    "moods": [
      "내추럴",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "강사가 자세를 잡아 주는 장면과 시간표·회원권까지 한 번에 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-069/thumb.jpg",
    "desktop": "/landing-gallery/LP-069/desktop.jpg",
    "mobile": "/landing-gallery/LP-069/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-070",
    "title": "1:1 PT 헬스장 · 남색과 코랄",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "헬스장",
      "개인 트레이닝"
    ],
    "purposes": [
      "소개",
      "예약",
      "구매"
    ],
    "moods": [
      "대담한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "트레이너가 회원 자세를 잡아 주는 장면과 실제 회원 이야기로 신뢰를 주는 구성.",
    "thumb": "/landing-gallery/LP-070/thumb.jpg",
    "desktop": "/landing-gallery/LP-070/desktop.jpg",
    "mobile": "/landing-gallery/LP-070/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-071",
    "title": "피부과 의원 · 맑은 파랑",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "피부과",
      "의원"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "전문의가 직접 상담하는 장면과 실제 진료 공간을 보여 주는 의원 페이지.",
    "thumb": "/landing-gallery/LP-071/thumb.jpg",
    "desktop": "/landing-gallery/LP-071/desktop.jpg",
    "mobile": "/landing-gallery/LP-071/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-072",
    "title": "한의원 · 깊은 초록 배너",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "한의원",
      "의원"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "내추럴",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "햇빛 드는 진료실과 원장 얼굴, 진료 순서로 처음 오는 환자를 안심시키는 구성.",
    "thumb": "/landing-gallery/LP-072/thumb.jpg",
    "desktop": "/landing-gallery/LP-072/desktop.jpg",
    "mobile": "/landing-gallery/LP-072/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-073",
    "title": "네일 숍 · 둥근 분홍",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "네일 숍",
      "뷰티 숍"
    ],
    "purposes": [
      "예약",
      "구매"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "손끝 디자인 사진과 작업대 모습으로 숍의 꼼꼼함을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-073/thumb.jpg",
    "desktop": "/landing-gallery/LP-073/desktop.jpg",
    "mobile": "/landing-gallery/LP-073/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-074",
    "title": "심리상담센터 · 차분한 보랏빛",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "심리상담",
      "상담센터"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사진보다 말투로 신뢰를 주는 구성. 상담사 얼굴과 자격만 실제로 채움.",
    "thumb": "/landing-gallery/LP-074/thumb.jpg",
    "desktop": "/landing-gallery/LP-074/desktop.jpg",
    "mobile": "/landing-gallery/LP-074/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-075",
    "title": "초등 영어 학원 · 하늘과 노랑",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "영어 학원",
      "초등 교육"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "발랄한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "아이들이 둘러앉은 수업 장면과 선생님 얼굴이 중심인 학원 페이지.",
    "thumb": "/landing-gallery/LP-075/thumb.jpg",
    "desktop": "/landing-gallery/LP-075/desktop.jpg",
    "mobile": "/landing-gallery/LP-075/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-076",
    "title": "코딩 부트캠프 · 밝은 파랑",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "코딩 교육",
      "부트캠프"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "타이포 중심",
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "멘토와 수강생이 함께 코드를 보는 장면, 수료생이 실제로 만든 서비스로 설득하는 구성.",
    "thumb": "/landing-gallery/LP-076/thumb.jpg",
    "desktop": "/landing-gallery/LP-076/desktop.jpg",
    "mobile": "/landing-gallery/LP-076/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-077",
    "title": "1:1 커리어 코칭 · 명조와 초록",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "커리어 코칭",
      "1인 코치"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "히어로 대신 코치 본인의 얼굴과 경력으로 시작하는 1인 브랜드 페이지.",
    "thumb": "/landing-gallery/LP-077/thumb.jpg",
    "desktop": "/landing-gallery/LP-077/desktop.jpg",
    "mobile": "/landing-gallery/LP-077/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-078",
    "title": "입시 미술 학원 · 흑백과 주홍",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "미술 학원",
      "입시 실기"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "대담한",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "수강생 그림과 합평 장면이 주인공. 실제 작품 사진(동의 받은 것)으로 채움.",
    "thumb": "/landing-gallery/LP-078/thumb.jpg",
    "desktop": "/landing-gallery/LP-078/desktop.jpg",
    "mobile": "/landing-gallery/LP-078/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-079",
    "title": "독서 논술 교실 · 차분한 초록",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "독서 논술",
      "초중등 교육"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "책을 펼쳐 토론하는 아이들과 학부모의 말이 들어가는 교습소 페이지.",
    "thumb": "/landing-gallery/LP-079/thumb.jpg",
    "desktop": "/landing-gallery/LP-079/desktop.jpg",
    "mobile": "/landing-gallery/LP-079/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-080",
    "title": "온라인 요리 클래스 · 당근색",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "온라인 강의",
      "요리 클래스"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "선생님의 부엌과 손이 나오는 강의 장면으로 따라 할 수 있다는 느낌을 주는 구성.",
    "thumb": "/landing-gallery/LP-080/thumb.jpg",
    "desktop": "/landing-gallery/LP-080/desktop.jpg",
    "mobile": "/landing-gallery/LP-080/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-081",
    "title": "직장인 자격증 학원 · 남색 개요",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "자격증 학원",
      "성인 교육"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "개강 일정과 수업 흐름이 중심인 정보형. 강의실과 강사 사진을 더하면 신뢰가 생김.",
    "thumb": "/landing-gallery/LP-081/thumb.jpg",
    "desktop": "/landing-gallery/LP-081/desktop.jpg",
    "mobile": "/landing-gallery/LP-081/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-082",
    "title": "인테리어 스튜디오 · 따뜻한 회색",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "인테리어",
      "리모델링"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "완성된 공간 사진과 건축주 이야기가 중심. 실제 시공 현장 촬영과 맞음.",
    "thumb": "/landing-gallery/LP-082/thumb.jpg",
    "desktop": "/landing-gallery/LP-082/desktop.jpg",
    "mobile": "/landing-gallery/LP-082/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-083",
    "title": "세무사 사무소 · 정돈된 남색",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "세무사",
      "기장 대리"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "담당 세무사의 얼굴과 일하는 순서로 신뢰를 주는 사무소 페이지.",
    "thumb": "/landing-gallery/LP-083/thumb.jpg",
    "desktop": "/landing-gallery/LP-083/desktop.jpg",
    "mobile": "/landing-gallery/LP-083/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-084",
    "title": "이사·입주 청소 · 청록",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "청소 서비스",
      "생활서비스"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "신뢰감 있는",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "청소 매니저가 일하는 장면과 사진 점검표 약속으로 믿음을 주는 구성.",
    "thumb": "/landing-gallery/LP-084/thumb.jpg",
    "desktop": "/landing-gallery/LP-084/desktop.jpg",
    "mobile": "/landing-gallery/LP-084/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-085",
    "title": "반려동물 미용·호텔 · 호박색",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "반려동물 미용",
      "반려동물 호텔"
    ],
    "purposes": [
      "예약",
      "소개"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "미용사가 강아지를 안은 장면과 미용 뒤 얼굴 사진으로 보호자를 안심시키는 구성.",
    "thumb": "/landing-gallery/LP-085/thumb.jpg",
    "desktop": "/landing-gallery/LP-085/desktop.jpg",
    "mobile": "/landing-gallery/LP-085/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-086",
    "title": "자동차 정비소 · 회색 배너",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "자동차 정비",
      "생활서비스"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "신뢰감 있는",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "정비사가 리프트 아래에서 일하는 장면과 사진으로 설명하는 약속이 중심.",
    "thumb": "/landing-gallery/LP-086/thumb.jpg",
    "desktop": "/landing-gallery/LP-086/desktop.jpg",
    "mobile": "/landing-gallery/LP-086/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-087",
    "title": "노무사 사무소 · 명조 남색",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "노무 상담",
      "법률 서비스"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사진보다 상황 목록과 절차로 '내 이야기'라고 느끼게 하는 상담형 페이지.",
    "thumb": "/landing-gallery/LP-087/thumb.jpg",
    "desktop": "/landing-gallery/LP-087/desktop.jpg",
    "mobile": "/landing-gallery/LP-087/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-088",
    "title": "수선·세탁소 · 파란 동네 가게",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "수선·세탁",
      "생활서비스"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "재봉틀 앞 사장님과 수선실 풍경, 사장님의 말이 중심인 동네 가게 페이지.",
    "thumb": "/landing-gallery/LP-088/thumb.jpg",
    "desktop": "/landing-gallery/LP-088/desktop.jpg",
    "mobile": "/landing-gallery/LP-088/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-089",
    "title": "수제 그래놀라 · 곡물빛",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "식품 D2C",
      "그래놀라"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "오븐 앞 대표와 재료 이야기로 작은 식품 브랜드의 정성을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-089/thumb.jpg",
    "desktop": "/landing-gallery/LP-089/desktop.jpg",
    "mobile": "/landing-gallery/LP-089/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-090",
    "title": "친환경 세제 리필 · 청록 욕실",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "생활용품 D2C",
      "리필 브랜드"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "내추럴",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "실제 욕실 선반과 리필하는 손 사진으로 생활 속 쓰임을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-090/thumb.jpg",
    "desktop": "/landing-gallery/LP-090/desktop.jpg",
    "mobile": "/landing-gallery/LP-090/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-091",
    "title": "원목 의자 신제품 · 갤러리 회색",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "가구 브랜드",
      "신제품 출시"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "프리미엄",
      "미니멀"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "공방에서 깎는 과정과 실제 거실 연출 사진으로 제품을 보여 주는 출시 페이지.",
    "thumb": "/landing-gallery/LP-091/thumb.jpg",
    "desktop": "/landing-gallery/LP-091/desktop.jpg",
    "mobile": "/landing-gallery/LP-091/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-092",
    "title": "과수원 산지 직송 · 사과밭",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "농산물 직거래",
      "산지 직송"
    ],
    "purposes": [
      "소개",
      "구매"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "사과를 따는 농부 부부가 주인공인 산지 직송 페이지. 과수원 현장 촬영과 맞음.",
    "thumb": "/landing-gallery/LP-092/thumb.jpg",
    "desktop": "/landing-gallery/LP-092/desktop.jpg",
    "mobile": "/landing-gallery/LP-092/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-093",
    "title": "전통주 양조장 · 어두운 금빛",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "전통주",
      "양조장"
    ],
    "purposes": [
      "소개",
      "구매",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "술 익는 옹기와 누룩 방에서 일하는 양조인 사진으로 기다림을 보여 주는 구성.",
    "thumb": "/landing-gallery/LP-093/thumb.jpg",
    "desktop": "/landing-gallery/LP-093/desktop.jpg",
    "mobile": "/landing-gallery/LP-093/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-094",
    "title": "한옥 스테이 · 처마 아래",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "한옥 숙소",
      "독채 스테이"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "비 오는 마당과 서까래, 아침 상차림 사진으로 머무는 시간을 보여 주는 숙소 페이지.",
    "thumb": "/landing-gallery/LP-094/thumb.jpg",
    "desktop": "/landing-gallery/LP-094/desktop.jpg",
    "mobile": "/landing-gallery/LP-094/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-095",
    "title": "숲속 캠핑장 · 짙은 숲",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "캠핑장",
      "글램핑"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "내추럴",
      "대담한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "숲속 데크와 모닥불, 실제 사이트 사진으로 고르는 재미를 주는 구성.",
    "thumb": "/landing-gallery/LP-095/thumb.jpg",
    "desktop": "/landing-gallery/LP-095/desktop.jpg",
    "mobile": "/landing-gallery/LP-095/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-096",
    "title": "골목 도보 투어 · 주황 지도",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "도보 여행",
      "가이드 투어"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "발랄한",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "동네 토박이 가이드의 얼굴과 골목 장면으로 여행을 사람 이야기로 파는 구성.",
    "thumb": "/landing-gallery/LP-096/thumb.jpg",
    "desktop": "/landing-gallery/LP-096/desktop.jpg",
    "mobile": "/landing-gallery/LP-096/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-097",
    "title": "소극장 연극 · 종이와 먹",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "연극",
      "공연"
    ],
    "purposes": [
      "행사",
      "구매"
    ],
    "moods": [
      "대담한",
      "미니멀"
    ],
    "visualStyles": [
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "무대 세트와 배우 얼굴, 굵은 제목 하나로 공연 성격을 세우는 구성.",
    "thumb": "/landing-gallery/LP-097/thumb.jpg",
    "desktop": "/landing-gallery/LP-097/desktop.jpg",
    "mobile": "/landing-gallery/LP-097/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-098",
    "title": "유기동물 정기 후원 · 따뜻한 주황",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "동물보호소",
      "비영리 후원"
    ],
    "purposes": [
      "소개",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "보호소 동물과 봉사자, 후원금이 쓰이는 현장 사진으로 신뢰를 쌓는 구성.",
    "thumb": "/landing-gallery/LP-098/thumb.jpg",
    "desktop": "/landing-gallery/LP-098/desktop.jpg",
    "mobile": "/landing-gallery/LP-098/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-099",
    "title": "스몰웨딩 정원 · 가는 명조",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "스몰웨딩",
      "행사 장소"
    ],
    "purposes": [
      "소개",
      "예약",
      "행사"
    ],
    "moods": [
      "프리미엄",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "실제 예식 장면과 공간 사진으로 하루를 상상하게 하는 장소 소개 페이지.",
    "thumb": "/landing-gallery/LP-099/thumb.jpg",
    "desktop": "/landing-gallery/LP-099/desktop.jpg",
    "mobile": "/landing-gallery/LP-099/mobile.jpg",
    "credit": null
  },
  {
    "id": "LP-100",
    "title": "구민 문화센터 강좌 · 보랏빛",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "문화센터",
      "생활 강좌"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "따뜻한",
      "발랄한"
    ],
    "visualStyles": [
      "사진 중심"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안",
    "summary": "동네 이웃이 함께 배우는 교실 사진이 중심인 강좌 모집 페이지.",
    "thumb": "/landing-gallery/LP-100/thumb.jpg",
    "desktop": "/landing-gallery/LP-100/desktop.jpg",
    "mobile": "/landing-gallery/LP-100/mobile.jpg",
    "credit": null
  }
];

export const landingDesignById = (id: string) => landingDesigns.find((d) => d.id === id);
