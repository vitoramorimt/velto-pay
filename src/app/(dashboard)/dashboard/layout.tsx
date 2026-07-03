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
      <div className="flex min-h-dvh">
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
