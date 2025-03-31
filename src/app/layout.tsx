import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster as Toast } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import QueryProvider from "@/context/query-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "StoreIt",
  description:
    "The only storage solution you need for safe and secure file storage/sharing.",
  icons: {
    icon: "/faviconcloud.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(`  antialiased`, outfit.variable)}>
        <QueryProvider>
          {children}

          <Toast />
          <Sonner />
        </QueryProvider>
      </body>
    </html>
  );
}
