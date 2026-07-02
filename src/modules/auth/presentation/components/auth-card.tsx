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
    <Card className="w-full max-w-md">
      <CardHeader>
        {showBrand ? (
          <VeltoLogo
            className="mb-4"
            imageClassName="h-14 w-14"
            priority
            size={56}
          />
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        {footer ? (
          <div className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
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
      className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
      href={href}
    >
      {children}
    </Link>
  );
}
