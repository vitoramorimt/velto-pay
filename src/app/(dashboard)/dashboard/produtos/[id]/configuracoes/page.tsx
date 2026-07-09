import { notFound } from "next/navigation";
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
    <div className="velto-page-shell py-0 sm:py-0">
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
