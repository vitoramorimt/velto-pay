import Link from "next/link";

import { VeltoLogo } from "@/components/brand/velto-logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthCardProps = {
  children: React.ReactNode;
  description: string;
  footer?: React.ReactNode;
  showBrand?: boolean;
  title: string;
};

export function AuthCard({
  children,
  description,
  footer,
  showBrand = false,
  title,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-white/10 bg-white/[0.045] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <CardHeader className="p-6">
        {showBrand ? (
          <VeltoLogo
            className="mb-4"
            imageClassName="h-14 w-14"
            priority
            size={56}
          />
        ) : null}
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        <CardDescription className="leading-6 text-slate-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {children}
        {footer ? (
          <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-slate-400">
            {footer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function AuthLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className="font-medium text-accent underline-offset-4 transition-colors hover:text-accent/80 hover:underline"
      href={href}
    >
      {children}
    </Link>
  );
}
