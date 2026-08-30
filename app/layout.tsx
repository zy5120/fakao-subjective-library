import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "法考主观题资料库",
  description: "2026 法考主观题每日一题与近十年真题阅读库",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
