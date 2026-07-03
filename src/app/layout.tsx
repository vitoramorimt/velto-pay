import type { Metadata } from "next";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { getCurrentUser } from "@/modules/auth/application/guards";
import { AuthProvider } from "@/modules/auth/presentation/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/brand/velto-pay-logo.jpeg",
  },
  title: "Velto Pay",
  description:
    "Plataforma SaaS de checkout e pagamentos para produtores digitais.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem={false}
        >
          <AuthProvider initialUser={user}>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
