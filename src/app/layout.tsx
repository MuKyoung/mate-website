import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButton from "@/components/FloatingContactButton";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = "https://devteammate.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mate - 게임·웹·앱 외주 개발 전문팀",
    template: "%s | Mate 외주개발팀",
  },
  description: "Unity 게임·AR/VR·웹·앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다. 5년 경력, 30개 이상의 프로젝트로 검증된 풀스택 개발 파트너입니다.",
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
    title: "Mate - 게임·웹·앱 외주 개발 전문팀",
    description: "Unity 게임·AR/VR·웹·앱 개발 및 개발 강의에 특화된 전문 외주개발팀입니다. 5년 경력, 30개 이상의 프로젝트로 검증된 풀스택 개발 파트너입니다.",
    images: [
      {
        url: `${siteUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Mate 외주개발팀",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mate - 게임·웹·앱 외주 개발 전문팀",
    description: "Unity 게임·AR/VR·웹·앱 개발 및 개발 강의 전문팀.",
    images: [`${siteUrl}/images/og-image.jpg`],
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
    "description": "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다",
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
    "description": "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀",
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingContactButton />
        <Analytics />
      </body>
    </html>
  );
}

