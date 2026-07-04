import { notFound } from "next/navigation";

import { getPublicCheckoutBySlug } from "@/modules/checkout/application/checkout-use-cases";
import { CheckoutTemplate } from "@/modules/checkout/presentation/components/checkout-template";
import { createPendingCheckoutOrderAction } from "@/modules/checkout/presentation/public-actions";

type PublicCheckoutPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    erro?: string;
    pedido?: string;
  }>;
};

export default async function PublicCheckoutPage({
  params,
  searchParams,
}: PublicCheckoutPageProps) {
  const { slug } = await params;
  const checkout = await getPublicCheckoutBySlug(slug);
  const query = await searchParams;

  if (!checkout) {
    notFound();
  }

  return (
    <CheckoutTemplate
      checkoutSlug={checkout.checkoutSlug}
      formAction={createPendingCheckoutOrderAction}
      product={checkout.product}
      showError={query?.erro === "pedido"}
      showSuccess={query?.pedido === "criado"}
      variant="public"
    />
  );
}
