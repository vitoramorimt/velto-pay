"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/modules/notifications/application/notification-actions";
import type { NotificationListItem } from "@/modules/notifications/domain/types";
import { cn } from "@/shared/utils/cn";

type NotificationListProps = {
  notifications: NotificationListItem[];
  unreadCount: number;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const [isPending, startTransition] = useTransition();

  function markAll() {
    startTransition(() => {
      void markAllNotificationsAsReadAction().then((result) => {
        if (result.status === "success") {
          toast.success(result.message);
          return;
        }

        toast.error(result.message);
      });
    });
  }

  function markOne(notificationId: string) {
    startTransition(() => {
      void markNotificationAsReadAction(notificationId).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
        }
      });
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          description="Alertas de vendas, pagamentos e financeiro aparecerão aqui assim que existirem eventos reais."
          icon={Bell}
          title="Nenhuma notificação encontrada"
        />
        <Button asChild className="w-full sm:w-auto" variant="outline">
          <Link href="/dashboard">Voltar ao dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {unreadCount > 0
            ? `${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}`
            : "Todas as notificações foram lidas."}
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={isPending || unreadCount === 0}
          onClick={markAll}
          type="button"
          variant="outline"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Marcar todas como lidas
        </Button>
      </div>

      <div className="grid gap-3">
        {notifications.map((notification) => (
          <article
            className={cn(
              "rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:border-accent/25",
              notification.readAt
                ? "border-border/80 bg-card/70"
                : "border-accent/25 bg-accent/10",
            )}
            key={notification.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">
                    {notification.title}
                  </h2>
                  {!notification.readAt ? (
                    <Badge
                      className="border-accent/25 bg-accent/10 text-accent"
                      variant="outline"
                    >
                      Nova
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {notification.body}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={notification.route}>
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </Link>
                </Button>
                {!notification.readAt ? (
                  <Button
                    disabled={isPending}
                    onClick={() => markOne(notification.id)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Check className="h-4 w-4" />
                    Lida
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
