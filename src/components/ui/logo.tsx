import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-brand/30 via-violet/20 to-mint/20 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <defs>
            <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stopColor="#9db2ff" />
              <stop offset="55%" stopColor="#6f8cff" />
              <stop offset="100%" stopColor="#4fe3c1" />
            </linearGradient>
          </defs>
          <path
            d="M12 2.6l2.2 6.1 6.2 2.2-6.2 2.2L12 19.2l-2.2-6.1-6.2-2.2 6.2-2.2L12 2.6z"
            fill="url(#logo-gradient)"
          />
          <circle cx="12" cy="11" r="1.6" fill="#05070f" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-wide text-white">引航 Navigator</span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-slate-500">Agent Workspace</span>
        </span>
      )}
    </Link>
  );
}
