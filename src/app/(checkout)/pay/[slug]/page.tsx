import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getPublicCheckoutBySlug,
  recordPublicCheckoutVisit,
} from "@/modules/checkout/application/checkout-use-cases";
import { CheckoutPixels } from "@/modules/checkout/presentation/components/checkout-pixels";
import { CheckoutTemplate } from "@/modules/checkout/presentation/components/checkout-template";
import { createPendingCheckoutOrderAction } from "@/modules/checkout/presentation/public-actions";

type PublicCheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    erro?: string;
    pedido?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_medium?: string;
    utm_source?: string;
    utm_term?: string;
    vlt_session?: string;
  }>;
};

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: PublicCheckoutPageProps) {
  const { slug } = await params;
  const checkout = await getPublicCheckoutBySlug(slug);
  const query = await searchParams;
  const requestHeaders = await headers();

  if (!checkout) {
    notFound();
  }

  await recordPublicCheckoutVisit(checkout, {
    referrer: requestHeaders.get("referer"),
    sessionId: query?.vlt_session ?? null,
    userAgent: requestHeaders.get("user-agent"),
    utm: {
      campaign: query?.utm_campaign ?? null,
      content: query?.utm_content ?? null,
      medium: query?.utm_medium ?? null,
      source: query?.utm_source ?? null,
      term: query?.utm_term ?? null,
    },
  });

  return (
    <>
      <CheckoutPixels pixels={checkout.pixels} />
      <CheckoutTemplate
        badges={checkout.badges}
        bannerUrl={checkout.bannerUrl}
        checkoutSlug={checkout.checkoutSlug}
        description={checkout.description}
        errorReason={query?.erro}
        formAction={createPendingCheckoutOrderAction}
        headline={checkout.headline}
        logoUrl={checkout.logoUrl}
        offerContent={checkout.offerContent}
        orderBumps={checkout.offers.orderBumps}
        primaryColor={checkout.primaryColor}
        product={checkout.product}
        securePurchaseEnabled={checkout.securePurchaseEnabled}
        showError={Boolean(query?.erro)}
        showSuccess={query?.pedido === "criado"}
        theme={checkout.theme}
        variant="public"
      />
    </>
  );
}
