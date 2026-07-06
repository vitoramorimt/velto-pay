import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { PwaRegistrar } from "@/components/pwa/pwa-registrar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { getCurrentUser } from "@/modules/auth/application/guards";
import { AuthProvider } from "@/modules/auth/presentation/auth-provider";

import "./globals.css";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Velto Pay",
  },
  applicationName: "Velto Pay",
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/brand/velto-pay-logo.jpeg",
  },
  manifest: "/manifest.webmanifest",
  title: "Velto Pay",
  description:
    "Plataforma SaaS de checkout e pagamentos para produtores digitais.",
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    {
      color: "#03100a",
      media: "(prefers-color-scheme: dark)",
    },
    {
      color: "#f8fafc",
      media: "(prefers-color-scheme: light)",
    },
  ],
  viewportFit: "cover",
  width: "device-width",
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
            <PwaRegistrar />
            <Toaster richColors closeButton position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
