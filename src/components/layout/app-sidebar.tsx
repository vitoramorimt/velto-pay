"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy, Sparkles } from "lucide-react";

import { appNavigationItems } from "@/components/layout/app-navigation";
import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar/98 px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
      <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.20)]">
        <VeltoLogo
          imageClassName="h-10 w-10 rounded-md"
          labelClassName="text-sm text-sidebar-foreground"
          priority
          showLabel
          size={40}
        />
      </div>

      <nav className="mt-8 space-y-1">
        {appNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href &&
            (item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const itemClassName = cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
            item.href
              ? "text-sidebar-foreground/72 hover:translate-x-0.5 hover:bg-white/5 hover:text-sidebar-foreground"
              : "cursor-default text-sidebar-foreground/38",
            isActive &&
              "bg-sidebar-active text-sidebar-active-foreground shadow-inner-line",
          );
          const content = (
            <>
              <Icon className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.status === "soon" ? (
                <Badge
                  className="ml-auto border-white/10 bg-white/[0.06] text-[10px] text-sidebar-foreground/60"
                  variant="outline"
                >
                  Em breve
                </Badge>
              ) : null}
            </>
          );

          return item.href ? (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={itemClassName}
              href={item.href}
              key={item.label}
            >
              {content}
            </Link>
          ) : (
            <div
              aria-disabled="true"
              className={itemClassName}
              key={item.label}
              title={item.description}
            >
              {content}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(25,205,139,0.10),rgba(255,255,255,0.035))] p-4 shadow-[0_22px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-accent" />
          Velto MVP
        </div>
        <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">
          Checkout e financeiro já possuem visão MVP. Pagamentos reais e saque
          seguem fora desta etapa.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/15 px-3 py-2 text-xs text-sidebar-foreground/70">
          <LifeBuoy className="h-3.5 w-3.5 text-accent" />
          Operação preparada para escalar
        </div>
      </div>
    </aside>
  );
}
