"use server";

import { redirect } from "next/navigation";

import { publicCheckoutOrderSchema } from "@/modules/checkout/domain/schemas";
import { createSupabaseServerClient } from "@/shared/supabase";

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_pending_checkout_order", {
    p_checkout_slug: parsedInput.data.slug,
    p_customer_email: parsedInput.data.customerEmail,
    p_customer_name: parsedInput.data.customerName,
  });

  if (error) {
    redirect(getCheckoutRedirect(parsedInput.data.slug, "erro"));
  }

  redirect(getCheckoutRedirect(parsedInput.data.slug, "pedido"));
}
