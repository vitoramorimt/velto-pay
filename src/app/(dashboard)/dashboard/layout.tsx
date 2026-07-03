import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

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
          <AppHeader />
          {children}
        </div>
      </div>
    </main>
  );
}
