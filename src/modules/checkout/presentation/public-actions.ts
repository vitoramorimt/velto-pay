"use server";

import { redirect } from "next/navigation";

import { publicCheckoutOrderSchema } from "@/modules/checkout/domain/schemas";
import { createCheckoutPaymentUseCase } from "@/modules/payments/application/payment-use-cases";

function getCheckoutRedirect(slug: string, status: "erro" | "pedido") {
  if (!slug) {
    return "/";
  }

  if (status === "pedido") {
    return `/pay/${slug}?pedido=criado`;
  }

  return `/pay/${slug}?erro=pedido`;
}

export async function createPendingCheckoutOrderAction(formData: FormData) {
  const rawSlug = String(formData.get("slug") ?? "");
  const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug) ? rawSlug : "";
  const parsedInput = publicCheckoutOrderSchema.safeParse({
    customerEmail: formData.get("customerEmail"),
    customerName: formData.get("customerName"),
    slug: rawSlug,
  });

  if (!parsedInput.success) {
    redirect(getCheckoutRedirect(safeSlug, "erro"));
  }

  let checkoutUrl: string | null = null;

  try {
    const paymentAttempt = await createCheckoutPaymentUseCase({
      checkoutSlug: parsedInput.data.slug,
      customer: {
        email: parsedInput.data.customerEmail,
        name: parsedInput.data.customerName,
      },
    });

    checkoutUrl = paymentAttempt.checkoutUrl;
  } catch {
    redirect(getCheckoutRedirect(parsedInput.data.slug, "erro"));
  }

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  redirect(getCheckoutRedirect(parsedInput.data.slug, "pedido"));
}
