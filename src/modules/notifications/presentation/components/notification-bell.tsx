"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/modules/notifications/application/notification-actions";
import type { NotificationListItem } from "@/modules/notifications/domain/types";
import { cn } from "@/shared/utils/cn";

type NotificationBellProps = {
  latest: NotificationListItem[];
  unreadCount: number;
};

function formatRelativeDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function NotificationBell({
  latest,
  unreadCount,
}: NotificationBellProps) {
  const [isPending, startTransition] = useTransition();

  function markAllAsRead() {
    startTransition(() => {
      void markAllNotificationsAsReadAction().then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
        }
      });
    });
  }

  function markAsRead(notificationId: string) {
    startTransition(() => {
      void markNotificationAsReadAction(notificationId).then((result) => {
        if (result.status === "error") {
          toast.error(result.message);
        }
      });
    });
  }

  return (
    <details className="group relative z-[75]">
      <summary className="relative flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-md border border-border/80 bg-card/80 text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Abrir notificações</span>
      </summary>

      <div className="absolute right-0 z-[80] mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-border/80 bg-popover/95 text-popover-foreground shadow-soft-lg backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border/80 p-3">
          <div>
            <p className="font-medium">Notificações</p>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}`
                : "Tudo em dia por aqui"}
            </p>
          </div>
          <Button
            disabled={isPending || unreadCount === 0}
            onClick={markAllAsRead}
            size="sm"
            type="button"
            variant="ghost"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Ler tudo
          </Button>
        </div>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {latest.length === 0 ? (
            <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Nenhuma notificação ainda. Quando uma venda ou pagamento mudar de
              status, o alerta aparecerá aqui.
            </div>
          ) : (
            latest.map((notification) => (
              <div
                className={cn(
                  "rounded-lg border p-3 transition-all hover:border-accent/25 hover:bg-accent/5",
                  notification.readAt
                    ? "border-border/70 bg-background/40"
                    : "border-accent/25 bg-accent/10",
                )}
                key={notification.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {notification.body}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {formatRelativeDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.readAt ? (
                    <Badge
                      className="shrink-0 border-accent/25 bg-accent/10 text-accent"
                      variant="outline"
                    >
                      Nova
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={notification.route}>
                      <ExternalLink className="h-4 w-4" />
                      Abrir
                    </Link>
                  </Button>
                  {!notification.readAt ? (
                    <Button
                      disabled={isPending}
                      onClick={() => markAsRead(notification.id)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Marcar como lida
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border/80 p-3">
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard/notificacoes">Ver central completa</Link>
          </Button>
        </div>
      </div>
    </details>
  );
}
