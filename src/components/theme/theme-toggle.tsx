"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";

const themeOptions = [
  {
    icon: Moon,
    label: "Dark",
    value: "dark",
  },
  {
    icon: Sun,
    label: "Light",
    value: "light",
  },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme ?? "dark") : "dark";

  return (
    <div
      aria-label="Selecionar tema"
      className={cn(
        "grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/50 p-1",
        className,
      )}
      role="group"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const active = currentTheme === option.value;

        return (
          <Button
            aria-pressed={active}
            className={cn(
              "h-8 px-2 text-xs",
              active
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground",
            )}
            disabled={!mounted}
            key={option.value}
            onClick={() => setTheme(option.value)}
            type="button"
            variant="ghost"
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
