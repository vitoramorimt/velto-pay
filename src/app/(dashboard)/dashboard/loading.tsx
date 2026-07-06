import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="mt-5 h-10 w-full max-w-md" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="velto-card p-6" key={index}>
            <div className="flex items-start justify-between gap-4">
              <div className="w-full">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-4 h-8 w-36" />
                <Skeleton className="mt-5 h-4 w-full" />
              </div>
              <Skeleton className="h-11 w-11 shrink-0" />
            </div>
          </div>
        ))}
      </section>

      <section className="velto-card p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        <Skeleton className="mt-6 h-80 w-full" />
      </section>
    </div>
  );
}
