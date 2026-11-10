"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KeyRound, LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

interface SiteNavProps {
  onOpenSettings?: () => void;
  hasOwnKey?: boolean;
}

const LINKS = [
  { href: "#guide", label: "新手导览" },
  { href: "#capabilities", label: "方法矩阵" },
  { href: "#flow", label: "执行流程" },
  { href: "/knowledge", label: "笔记库", external: true },
];

export function SiteNav({ onOpenSettings, hasOwnKey }: SiteNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled ? "border-line bg-[#05070f]/80 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) =>
            link.external ? (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[13px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[13px] text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="hidden items-center gap-1.5 rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-xs text-slate-300 transition hover:border-brand/30 hover:text-white sm:inline-flex"
          >
            <KeyRound className="h-3.5 w-3.5 text-brand-soft" />
            {hasOwnKey ? "可选增强 · 已配置" : "配置可选增强"}
          </button>
          <Link href="/workspace" className="btn-primary px-4 py-2 text-xs">
            <LayoutDashboard className="h-3.5 w-3.5" />
            进入工作台
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="打开菜单"
            className="rounded-xl border border-line p-2 text-slate-400 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-[#070b16]/95 px-5 py-3 backdrop-blur-xl md:hidden">
          <div className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-slate-300 hover:bg-white/[0.04]"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                onOpenSettings?.();
                setOpen(false);
              }}
              className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm text-slate-300 hover:bg-white/[0.04]"
            >
              <KeyRound className="h-4 w-4 text-brand-soft" />
              本地 API 设置
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
