import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { MOCK_SESSION_ID } from "@/infrastructure/repositories/mock-checkout-session-repository";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 text-center">
      <h1 className="text-2xl font-semibold">VeltoPay</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Plataforma de checkout/gateway de pagamentos. Esta é a página inicial de
        desenvolvimento — o site institucional vive em outro projeto.
      </p>
      <Link href={`/checkout/${MOCK_SESSION_ID}`} className={cn(buttonVariants())}>
        Ver checkout de exemplo
      </Link>
    </main>
  );
}
