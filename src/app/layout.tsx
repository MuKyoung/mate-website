import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContactButton from "@/components/FloatingContactButton";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = "https://devteammate.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mate - 유니티 외주 개발 및 개발 강의 팀",
    template: "%s | Mate 외주개발팀",
  },
  description: "유니티 개발과 개발 강의에 특화된 전문 개발 팀입니다. 실무 경험을 바탕으로 한 체계적인 교육과 안정적인 개발 서비스를 제공합니다.",
  keywords: "외주개발, 외주 개발, 유니티, Unity, 개발 강의, 유니티 강의, Unity 교육, 게임 개발 교육, 외주 팀, 유니티 외주, 유니티 외주개발, Unity 외주개발, 게임 개발 외주, AR/VR 개발, 2D 게임 개발, 3D 게임 개발",
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
    title: "Mate - 유니티 외주 개발 및 개발 강의 팀",
    description: "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다. 실무 경험을 바탕으로 한 체계적인 교육과 안정적인 외주 개발 서비스를 제공합니다.",
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
    title: "Mate - 유니티 외주 개발 및 개발 강의 팀",
    description: "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다.",
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
      "telephone": "+82-10-5457-9141",
      "contactType": "customer service",
      "email": "team-mate@naver.com",
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
      <body className={inter.className}>
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

