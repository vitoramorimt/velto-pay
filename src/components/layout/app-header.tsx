"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserCircle, X } from "lucide-react";

import { appNavigationItems } from "@/components/layout/app-navigation";
import { VeltoLogo } from "@/components/brand/velto-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/modules/auth/presentation/auth-provider";
import { cn } from "@/shared/utils/cn";

type AppHeaderProps = {
  signOutSlot?: ReactNode;
};

export function AppHeader({ signOutSlot }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userName = user?.fullName?.trim() || user?.email || "Conta Velto";
  const userEmail = user?.email ?? "Usuário autenticado";

  function isNavigationItemActive(href?: string): boolean {
    if (!href) {
      return false;
    }

    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button
          className="lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Abrir navegação</span>
        </Button>

        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="text-sm font-medium text-foreground">Operação Velto</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Core comercial, checkout MVP e financeiro em evolução.
          </p>
        </div>

        <div className="min-w-0 flex-1 lg:hidden">
          <VeltoLogo
            imageClassName="h-8 w-8 rounded-md"
            labelClassName="text-sm text-foreground"
            showLabel
            size={32}
          />
        </div>

        <ThemeToggle className="hidden sm:grid" />
        <Badge className="hidden sm:inline-flex" variant="success">
          MVP
        </Badge>

        <details className="group relative">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border/80 bg-card/70 px-2.5 text-sm shadow-sm transition-colors hover:border-accent/30 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
              <UserCircle className="h-4 w-4" />
            </span>
            <span className="hidden max-w-40 truncate text-left font-medium md:block">
              {userName}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180 md:block" />
          </summary>

          <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border/80 bg-popover p-2 text-popover-foreground shadow-soft-lg">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            {signOutSlot}
          </div>
        </details>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fechar navegação"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
            type="button"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col border-r border-white/10 bg-sidebar p-4 text-sidebar-foreground shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <VeltoLogo
                imageClassName="h-10 w-10 rounded-md"
                labelClassName="text-sm text-sidebar-foreground"
                priority
                showLabel
                size={40}
              />
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar navegação</span>
              </Button>
            </div>

            <nav className="mt-8 space-y-1">
              {appNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item.href);
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
                    <span className="min-w-0 flex-1 truncate">
                      {item.label}
                    </span>
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
                    onClick={() => setIsMobileMenuOpen(false)}
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

            <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
              <p className="font-medium text-sidebar-foreground">Tema</p>
              <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">
                Escolha entre dark e light. A preferência fica salva no
                navegador.
              </p>
              <ThemeToggle className="mt-4 border-white/10 bg-white/[0.04]" />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
