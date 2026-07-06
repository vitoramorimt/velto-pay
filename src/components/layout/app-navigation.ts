import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Boxes,
  BrainCircuit,
  CreditCard,
  Home,
  Landmark,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

export type AppNavigationItem = {
  description?: string;
  href?: string;
  icon: LucideIcon;
  label: string;
  status?: "soon";
};

export const appNavigationItems: AppNavigationItem[] = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Visão geral",
  },
  {
    href: "/dashboard/produtos",
    icon: Boxes,
    label: "Produtos",
  },
  {
    href: "/dashboard/ia-de-vendas",
    icon: BrainCircuit,
    label: "Assistente Comercial",
  },
  {
    href: "/dashboard/checkout",
    icon: CreditCard,
    label: "Checkout",
  },
  {
    href: "/dashboard/financeiro",
    icon: WalletCards,
    label: "Financeiro",
  },
  {
    href: "/dashboard/configuracoes/recebimentos",
    icon: Landmark,
    label: "Recebimentos",
  },
  {
    href: "/dashboard/notificacoes",
    icon: Bell,
    label: "Notificações",
  },
  {
    description: "Relatórios avançados entram depois dos primeiros eventos.",
    icon: BarChart3,
    label: "Análises",
    status: "soon",
  },
  {
    description: "Admin e KYC terão uma área dedicada.",
    icon: ShieldCheck,
    label: "Compliance",
    status: "soon",
  },
];
