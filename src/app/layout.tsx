import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mate - 유니티 게임 개발 외주개발팀",
  description: "유니티 게임 개발, AR/VR, 외주 개발에 특화된 전문 개발 팀입니다. 2D/3D 게임, 클라이언트/서버 개발 경험이 풍부합니다.",
  keywords: "외주개발, 외주 개발, 유니티, Unity, 게임 개발, AR/VR, 2D 게임, 3D 게임, 게임 서버, 클라이언트 개발, 외주 팀, 게임 외주",
  openGraph: {
    title: "Mate - 유니티 게임 개발 외주개발팀",
    description: "유니티 게임 개발, AR/VR, 외주 개발에 특화된 전문 개발 팀입니다.",
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

