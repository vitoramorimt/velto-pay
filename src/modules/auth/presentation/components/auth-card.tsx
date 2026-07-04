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
    <Card className="w-full max-w-[27rem] overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.038))] text-slate-100 shadow-[0_34px_120px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="h-px bg-[linear-gradient(90deg,transparent,rgba(25,205,139,0.62),transparent)]" />
      <CardHeader className="items-center p-6 pb-5 text-center sm:p-7 sm:pb-5">
        {showBrand ? (
          <VeltoLogo
            className="mb-3 justify-center"
            imageClassName="h-14 w-14 rounded-md shadow-[0_0_44px_rgba(25,205,139,0.16)]"
            labelClassName="text-base text-white"
            priority
            showLabel
            size={56}
          />
        ) : null}
        <CardTitle className="text-2xl text-white sm:text-[1.7rem]">
          {title}
        </CardTitle>
        <CardDescription className="max-w-sm leading-6 text-slate-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 sm:p-7 sm:pt-0">
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
