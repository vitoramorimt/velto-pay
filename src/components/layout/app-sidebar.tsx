"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  BrainCircuit,
  CreditCard,
  Home,
  LifeBuoy,
  Settings,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { VeltoLogo } from "@/components/brand/velto-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/cn";

const navigationItems = [
  { label: "Overview", href: "/dashboard", icon: Home },
  { label: "Produtos", href: "/dashboard/produtos", icon: Boxes },
  {
    label: "IA de Vendas",
    href: "/dashboard/ia-de-vendas",
    icon: BrainCircuit,
  },
  { label: "Checkout", href: "#", icon: CreditCard },
  { label: "Financas", href: "#", icon: WalletCards },
  { label: "Analytics", href: "#", icon: BarChart3 },
  { label: "Compliance", href: "#", icon: ShieldCheck },
];

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
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href !== "#" &&
            (item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`));

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "text-sidebar-foreground/72 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-sidebar-foreground",
                isActive &&
                  "bg-sidebar-active text-sidebar-active-foreground shadow-inner-line",
              )}
              href={item.href}
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
            </Link>
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
