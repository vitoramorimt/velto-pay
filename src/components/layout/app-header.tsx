"use client";

import { Bell, Command, LogOut, Menu, Search, UserCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/application/auth-actions";
import { useAuth } from "@/modules/auth/presentation/auth-provider";

export function AppHeader() {
  const { user } = useAuth();
  const userName = user?.fullName?.trim() || user?.email || "Conta Velto";
  const userEmail = user?.email ?? "Usuário autenticado";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button className="lg:hidden" size="icon" variant="ghost">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Abrir navegação</span>
        </Button>

        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-border/80 bg-card/70 px-3 py-2 text-sm text-muted-foreground shadow-sm md:flex">
          <Search className="h-4 w-4" />
          <span className="truncate">Buscar produtos, vendas e clientes</span>
          <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <Badge className="hidden sm:inline-flex" variant="success">
          MVP
        </Badge>

        <Badge
          className="hidden border-accent/30 bg-accent/10 text-accent sm:inline-flex"
          variant="outline"
        >
          Dark
        </Badge>

        <Button size="icon" type="button" variant="outline">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificações</span>
        </Button>

        <details className="group relative">
          <summary className="flex h-10 cursor-pointer list-none items-center gap-3 rounded-md border border-border/80 bg-card/70 px-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent group-hover:bg-accent-foreground/15 group-hover:text-accent-foreground">
              <UserCircle className="h-4 w-4" />
            </span>
            <span className="hidden max-w-40 truncate text-left font-medium md:block">
              {userName}
            </span>
          </summary>

          <div className="absolute right-0 mt-2 w-72 rounded-lg border border-border/80 bg-popover p-2 text-popover-foreground shadow-soft-lg">
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>

            <form action={signOutAction} className="mt-2">
              <Button
                className="w-full justify-start"
                type="submit"
                variant="ghost"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
