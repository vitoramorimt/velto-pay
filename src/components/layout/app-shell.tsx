"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { AppHeader } from "@/components/layout/app-header";
import { appNavigationItems } from "@/components/layout/app-navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

type AppShellProps = {
  children: ReactNode;
  notificationSlot?: ReactNode;
  signOutSlot?: ReactNode;
};

export function AppShell({
  children,
  notificationSlot,
  signOutSlot,
}: AppShellProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  function isNavigationItemActive(href?: string): boolean {
    if (!href) {
      return false;
    }

    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    setIsMobileNavigationOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setIsMobileNavigationOpen(false);
      }
    }

    mediaQuery.addEventListener("change", handleViewportChange);

    if (mediaQuery.matches) {
      setIsMobileNavigationOpen(false);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavigationOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.({ preventScroll: true });
    };
  }, [isMobileNavigationOpen]);

  return (
    <div className="relative flex min-h-dvh overflow-x-clip">
      <AppSidebar />

      <div
        className={cn(
          "relative z-10 flex min-w-0 flex-1 flex-col transition-transform duration-300 ease-out will-change-transform lg:translate-x-0",
          isMobileNavigationOpen &&
            "translate-x-[var(--velto-mobile-nav-width)]",
        )}
      >
        <AppHeader
          isMobileNavigationOpen={isMobileNavigationOpen}
          notificationSlot={notificationSlot}
          onOpenMobileNavigation={() => setIsMobileNavigationOpen(true)}
          signOutSlot={signOutSlot}
        />
        {children}
      </div>

      <div
        aria-hidden={!isMobileNavigationOpen}
        className={cn(
          "fixed inset-0 z-[80] lg:hidden",
          isMobileNavigationOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          aria-label="Fechar navegação"
          className={cn(
            "fixed inset-y-0 right-0 left-[var(--velto-mobile-nav-width)] z-[85] bg-background/70 backdrop-blur-[2px] transition-opacity duration-300",
            isMobileNavigationOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMobileNavigationOpen(false)}
          type="button"
        />

        <aside
          aria-labelledby="velto-mobile-navigation-title"
          aria-modal={isMobileNavigationOpen}
          className={cn(
            "velto-mobile-drawer-panel fixed inset-y-0 left-0 z-[90] flex w-[var(--velto-mobile-nav-width)] flex-col overflow-y-auto border-r border-white/10 bg-sidebar px-4 text-sidebar-foreground shadow-[24px_0_100px_rgba(0,0,0,0.45)] transition-transform duration-300 ease-out",
            isMobileNavigationOpen ? "translate-x-0" : "-translate-x-full",
          )}
          id="velto-mobile-navigation"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3">
            <VeltoLogo
              imageClassName="h-10 w-10 rounded-md"
              labelClassName="text-sm text-sidebar-foreground"
              priority
              showLabel
              size={40}
            />
            <h2 className="sr-only" id="velto-mobile-navigation-title">
              Navegação principal
            </h2>
            <Button
              className="border border-white/10 bg-white/[0.04] text-sidebar-foreground hover:bg-white/[0.08]"
              onClick={() => setIsMobileNavigationOpen(false)}
              ref={closeButtonRef}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar navegação</span>
            </Button>
          </div>

          <nav className="mt-6 space-y-1">
            {appNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavigationItemActive(item.href);
              const itemClassName = cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all",
                item.href
                  ? "text-sidebar-foreground/70 hover:translate-x-0.5 hover:bg-white/5 hover:text-sidebar-foreground"
                  : "cursor-default text-sidebar-foreground/40",
                isActive &&
                  "bg-sidebar-active text-sidebar-active-foreground shadow-inner-line",
              );
              const content = (
                <>
                  <Icon className="h-4 w-4 shrink-0" />
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
                  onClick={() => setIsMobileNavigationOpen(false)}
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

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
            <p className="font-medium text-sidebar-foreground">Tema</p>
            <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">
              Escolha entre dark e light. A preferência fica salva no navegador.
            </p>
            <ThemeToggle className="mt-3 border-white/10 bg-white/[0.04]" />
          </div>
        </aside>
      </div>
    </div>
  );
}
