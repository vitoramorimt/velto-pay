"use server";

import { redirect } from "next/navigation";

import { publicCheckoutOrderSchema } from "@/modules/checkout/domain/schemas";
import { createCheckoutPaymentUseCase } from "@/modules/payments/application/payment-use-cases";

function getCheckoutRedirect(
  slug: string,
  status: "configuracao" | "erro" | "pedido",
) {
  if (!slug) {
    return "/";
  }

  if (status === "pedido") {
    return `/pay/${slug}?pedido=criado`;
  }

  if (status === "configuracao") {
    return `/pay/${slug}?erro=configuracao`;
  }

  return `/pay/${slug}?erro=pedido`;
}

function isPaymentConfigurationError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /STRIPE_|PAYMENT_|configur|gateway|provider/i.test(error.message);
}

function getOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}

export async function createPendingCheckoutOrderAction(formData: FormData) {
  const rawSlug = String(formData.get("slug") ?? "");
  const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug) ? rawSlug : "";
  const parsedInput = publicCheckoutOrderSchema.safeParse({
    couponCode: formData.get("couponCode"),
    customerEmail: formData.get("customerEmail"),
    customerName: formData.get("customerName"),
    orderBumpIds: formData.getAll("orderBumpIds").map(String),
    slug: rawSlug,
    utmCampaign: getOptionalString(formData.get("utmCampaign")),
    utmContent: getOptionalString(formData.get("utmContent")),
    utmMedium: getOptionalString(formData.get("utmMedium")),
    utmSource: getOptionalString(formData.get("utmSource")),
    utmTerm: getOptionalString(formData.get("utmTerm")),
  });

  if (!parsedInput.success) {
    redirect(getCheckoutRedirect(safeSlug, "erro"));
  }

  let checkoutUrl: string | null = null;

  try {
    const paymentAttempt = await createCheckoutPaymentUseCase({
      checkoutSlug: parsedInput.data.slug,
      couponCode: parsedInput.data.couponCode,
      customer: {
        email: parsedInput.data.customerEmail,
        name: parsedInput.data.customerName,
      },
      orderBumpIds: parsedInput.data.orderBumpIds,
      tracking: {
        utmCampaign: parsedInput.data.utmCampaign,
        utmContent: parsedInput.data.utmContent,
        utmMedium: parsedInput.data.utmMedium,
        utmSource: parsedInput.data.utmSource,
        utmTerm: parsedInput.data.utmTerm,
      },
    });

    checkoutUrl = paymentAttempt.checkoutUrl;
  } catch (error) {
    console.error("[checkout] createPendingCheckoutOrderAction failed", {
      error,
      slug: parsedInput.data.slug,
    });

    if (isPaymentConfigurationError(error)) {
      redirect(getCheckoutRedirect(parsedInput.data.slug, "configuracao"));
    }

    redirect(getCheckoutRedirect(parsedInput.data.slug, "erro"));
  }

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }

  redirect(getCheckoutRedirect(parsedInput.data.slug, "pedido"));
}
