import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/application/auth-actions";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-background">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,hsl(var(--accent)/0.10),transparent_28rem),radial-gradient(circle_at_85%_8%,hsl(var(--foreground)/0.04),transparent_26rem)]" />
      <div className="relative flex min-h-dvh">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <AppHeader
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
          />
          {children}
        </div>
      </div>
    </main>
  );
}
