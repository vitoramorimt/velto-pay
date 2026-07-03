"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LifeBuoy } from "lucide-react";

import { appNavigationItems } from "@/components/layout/app-navigation";
import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
      <VeltoLogo
        className="px-2"
        imageClassName="h-10 w-10"
        labelClassName="text-sm text-sidebar-foreground"
        priority
        showLabel
        size={40}
      />

      <nav className="mt-8 space-y-1">
        {appNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href &&
            (item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`));
          const itemClassName = cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
            item.href
              ? "text-sidebar-foreground/72 hover:bg-white/5 hover:text-sidebar-foreground"
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

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LifeBuoy className="h-4 w-4 text-accent" />
          Suporte visual
        </div>
        <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">
          Checkout e financeiro já possuem visão MVP. Pagamentos reais e saque
          seguem fora desta etapa.
        </p>
      </div>
    </aside>
  );
}
