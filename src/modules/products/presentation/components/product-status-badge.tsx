import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  PRODUCT_STATUS_DISPLAY_LABELS,
  type ProductStatus,
} from "@/modules/products/domain/types";

const statusVariants: Record<ProductStatus, BadgeProps["variant"]> = {
  active: "success",
  archived: "outline",
  draft: "warning",
  inactive: "muted",
};

type ProductStatusBadgeProps = {
  status: ProductStatus;
};

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {PRODUCT_STATUS_DISPLAY_LABELS[status]}
    </Badge>
  );
}
