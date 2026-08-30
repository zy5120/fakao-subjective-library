import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "zy5120.github.io";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "2026 法考主观题资料库｜每日一题、带背与近十年真题";
  const description = "持续收集 2026 法考老师主观题每日一题、法治思想带背与 2016—2025 主观题真题，逐条保留来源与答案入口。";
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: [{ url: image, width: 1672, height: 941 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

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
