import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mate - 유니티 외주 개발 및 개발 강의 팀",
  description: "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다. 실무 경험을 바탕으로 한 체계적인 교육과 안정적인 외주 개발 서비스를 제공합니다.",
  keywords: "외주개발, 외주 개발, 유니티, Unity, 개발 강의, 유니티 강의, Unity 교육, 게임 개발 교육, 외주 팀, 유니티 외주",
  openGraph: {
    title: "Mate - 유니티 외주 개발 및 개발 강의 팀",
    description: "유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

