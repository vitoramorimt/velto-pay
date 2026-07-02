import Image from "next/image";

import { cn } from "@/shared/utils/cn";

type VeltoLogoProps = {
  className?: string;
  imageClassName?: string;
  labelClassName?: string;
  priority?: boolean;
  showLabel?: boolean;
  size?: number;
};

export function VeltoLogo({
  className,
  imageClassName,
  labelClassName,
  priority = false,
  showLabel = false,
  size = 40,
}: VeltoLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        alt="Logo da Velto Pay"
        className={cn("rounded-lg object-cover shadow-soft", imageClassName)}
        height={size}
        priority={priority}
        src="/brand/velto-pay-logo.jpeg"
        width={size}
      />
      {showLabel ? (
        <span className={cn("font-semibold leading-none", labelClassName)}>
          Velto Pay
        </span>
      ) : null}
    </div>
  );
}
