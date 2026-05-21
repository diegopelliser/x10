"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, PlusCircle, TrendingUp, BarChart2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/dre",         label: "DRE Gerencial", icon: FileText },
  { href: "/analises",    label: "Análises",      icon: BarChart2 },
  { href: "/lancamentos", label: "Lançamentos",   icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="sidebar fixed left-0 top-0 h-full w-60 flex flex-col z-40"
           style={{ background: "var(--bg-surface)", borderRight: "1px solid var(--border)" }}>

      {/* Logo */}
      <div className="flex flex-col items-center px-6 py-6"
           style={{ borderBottom: "1px solid rgba(200,168,75,0.2)" }}>
        <div className="relative w-full h-48 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="X10 Investimentos"
            fill
            className="object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <p className="text-[10px] mt-2 tracking-widest uppercase"
           style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
          Controle Financeiro
        </p>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "text-white"
                  : "hover:text-white"
              )}
              style={{
                background: active ? "rgba(200,168,75,0.12)" : "transparent",
                color: active ? "#F5F7FA" : "var(--muted-foreground)",
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Borda esquerda dourada no item ativo */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: "var(--gold)" }} />
              )}
              <Icon
                size={16}
                className="flex-shrink-0"
                style={{ color: active ? "var(--gold)" : "inherit" }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
          style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.color = "var(--danger)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--muted-foreground)";
          }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          Sair
        </button>

        <div className="flex items-center gap-2 px-3">
          <TrendingUp size={12} style={{ color: "var(--gold)" }} />
          <span className="text-[10px] tracking-wide uppercase"
                style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-jakarta)" }}>
            Versão 1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
