import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  BrainCircuit,
  CreditCard,
  Home,
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
    label: "IA de Vendas",
  },
  {
    description: "Será habilitado na sprint de checkout.",
    icon: CreditCard,
    label: "Checkout",
    status: "soon",
  },
  {
    description: "Financeiro completo entra após checkout e pagamentos.",
    icon: WalletCards,
    label: "Financeiro",
    status: "soon",
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
