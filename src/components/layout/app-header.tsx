"use client";

import type { ReactNode } from "react";
import { ChevronDown, Menu, UserCircle } from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/modules/auth/presentation/auth-provider";

type AppHeaderProps = {
  isMobileNavigationOpen?: boolean;
  notificationSlot?: ReactNode;
  onOpenMobileNavigation?: () => void;
  signOutSlot?: ReactNode;
};

export function AppHeader({
  isMobileNavigationOpen = false,
  notificationSlot,
  onOpenMobileNavigation,
  signOutSlot,
}: AppHeaderProps) {
  const { user } = useAuth();
  const userName = user?.fullName?.trim() || user?.email || "Conta Velto";
  const userEmail = user?.email ?? "Usuário autenticado";

  return (
    <header className="velto-app-header bg-background/90 sticky top-0 z-[70] border-b border-border/70 backdrop-blur-2xl">
      <div className="flex h-16 min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Button
          aria-controls="velto-mobile-navigation"
          aria-expanded={isMobileNavigationOpen}
          className="border border-border/70 bg-card/70 shadow-sm lg:hidden"
          onClick={onOpenMobileNavigation}
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
            Acompanhe produtos, checkouts e sinais financeiros em tempo real.
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

        {notificationSlot}
        <ThemeToggle className="hidden sm:grid" />
        <details className="group relative z-[75]">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-border/80 bg-card/80 px-2.5 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/20 bg-accent/10 text-accent">
              <UserCircle className="h-4 w-4" />
            </span>
            <span className="hidden max-w-40 truncate text-left font-medium md:block">
              {userName}
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground transition-transform group-open:rotate-180 md:block" />
          </summary>

          <div className="absolute right-0 z-[80] mt-2 w-[min(18rem,calc(100vw-1rem))] rounded-lg border border-border/80 bg-popover/95 p-2 text-popover-foreground shadow-soft-lg backdrop-blur-xl">
            <div className="rounded-md border border-border/70 bg-muted/50 px-3 py-2">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            {signOutSlot}
          </div>
        </details>
      </div>
    </header>
  );
}
