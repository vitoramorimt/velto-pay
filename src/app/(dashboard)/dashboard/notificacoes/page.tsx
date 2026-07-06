import Link from "next/link";
import { BellRing, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getNotificationCenterData } from "@/modules/notifications/application/notification-use-cases";
import type { NotificationEventType } from "@/modules/notifications/domain/types";
import { NotificationList } from "@/modules/notifications/presentation/components/notification-list";
import { NotificationPreferencesPanel } from "@/modules/notifications/presentation/components/notification-preferences-panel";
import { cn } from "@/shared/utils/cn";

type NotificationsPageProps = {
  searchParams?: Promise<{
    tipo?: string;
  }>;
};

const filterItems: Array<{
  label: string;
  value: NotificationEventType | "all";
}> = [
  { label: "Todas", value: "all" },
  { label: "Vendas", value: "sale_approved" },
  { label: "Pix", value: "pix_created" },
  { label: "Pendentes", value: "payment_pending" },
  { label: "Recusadas", value: "payment_failed" },
  { label: "Reembolsos", value: "refund_created" },
  { label: "Chargebacks", value: "chargeback_created" },
];

function normalizeFilter(value?: string): NotificationEventType | "all" {
  const filter = filterItems.find((item) => item.value === value);

  return filter?.value ?? "all";
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;
  const filter = normalizeFilter(params?.tipo);
  const data = await getNotificationCenterData({ filter });

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Badge
          className="border-accent/25 bg-accent/10 text-accent"
          variant="outline"
        >
          <BellRing className="mr-1 h-3 w-3" />
          Central de notificações
        </Badge>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
              Notificações
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Acompanhe alertas de vendas, pagamentos, reembolsos e eventos
              financeiros da sua operação Velto Pay.
            </p>
          </div>
          <Card className="bg-card/80">
            <CardHeader className="pb-3">
              <CardDescription>Não lidas</CardDescription>
              <CardTitle className="text-3xl">{data.unreadCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <Card className="velto-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            Filtros
          </CardTitle>
          <CardDescription>
            Visualize seus alertas por tipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {filterItems.map((item) => (
              <Link
                className={cn(
                  "rounded-md border px-3 py-2 text-sm transition-all hover:border-accent/30 hover:bg-accent/10",
                  item.value === filter
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border/80 bg-background/60 text-muted-foreground",
                )}
                href={
                  item.value === "all"
                    ? "/dashboard/notificacoes"
                    : `/dashboard/notificacoes?tipo=${item.value}`
                }
                key={item.value}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <NotificationList
        notifications={data.notifications}
        unreadCount={data.unreadCount}
      />

      <NotificationPreferencesPanel preferences={data.preferences} />
    </div>
  );
}
