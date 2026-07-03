import "server-only";

import { requireAuthenticatedUser } from "@/modules/auth/application/guards";
import { createCheckoutUrl } from "@/modules/checkout/domain/links";
import type {
  CheckoutLink,
  PublicCheckoutProduct,
} from "@/modules/checkout/domain/types";
import {
  findPublicCheckoutProductBySlug,
  listCheckoutProductsByProducerId,
} from "@/modules/checkout/infrastructure/checkout.repository";
import { findProducerByUserId } from "@/modules/products/infrastructure/products.repository";
import { createSupabaseServerClient } from "@/shared/supabase";

export type CheckoutLinksPageData =
  | {
      state: "missing_producer";
      links: [];
    }
  | {
      state: "ready";
      links: CheckoutLink[];
    };

function toCheckoutStatus(status: CheckoutLink["product"]["status"]) {
  if (status === "active") {
    return "published" as const;
  }

  if (status === "inactive" || status === "archived") {
    return "disabled" as const;
  }

  return "draft" as const;
}

export async function getCheckoutLinksPageData(): Promise<CheckoutLinksPageData> {
  const user = await requireAuthenticatedUser("/dashboard/checkout");
  const supabase = await createSupabaseServerClient();
  const producer = await findProducerByUserId(supabase, user.id);

  if (!producer) {
    return {
      links: [],
      state: "missing_producer",
    };
  }

  const products = await listCheckoutProductsByProducerId(
    supabase,
    producer.id,
  );

  return {
    links: products.map((product) => ({
      checkoutId: null,
      checkoutStatus: toCheckoutStatus(product.status),
      checkoutUpdatedAt: product.updated_at,
      link: createCheckoutUrl(product.slug),
      product,
    })),
    state: "ready",
  };
}

export async function getPublicCheckoutBySlug(
  slug: string,
): Promise<PublicCheckoutProduct | null> {
  const supabase = await createSupabaseServerClient();

  return findPublicCheckoutProductBySlug(supabase, slug);
}
