"use client";

import { useEffect, useState } from "react";
import { Bell, Command, Menu, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const isDark = isMounted && resolvedTheme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <Button className="lg:hidden" size="icon" variant="ghost">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Abrir navegacao</span>
        </Button>

        <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-md border border-border/80 bg-card/70 px-3 py-2 text-sm text-muted-foreground shadow-sm md:flex">
          <Search className="h-4 w-4" />
          <span className="truncate">Buscar componentes, tokens e padroes</span>
          <kbd className="ml-auto inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        <Badge className="hidden sm:inline-flex" variant="success">
          Sprint 2
        </Badge>

        <Button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          size="icon"
          type="button"
          variant="outline"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="sr-only">Alternar tema</span>
        </Button>

        <Button size="icon" type="button" variant="outline">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificacoes</span>
        </Button>
      </div>
    </header>
  );
}
