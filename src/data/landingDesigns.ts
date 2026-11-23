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
    "일러스트 중심",
    "모션 그래픽"
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
    "mobileThumb": "/landing-gallery/LP-001/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Oceanside Restaurant Free Website Template\" by CCasalme (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "CCasalme",
      "sourceUrl": "https://www.figma.com/community/file/1638381785075377576",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-002/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Responsive Landing Page Design | Webinar Event Website UI Design | Free Figma Template\" by Publish Ninja (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Publish Ninja",
      "sourceUrl": "https://www.figma.com/community/file/1433089452383535100",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "AMONWAT DUMKRUT",
        "url": "https://unsplash.com/@amonwatdumkrut",
        "photoUrl": "https://unsplash.com/photos/CfsjW_F9J6s"
      },
      {
        "name": "Alexandre Pellaes",
        "url": "https://unsplash.com/@apellaes",
        "photoUrl": "https://unsplash.com/photos/6vAjp0pscX0"
      },
      {
        "name": "Kevin Gonzalez",
        "url": "https://unsplash.com/@typegon",
        "photoUrl": "https://unsplash.com/photos/-NXNaE9lu6w"
      },
      {
        "name": "Kane Reinholdtsen",
        "url": "https://unsplash.com/@kanereinholdtsen",
        "photoUrl": "https://unsplash.com/photos/LETdkk7wHQk"
      },
      {
        "name": "Product School",
        "url": "https://unsplash.com/@productschool",
        "photoUrl": "https://unsplash.com/photos/dJICd7b_LlE"
      },
      {
        "name": "Olena Kholina",
        "url": "https://unsplash.com/@sixtynice",
        "photoUrl": "https://unsplash.com/photos/OsuDfn4vtLA"
      },
      {
        "name": "Zac Bowling",
        "url": "https://unsplash.com/@zbowling",
        "photoUrl": "https://unsplash.com/photos/Gi-HOiLMx7o"
      },
      {
        "name": "SR Engineers and Consultants",
        "url": "https://unsplash.com/@sr_engineersandconsultants",
        "photoUrl": "https://unsplash.com/photos/S3Qh6mNZbLc"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-003/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Free Skincare E-Commerce Landing Page (Web and Mobile Responsiveness)\" by Abiola Babatunde (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Abiola Babatunde",
      "sourceUrl": "https://www.figma.com/community/file/1448238939856956662",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Natallia Photo",
        "url": "https://unsplash.com/@natallia_jpeg",
        "photoUrl": "https://unsplash.com/photos/58BQs83uClo"
      },
      {
        "name": "CRYSTALWEED cannabis",
        "url": "https://unsplash.com/@crystalweed",
        "photoUrl": "https://unsplash.com/photos/w1an547rkxo"
      },
      {
        "name": "GLOBENCER",
        "url": "https://unsplash.com/@globencer",
        "photoUrl": "https://unsplash.com/photos/DiJKOYIiNmQ"
      },
      {
        "name": "Ela De Pure",
        "url": "https://unsplash.com/@eladepure",
        "photoUrl": "https://unsplash.com/photos/RJgh0UW0HbU"
      },
      {
        "name": "Rafly Alfaridzy",
        "url": "https://unsplash.com/@raphiella",
        "photoUrl": "https://unsplash.com/photos/D44p6Ubx-9E"
      },
      {
        "name": "Laura Jaeger",
        "url": "https://unsplash.com/@lvjart",
        "photoUrl": "https://unsplash.com/photos/yUF0J8UMEQg"
      },
      {
        "name": "Filip Knezevic",
        "url": "https://unsplash.com/@knezevic",
        "photoUrl": "https://unsplash.com/photos/fVXe4UXX5RI"
      },
      {
        "name": "Birgith Roosipuu",
        "url": "https://unsplash.com/@msbirgith",
        "photoUrl": "https://unsplash.com/photos/gUZv1Fdkfgw"
      },
      {
        "name": "Point Normal",
        "url": "https://unsplash.com/@normals",
        "photoUrl": "https://unsplash.com/photos/GjJZ5HBl2qQ"
      },
      {
        "name": "Mathilde Langevin",
        "url": "https://unsplash.com/@mathildelangevin",
        "photoUrl": "https://unsplash.com/photos/FDRaYqiTY1k"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-004/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #1\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Lyubomyr Reverchuk",
        "url": "https://unsplash.com/@lreverchuk",
        "photoUrl": "https://unsplash.com/photos/rtD_lcsN6_U"
      },
      {
        "name": "Mushvig Niftaliyev",
        "url": "https://unsplash.com/@mushvig95",
        "photoUrl": "https://unsplash.com/photos/CQTbmzuat5c"
      },
      {
        "name": "Philipp Katzenberger",
        "url": "https://unsplash.com/@fantasyflip",
        "photoUrl": "https://unsplash.com/photos/iIJrUoeRoCQ"
      },
      {
        "name": "Abu Saeid",
        "url": "https://unsplash.com/@abusaeid01",
        "photoUrl": "https://unsplash.com/photos/fdGTi4IcaJc"
      },
      {
        "name": "Paper Textures",
        "url": "https://unsplash.com/@inthemakingstudio",
        "photoUrl": "https://unsplash.com/photos/Vq1FQ_uNppw"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-005/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #2\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Cherrydeck",
        "url": "https://unsplash.com/@cherrydeck",
        "photoUrl": "https://unsplash.com/photos/05gac-Qn0k4"
      },
      {
        "name": "Amélie Mourichon",
        "url": "https://unsplash.com/@amayli",
        "photoUrl": "https://unsplash.com/photos/sv8oOQaUb-o"
      },
      {
        "name": "Danial Igdery",
        "url": "https://unsplash.com/@ricaros",
        "photoUrl": "https://unsplash.com/photos/FCHlYvR5gJI"
      },
      {
        "name": "Luis Villasmil",
        "url": "https://unsplash.com/@luisviol",
        "photoUrl": "https://unsplash.com/photos/4V8uMZx8FYA"
      },
      {
        "name": "charlesdeluvio",
        "url": "https://unsplash.com/@charlesdeluvio",
        "photoUrl": "https://unsplash.com/photos/6OF-Ly-5oJY"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-006/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #3\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/kp7qkHTgSKc"
      },
      {
        "name": "Thought Catalog",
        "url": "https://unsplash.com/@thoughtcatalog",
        "photoUrl": "https://unsplash.com/photos/BlGmdY18CFQ"
      },
      {
        "name": "John",
        "url": "https://unsplash.com/@johnishappysometimes",
        "photoUrl": "https://unsplash.com/photos/yFbyvpEGHFQ"
      },
      {
        "name": "Quilia",
        "url": "https://unsplash.com/@heyquilia",
        "photoUrl": "https://unsplash.com/photos/1-aA2Fadydc"
      },
      {
        "name": "Jeswin Thomas",
        "url": "https://unsplash.com/@jeswinthomas",
        "photoUrl": "https://unsplash.com/photos/-hgJu2ykh4E"
      },
      {
        "name": "ThisisEngineering",
        "url": "https://unsplash.com/@thisisengineering",
        "photoUrl": "https://unsplash.com/photos/TXxiFuQLBKQ"
      },
      {
        "name": "Anastassia Anufrieva",
        "url": "https://unsplash.com/@antoie",
        "photoUrl": "https://unsplash.com/photos/-JUlfa5fAIg"
      },
      {
        "name": "Dom Fou",
        "url": "https://unsplash.com/@domlafou",
        "photoUrl": "https://unsplash.com/photos/YRMWVcdyhmI"
      },
      {
        "name": "Ashutosh Gupta",
        "url": "https://unsplash.com/@ashu_3101",
        "photoUrl": "https://unsplash.com/photos/NASjMHJ9OhI"
      },
      {
        "name": "Ernest Flowers",
        "url": "https://unsplash.com/@ernestflowerss",
        "photoUrl": "https://unsplash.com/photos/jW_8iexQbhw"
      },
      {
        "name": "Timur Shakerzianov",
        "url": "https://unsplash.com/@shaker_jpg",
        "photoUrl": "https://unsplash.com/photos/DEDF2zaZvUg"
      },
      {
        "name": "Christin Hume",
        "url": "https://unsplash.com/@christinhumephoto",
        "photoUrl": "https://unsplash.com/photos/Hcfwew744z4"
      },
      {
        "name": "Joshua Hoehne",
        "url": "https://unsplash.com/@joshua_hoehne",
        "photoUrl": "https://unsplash.com/photos/iggWDxHTAUQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-007/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #4\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Snapmaker 3D Printer",
        "url": "https://unsplash.com/@snapmaker_official",
        "photoUrl": "https://unsplash.com/photos/qvRFRFJpXA4"
      },
      {
        "name": "Onkar Mehta",
        "url": "https://unsplash.com/@onkar_",
        "photoUrl": "https://unsplash.com/photos/eVpZxkNY3bw"
      },
      {
        "name": "Tai Bui",
        "url": "https://unsplash.com/@agforl24",
        "photoUrl": "https://unsplash.com/photos/NLXJjsuKBh0"
      },
      {
        "name": "Andy Brown",
        "url": "https://unsplash.com/@basallt",
        "photoUrl": "https://unsplash.com/photos/8dgFq8Vbelo"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-008/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #5\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Steven Lelham",
        "url": "https://unsplash.com/@slelham",
        "photoUrl": "https://unsplash.com/photos/atSaEOeE8Nk"
      },
      {
        "name": "Shan A. Rajpoot",
        "url": "https://unsplash.com/@shanalirajpoot",
        "photoUrl": "https://unsplash.com/photos/QkK7NtsPrJM"
      },
      {
        "name": "James Lee",
        "url": "https://unsplash.com/@jbl12761",
        "photoUrl": "https://unsplash.com/photos/_QvszySFByg"
      },
      {
        "name": "Alexander Red",
        "url": "https://unsplash.com/@alexandered7",
        "photoUrl": "https://unsplash.com/photos/d3bYmnZ0ank"
      },
      {
        "name": "Christopher Campbell",
        "url": "https://unsplash.com/@chrisjoelcampbell",
        "photoUrl": "https://unsplash.com/photos/kFCdfLbu6zA"
      },
      {
        "name": "Isaac Wendland",
        "url": "https://unsplash.com/@isaacwendland",
        "photoUrl": "https://unsplash.com/photos/7DCZgKyp8vw"
      },
      {
        "name": "Oleksii S",
        "url": "https://unsplash.com/@wonderland8",
        "photoUrl": "https://unsplash.com/photos/O2kqxbix4Mw"
      },
      {
        "name": "Viktor Bystrov",
        "url": "https://unsplash.com/@xokvictor",
        "photoUrl": "https://unsplash.com/photos/Gi0OMNguFaw"
      },
      {
        "name": "Danielle Cerullo",
        "url": "https://unsplash.com/@dncerullo",
        "photoUrl": "https://unsplash.com/photos/CQfNt66ttZM"
      },
      {
        "name": "Wesley Tingey",
        "url": "https://unsplash.com/@wesleyphotography",
        "photoUrl": "https://unsplash.com/photos/dKCKiC0BQtU"
      },
      {
        "name": "John Fornander",
        "url": "https://unsplash.com/@johnfo",
        "photoUrl": "https://unsplash.com/photos/4R9CcBdQTEg"
      },
      {
        "name": "Joshua Tsu",
        "url": "https://unsplash.com/@joshdatsu",
        "photoUrl": "https://unsplash.com/photos/k27fjLXCuuo"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-009/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #6\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Gayatri Malhotra",
        "url": "https://unsplash.com/@gmalhotra",
        "photoUrl": "https://unsplash.com/photos/O1uVXHc2tl4"
      },
      {
        "name": "Dogfluence.com",
        "url": "https://unsplash.com/@dogfluence",
        "photoUrl": "https://unsplash.com/photos/ENqs0WEM3nY"
      },
      {
        "name": "Mohammad Reza",
        "url": "https://unsplash.com/@razee48",
        "photoUrl": "https://unsplash.com/photos/qYlabBENQNQ"
      },
      {
        "name": "龙 赵",
        "url": "https://unsplash.com/@zhaolong",
        "photoUrl": "https://unsplash.com/photos/V-b68_mY2Ws"
      },
      {
        "name": "Taylor Kopel",
        "url": "https://unsplash.com/@taylorkopel",
        "photoUrl": "https://unsplash.com/photos/WX4i1Jq_o0Y"
      },
      {
        "name": "Zoë Gayah Jonker",
        "url": "https://unsplash.com/@zoegayah",
        "photoUrl": "https://unsplash.com/photos/G7kUPmzi80E"
      },
      {
        "name": "Xingchen Yan",
        "url": "https://unsplash.com/@xingchenyan",
        "photoUrl": "https://unsplash.com/photos/MZYuAp-nIqM"
      },
      {
        "name": "Ludek Pytloun",
        "url": "https://unsplash.com/@ludvar31",
        "photoUrl": "https://unsplash.com/photos/JtbE42YVp0s"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-010/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #7\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/WrevB3gLLBs"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-011/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #8\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Ash Amplifies",
        "url": "https://unsplash.com/@ashamplifies",
        "photoUrl": "https://unsplash.com/photos/NQ6Lh81BTRs"
      },
      {
        "name": "Ela De Pure",
        "url": "https://unsplash.com/@eladepure",
        "photoUrl": "https://unsplash.com/photos/XW9IR7pucEo"
      },
      {
        "name": "Look Studio",
        "url": "https://unsplash.com/@lookphoto",
        "photoUrl": "https://unsplash.com/photos/FJuO9YRnYcQ"
      },
      {
        "name": "Elsa Olofsson",
        "url": "https://unsplash.com/@elsaolofsson",
        "photoUrl": "https://unsplash.com/photos/Pm0K9Y3EPUc"
      },
      {
        "name": "Maria Lupan",
        "url": "https://unsplash.com/@luandmario",
        "photoUrl": "https://unsplash.com/photos/BlcA2-o-7IM"
      },
      {
        "name": "CRYSTALWEED cannabis",
        "url": "https://unsplash.com/@crystalweed",
        "photoUrl": "https://unsplash.com/photos/87v3-xW2MnQ"
      },
      {
        "name": "mansi yadav",
        "url": "https://unsplash.com/@mansiyadav0308",
        "photoUrl": "https://unsplash.com/photos/lHjr4nmDiQM"
      },
      {
        "name": "Mohamed hamdi",
        "url": "https://unsplash.com/@amdshutter",
        "photoUrl": "https://unsplash.com/photos/_Yca73BgigE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-012/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #9\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Wei Huang",
        "url": "https://unsplash.com/@wei0411",
        "photoUrl": "https://unsplash.com/photos/t3fiFqm5mGA"
      },
      {
        "name": "Daria K",
        "url": "https://unsplash.com/@amberfoxfilm",
        "photoUrl": "https://unsplash.com/photos/wAD3Ow8x1w4"
      },
      {
        "name": "Scott Webb",
        "url": "https://unsplash.com/@scottwebb",
        "photoUrl": "https://unsplash.com/photos/z-byiqHM1ZM"
      },
      {
        "name": "Noyo creatif",
        "url": "https://unsplash.com/@noyocreatif",
        "photoUrl": "https://unsplash.com/photos/gzu-etcMXKw"
      },
      {
        "name": "Natalie Kovach",
        "url": "https://unsplash.com/@natkingkov",
        "photoUrl": "https://unsplash.com/photos/ph7QQq63lCs"
      },
      {
        "name": "lan deng",
        "url": "https://unsplash.com/@landall",
        "photoUrl": "https://unsplash.com/photos/CFKwL570ZSc"
      },
      {
        "name": "Prudence Earl",
        "url": "https://unsplash.com/@prudenceearl",
        "photoUrl": "https://unsplash.com/photos/NwBx723XaHw"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-013/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"10 Landing pages | Responsive | Web, Tab, Mobile | Ui/Ux Design · #10\" by Ashraf Sabri (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Ashraf Sabri",
      "sourceUrl": "https://www.figma.com/community/file/1357235266228589543",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Mike Swigunski",
        "url": "https://unsplash.com/@mike_swigunski",
        "photoUrl": "https://unsplash.com/photos/k9Zeq6EH_bk"
      },
      {
        "name": "Adam Juman",
        "url": "https://unsplash.com/@jumanjiphotos",
        "photoUrl": "https://unsplash.com/photos/GRNQr9O0FBo"
      },
      {
        "name": "Travis Fish",
        "url": "https://unsplash.com/@travisfishl",
        "photoUrl": "https://unsplash.com/photos/8Tr_d66NbQM"
      },
      {
        "name": "Aravind Sreekumar Nair",
        "url": "https://unsplash.com/@aravindu62",
        "photoUrl": "https://unsplash.com/photos/g9HRrjOu0Fc"
      },
      {
        "name": "Hana El Zohiry",
        "url": "https://unsplash.com/@hana_elzohiry",
        "photoUrl": "https://unsplash.com/photos/wEkp5JAAS7E"
      },
      {
        "name": "Shing",
        "url": "https://unsplash.com/@imshing",
        "photoUrl": "https://unsplash.com/photos/I26mw3wrvdA"
      },
      {
        "name": "Eugene Chystiakov",
        "url": "https://unsplash.com/@eugenechystiakov",
        "photoUrl": "https://unsplash.com/photos/bt-AYttMuww"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-014/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Figma design - Responsive yoga website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1229610063156797225",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "gabbiistudios",
        "url": "https://unsplash.com/@gabrielonodegba",
        "photoUrl": "https://unsplash.com/photos/0cuGLRYbQsk"
      },
      {
        "name": "Junseong Lee",
        "url": "https://unsplash.com/@bearsnap",
        "photoUrl": "https://unsplash.com/photos/AX8cf6mkCzw"
      },
      {
        "name": "Jared Rice",
        "url": "https://unsplash.com/@jareddrice",
        "photoUrl": "https://unsplash.com/photos/NTyBbu66_SI"
      },
      {
        "name": "kike vega",
        "url": "https://unsplash.com/@kikekiks",
        "photoUrl": "https://unsplash.com/photos/F2qh3yjz6Jk"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/az_3xzrPNtg"
      },
      {
        "name": "Marea Wellness",
        "url": "https://unsplash.com/@mareawellness",
        "photoUrl": "https://unsplash.com/photos/IvtDTZQM8tQ"
      },
      {
        "name": "ROXANA POPOVICI",
        "url": "https://unsplash.com/@roxanarxx",
        "photoUrl": "https://unsplash.com/photos/cZ0WYsBFHhs"
      },
      {
        "name": "Jaspinder Singh",
        "url": "https://unsplash.com/@jaspindersingh",
        "photoUrl": "https://unsplash.com/photos/vpVE1Xk1eR4"
      },
      {
        "name": "JD  Mason",
        "url": "https://unsplash.com/@jmason",
        "photoUrl": "https://unsplash.com/photos/xCPdjitY5sQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-015/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Charity- Responsive Website Design\" by Joou Designs (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Joou Designs",
      "sourceUrl": "https://www.figma.com/community/file/1374427178022270099",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/NGdaKKVt4w0"
      },
      {
        "name": "Eyoel Kahssay",
        "url": "https://unsplash.com/@eyoelkahssay",
        "photoUrl": "https://unsplash.com/photos/FyCjvyPG9Pg"
      },
      {
        "name": "Marlis Trio Akbar",
        "url": "https://unsplash.com/@marlis_akbar",
        "photoUrl": "https://unsplash.com/photos/eMB60hNHFL8"
      },
      {
        "name": "Joel Muniz",
        "url": "https://unsplash.com/@jmuniz",
        "photoUrl": "https://unsplash.com/photos/3k3l2brxmwQ"
      },
      {
        "name": "Ries Bosch",
        "url": "https://unsplash.com/@ries_bosch",
        "photoUrl": "https://unsplash.com/photos/5gXPybgcM5M"
      },
      {
        "name": "Avesta",
        "url": "https://unsplash.com/@avesta1",
        "photoUrl": "https://unsplash.com/photos/nhxN9_O7xZY"
      },
      {
        "name": "Quilia",
        "url": "https://unsplash.com/@heyquilia",
        "photoUrl": "https://unsplash.com/photos/AvcBDbR-LWc"
      },
      {
        "name": "Nguyễn Tân",
        "url": "https://unsplash.com/@tannht",
        "photoUrl": "https://unsplash.com/photos/6yIJ8PY9rzs"
      },
      {
        "name": "Aaron Burden",
        "url": "https://unsplash.com/@aaronburden",
        "photoUrl": "https://unsplash.com/photos/6jYoil2GhVk"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-016/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Design in Figma - Responsive watches website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098395559253476",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Tony Litvyak",
        "url": "https://unsplash.com/@justatony",
        "photoUrl": "https://unsplash.com/photos/5Dv52kcKZLc"
      },
      {
        "name": "Shakib Uzzaman",
        "url": "https://unsplash.com/@shakib2777",
        "photoUrl": "https://unsplash.com/photos/GacPgtEzTpU"
      },
      {
        "name": "Ruben Caldera",
        "url": "https://unsplash.com/@scdone123",
        "photoUrl": "https://unsplash.com/photos/hAHzIx8EBdM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-017/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"ECO Shop - Eco Friendly Store Responsive Website\" by Bima Agustian Wanaputra (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Bima Agustian Wanaputra",
      "sourceUrl": "https://www.figma.com/community/file/1318227406178520862",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "micheile henderson",
        "url": "https://unsplash.com/@micheile",
        "photoUrl": "https://unsplash.com/photos/7iGNwuxjBY8"
      },
      {
        "name": "Moonstarious Project",
        "url": "https://unsplash.com/@moonstariousproject",
        "photoUrl": "https://unsplash.com/photos/wl2TODALiAY"
      },
      {
        "name": "Joan Tran",
        "url": "https://unsplash.com/@joanofarts",
        "photoUrl": "https://unsplash.com/photos/reEySFadyJQ"
      },
      {
        "name": "Harold Hisona",
        "url": "https://unsplash.com/@harold_angus",
        "photoUrl": "https://unsplash.com/photos/VCC5Vc0X2F8"
      },
      {
        "name": "Clay Banks",
        "url": "https://unsplash.com/@claybanks",
        "photoUrl": "https://unsplash.com/photos/rLQwcbZjrcU"
      },
      {
        "name": "Heather Ford",
        "url": "https://unsplash.com/@the_modern_life_mrs",
        "photoUrl": "https://unsplash.com/photos/FbrDS0jY_Hw"
      },
      {
        "name": "cool guy jon",
        "url": "https://unsplash.com/@cool_guy_jon",
        "photoUrl": "https://unsplash.com/photos/EIFJ8YlxsDY"
      },
      {
        "name": "Katy Anne",
        "url": "https://unsplash.com/@katy_anne",
        "photoUrl": "https://unsplash.com/photos/LX1qE-yF_Zs"
      },
      {
        "name": "ZACHARY STAINES",
        "url": "https://unsplash.com/@zaccastravels",
        "photoUrl": "https://unsplash.com/photos/0kvS01RVKQI"
      },
      {
        "name": "Yulia Khlebnikova",
        "url": "https://unsplash.com/@khlebnikovayulia",
        "photoUrl": "https://unsplash.com/photos/dwgizUdeQZ4"
      },
      {
        "name": "insung yoon",
        "url": "https://unsplash.com/@insungpandora",
        "photoUrl": "https://unsplash.com/photos/RCWIK0fsETc"
      },
      {
        "name": "Jack Cole",
        "url": "https://unsplash.com/@thisisjackcole",
        "photoUrl": "https://unsplash.com/photos/UlPIZi9hONI"
      },
      {
        "name": "Romain Water",
        "url": "https://unsplash.com/@romain_water_oneee",
        "photoUrl": "https://unsplash.com/photos/oJPPcg6s-ec"
      },
      {
        "name": "runda choo",
        "url": "https://unsplash.com/@rundachoo",
        "photoUrl": "https://unsplash.com/photos/hl0aLqt1iuk"
      },
      {
        "name": "Andrew Valdivia",
        "url": "https://unsplash.com/@donovan_valdivia",
        "photoUrl": "https://unsplash.com/photos/4Aw5FeBo2aA"
      },
      {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt",
        "photoUrl": "https://unsplash.com/photos/n42ogaQn32o"
      },
      {
        "name": "Ian Talmacs",
        "url": "https://unsplash.com/@iantalmacs",
        "photoUrl": "https://unsplash.com/photos/C5Z2m8Eaf8Y"
      },
      {
        "name": "Far Chinberdiev",
        "url": "https://unsplash.com/@fardevio",
        "photoUrl": "https://unsplash.com/photos/N0Cit1c5wwI"
      },
      {
        "name": "Kendal",
        "url": "https://unsplash.com/@hikendal",
        "photoUrl": "https://unsplash.com/photos/hnysCJrPpkc"
      },
      {
        "name": "Pierre Borthiry - Peiobty",
        "url": "https://unsplash.com/@peiobty",
        "photoUrl": "https://unsplash.com/photos/P7JEpmkUzCg"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-018/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Figma Design - Responsive coffee website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098100611718626",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "nameless 3791",
        "url": "https://unsplash.com/@unidentifieduser",
        "photoUrl": "https://unsplash.com/photos/5nYLHK68TLM"
      },
      {
        "name": "Nathan Dumlao",
        "url": "https://unsplash.com/@nate_dumlao",
        "photoUrl": "https://unsplash.com/photos/Y3AqmbmtLQI"
      },
      {
        "name": "Colin redwood",
        "url": "https://unsplash.com/@credwood",
        "photoUrl": "https://unsplash.com/photos/WmCOwYlJT1A"
      },
      {
        "name": "Nadia Valko",
        "url": "https://unsplash.com/@nadiavalko",
        "photoUrl": "https://unsplash.com/photos/7QlJ79Cj43w"
      },
      {
        "name": "Hümâ H. Yardım",
        "url": "https://unsplash.com/@humayardim",
        "photoUrl": "https://unsplash.com/photos/7w82p5jkhD0"
      },
      {
        "name": "Brooke Cagle",
        "url": "https://unsplash.com/@brookecagle",
        "photoUrl": "https://unsplash.com/photos/X4RJG4aNi8o"
      },
      {
        "name": "Tina Guina",
        "url": "https://unsplash.com/@kittinskie",
        "photoUrl": "https://unsplash.com/photos/obV_LM0KjxY"
      },
      {
        "name": "Quang Nguyen Vinh",
        "url": "https://unsplash.com/@quangpraha",
        "photoUrl": "https://unsplash.com/photos/OE1zLjHsfm0"
      },
      {
        "name": "Tim Mossholder",
        "url": "https://unsplash.com/@timmossholder",
        "photoUrl": "https://unsplash.com/photos/YC6RVdoTtIk"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/U53SkA9ds7E"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-019/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Design in Figma - Responsive christmas website\" by young kim (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "young kim",
      "sourceUrl": "https://www.figma.com/community/file/1306098233587105251",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Stanislav Rozhkov",
        "url": "https://unsplash.com/@stas_r",
        "photoUrl": "https://unsplash.com/photos/VzroC_tx5uM"
      },
      {
        "name": "Jess Bailey",
        "url": "https://unsplash.com/@jessbaileydesigns",
        "photoUrl": "https://unsplash.com/photos/f94JPVrDbnY"
      },
      {
        "name": "Carina Maria",
        "url": "https://unsplash.com/@carinamariah",
        "photoUrl": "https://unsplash.com/photos/R5tmKp6tg0U"
      },
      {
        "name": "freestocks",
        "url": "https://unsplash.com/@freestocks",
        "photoUrl": "https://unsplash.com/photos/PxM8aeJbzvk"
      },
      {
        "name": "Sixteen Miles Out",
        "url": "https://unsplash.com/@sixteenmilesout",
        "photoUrl": "https://unsplash.com/photos/CRKIgU6FecU"
      },
      {
        "name": "Morgane Le Breton",
        "url": "https://unsplash.com/@morgane_lb",
        "photoUrl": "https://unsplash.com/photos/Ym4my-Xj8EY"
      },
      {
        "name": "sammy swae",
        "url": "https://unsplash.com/@sammyswae",
        "photoUrl": "https://unsplash.com/photos/ewXhW0Eb1xw"
      },
      {
        "name": "khampha phimmachak",
        "url": "https://unsplash.com/@incept_u",
        "photoUrl": "https://unsplash.com/photos/vdkAt1S7fCc"
      },
      {
        "name": "Charlie Wollborg",
        "url": "https://unsplash.com/@charlie_wollborg",
        "photoUrl": "https://unsplash.com/photos/nZk6pTo6v_0"
      },
      {
        "name": "Mariana B.",
        "url": "https://unsplash.com/@mariana42",
        "photoUrl": "https://unsplash.com/photos/iKHXbvNHXPQ"
      },
      {
        "name": "Jennifer Burk",
        "url": "https://unsplash.com/@jenandjoon",
        "photoUrl": "https://unsplash.com/photos/CpY1O3_5bUk"
      },
      {
        "name": "Mike Cox",
        "url": "https://unsplash.com/@iprefermike",
        "photoUrl": "https://unsplash.com/photos/udz171daS6k"
      },
      {
        "name": "Myriam Zilles",
        "url": "https://unsplash.com/@myriamzilles",
        "photoUrl": "https://unsplash.com/photos/iEtzja4_4aU"
      },
      {
        "name": "Casey Chae",
        "url": "https://unsplash.com/@chaseycasey",
        "photoUrl": "https://unsplash.com/photos/3DrCZblTGoQ"
      },
      {
        "name": "Jamie Street",
        "url": "https://unsplash.com/@jamie452",
        "photoUrl": "https://unsplash.com/photos/G6aNLWPUlcY"
      },
      {
        "name": "Markus Spiske",
        "url": "https://unsplash.com/@markusspiske",
        "photoUrl": "https://unsplash.com/photos/TymR-rSAMnI"
      },
      {
        "name": "Anne Drotleff",
        "url": "https://unsplash.com/@annedrotleff",
        "photoUrl": "https://unsplash.com/photos/tKjAPP-vi5I"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-020/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Real Estate Landing Page\" by Sergei Evdokimov (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Sergei Evdokimov",
      "sourceUrl": "https://www.figma.com/community/file/1379119736954724263",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Eric Stoynov",
        "url": "https://unsplash.com/@ericstoynov",
        "photoUrl": "https://unsplash.com/photos/I_6NimmgInQ"
      },
      {
        "name": "Ярослав Алексеенко",
        "url": "https://unsplash.com/@webaliser",
        "photoUrl": "https://unsplash.com/photos/_TPTXZd9mOo"
      },
      {
        "name": "JEMM Builders",
        "url": "https://unsplash.com/@jemmbuilders",
        "photoUrl": "https://unsplash.com/photos/_UwO7vkWkE0"
      },
      {
        "name": "Polina Kuzovkova",
        "url": "https://unsplash.com/@p_kuzovkova",
        "photoUrl": "https://unsplash.com/photos/JSezq0Td59k"
      },
      {
        "name": "Maverick Frame",
        "url": "https://unsplash.com/@maverickframe",
        "photoUrl": "https://unsplash.com/photos/7s8ab4twHcI"
      },
      {
        "name": "Amsterdam City Archives",
        "url": "https://unsplash.com/@amsterdamcityarchives",
        "photoUrl": "https://unsplash.com/photos/9tmKEDz03uw"
      },
      {
        "name": "Troy Mortier",
        "url": "https://unsplash.com/@troyscanon",
        "photoUrl": "https://unsplash.com/photos/nCiRDhiVeP8"
      },
      {
        "name": "Minh Pham",
        "url": "https://unsplash.com/@minhphamdesign",
        "photoUrl": "https://unsplash.com/photos/OtXADkUh3-I"
      },
      {
        "name": "Tierra Mallorca",
        "url": "https://unsplash.com/@tierramallorca",
        "photoUrl": "https://unsplash.com/photos/rgJ1J8SDEAY"
      },
      {
        "name": "Amir Hosseini",
        "url": "https://unsplash.com/@mmpixz",
        "photoUrl": "https://unsplash.com/photos/3cl6impBd_8"
      },
      {
        "name": "snap wander",
        "url": "https://unsplash.com/@passimage",
        "photoUrl": "https://unsplash.com/photos/PpMXLSQj1K0"
      },
      {
        "name": "Randy Fath",
        "url": "https://unsplash.com/@randyfath",
        "photoUrl": "https://unsplash.com/photos/csK5XPO87lI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-021/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Diseño Web Abogados / Web Design Lawyers\" by Matias Gomez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Matias Gomez",
      "sourceUrl": "https://www.figma.com/community/file/1085677230028305615",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Magic Fan",
        "url": "https://unsplash.com/@magicunsplash",
        "photoUrl": "https://unsplash.com/photos/0y2FXSJ70sc"
      },
      {
        "name": "Leon Seibert",
        "url": "https://unsplash.com/@yapics",
        "photoUrl": "https://unsplash.com/photos/9i5eqBarv-k"
      },
      {
        "name": "Anthony Aird",
        "url": "https://unsplash.com/@anthonyaird",
        "photoUrl": "https://unsplash.com/photos/zwp8SRLHo4A"
      },
      {
        "name": "Sasun Bughdaryan",
        "url": "https://unsplash.com/@sasun1990",
        "photoUrl": "https://unsplash.com/photos/FaTLrG5-ViE"
      },
      {
        "name": "Enes Gundogdu",
        "url": "https://unsplash.com/@egundogdu",
        "photoUrl": "https://unsplash.com/photos/d9RN-_GOhhM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-022/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Home Services Website & Booking Flow — Desktop + Mobile\" by Keshley Nitz Martinez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Keshley Nitz Martinez",
      "sourceUrl": "https://www.figma.com/community/file/1685698519894048991",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-023/mobile-thumb.jpg",
    "credit": {
      "text": "디자인 원작: \"Landing Page For Dentist with Mobile Version | Landing Page para Dentistas con Version Movil\" by Matias Gomez (Figma Community) · CC BY 4.0 · MATE가 사진·글꼴·문구를 바꿔 다시 구성",
      "creator": "Matias Gomez",
      "sourceUrl": "https://www.figma.com/community/file/1244357573623602317",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    },
    "photoCredits": [
      {
        "name": "Katarzyna Zygnerska",
        "url": "https://unsplash.com/@katasha",
        "photoUrl": "https://unsplash.com/photos/44jaETSVX2I"
      },
      {
        "name": "Jonathan Borba",
        "url": "https://unsplash.com/@jonathanborba",
        "photoUrl": "https://unsplash.com/photos/hl6uG9cHW5A"
      },
      {
        "name": "Sergio Guardiola Herrador",
        "url": "https://unsplash.com/@guardiola86",
        "photoUrl": "https://unsplash.com/photos/I_tiqvkfVq8"
      },
      {
        "name": "Martha Dominguez de Gouveia",
        "url": "https://unsplash.com/@m_dominguez_marketing",
        "photoUrl": "https://unsplash.com/photos/nMyM7fxpokE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-024/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "FORTYTWO",
        "url": "https://unsplash.com/@byfortytwo",
        "photoUrl": "https://unsplash.com/photos/4ZmIiGyrMyo"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-025/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-026/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Denise Bugg",
        "url": "https://unsplash.com/@burybugs",
        "photoUrl": "https://unsplash.com/photos/sY_rP7qRPqQ"
      },
      {
        "name": "Endstarky",
        "url": "https://unsplash.com/@endstarky",
        "photoUrl": "https://unsplash.com/photos/y3qLsem5RdQ"
      },
      {
        "name": "Darya Min",
        "url": "https://unsplash.com/@darmink",
        "photoUrl": "https://unsplash.com/photos/Gp6JX-hJUCw"
      },
      {
        "name": "Evgeniy Beloshytskiy",
        "url": "https://unsplash.com/@eugeniqa",
        "photoUrl": "https://unsplash.com/photos/Vd26ICXwhYk"
      },
      {
        "name": "Jakub Arbet",
        "url": "https://unsplash.com/@jakubarbet",
        "photoUrl": "https://unsplash.com/photos/nrnqvfkUWnA"
      },
      {
        "name": "Tony Phan",
        "url": "https://unsplash.com/@phanchutoan",
        "photoUrl": "https://unsplash.com/photos/Syo79otHBUw"
      },
      {
        "name": "Rosalind Chang",
        "url": "https://unsplash.com/@rosalindjchang",
        "photoUrl": "https://unsplash.com/photos/HVoXZIKCJ6I"
      },
      {
        "name": "Ranurte",
        "url": "https://unsplash.com/@ranurte",
        "photoUrl": "https://unsplash.com/photos/OVmwKilhg9w"
      },
      {
        "name": "Tofan Teodor",
        "url": "https://unsplash.com/@tofanteo",
        "photoUrl": "https://unsplash.com/photos/C56DHLS1ysE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-027/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Prabu Panji",
        "url": "https://unsplash.com/@prabuuuuu",
        "photoUrl": "https://unsplash.com/photos/8vF5Kikv3RI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-028/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Sokha Michael",
        "url": "https://unsplash.com/@sokha9",
        "photoUrl": "https://unsplash.com/photos/1ckoSPQqlwI"
      },
      {
        "name": "Power Lai",
        "url": "https://unsplash.com/@welipower",
        "photoUrl": "https://unsplash.com/photos/E0BmfKjeQrw"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-029/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/4M7HLn1r6ss"
      },
      {
        "name": "Gilles Lambert",
        "url": "https://unsplash.com/@gilleslambert",
        "photoUrl": "https://unsplash.com/photos/pb_lF8VWaPU"
      },
      {
        "name": "Maximilian Bungart",
        "url": "https://unsplash.com/@hypernature",
        "photoUrl": "https://unsplash.com/photos/qmIMiFsxnGw"
      },
      {
        "name": "volant",
        "url": "https://unsplash.com/@volantaroma",
        "photoUrl": "https://unsplash.com/photos/OIkhvh2vY10"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-030/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-031/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/XcHGzdXaLX0"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-032/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/EvOvokXGUCg"
      },
      {
        "name": "Illia Bondar",
        "url": "https://unsplash.com/@viktoriiailliaphotography",
        "photoUrl": "https://unsplash.com/photos/7QpNKarIO2k"
      },
      {
        "name": "Age Cymru",
        "url": "https://unsplash.com/@agecymru",
        "photoUrl": "https://unsplash.com/photos/bSXk1lOp8T0"
      },
      {
        "name": "micheile henderson",
        "url": "https://unsplash.com/@micheile",
        "photoUrl": "https://unsplash.com/photos/PpZasS086os"
      },
      {
        "name": "LinkedIn Sales Solutions",
        "url": "https://unsplash.com/@linkedinsalesnavigator",
        "photoUrl": "https://unsplash.com/photos/qbDiSp5IqxA"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-033/mobile-thumb.jpg",
    "credit": {
      "text": "본 시안은 행정안전부에서 2024년 작성하여 공공누리 제1유형으로 개방한 범정부 UI/UX 디자인시스템(KRDS)을 이용하였으며, 해당 저작물은 KRDS 디자인시스템 홈페이지(www.krds.go.kr)에서 무료로 받을 수 있습니다.",
      "creator": "행정안전부 KRDS",
      "sourceUrl": "https://www.krds.go.kr",
      "license": "공공누리 제1유형",
      "licenseUrl": "https://www.krds.go.kr/html/site/utility/utility_06.html"
    },
    "photoCredits": [
      {
        "name": "Jacob Thomas",
        "url": "https://unsplash.com/@jacob225",
        "photoUrl": "https://unsplash.com/photos/yfh5vKEHrJ8"
      },
      {
        "name": "Erwan Hesry",
        "url": "https://unsplash.com/@erwanhesry",
        "photoUrl": "https://unsplash.com/photos/1q75BReKpms"
      },
      {
        "name": "Hoseung Han",
        "url": "https://unsplash.com/@dhs4590",
        "photoUrl": "https://unsplash.com/photos/yDHeNGy6r6Y"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/mS5SxesPFKU"
      },
      {
        "name": "Nick Fewings",
        "url": "https://unsplash.com/@jannerboy62",
        "photoUrl": "https://unsplash.com/photos/YP1Lz5B4nOk"
      },
      {
        "name": "Kier in Sight Archives",
        "url": "https://unsplash.com/@kierinsightarchives",
        "photoUrl": "https://unsplash.com/photos/0Mn__AjRHCo"
      },
      {
        "name": "Jonathan Borba",
        "url": "https://unsplash.com/@jonathanborba",
        "photoUrl": "https://unsplash.com/photos/8ji7mgL1P0M"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-034/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Aurora Song",
        "url": "https://unsplash.com/@auroras13",
        "photoUrl": "https://unsplash.com/photos/tfP5ZSz1rhg"
      },
      {
        "name": "YU Carla",
        "url": "https://unsplash.com/@carlayuuu",
        "photoUrl": "https://unsplash.com/photos/Or3zn5zbgzE"
      },
      {
        "name": "Kyle Yen",
        "url": "https://unsplash.com/@yenkyle",
        "photoUrl": "https://unsplash.com/photos/vyjAN9rHt4M"
      },
      {
        "name": "Tarah Dane",
        "url": "https://unsplash.com/@danesvg",
        "photoUrl": "https://unsplash.com/photos/xudcDDtjY2c"
      },
      {
        "name": "ObjectType RAW",
        "url": "https://unsplash.com/@objecttyperaw",
        "photoUrl": "https://unsplash.com/photos/MSUXmdgq8nc"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-035/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-036/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "ThisisEngineering",
        "url": "https://unsplash.com/@thisisengineering",
        "photoUrl": "https://unsplash.com/photos/8yS04veb1TQ"
      },
      {
        "name": "Trnava University",
        "url": "https://unsplash.com/@trnavskauni",
        "photoUrl": "https://unsplash.com/photos/_9xRHrMOjeg"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-037/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Mapbox",
        "url": "https://unsplash.com/@mapbox",
        "photoUrl": "https://unsplash.com/photos/ZT5v0puBjZI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-038/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-039/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Picsea",
        "url": "https://unsplash.com/@picsea",
        "photoUrl": "https://unsplash.com/photos/EQlTyDZRx7U"
      },
      {
        "name": "Adam Winger",
        "url": "https://unsplash.com/@awcreativeut",
        "photoUrl": "https://unsplash.com/photos/7fF0iei80AQ"
      },
      {
        "name": "Bill Ringer",
        "url": "https://unsplash.com/@iamsimplybill",
        "photoUrl": "https://unsplash.com/photos/7C2JUQRJ5hE"
      },
      {
        "name": "Clem Onojeghuo",
        "url": "https://unsplash.com/@clemono",
        "photoUrl": "https://unsplash.com/photos/O5J1LgmoGeI"
      },
      {
        "name": "jason hu",
        "url": "https://unsplash.com/@hujason",
        "photoUrl": "https://unsplash.com/photos/EP8lBWLFLkg"
      },
      {
        "name": "Drahomír Hugo Posteby-Mach",
        "url": "https://unsplash.com/@postebymach",
        "photoUrl": "https://unsplash.com/photos/n4y3eiQSIoc"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-040/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Adrien Olichon",
        "url": "https://unsplash.com/@adrienolichon",
        "photoUrl": "https://unsplash.com/photos/JsWgPa_JW5s"
      },
      {
        "name": "Jametlene Reskp",
        "url": "https://unsplash.com/@reskp",
        "photoUrl": "https://unsplash.com/photos/Aebsnylk2PI"
      },
      {
        "name": "Aysegul Aytören",
        "url": "https://unsplash.com/@oldsoulframes",
        "photoUrl": "https://unsplash.com/photos/UQ4vZSvHN74"
      },
      {
        "name": "HsinKai Tai",
        "url": "https://unsplash.com/@able527",
        "photoUrl": "https://unsplash.com/photos/xK_kGsqaTxo"
      },
      {
        "name": "tommao wang",
        "url": "https://unsplash.com/@tommaomaoer",
        "photoUrl": "https://unsplash.com/photos/8XmuKjtd6rc"
      },
      {
        "name": "LISK OBE",
        "url": "https://unsplash.com/@summerobelisk",
        "photoUrl": "https://unsplash.com/photos/akkOcTiDkfo"
      },
      {
        "name": "Jason Leung",
        "url": "https://unsplash.com/@ninjason",
        "photoUrl": "https://unsplash.com/photos/7Ly8Isj_x0k"
      },
      {
        "name": "Duong Ngan",
        "url": "https://unsplash.com/@nganduong93",
        "photoUrl": "https://unsplash.com/photos/w39pcTyZPGI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-041/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-042/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-043/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Navy Medicine",
        "url": "https://unsplash.com/@navymedicine",
        "photoUrl": "https://unsplash.com/photos/3fx-mGg8Dzg"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-044/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Clay Banks",
        "url": "https://unsplash.com/@claybanks",
        "photoUrl": "https://unsplash.com/photos/QnYqq6tlVq8"
      },
      {
        "name": "Nadya Spetnitskaya",
        "url": "https://unsplash.com/@kiboka",
        "photoUrl": "https://unsplash.com/photos/tOYiQxF9-Ys"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/a0xqXaRXFrA"
      },
      {
        "name": "Maddie Kuchenmeister",
        "url": "https://unsplash.com/@maddiekuchen",
        "photoUrl": "https://unsplash.com/photos/flYDQfYfwyg"
      },
      {
        "name": "Rohit Bhusan",
        "url": "https://unsplash.com/@rohitbhusan",
        "photoUrl": "https://unsplash.com/photos/XT6a2xiNPLM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-045/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Lesia and Serhii Artymovych",
        "url": "https://unsplash.com/@lesiart",
        "photoUrl": "https://unsplash.com/photos/gx3CR7UabgM"
      },
      {
        "name": "Samiul Haque Bhuyan",
        "url": "https://unsplash.com/@samiulhaquebhuyan",
        "photoUrl": "https://unsplash.com/photos/g6yprmEQt0w"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-046/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Gabriel Weyand",
        "url": "https://unsplash.com/@werealproduction",
        "photoUrl": "https://unsplash.com/photos/aaciLRh5rkI"
      },
      {
        "name": "Towfiqu barbhuiya",
        "url": "https://unsplash.com/@towfiqu999999",
        "photoUrl": "https://unsplash.com/photos/ARvWBP4o1F0"
      },
      {
        "name": "Orgalux",
        "url": "https://unsplash.com/@orgalux",
        "photoUrl": "https://unsplash.com/photos/uHIWJfkNwts"
      },
      {
        "name": "Peter Wilkinson",
        "url": "https://unsplash.com/@pjw_33",
        "photoUrl": "https://unsplash.com/photos/tl62sT_8Oho"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-047/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-048/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Marcus Neto",
        "url": "https://unsplash.com/@marcusneto",
        "photoUrl": "https://unsplash.com/photos/gioH4gHo0-g"
      },
      {
        "name": "Niko Caelis",
        "url": "https://unsplash.com/@nikocaelis",
        "photoUrl": "https://unsplash.com/photos/PmYiOnUMJMg"
      },
      {
        "name": "Jakob Rosen",
        "url": "https://unsplash.com/@jakobnoahrosen",
        "photoUrl": "https://unsplash.com/photos/KA1WM_yQGF8"
      },
      {
        "name": "Ivett M",
        "url": "https://unsplash.com/@ivett_m",
        "photoUrl": "https://unsplash.com/photos/qtEKkcrupbs"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-049/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Haberdoedas",
        "url": "https://unsplash.com/@haberdoedas",
        "photoUrl": "https://unsplash.com/photos/W99azfs9OAk"
      },
      {
        "name": "Brett Jordan",
        "url": "https://unsplash.com/@brett_jordan",
        "photoUrl": "https://unsplash.com/photos/ZRdb5UnJx_o"
      },
      {
        "name": "engin akyurt",
        "url": "https://unsplash.com/@enginakyurt",
        "photoUrl": "https://unsplash.com/photos/cXV9hZV3y5c"
      },
      {
        "name": "Andrey Matveev",
        "url": "https://unsplash.com/@zelebb",
        "photoUrl": "https://unsplash.com/photos/AKEMh3y86dE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-050/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Tuan Nguyen",
        "url": "https://unsplash.com/@tuan0_12",
        "photoUrl": "https://unsplash.com/photos/_g41T51ECR4"
      },
      {
        "name": "Jessie Maxwell",
        "url": "https://unsplash.com/@jessiemaxwellphotography",
        "photoUrl": "https://unsplash.com/photos/bZqKUYZlEIY"
      },
      {
        "name": "Brecht Corbeel",
        "url": "https://unsplash.com/@brechtcorbeel",
        "photoUrl": "https://unsplash.com/photos/r_FSzdmrKAo"
      },
      {
        "name": "Caden Norcott",
        "url": "https://unsplash.com/@cadennorcott",
        "photoUrl": "https://unsplash.com/photos/aCIVzfV05pM"
      },
      {
        "name": "Jocelyn Morales",
        "url": "https://unsplash.com/@molnj",
        "photoUrl": "https://unsplash.com/photos/FXdpfV9TBRs"
      },
      {
        "name": "Kasia Sikorska",
        "url": "https://unsplash.com/@kasiasikorska",
        "photoUrl": "https://unsplash.com/photos/UMtUTbxLmL0"
      },
      {
        "name": "Diana Light",
        "url": "https://unsplash.com/@dreamcatchlight",
        "photoUrl": "https://unsplash.com/photos/u_jt9A7FADk"
      },
      {
        "name": "五玄土 ORIENTO",
        "url": "https://unsplash.com/@oriento",
        "photoUrl": "https://unsplash.com/photos/l0ah3UBLppo"
      },
      {
        "name": "Taylor Heery",
        "url": "https://unsplash.com/@taylorheeryphoto",
        "photoUrl": "https://unsplash.com/photos/ZSgWcW70cTs"
      },
      {
        "name": "Laura Tommasina",
        "url": "https://unsplash.com/@lauratommphoto",
        "photoUrl": "https://unsplash.com/photos/5fO9grtkVYo"
      },
      {
        "name": "Grant Durr",
        "url": "https://unsplash.com/@grant_durr",
        "photoUrl": "https://unsplash.com/photos/GjpUt15XbPE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-051/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-052/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Muhammad-Taha Ibrahim",
        "url": "https://unsplash.com/@planeteelevene",
        "photoUrl": "https://unsplash.com/photos/RR1ZtQxyUQc"
      },
      {
        "name": "Hamish Kale",
        "url": "https://unsplash.com/@hamishkale_",
        "photoUrl": "https://unsplash.com/photos/oj0gsj-Zt_w"
      },
      {
        "name": "Jesus Loves Austin",
        "url": "https://unsplash.com/@jesuslovesaustin",
        "photoUrl": "https://unsplash.com/photos/LYUXl1NNXHM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-053/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-054/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Sam Moghadam",
        "url": "https://unsplash.com/@sammoghadam",
        "photoUrl": "https://unsplash.com/photos/bN_aaTKfwM0"
      },
      {
        "name": "Mastars",
        "url": "https://unsplash.com/@mastars",
        "photoUrl": "https://unsplash.com/photos/cJpvBX_gNrg"
      },
      {
        "name": "Isis França",
        "url": "https://unsplash.com/@isisfra",
        "photoUrl": "https://unsplash.com/photos/hsPFuudRg5I"
      },
      {
        "name": "Sufyan",
        "url": "https://unsplash.com/@blenderdesigner",
        "photoUrl": "https://unsplash.com/photos/JUJzjthZnYU"
      },
      {
        "name": "ThisisEngineering",
        "url": "https://unsplash.com/@thisisengineering",
        "photoUrl": "https://unsplash.com/photos/-RFVw0jMyM4"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-055/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Defrino Maasy",
        "url": "https://unsplash.com/@defrino",
        "photoUrl": "https://unsplash.com/photos/GYRA3E1hOuE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-056/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-057/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Jacques Dillies",
        "url": "https://unsplash.com/@jacques_dillies",
        "photoUrl": "https://unsplash.com/photos/jcav1COVvOc"
      },
      {
        "name": "Kat von Wood",
        "url": "https://unsplash.com/@kat_von_wood",
        "photoUrl": "https://unsplash.com/photos/XL4ElC_KhPk"
      },
      {
        "name": "Alexander Simonsen",
        "url": "https://unsplash.com/@circlz",
        "photoUrl": "https://unsplash.com/photos/44al1GlFVxo"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-058/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Kaleidico",
        "url": "https://unsplash.com/@kaleidico",
        "photoUrl": "https://unsplash.com/photos/26MJGnCM0Wc"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-059/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Aditi Toys",
        "url": "https://unsplash.com/@adititoys",
        "photoUrl": "https://unsplash.com/photos/J5DO_DiE3IY"
      },
      {
        "name": "Alberto Rodríguez",
        "url": "https://unsplash.com/@albertorodriguez",
        "photoUrl": "https://unsplash.com/photos/qVpGF1mlaM8"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-060/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Cherrydeck",
        "url": "https://unsplash.com/@cherrydeck",
        "photoUrl": "https://unsplash.com/photos/Qx7A7SChpnI"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/AixitSFNrBc"
      },
      {
        "name": "ThisisEngineering",
        "url": "https://unsplash.com/@thisisengineering",
        "photoUrl": "https://unsplash.com/photos/uOhBxB23Wao"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-061/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Victor Rodríguez Iglesias",
        "url": "https://unsplash.com/@victorrdez",
        "photoUrl": "https://unsplash.com/photos/zTG8dSz10tQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-062/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Jacob Stone",
        "url": "https://unsplash.com/@thejacobstone",
        "photoUrl": "https://unsplash.com/photos/yXs_U82T1fY"
      },
      {
        "name": "Hoseung Han",
        "url": "https://unsplash.com/@dhs4590",
        "photoUrl": "https://unsplash.com/photos/d7PKMmEQn5g"
      },
      {
        "name": "Chulho Choi",
        "url": "https://unsplash.com/@chulho",
        "photoUrl": "https://unsplash.com/photos/-o9inSGgeFg"
      },
      {
        "name": "Arthur Tseng",
        "url": "https://unsplash.com/@arthur3607",
        "photoUrl": "https://unsplash.com/photos/AuKM_oK3Mro"
      },
      {
        "name": "Jéan Béller",
        "url": "https://unsplash.com/@worldtravelwithjean",
        "photoUrl": "https://unsplash.com/photos/FMYXBdbxOHo"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-063/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Brent Gorwin",
        "url": "https://unsplash.com/@brentg",
        "photoUrl": "https://unsplash.com/photos/vhQUnmnOLys"
      },
      {
        "name": "Ceba Solutions",
        "url": "https://unsplash.com/@professional_photos_online",
        "photoUrl": "https://unsplash.com/photos/SJ3V9ep9fEA"
      },
      {
        "name": "Eugeniya Belova",
        "url": "https://unsplash.com/@evgeeeenchik",
        "photoUrl": "https://unsplash.com/photos/14JQozSYEng"
      },
      {
        "name": "Julian Christian Anderson",
        "url": "https://unsplash.com/@juliancanderson",
        "photoUrl": "https://unsplash.com/photos/bnzJEspmedQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-064/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Marcin Skalij",
        "url": "https://unsplash.com/@m_skalij",
        "photoUrl": "https://unsplash.com/photos/w_2vlvTgk7E"
      },
      {
        "name": "Filippo Faruffini",
        "url": "https://unsplash.com/@heyfil",
        "photoUrl": "https://unsplash.com/photos/M1M9PVArnlE"
      },
      {
        "name": "Jay",
        "url": "https://unsplash.com/@ja024",
        "photoUrl": "https://unsplash.com/photos/ErSmnThoeJI"
      },
      {
        "name": "lee seunghyub",
        "url": "https://unsplash.com/@sobalc",
        "photoUrl": "https://unsplash.com/photos/HuFL7Kq-1Ow"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-065/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "jessie daniella",
        "url": "https://unsplash.com/@jessiedaniella",
        "photoUrl": "https://unsplash.com/photos/aiNU4cA4UzQ"
      },
      {
        "name": "shche_ team",
        "url": "https://unsplash.com/@shche_",
        "photoUrl": "https://unsplash.com/photos/hY6mzHREM8I"
      },
      {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt",
        "photoUrl": "https://unsplash.com/photos/KQ6sO8m1ZDE"
      },
      {
        "name": "Markus Clemens",
        "url": "https://unsplash.com/@markusclemens",
        "photoUrl": "https://unsplash.com/photos/mibjbNoS1XA"
      },
      {
        "name": "insung yoon",
        "url": "https://unsplash.com/@insungpandora",
        "photoUrl": "https://unsplash.com/photos/Vxm213warDA"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-066/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Daily Food Shot",
        "url": "https://unsplash.com/@dailyfoodshot",
        "photoUrl": "https://unsplash.com/photos/Rrnz4gDBo3s"
      },
      {
        "name": "Ivan Wong",
        "url": "https://unsplash.com/@yitmeng_w",
        "photoUrl": "https://unsplash.com/photos/gmLe2fuOI1I"
      },
      {
        "name": "Markus Winkler",
        "url": "https://unsplash.com/@markuswinkler",
        "photoUrl": "https://unsplash.com/photos/tEPkM2uFYPQ"
      },
      {
        "name": "Compagnons",
        "url": "https://unsplash.com/@sigmund",
        "photoUrl": "https://unsplash.com/photos/v5afgIby-08"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-067/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Orion Stephens",
        "url": "https://unsplash.com/@dropspike_orion55",
        "photoUrl": "https://unsplash.com/photos/OroGI4DFNX0"
      },
      {
        "name": "Haberdoedas",
        "url": "https://unsplash.com/@haberdoedas",
        "photoUrl": "https://unsplash.com/photos/6PzPt2-nieU"
      },
      {
        "name": "Gaku Suyama",
        "url": "https://unsplash.com/@gakusuyama",
        "photoUrl": "https://unsplash.com/photos/dBQjKFvqmp4"
      },
      {
        "name": "Aliona Gumeniuk",
        "url": "https://unsplash.com/@agumeniuk",
        "photoUrl": "https://unsplash.com/photos/jeAjT87nbjM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-068/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Vinicius \"amnx\" Amano",
        "url": "https://unsplash.com/@viniciusamano",
        "photoUrl": "https://unsplash.com/photos/FmM6iJWBd3o"
      },
      {
        "name": "Farhad Ibrahimzade",
        "url": "https://unsplash.com/@ferhadd",
        "photoUrl": "https://unsplash.com/photos/V2HDOQTJh3o"
      },
      {
        "name": "SumUp",
        "url": "https://unsplash.com/@sumup",
        "photoUrl": "https://unsplash.com/photos/5xFEY6ZEE8g"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-069/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "ROXANA POPOVICI",
        "url": "https://unsplash.com/@roxanarxx",
        "photoUrl": "https://unsplash.com/photos/aY5uOJ2o96g"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-070/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Sergio Kian",
        "url": "https://unsplash.com/@sergiokian",
        "photoUrl": "https://unsplash.com/photos/G6svDyPVRrc"
      },
      {
        "name": "Victor Freitas",
        "url": "https://unsplash.com/@victorfreitas",
        "photoUrl": "https://unsplash.com/photos/WvDYdXDzkhs"
      },
      {
        "name": "Geert Pieters",
        "url": "https://unsplash.com/@shotsbywolf",
        "photoUrl": "https://unsplash.com/photos/3RnkZpDqsEI"
      },
      {
        "name": "Ambitious Studio* | Rick Barrett",
        "url": "https://unsplash.com/@weareambitious",
        "photoUrl": "https://unsplash.com/photos/1RNQ11ZODJM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-071/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/iyeUwItlIPk"
      },
      {
        "name": "Jun Ren",
        "url": "https://unsplash.com/@renjunn",
        "photoUrl": "https://unsplash.com/photos/KnvVNQ1bAl4"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-072/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Lisa Hobbs",
        "url": "https://unsplash.com/@lisahobbs",
        "photoUrl": "https://unsplash.com/photos/mRaNok_Ld6s"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-073/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Ellie Eshaghi",
        "url": "https://unsplash.com/@eliiesh",
        "photoUrl": "https://unsplash.com/photos/0J-cxuGLbhc"
      },
      {
        "name": "de Aura",
        "url": "https://unsplash.com/@deaura2026",
        "photoUrl": "https://unsplash.com/photos/6RHzDK61LDw"
      },
      {
        "name": "Chelson Tamares",
        "url": "https://unsplash.com/@jd_chon",
        "photoUrl": "https://unsplash.com/photos/vtQHwU4F13s"
      },
      {
        "name": "Margarita Yutsaytis",
        "url": "https://unsplash.com/@marsnails",
        "photoUrl": "https://unsplash.com/photos/v3-AHQ63Wws"
      },
      {
        "name": "Giorgio Trovato",
        "url": "https://unsplash.com/@giorgiotrovato",
        "photoUrl": "https://unsplash.com/photos/gb6gtiTZKB8"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-074/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-075/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Michał Parzuchowski",
        "url": "https://unsplash.com/@mparzuchowski",
        "photoUrl": "https://unsplash.com/photos/BPXSTl_HBhk"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-076/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Jakub Żerdzicki",
        "url": "https://unsplash.com/@jakubzerdzicki",
        "photoUrl": "https://unsplash.com/photos/n3ba57RKVNs"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-077/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Justin Morgan",
        "url": "https://unsplash.com/@justin_morgan",
        "photoUrl": "https://unsplash.com/photos/Hx-4TbpsoIw"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-078/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Artem Korolev",
        "url": "https://unsplash.com/@artemisss666",
        "photoUrl": "https://unsplash.com/photos/q-4TMKhwIm8"
      },
      {
        "name": "Julia Taubitz",
        "url": "https://unsplash.com/@justmejuliee",
        "photoUrl": "https://unsplash.com/photos/LLCzbAEC7uE"
      },
      {
        "name": "Art Institute of Chicago",
        "url": "https://unsplash.com/@artchicago",
        "photoUrl": "https://unsplash.com/photos/HB-w3Dzz5Pk"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-079/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "tommao wang",
        "url": "https://unsplash.com/@tommaomaoer",
        "photoUrl": "https://unsplash.com/photos/BFQSV68qESs"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-080/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/IeysFCmBbHY"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-081/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Nathan Cima",
        "url": "https://unsplash.com/@nathan_cima",
        "photoUrl": "https://unsplash.com/photos/Qw6wa96IvvQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-082/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Bailey Alexander",
        "url": "https://unsplash.com/@baileyal3xander",
        "photoUrl": "https://unsplash.com/photos/PE4pFgcYzoQ"
      },
      {
        "name": "Pipcke",
        "url": "https://unsplash.com/@pipcke",
        "photoUrl": "https://unsplash.com/photos/g_5UyVBIX_k"
      },
      {
        "name": "Clifford",
        "url": "https://unsplash.com/@cyzx",
        "photoUrl": "https://unsplash.com/photos/VobvKmG-StA"
      },
      {
        "name": "Jason Briscoe",
        "url": "https://unsplash.com/@jsnbrsc",
        "photoUrl": "https://unsplash.com/photos/GliaHAJ3_5A"
      },
      {
        "name": "john renzzel",
        "url": "https://unsplash.com/@johnrenzzel",
        "photoUrl": "https://unsplash.com/photos/rr12y4qEbps"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-083/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-084/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Ryoji Iwata",
        "url": "https://unsplash.com/@ryoji__iwata",
        "photoUrl": "https://unsplash.com/photos/Fusx3dlbqpw"
      },
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/RRet2T_Ct90"
      },
      {
        "name": "Christian Lue",
        "url": "https://unsplash.com/@christianlue",
        "photoUrl": "https://unsplash.com/photos/4YhNRgL59Fc"
      },
      {
        "name": "Laura Ohlman",
        "url": "https://unsplash.com/@ohlmanphotography",
        "photoUrl": "https://unsplash.com/photos/Je6tljZPtGM"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-085/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Ali Pazani",
        "url": "https://unsplash.com/@alipzn",
        "photoUrl": "https://unsplash.com/photos/BSQZvVtoRCw"
      },
      {
        "name": "Michael G",
        "url": "https://unsplash.com/@escape_your_mind",
        "photoUrl": "https://unsplash.com/photos/BtwFA_v1xg4"
      },
      {
        "name": "Madeline Liu",
        "url": "https://unsplash.com/@madeline_sd",
        "photoUrl": "https://unsplash.com/photos/cuvIg3vw_Ik"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-086/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Mustafa Sheikhmouss",
        "url": "https://unsplash.com/@xalo_mustafa",
        "photoUrl": "https://unsplash.com/photos/cl1M5WBCF8c"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-087/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": []
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
    "mobileThumb": "/landing-gallery/LP-088/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt",
        "photoUrl": "https://unsplash.com/photos/hzdgFPz1V24"
      },
      {
        "name": "Bozhin Karaivanov",
        "url": "https://unsplash.com/@bkaraivanov",
        "photoUrl": "https://unsplash.com/photos/wiwhYQtjWQE"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-089/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Jacinto",
        "url": "https://unsplash.com/@longlivehaas",
        "photoUrl": "https://unsplash.com/photos/LDRXZSIKIoU"
      },
      {
        "name": "Nikita Khowala",
        "url": "https://unsplash.com/@nikitakhowala",
        "photoUrl": "https://unsplash.com/photos/ua_qOi2M_80"
      },
      {
        "name": "Kate Mishchankova",
        "url": "https://unsplash.com/@katemi",
        "photoUrl": "https://unsplash.com/photos/ibFvdszg748"
      },
      {
        "name": "Uliana Kopanytsia",
        "url": "https://unsplash.com/@ulian_ka",
        "photoUrl": "https://unsplash.com/photos/Y-u2ZcaCKO4"
      },
      {
        "name": "Yasin Onus",
        "url": "https://unsplash.com/@yasinonus",
        "photoUrl": "https://unsplash.com/photos/z5Zrrui_COc"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-090/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Steven Ungermann",
        "url": "https://unsplash.com/@steveungermann",
        "photoUrl": "https://unsplash.com/photos/ioazSWHfmzY"
      },
      {
        "name": "Spruce Refillable Cleaning",
        "url": "https://unsplash.com/@wearespruce",
        "photoUrl": "https://unsplash.com/photos/OxdnFg-I3Lc"
      },
      {
        "name": "Priscilla Du Preez 🇨🇦",
        "url": "https://unsplash.com/@priscilladupreez",
        "photoUrl": "https://unsplash.com/photos/00l8o8UJI_Y"
      },
      {
        "name": "Vít Luštinec",
        "url": "https://unsplash.com/@vitlustinec",
        "photoUrl": "https://unsplash.com/photos/--k6f3rtC1I"
      },
      {
        "name": "GoGoNano",
        "url": "https://unsplash.com/@gogonano",
        "photoUrl": "https://unsplash.com/photos/gqP96iagklM"
      },
      {
        "name": "With Mahdy",
        "url": "https://unsplash.com/@withmahdy",
        "photoUrl": "https://unsplash.com/photos/wizWrRZJXSg"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-091/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Franco Debartolo",
        "url": "https://unsplash.com/@francotheshooter",
        "photoUrl": "https://unsplash.com/photos/tTAS_B7mxI8"
      },
      {
        "name": "Geon George",
        "url": "https://unsplash.com/@geongeorge",
        "photoUrl": "https://unsplash.com/photos/HlgGDRhTgCQ"
      },
      {
        "name": "Clay Banks",
        "url": "https://unsplash.com/@claybanks",
        "photoUrl": "https://unsplash.com/photos/7pvC_d2iXSE"
      },
      {
        "name": "Esra Afşar",
        "url": "https://unsplash.com/@esraafsar",
        "photoUrl": "https://unsplash.com/photos/vAXn-LXUQa8"
      },
      {
        "name": "simon",
        "url": "https://unsplash.com/@simon_berger",
        "photoUrl": "https://unsplash.com/photos/JH_R66BihvA"
      },
      {
        "name": "The Cleveland Museum of Art",
        "url": "https://unsplash.com/@clevelandart",
        "photoUrl": "https://unsplash.com/photos/AD8nr59mr5c"
      },
      {
        "name": "Joshua Bartell",
        "url": "https://unsplash.com/@jjbart7",
        "photoUrl": "https://unsplash.com/photos/6vvIBTvL90A"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-092/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Ryan Arnst",
        "url": "https://unsplash.com/@ryanarnst",
        "photoUrl": "https://unsplash.com/photos/jN7egxv2K3M"
      },
      {
        "name": "Jake Kemman",
        "url": "https://unsplash.com/@jckemman",
        "photoUrl": "https://unsplash.com/photos/A_tKbuAwLcs"
      },
      {
        "name": "Terra Slaybaugh",
        "url": "https://unsplash.com/@terras",
        "photoUrl": "https://unsplash.com/photos/LCDYCLEJlEo"
      },
      {
        "name": "tommao wang",
        "url": "https://unsplash.com/@tommaomaoer",
        "photoUrl": "https://unsplash.com/photos/7QKH1X6tleI"
      },
      {
        "name": "Anna Maria Gnadl",
        "url": "https://unsplash.com/@aenniways",
        "photoUrl": "https://unsplash.com/photos/-UDgUw3IoRA"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-093/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Zhen Yao",
        "url": "https://unsplash.com/@rex_filmer",
        "photoUrl": "https://unsplash.com/photos/KMSlIuYXbUw"
      },
      {
        "name": "Laura Mitulla",
        "url": "https://unsplash.com/@luamtla",
        "photoUrl": "https://unsplash.com/photos/7Zlds3gm7NU"
      },
      {
        "name": "Vinn Koonyosying",
        "url": "https://unsplash.com/@mggbox",
        "photoUrl": "https://unsplash.com/photos/zXNC_lBBVGE"
      },
      {
        "name": "Fenghua",
        "url": "https://unsplash.com/@fenghua1975",
        "photoUrl": "https://unsplash.com/photos/g6hSdTrUSC8"
      },
      {
        "name": "Dmitry Rodionov",
        "url": "https://unsplash.com/@knuckles_echidna",
        "photoUrl": "https://unsplash.com/photos/AGAj6dhVgPw"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-094/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "seongjin Kim",
        "url": "https://unsplash.com/@makimesa",
        "photoUrl": "https://unsplash.com/photos/b5OOpRblTpU"
      },
      {
        "name": "Finn",
        "url": "https://unsplash.com/@finn_staygold",
        "photoUrl": "https://unsplash.com/photos/RAPatsLTaJ0"
      },
      {
        "name": "J Shim",
        "url": "https://unsplash.com/@uncertainthink",
        "photoUrl": "https://unsplash.com/photos/hoTW8weCnOg"
      },
      {
        "name": "john ko",
        "url": "https://unsplash.com/@jko001",
        "photoUrl": "https://unsplash.com/photos/OkJnM-pq2_o"
      },
      {
        "name": "Fidel Fernando",
        "url": "https://unsplash.com/@fifernando",
        "photoUrl": "https://unsplash.com/photos/X7NzByz9bdI"
      },
      {
        "name": "Perry Merrity II",
        "url": "https://unsplash.com/@prince_perry",
        "photoUrl": "https://unsplash.com/photos/9i7tnsd7csc"
      },
      {
        "name": "Hakam magdea fardana ansie",
        "url": "https://unsplash.com/@hakammagdea",
        "photoUrl": "https://unsplash.com/photos/Fdi7VNM7uSQ"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-095/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Matt Whitacre",
        "url": "https://unsplash.com/@mattwhitacre",
        "photoUrl": "https://unsplash.com/photos/F4GGnyJ8aiI"
      },
      {
        "name": "Mahyar Yeganeh",
        "url": "https://unsplash.com/@nvamahyar",
        "photoUrl": "https://unsplash.com/photos/4AjsolUEVhE"
      },
      {
        "name": "Regi Munandar",
        "url": "https://unsplash.com/@regimunandar",
        "photoUrl": "https://unsplash.com/photos/QAQiH_u1y6Q"
      },
      {
        "name": "Jonathan Adams",
        "url": "https://unsplash.com/@jonathanadamsphoto",
        "photoUrl": "https://unsplash.com/photos/oV7tFzLnTks"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-096/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Zongnan Bao",
        "url": "https://unsplash.com/@zbao",
        "photoUrl": "https://unsplash.com/photos/Y0dShCjjkWE"
      },
      {
        "name": "James Garman",
        "url": "https://unsplash.com/@jamesgarmandotcom",
        "photoUrl": "https://unsplash.com/photos/g0gHGCAMclI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-097/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Zara Photo",
        "url": "https://unsplash.com/@zara_photo",
        "photoUrl": "https://unsplash.com/photos/ZOeVIjScKpY"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-098/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "12photostory",
        "url": "https://unsplash.com/@12photography",
        "photoUrl": "https://unsplash.com/photos/QSoYOsSiiQA"
      },
      {
        "name": "Zemos",
        "url": "https://unsplash.com/@zemos",
        "photoUrl": "https://unsplash.com/photos/qHo65Xyzcvo"
      },
      {
        "name": "Jonatan Bustos",
        "url": "https://unsplash.com/@jonatanbustos25",
        "photoUrl": "https://unsplash.com/photos/P1Ku27zZJDs"
      },
      {
        "name": "Mathias Reding",
        "url": "https://unsplash.com/@matreding",
        "photoUrl": "https://unsplash.com/photos/_FDgN0zjaPI"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-099/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Volodymyr Lymariev",
        "url": "https://unsplash.com/@vlmrv",
        "photoUrl": "https://unsplash.com/photos/qSWpTzl0too"
      },
      {
        "name": "Alexander Mass",
        "url": "https://unsplash.com/@alexandermassph",
        "photoUrl": "https://unsplash.com/photos/JyAMGd2WYZk"
      },
      {
        "name": "Haberdoedas",
        "url": "https://unsplash.com/@haberdoedas",
        "photoUrl": "https://unsplash.com/photos/taoCQhiWv1E"
      },
      {
        "name": "Grace Anne Bobadilla",
        "url": "https://unsplash.com/@graceannefully",
        "photoUrl": "https://unsplash.com/photos/ldWazd-vWI0"
      }
    ]
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
    "mobileThumb": "/landing-gallery/LP-100/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Lindsey Elsey",
        "url": "https://unsplash.com/@artsmarts",
        "photoUrl": "https://unsplash.com/photos/fmuykMXH-dY"
      },
      {
        "name": "Laura Tommasina",
        "url": "https://unsplash.com/@lauratommphoto",
        "photoUrl": "https://unsplash.com/photos/Wksd6I6mSkw"
      },
      {
        "name": "Igor Rodrigues",
        "url": "https://unsplash.com/@igorrodrigues",
        "photoUrl": "https://unsplash.com/photos/0xw9_4toZck"
      },
      {
        "name": "Jelleke Vanooteghem",
        "url": "https://unsplash.com/@ilumire",
        "photoUrl": "https://unsplash.com/photos/8Arw-cEpt-Q"
      },
      {
        "name": "Junseong Lee",
        "url": "https://unsplash.com/@bearsnap",
        "photoUrl": "https://unsplash.com/photos/G9H5edUL0T8"
      }
    ]
  },
  {
    "id": "LP-101",
    "title": "로스터리 카페 · 내려지는 커피",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "로스터리 카페",
      "원두 판매",
      "동네 카페"
    ],
    "purposes": [
      "소개",
      "예약",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "프리미엄"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면에서 커피가 내려지고, 스크롤을 내리면 연둣빛 생두가 볶이고 갈려 한 잔이 되는 과정을 따라가는 로스터리 카페 페이지.",
    "thumb": "/landing-gallery/LP-101/thumb.jpg",
    "desktop": "/landing-gallery/LP-101/desktop.jpg",
    "mobile": "/landing-gallery/LP-101/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-101/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-101.html",
    "motions": [
      "첫 화면에서 물줄기가 흐르고 커피가 차오르는 그림",
      "스크롤에 맞춰 생두가 익고 갈리고 내려지는 고정 구간",
      "원두 목록의 볶음 정도 점이 차례로 켜짐",
      "메뉴 탭 사이를 미끄러지는 표시",
      "지금 시각을 가리키는 시계와 그려지는 약도"
    ]
  },
  {
    "id": "LP-102",
    "title": "필라테스 스튜디오 · 숨 쉬는 곡선",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "필라테스",
      "요가 · 스트레칭",
      "소그룹 운동"
    ],
    "purposes": [
      "소개",
      "예약",
      "신청"
    ],
    "moods": [
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면의 둥근 덩어리가 숨 쉬듯 모양을 바꾸며 들숨과 날숨을 안내하고, 스크롤을 따라 곡선이 내려오며 수업을 차례로 소개하는 필라테스 스튜디오 페이지.",
    "thumb": "/landing-gallery/LP-102/thumb.jpg",
    "desktop": "/landing-gallery/LP-102/desktop.jpg",
    "mobile": "/landing-gallery/LP-102/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-102/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-102.html",
    "motions": [
      "숨 쉬듯 모양이 바뀌는 곡선 덩어리",
      "4초마다 들숨 · 날숨을 안내하며 커졌다 작아지는 원",
      "스크롤을 내리는 만큼 드러나는 곡선과 수업 소개",
      "요일 탭 아래를 미끄러지는 밑줄과 차례로 뜨는 시간표",
      "마우스를 따라 기우는 수강권 카드와 흐르는 물결 선"
    ]
  },
  {
    "id": "LP-103",
    "title": "코딩 부트캠프 · 타이핑되는 터미널",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "코딩 부트캠프",
      "온라인 강의",
      "직무 교육"
    ],
    "purposes": [
      "모집",
      "신청",
      "소개"
    ],
    "moods": [
      "대담한"
    ],
    "visualStyles": [
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면의 터미널에 명령어가 한 글자씩 쳐지고, 스크롤을 내리면 16주 진도 선이 차오르며 달마다 배우는 것이 바뀌는 코딩 부트캠프 모집 페이지.",
    "thumb": "/landing-gallery/LP-103/thumb.jpg",
    "desktop": "/landing-gallery/LP-103/desktop.jpg",
    "mobile": "/landing-gallery/LP-103/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-103/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-103.html",
    "motions": [
      "명령어가 한 글자씩 쳐지고 결과가 뜨는 터미널",
      "스크롤에 맞춰 진도 선이 차오르고 마디가 켜지는 16주 커리큘럼",
      "화면에 들어오면 아래에서 자라는 막대 그래프와 올라가는 숫자",
      "마우스를 따라 움직이는 빛과 접히는 질문",
      "초 단위로 줄어드는 모집 마감 시계"
    ]
  },
  {
    "id": "LP-104",
    "title": "세무 · 회계 사무실 · 정리되는 영수증",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "세무 · 회계 사무실",
      "노무 · 법무 사무실",
      "사업자 지원 서비스"
    ],
    "purposes": [
      "소개",
      "문의",
      "예약"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "스크롤을 내리면 흩어져 있던 영수증 일곱 장이 날짜순으로 줄을 서고 계정 과목과 합계가 붙어 장부 한 장이 되는 세무 · 회계 사무실 페이지.",
    "thumb": "/landing-gallery/LP-104/thumb.jpg",
    "desktop": "/landing-gallery/LP-104/desktop.jpg",
    "mobile": "/landing-gallery/LP-104/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-104/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-104.html",
    "motions": [
      "스크롤에 맞춰 흩어진 영수증이 장부 줄로 정리되고 합계가 올라가는 고정 구간",
      "화면에 들어오면 원과 체크 표시가 차례로 그려지는 점검 목록",
      "스크롤한 만큼 자라는 단계 선과 켜지는 마디",
      "손잡이를 움직이면 숫자가 따라 바뀌는 기장료 가늠 슬라이더",
      "월간 보고 카드의 올라가는 숫자와 자라는 막대, 흐르는 신고 달력"
    ]
  },
  {
    "id": "LP-105",
    "title": "탄산음료 출시 · 돌아가는 캔과 맛 고르기",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "음료 브랜드",
      "신제품 출시",
      "식품 D2C"
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
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "라벨이 돌아가는 캔을 가운데 두고, 맛을 고르면 누른 자리에서 색이 번지며 화면 전체가 그 맛으로 바뀌는 탄산음료 출시 페이지.",
    "thumb": "/landing-gallery/LP-105/thumb.jpg",
    "desktop": "/landing-gallery/LP-105/desktop.jpg",
    "mobile": "/landing-gallery/LP-105/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-105/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-105.html",
    "motions": [
      "라벨이 옆으로 흘러 캔이 도는 것처럼 보이는 첫 화면",
      "맛을 고르면 누른 자리에서 원으로 번지는 배경색 전환",
      "바닥에서 올라오는 기포",
      "스크롤에 맞춰 도는 과일 조각과 올라가는 성분 숫자",
      "상자 크기를 고르면 캔 개수 점이 차례로 켜지고 가격이 바뀜"
    ]
  },
  {
    "id": "LP-106",
    "title": "주문 · 재고 관리 서비스 · 그려지는 대시보드",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "업무용 SaaS",
      "재고 · 주문 관리",
      "B2B 서비스"
    ],
    "purposes": [
      "소개",
      "신청",
      "문의"
    ],
    "moods": [
      "신뢰감 있는",
      "미니멀"
    ],
    "visualStyles": [
      "일러스트 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면의 대시보드에서 그래프가 그려지고 숫자가 올라가며, 스크롤을 내리면 주문 모으기 · 재고 맞추기 · 발주 알림 화면이 차례로 바뀌는 업무용 서비스 페이지.",
    "thumb": "/landing-gallery/LP-106/thumb.jpg",
    "desktop": "/landing-gallery/LP-106/desktop.jpg",
    "mobile": "/landing-gallery/LP-106/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-106/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-106.html",
    "motions": [
      "선 그래프가 그려지고 막대가 자라며 숫자가 올라가는 대시보드",
      "스크롤에 맞춰 세 가지 기능 화면이 바뀌는 고정 구간",
      "가운데에서 여섯 서비스로 선이 이어지고 점이 오가는 연동 그림",
      "월 · 연 결제를 바꾸면 미끄러지는 단추와 바뀌는 금액",
      "마무리 문장에서 낱말이 타자로 바뀜"
    ]
  },
  {
    "id": "LP-107",
    "title": "청년 창업 지원사업 모집 · 포스터 같은 큰 글자",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "지원사업 모집",
      "지자체 · 재단",
      "창업 지원"
    ],
    "purposes": [
      "모집",
      "신청"
    ],
    "moods": [
      "대담한",
      "신뢰감 있는"
    ],
    "visualStyles": [
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "화면을 채우는 큰 글자와 마감까지 남은 시간으로 시작해, 자격 항목을 눌러 신청할 수 있는지 바로 확인하는 지원사업 모집 페이지.",
    "thumb": "/landing-gallery/LP-107/thumb.jpg",
    "desktop": "/landing-gallery/LP-107/desktop.jpg",
    "mobile": "/landing-gallery/LP-107/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-107/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-107.html",
    "motions": [
      "한 글자씩 올라오는 포스터 크기 제목과 떠다니는 도형",
      "초 단위로 줄어드는 마감까지 남은 시간",
      "화면에 들어오면 올라가는 지원 금액 숫자",
      "자격 항목을 누르면 채워지는 원과 바뀌는 결과",
      "스크롤에 맞춰 차오르는 진행 단계 선"
    ]
  },
  {
    "id": "LP-108",
    "title": "대학 오픈 캠퍼스 · 따라 걷는 지도",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "대학 입학처",
      "입학 설명회",
      "오픈 캠퍼스"
    ],
    "purposes": [
      "행사",
      "신청",
      "소개"
    ],
    "moods": [
      "신뢰감 있는",
      "프리미엄"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "본관이 선으로 그려지며 열리고, 스크롤을 내리면 정문에서 운동장까지 길이 이어지면서 건물이 하나씩 켜지는 대학 오픈 캠퍼스 안내 페이지.",
    "thumb": "/landing-gallery/LP-108/thumb.jpg",
    "desktop": "/landing-gallery/LP-108/desktop.jpg",
    "mobile": "/landing-gallery/LP-108/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-108/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-108.html",
    "motions": [
      "첫 화면에서 본관이 한 획씩 그려짐",
      "스크롤에 맞춰 길이 그려지고 건물이 차례로 켜지는 캠퍼스 지도",
      "숫자가 올라가는 안내 띠",
      "밑줄이 미끄러지는 날짜 탭과 차례로 나타나는 일정",
      "누르면 뒤집혀 전공이 보이는 계열 카드"
    ]
  },
  {
    "id": "LP-109",
    "title": "일러스트레이터 포트폴리오 · 잡아 던지는 스티커",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "일러스트레이터",
      "그림 작가",
      "프리랜서 디자이너"
    ],
    "purposes": [
      "소개",
      "문의"
    ],
    "moods": [
      "발랄한",
      "대담한"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면의 스티커 도형을 손으로 잡아 던질 수 있고, 작품 타일을 누를 때마다 새 그림이 그려지는 일러스트레이터 포트폴리오 페이지.",
    "thumb": "/landing-gallery/LP-109/thumb.jpg",
    "desktop": "/landing-gallery/LP-109/desktop.jpg",
    "mobile": "/landing-gallery/LP-109/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-109/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-109.html",
    "motions": [
      "끌어서 던지면 벽에 튕기는 스티커 도형",
      "서로 반대로 흐르는 큰 글자 띠",
      "누를 때마다 도형이 튀어나오며 새로 그려지는 작품 타일",
      "마우스를 올리면 기우는 카드와 물결 밑줄 그리기",
      "커서를 따라 움직이는 눈동자"
    ]
  },
  {
    "id": "LP-110",
    "title": "여름밤 음악 축제 · 누르면 터지는 불꽃",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "음악 축제",
      "지역 축제",
      "야외 공연"
    ],
    "purposes": [
      "행사",
      "예약",
      "소개"
    ],
    "moods": [
      "대담한",
      "발랄한"
    ],
    "visualStyles": [
      "일러스트 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "별이 반짝이는 밤하늘을 누르면 불꽃이 터지고, 스크롤을 내리면 산과 무대, 관객이 서로 다른 속도로 움직이는 여름밤 음악 축제 페이지.",
    "thumb": "/landing-gallery/LP-110/thumb.jpg",
    "desktop": "/landing-gallery/LP-110/desktop.jpg",
    "mobile": "/landing-gallery/LP-110/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-110/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [],
    "demo": "/landing-motion/LP-110.html",
    "motions": [
      "별이 반짝이고 누르는 곳마다 불꽃이 터지는 밤하늘",
      "스크롤에 따라 산 · 무대 · 관객이 다른 속도로 움직이는 겹겹의 실루엣",
      "서로 반대로 흐르는 출연진 글자 띠",
      "마우스를 올리면 기우는 입장권",
      "미끄러지는 날짜 탭과 남은 날 시계, 길을 달리는 셔틀버스"
    ]
  },
  {
    "id": "LP-111",
    "title": "동네 빵집 · 옆으로 흐르는 빵 사진",
    "field": 1,
    "fieldLabel": "음식·카페·매장",
    "industries": [
      "베이커리",
      "동네 빵집",
      "디저트 카페"
    ],
    "purposes": [
      "소개",
      "예약",
      "구매"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "반죽을 빚는 손 사진이 천천히 다가오며 제목이 드러나고, 스크롤을 내리면 오늘 나오는 빵 사진이 옆으로 흘러가는 동네 빵집 페이지.",
    "thumb": "/landing-gallery/LP-111/thumb.jpg",
    "desktop": "/landing-gallery/LP-111/desktop.jpg",
    "mobile": "/landing-gallery/LP-111/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-111/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Skyler Ewing",
        "url": "https://unsplash.com/@skylerewing",
        "photoUrl": "https://unsplash.com/photos/8Fled6qer2Q"
      },
      {
        "name": "Nicholas Doyle",
        "url": "https://unsplash.com/@nsdoyle",
        "photoUrl": "https://unsplash.com/photos/t7jTtJ9iyUE"
      },
      {
        "name": "With Mahdy",
        "url": "https://unsplash.com/@withmahdy",
        "photoUrl": "https://unsplash.com/photos/ePh7mI8y_bA"
      },
      {
        "name": "arh Lee",
        "url": "https://unsplash.com/@arhlee_00",
        "photoUrl": "https://unsplash.com/photos/UTxe9bNv_R4"
      },
      {
        "name": "Kris Tian",
        "url": "https://unsplash.com/@kris_tian",
        "photoUrl": "https://unsplash.com/photos/jeHTgSM6Ujc"
      },
      {
        "name": "atelierbyvineeth ...",
        "url": "https://unsplash.com/@atelierbyvineeth",
        "photoUrl": "https://unsplash.com/photos/W1EQVH99VHI"
      }
    ],
    "demo": "/landing-motion/LP-111.html",
    "motions": [
      "첫 화면 사진이 천천히 다가오고 제목이 아래에서 밀려 올라와 드러남",
      "스크롤에 맞춰 빵 사진이 옆으로 흘러가는 고정 구간",
      "메뉴 줄에 마우스를 올리면 커서를 따라오는 빵 사진",
      "스크롤로 차오르는 굽는 시간표와 다음에 나올 빵 표시",
      "아래에서 위로 잘려 드러나는 진열장 사진"
    ]
  },
  {
    "id": "LP-112",
    "title": "스킨케어 숍 · 아치 창 속 사진",
    "field": 2,
    "fieldLabel": "뷰티·건강·의료",
    "industries": [
      "스킨케어 숍",
      "에스테틱",
      "피부 관리실"
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
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "아치 모양 창 안에서 사진이 서로 다른 속도로 움직이고, 관리 순서를 따라 내려가면 둥근 창의 사진이 바뀌는 예약제 스킨케어 숍 페이지.",
    "thumb": "/landing-gallery/LP-112/thumb.jpg",
    "desktop": "/landing-gallery/LP-112/desktop.jpg",
    "mobile": "/landing-gallery/LP-112/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-112/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Anju Ravindranath",
        "url": "https://unsplash.com/@anjurnath",
        "photoUrl": "https://unsplash.com/photos/InjcU6s_l44"
      },
      {
        "name": "sam limon",
        "url": "https://unsplash.com/@limone",
        "photoUrl": "https://unsplash.com/photos/apuJlRzdcDo"
      },
      {
        "name": "Ana azuria",
        "url": "https://unsplash.com/@ana_azuria",
        "photoUrl": "https://unsplash.com/photos/LclE8PqL9qw"
      },
      {
        "name": "ibnu ihza",
        "url": "https://unsplash.com/@mahendra_10",
        "photoUrl": "https://unsplash.com/photos/g6q3lFAe3kA"
      },
      {
        "name": "A.Rahmat MN",
        "url": "https://unsplash.com/@alir4hmatmn",
        "photoUrl": "https://unsplash.com/photos/JysmtN0YPHM"
      },
      {
        "name": "Cosmin Ursea",
        "url": "https://unsplash.com/@cosminursea",
        "photoUrl": "https://unsplash.com/photos/IjcQV4wxPXU"
      },
      {
        "name": "Declan Sun",
        "url": "https://unsplash.com/@declansun",
        "photoUrl": "https://unsplash.com/photos/6OfQw-we6Ps"
      }
    ],
    "demo": "/landing-motion/LP-112.html",
    "motions": [
      "아치 창 세 개 안에서 사진이 서로 다른 속도로 움직임",
      "커튼처럼 옆으로 열리며 드러나는 사진",
      "관리 순서에 따라 둥근 창의 사진이 바뀌고 둘레의 고리가 차오름",
      "메뉴 탭 아래에서 미끄러지는 밑줄",
      "낱말 단위로 떠오르는 제목"
    ]
  },
  {
    "id": "LP-113",
    "title": "도예 공방 수업 · 한 장씩 넘어가는 사진",
    "field": 3,
    "fieldLabel": "교육·강의·코칭",
    "industries": [
      "도예 공방",
      "원데이 클래스",
      "공예 수업"
    ],
    "purposes": [
      "소개",
      "신청",
      "모집"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "흙을 치대는 것부터 구워서 받기까지, 스크롤을 내리면 수업 순서대로 사진 카드가 한 장씩 넘어가는 도예 공방 하루 수업 페이지.",
    "thumb": "/landing-gallery/LP-113/thumb.jpg",
    "desktop": "/landing-gallery/LP-113/desktop.jpg",
    "mobile": "/landing-gallery/LP-113/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-113/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Vitaly Gariev",
        "url": "https://unsplash.com/@silverkblack",
        "photoUrl": "https://unsplash.com/photos/tRdMXNgFBVY"
      },
      {
        "name": "Alex Jones",
        "url": "https://unsplash.com/@alexjones",
        "photoUrl": "https://unsplash.com/photos/Tq4YjCa2BSc"
      },
      {
        "name": "Earl Wilcox",
        "url": "https://unsplash.com/@earl_plannerzone",
        "photoUrl": "https://unsplash.com/photos/iUbsw_VOkbM"
      },
      {
        "name": "Aedrian Salazar",
        "url": "https://unsplash.com/@aedrian",
        "photoUrl": "https://unsplash.com/photos/wrEHW8QaeYw"
      },
      {
        "name": "Kazuo ota",
        "url": "https://unsplash.com/@kazuo513",
        "photoUrl": "https://unsplash.com/photos/7aEICAa-JK8"
      },
      {
        "name": "cafeconcetto",
        "url": "https://unsplash.com/@cafeconcetto",
        "photoUrl": "https://unsplash.com/photos/NENc84l109g"
      },
      {
        "name": "Jason Leung",
        "url": "https://unsplash.com/@ninjason",
        "photoUrl": "https://unsplash.com/photos/_p2LIblOlWY"
      }
    ],
    "demo": "/landing-motion/LP-113.html",
    "motions": [
      "첫 화면 사진이 옆에서 잘려 드러나고 물레처럼 도는 고리",
      "수업 순서대로 사진 카드가 한 장씩 넘어가는 고정 구간",
      "수업 시간 · 인원 숫자가 올라감",
      "요일 탭 사이를 미끄러지는 표시와 남은 자리 점",
      "준비물 목록의 체크 표시가 그려짐"
    ]
  },
  {
    "id": "LP-114",
    "title": "인테리어 시공 · 손잡이로 견주는 설계와 완성",
    "field": 4,
    "fieldLabel": "전문·생활 서비스",
    "industries": [
      "인테리어 시공",
      "주거 리모델링",
      "주방 · 거실 공사"
    ],
    "purposes": [
      "소개",
      "문의",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "식당 사진 한 장을 손잡이로 좌우로 끌어 선으로 본 설계와 완성된 모습을 견주고, 공간 사진이 잘려 드러나며 공정 선이 스크롤에 맞춰 차오르는 인테리어 시공 페이지.",
    "thumb": "/landing-gallery/LP-114/thumb.jpg",
    "desktop": "/landing-gallery/LP-114/desktop.jpg",
    "mobile": "/landing-gallery/LP-114/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-114/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Puscas Adryan",
        "url": "https://unsplash.com/@adryan_studio",
        "photoUrl": "https://unsplash.com/photos/JXFnfu15SgI"
      },
      {
        "name": "Aalo Lens",
        "url": "https://unsplash.com/@aalolens",
        "photoUrl": "https://unsplash.com/photos/u7apeDIhIaI"
      },
      {
        "name": "Franco Debartolo",
        "url": "https://unsplash.com/@francotheshooter",
        "photoUrl": "https://unsplash.com/photos/xCAMk7wFZC4"
      },
      {
        "name": "GoodLifeConstruction",
        "url": "https://unsplash.com/@goodlifeconstruction",
        "photoUrl": "https://unsplash.com/photos/pQVP5QmskxM"
      },
      {
        "name": "Ishan Sharma",
        "url": "https://unsplash.com/@itslunar",
        "photoUrl": "https://unsplash.com/photos/DjaSE8vgUXg"
      },
      {
        "name": "Declan Sun",
        "url": "https://unsplash.com/@declansun",
        "photoUrl": "https://unsplash.com/photos/2ZjSja_2EX4"
      }
    ],
    "demo": "/landing-motion/LP-114.html",
    "motions": [
      "손잡이를 끌어 선으로 본 설계와 완성을 견주는 사진",
      "잘려 드러나고 올리면 다가오는 공간 사진 격자",
      "스크롤에 맞춰 차오르며 단계가 켜지는 공정 선",
      "첫 화면에서 천천히 다가오는 거실 사진과 한 글자씩 오르는 제목",
      "화면에 들어오면 올라가는 숫자"
    ]
  },
  {
    "id": "LP-115",
    "title": "생활 도자기 룩북 · 옆으로 넘기는 그릇 선반",
    "field": 5,
    "fieldLabel": "쇼핑·제품·브랜드",
    "industries": [
      "생활 도자기",
      "핸드메이드 소품",
      "공방 브랜드"
    ],
    "purposes": [
      "소개",
      "구매",
      "예약"
    ],
    "moods": [
      "내추럴",
      "미니멀",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "첫 화면 사진이 스크롤에 맞춰 액자처럼 줄어들고, 그릇 네 점이 옆으로 넘어가는 룩북과 스크롤로 커지는 사진, 커서를 따라오는 미리보기가 이어지는 생활 도자기 브랜드 페이지.",
    "thumb": "/landing-gallery/LP-115/thumb.jpg",
    "desktop": "/landing-gallery/LP-115/desktop.jpg",
    "mobile": "/landing-gallery/LP-115/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-115/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Raymond Petrik",
        "url": "https://unsplash.com/@raymondpetrik",
        "photoUrl": "https://unsplash.com/photos/525wpkeJSwg"
      },
      {
        "name": "Sixteen Miles Out",
        "url": "https://unsplash.com/@sixteenmilesout",
        "photoUrl": "https://unsplash.com/photos/aFvxASlms2A"
      },
      {
        "name": "Tom Crew",
        "url": "https://unsplash.com/@tomcrewceramics",
        "photoUrl": "https://unsplash.com/photos/Mz__0nr1AM8"
      },
      {
        "name": "John Vid",
        "url": "https://unsplash.com/@vanvid",
        "photoUrl": "https://unsplash.com/photos/YOQ0QeTpMfo"
      },
      {
        "name": "cafeconcetto",
        "url": "https://unsplash.com/@cafeconcetto",
        "photoUrl": "https://unsplash.com/photos/4fXPCj0_828"
      },
      {
        "name": "Ionela Mat",
        "url": "https://unsplash.com/@ionelaaaaa",
        "photoUrl": "https://unsplash.com/photos/CgnrIDsBrY0"
      },
      {
        "name": "Annie Spratt",
        "url": "https://unsplash.com/@anniespratt",
        "photoUrl": "https://unsplash.com/photos/nV8XhbS7wCo"
      }
    ],
    "demo": "/landing-motion/LP-115.html",
    "motions": [
      "스크롤에 따라 옆으로 넘어가는 그릇 룩북(고정 구간)",
      "스크롤하면 액자처럼 줄어드는 첫 화면 사진",
      "화면에 들어오며 커지는 그릇 사진",
      "목록에 올리면 커서를 따라오는 사진 미리보기",
      "낱말씩 떠오르는 소개 글과 시차로 움직이는 작업실 사진"
    ]
  },
  {
    "id": "LP-116",
    "title": "공장 · 물류 자동화 설비 · 둥근 창에서 열리는 라인",
    "field": 6,
    "fieldLabel": "IT·B2B·제조",
    "industries": [
      "물류 자동화",
      "스마트 공장 설비",
      "컨베이어 · 로봇"
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
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "작은 둥근 창으로 보이던 분류 라인 사진이 스크롤에 맞춰 화면 가득 열리고, 생산 라인 사진 위에서 글이 단계별로 바뀌는 공장 · 물류 자동화 설비 회사 페이지.",
    "thumb": "/landing-gallery/LP-116/thumb.jpg",
    "desktop": "/landing-gallery/LP-116/desktop.jpg",
    "mobile": "/landing-gallery/LP-116/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-116/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "CHUTTERSNAP",
        "url": "https://unsplash.com/@chuttersnap",
        "photoUrl": "https://unsplash.com/photos/BNBA1h-NgdY"
      },
      {
        "name": "Alberto Rodríguez",
        "url": "https://unsplash.com/@albertorodriguez",
        "photoUrl": "https://unsplash.com/photos/xoSw4kQMgbk"
      },
      {
        "name": "Salvador Escalante",
        "url": "https://unsplash.com/@salvador_86",
        "photoUrl": "https://unsplash.com/photos/GG02YTZl0GM"
      },
      {
        "name": "nik biziuk",
        "url": "https://unsplash.com/@nikbizuk",
        "photoUrl": "https://unsplash.com/photos/hJ4JxDJkRUw"
      },
      {
        "name": "Akshat Sharma",
        "url": "https://unsplash.com/@asphotographypics",
        "photoUrl": "https://unsplash.com/photos/Au8NdOftMaI"
      },
      {
        "name": "Mina Rad",
        "url": "https://unsplash.com/@miinrad",
        "photoUrl": "https://unsplash.com/photos/GiuvVfcNFzY"
      }
    ],
    "demo": "/landing-motion/LP-116.html",
    "motions": [
      "작은 둥근 창이 스크롤에 맞춰 화면 가득으로 열리는 분류 라인 사진(고정 구간)",
      "화면 가득한 사진 위에 고정돼 단계별로 바뀌는 글",
      "서로 다른 속도로 움직이는 가공 · 로봇 사진",
      "첫 화면에서 천천히 다가오는 창고 사진과 위아래로 지나가는 점검 선",
      "화면에 들어오면 올라가는 숫자와 잘려 드러나는 사진"
    ]
  },
  {
    "id": "LP-117",
    "title": "농촌 한 달 살기 모집 · 맞춰지는 사진 조각",
    "field": 7,
    "fieldLabel": "정부·정책·모집",
    "industries": [
      "지자체 모집 공고",
      "귀농 · 귀촌 체험",
      "농촌 살아 보기"
    ],
    "purposes": [
      "모집",
      "신청",
      "소개"
    ],
    "moods": [
      "따뜻한",
      "내추럴"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "황금빛 논 사진으로 열고, 스크롤을 내리면 흩어져 있던 농촌 사진 여섯 장이 한 장의 모음으로 맞춰지는 농촌 한 달 살기 참가자 모집 페이지.",
    "thumb": "/landing-gallery/LP-117/thumb.jpg",
    "desktop": "/landing-gallery/LP-117/desktop.jpg",
    "mobile": "/landing-gallery/LP-117/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-117/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Winston Chen",
        "url": "https://unsplash.com/@winstonchen",
        "photoUrl": "https://unsplash.com/photos/FxGYroqWfb4"
      },
      {
        "name": "Claudia Pop",
        "url": "https://unsplash.com/@p_claudia_",
        "photoUrl": "https://unsplash.com/photos/QoIuMEBrkfE"
      },
      {
        "name": "Aleksandrs Karevs",
        "url": "https://unsplash.com/@ohmycamera",
        "photoUrl": "https://unsplash.com/photos/sLXFgGW9xTw"
      },
      {
        "name": "Sandie Clarke",
        "url": "https://unsplash.com/@honeypoppet",
        "photoUrl": "https://unsplash.com/photos/q13Zq1Jufks"
      },
      {
        "name": "KS KYUNG",
        "url": "https://unsplash.com/@mygallery",
        "photoUrl": "https://unsplash.com/photos/FwMOXyz93po"
      },
      {
        "name": "Tho Nguyen Huu",
        "url": "https://unsplash.com/@suryatravel",
        "photoUrl": "https://unsplash.com/photos/HdEjmywhC08"
      },
      {
        "name": "Alfi Hilman",
        "url": "https://unsplash.com/@alfihilmaan",
        "photoUrl": "https://unsplash.com/photos/4_0G_pobG8M"
      }
    ],
    "demo": "/landing-motion/LP-117.html",
    "motions": [
      "흩어진 사진 여섯 장이 스크롤에 따라 한 장의 모음으로 맞춰지는 고정 구간",
      "첫 화면 논 사진이 천천히 다가오고 제목이 한 글자씩 올라옴",
      "옆으로 흐르는 사진 띠",
      "모집 마감까지 남은 시간과 올라가는 지원 숫자",
      "스크롤에 맞춰 차오르는 하루 일과 선"
    ]
  },
  {
    "id": "LP-118",
    "title": "시립도서관 새 단장 · 층마다 바뀌는 사진",
    "field": 8,
    "fieldLabel": "공공기관·대학·협회",
    "industries": [
      "공공 도서관",
      "문화 시설",
      "재개관 안내"
    ],
    "purposes": [
      "소개",
      "행사",
      "신청"
    ],
    "moods": [
      "신뢰감 있는",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "타이포 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "새 단장을 마친 도서관을 한 층씩 올라가듯, 글 단락을 따라 한쪽에 고정된 사진이 바뀌는 시립도서관 재개관 안내 페이지.",
    "thumb": "/landing-gallery/LP-118/thumb.jpg",
    "desktop": "/landing-gallery/LP-118/desktop.jpg",
    "mobile": "/landing-gallery/LP-118/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-118/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Brett Wharton",
        "url": "https://unsplash.com/@brettwharton",
        "photoUrl": "https://unsplash.com/photos/XaVW0jy1hd4"
      },
      {
        "name": "Tat Linh Nguyen",
        "url": "https://unsplash.com/@niko_nguyen_10",
        "photoUrl": "https://unsplash.com/photos/iCy0QOTGzKE"
      },
      {
        "name": "Zoshua Colah",
        "url": "https://unsplash.com/@zoshuacolah",
        "photoUrl": "https://unsplash.com/photos/ii3PT1ihWXM"
      },
      {
        "name": "Chang Ye",
        "url": "https://unsplash.com/@yooceii",
        "photoUrl": "https://unsplash.com/photos/HazMIZroH2E"
      },
      {
        "name": "Chengrui Lin",
        "url": "https://unsplash.com/@chengrui",
        "photoUrl": "https://unsplash.com/photos/IcnO9pYPBdY"
      },
      {
        "name": "Dong Xu",
        "url": "https://unsplash.com/@tdx_104",
        "photoUrl": "https://unsplash.com/photos/hIygfQ-JHI4"
      }
    ],
    "demo": "/landing-motion/LP-118.html",
    "motions": [
      "글 단락에 맞춰 한쪽에 고정된 사진이 겹쳐 바뀌는 층별 안내",
      "첫 화면과 자료실 사진이 가장자리부터 잘려 드러남",
      "프로그램 탭 아래를 미끄러지는 밑줄",
      "한 획씩 그려지는 펼친 책과 등",
      "올라가는 숫자와 사진 시차"
    ]
  },
  {
    "id": "LP-119",
    "title": "사진작가 포트폴리오 · 잘리며 넘어가는 사진",
    "field": 9,
    "fieldLabel": "크리에이터·아티스트",
    "industries": [
      "사진작가",
      "풍경 · 건축 사진",
      "촬영 의뢰"
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
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "화면을 가득 채운 사진이 한쪽부터 잘리며 다음 장으로 넘어가고, 필름 띠를 끌어 넘기다 한 장을 눌러 크게 보는 어둡고 조용한 사진작가 포트폴리오.",
    "thumb": "/landing-gallery/LP-119/thumb.jpg",
    "desktop": "/landing-gallery/LP-119/desktop.jpg",
    "mobile": "/landing-gallery/LP-119/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-119/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Nathan Anderson",
        "url": "https://unsplash.com/@nathananderson",
        "photoUrl": "https://unsplash.com/photos/FAA_bYB7VTg"
      },
      {
        "name": "Alexandra",
        "url": "https://unsplash.com/@alexandra_p_d",
        "photoUrl": "https://unsplash.com/photos/_nnSWTXvQAM"
      },
      {
        "name": "yujeong Huh",
        "url": "https://unsplash.com/@yujeongh",
        "photoUrl": "https://unsplash.com/photos/77kgRKMUyHg"
      },
      {
        "name": "Oleksii Rozanov",
        "url": "https://unsplash.com/@rozanovz",
        "photoUrl": "https://unsplash.com/photos/MzERmV-F2N8"
      },
      {
        "name": "Jonathan Marchal",
        "url": "https://unsplash.com/@jomarcha",
        "photoUrl": "https://unsplash.com/photos/5f7feBxJGyY"
      },
      {
        "name": "Anders Jildén",
        "url": "https://unsplash.com/@andersjilden",
        "photoUrl": "https://unsplash.com/photos/Sc5RKXLBjGg"
      },
      {
        "name": "Silas Baisch",
        "url": "https://unsplash.com/@silasbaisch",
        "photoUrl": "https://unsplash.com/photos/-3vU48G830k"
      },
      {
        "name": "Drew Bae",
        "url": "https://unsplash.com/@drewbae0505",
        "photoUrl": "https://unsplash.com/photos/xnP_MyCK2To"
      }
    ],
    "demo": "/landing-motion/LP-119.html",
    "motions": [
      "화면 가득한 사진이 한쪽부터 잘리며 넘어가는 슬라이드(자동 · 화살표 · 점)",
      "끌었다 놓으면 미끄러지는 필름 띠",
      "사진을 누르면 커지고 좌우로 넘기는 크게 보기",
      "작업 분야에 올리면 옆 사진이 겹쳐 바뀜",
      "한 낱말씩 떠오르는 작가의 말"
    ]
  },
  {
    "id": "LP-120",
    "title": "한옥 스테이 · 액자로 줄어드는 첫 사진",
    "field": 10,
    "fieldLabel": "관광·행사·문화",
    "industries": [
      "한옥 스테이",
      "독채 숙소",
      "전통 숙박"
    ],
    "purposes": [
      "소개",
      "예약"
    ],
    "moods": [
      "프리미엄",
      "내추럴",
      "따뜻한"
    ],
    "visualStyles": [
      "사진 중심",
      "모션 그래픽"
    ],
    "kind": "mate",
    "kindLabel": "MATE 시안 · 움직이는 페이지",
    "summary": "화면을 가득 채운 한옥 마당 사진이 스크롤을 내리면 액자 크기로 줄어들고, 그 뒤에서 제목이 드러나는 한옥 스테이 페이지.",
    "thumb": "/landing-gallery/LP-120/thumb.jpg",
    "desktop": "/landing-gallery/LP-120/desktop.jpg",
    "mobile": "/landing-gallery/LP-120/mobile.jpg",
    "mobileThumb": "/landing-gallery/LP-120/mobile-thumb.jpg",
    "credit": null,
    "photoCredits": [
      {
        "name": "Hazel J",
        "url": "https://unsplash.com/@hhj8861",
        "photoUrl": "https://unsplash.com/photos/EG2ASvE4GZU"
      },
      {
        "name": "Rachael Kim",
        "url": "https://unsplash.com/@rachaelkim7",
        "photoUrl": "https://unsplash.com/photos/PaGVwwdup9Y"
      },
      {
        "name": "Susann Schuster",
        "url": "https://unsplash.com/@susannschuster",
        "photoUrl": "https://unsplash.com/photos/v5tEPII1stk"
      },
      {
        "name": "PJH",
        "url": "https://unsplash.com/@dokae",
        "photoUrl": "https://unsplash.com/photos/XzuDOv79Ut0"
      },
      {
        "name": "eun kim",
        "url": "https://unsplash.com/@calmstore",
        "photoUrl": "https://unsplash.com/photos/edNGpzKKbmQ"
      },
      {
        "name": "franci ee",
        "url": "https://unsplash.com/@ee_franci",
        "photoUrl": "https://unsplash.com/photos/oGxr7DbE0nE"
      },
      {
        "name": "Kristian Angelo",
        "url": "https://unsplash.com/@kgadia87",
        "photoUrl": "https://unsplash.com/photos/lWnlcBz6gW4"
      }
    ],
    "demo": "/landing-motion/LP-120.html",
    "motions": [
      "화면 가득한 첫 사진이 스크롤에 따라 액자 크기로 줄어들고 제목이 드러나는 고정 구간",
      "기와지붕 풍경이 스크롤과 다른 속도로 움직임",
      "마우스를 따라 기우는 객실 카드",
      "둥글게 잘려 드러나는 차와 아침상 사진",
      "역에서 대문까지 그려지는 오는 길"
    ]
  }
];

export const landingDesignById = (id: string) => landingDesigns.find((d) => d.id === id);
