import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-background">
      <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-6 py-16">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Velto Pay
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Bootstrap tecnico pronto para evoluir o MVP.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            Base Next.js 15 com TypeScript strict, Tailwind CSS, shadcn/ui,
            aliases, validacao de ambiente com Zod e clients Supabase iniciais.
          </p>
          <Button type="button">Fundacao tecnica</Button>
        </div>
      </section>
    </main>
  );
}
