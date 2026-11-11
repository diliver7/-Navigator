import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "引航 Navigator · 学习方法与效率工具站",
  description:
    "58 篇系统学习方法笔记内置：主动回忆、间隔重复、番茄钟、错题本与周回顾，零配置可用、断网可查，可排复习计划并核对原文出处。",
  keywords: ["学习方法", "主动回忆", "间隔重复", "番茄工作法", "错题本", "复习计划"],
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
