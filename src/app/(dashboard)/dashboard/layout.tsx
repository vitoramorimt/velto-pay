import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/application/auth-actions";
import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { getNotificationHeaderData } from "@/modules/notifications/application/notification-use-cases";
import { NotificationBell } from "@/modules/notifications/presentation/components/notification-bell";
import { NotificationPermissionBanner } from "@/modules/notifications/presentation/components/notification-permission-banner";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuthenticatedUser("/dashboard");
  const notificationData = await getNotificationHeaderData().catch((error) => {
    console.error("[notifications] header data failed", error);

    return null;
  });

  return (
    <main className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--accent)/0.10),transparent_28rem),radial-gradient(circle_at_85%_8%,hsl(var(--foreground)/0.04),transparent_26rem)]" />
      <AppShell
        notificationSlot={
          notificationData ? (
            <NotificationBell
              latest={notificationData.latest}
              unreadCount={notificationData.unreadCount}
            />
          ) : null
        }
        signOutSlot={
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
        }
      >
        {notificationData ? (
          <NotificationPermissionBanner
            isPushAvailable={notificationData.isPushAvailable}
            publicKey={notificationData.publicKey}
          />
        ) : null}
        {children}
      </AppShell>
    </main>
  );
}
