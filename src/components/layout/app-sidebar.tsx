import {
  BarChart3,
  Boxes,
  CreditCard,
  Home,
  LifeBuoy,
  Settings,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

const navigationItems = [
  { label: "Overview", icon: Home, active: true },
  { label: "Produtos", icon: Boxes },
  { label: "Checkout", icon: CreditCard },
  { label: "Financas", icon: WalletCards },
  { label: "Analytics", icon: BarChart3 },
  { label: "Compliance", icon: ShieldCheck },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-dvh w-72 shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Velto Pay</p>
          <p className="mt-1 text-xs text-sidebar-foreground/55">
            Design System
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              className={cn(
                "text-sidebar-foreground/72 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
                item.active &&
                  "bg-sidebar-active text-sidebar-active-foreground shadow-inner-line",
              )}
              href="#"
              key={item.label}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.label === "Checkout" ? (
                <Badge
                  className="ml-auto bg-white/10 text-[10px] text-white"
                  variant="outline"
                >
                  UI
                </Badge>
              ) : null}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LifeBuoy className="h-4 w-4 text-accent" />
          Suporte visual
        </div>
        <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">
          Componentes consistentes para fluxos de checkout, operacao e
          analytics.
        </p>
      </div>

      <a
        className="text-sidebar-foreground/72 mt-3 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-sidebar-foreground"
        href="#"
      >
        <Settings className="h-4 w-4" />
        Preferencias
      </a>
    </aside>
  );
}
