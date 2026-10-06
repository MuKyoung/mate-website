import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButton from "@/components/FloatingContactButton";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = "https://devteammate.co.kr";

/* 모바일 브라우저 크롬(주소창 등)을 다크 캔버스에 맞춤 */
export const viewport: Viewport = {
  themeColor: "#101012",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mate — 웹 · 앱 · 게임 · XR · 교육 개발과 자체 게임 퍼블리싱",
    template: "%s | Mate 외주개발팀",
  },
  description: "웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다. 요구사항 정의부터 배포와 인계까지 한 팀이 맡습니다.",
  keywords: "외주개발, 외주 개발, 유니티, Unity, 게임 개발, AR/VR, 웹개발, 앱개발, React, Next.js, Flutter, 개발 강의, 유니티 강의, 외주 팀, 유니티 외주, 웹 외주, 앱 외주, 게임 외주, 2D 게임 개발, 3D 게임 개발",
  authors: [{ name: "Mate Team" }],
  creator: "Mate 외주개발팀",
  publisher: "Mate 외주개발팀",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "Mate 외주개발팀",
    title: "Mate — 웹 · 앱 · 게임 · XR · 교육 개발과 자체 게임 퍼블리싱",
    description: "웹 · 앱, 게임 · XR, 교육 세 영역의 외주 개발과 자체 게임 제작 · 퍼블리싱을 함께 합니다. 요구사항 정의부터 배포와 인계까지 한 팀이 맡습니다.",
    images: [
      {
        url: `${siteUrl}/images/og/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: "Mate 외주개발팀",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mate — 웹 · 앱 · 게임 · XR · 교육 개발과 자체 게임 퍼블리싱",
    description: "웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱.",
    images: [`${siteUrl}/images/og/og-default.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console 인증을 위해 추가할 수 있습니다
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mate",
    "alternateName": "Mate 외주개발팀",
    "description": "웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱.",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+82-507-1339-9141",
      "contactType": "customer service",
      "email": "hsib1212@naver.com",
      "areaServed": "KR",
      "availableLanguage": "Korean",
    },
    "sameAs": [],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KR",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Mate 외주개발팀",
    "url": siteUrl,
    "description": "웹 · 앱, 게임 · XR, 교육 외주 개발과 자체 게임 제작 · 퍼블리싱.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/projects?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <SmoothScroll />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingContactButton />
        <Analytics />
      </body>
    </html>
  );
}

