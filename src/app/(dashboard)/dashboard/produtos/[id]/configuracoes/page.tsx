import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOfferCenterPageData } from "@/modules/offers/application/offer-center-use-cases";
import { OfferCreationCenter } from "@/modules/offers/presentation/components/offer-creation-center";

type ProductSettingsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ProductSettingsPage({
  params,
}: ProductSettingsPageProps) {
  const { id } = await params;

  if (!uuidRegex.test(id)) {
    notFound();
  }

  const data = await getOfferCenterPageData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="velto-page-shell">
      <section className="velto-page-hero">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Badge
              className="border-accent/25 bg-accent/10 text-accent"
              variant="outline"
            >
              <Sparkles className="mr-1 size-3" />
              Centro de criação de oferta
            </Badge>
            <h1 className="mt-4 break-words text-3xl font-semibold tracking-normal sm:text-4xl">
              {data.product.name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Configure produto, checkout, conversão, pagamento e publicação no
              mesmo fluxo com autosave e preview ao vivo.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/produtos">
              <ArrowLeft />
              Voltar
            </Link>
          </Button>
        </div>
      </section>

      <OfferCreationCenter
        checkout={data.checkout}
        conversion={data.conversion}
        paymentSimulation={data.paymentSimulation}
        product={data.product}
        productId={id}
        publicLink={data.publicLink}
      />
    </div>
  );
}
