import Image from "next/image";

import { cn } from "@/lib/utils";

export function VeltoPayLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo.jpeg"
        alt="VeltoPay"
        width={56}
        height={56}
        className="size-14 shrink-0 rounded-xl object-cover"
      />
      <span className="text-3xl font-bold tracking-tight text-foreground">
        VeltoPay
      </span>
    </div>
  );
}
