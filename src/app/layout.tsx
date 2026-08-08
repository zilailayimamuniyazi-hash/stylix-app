import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { CartProvider } from "@/lib/cart/CartContext";
import { WishlistProvider } from "@/lib/wishlist/WishlistContext";
import { OrderProvider } from "@/lib/order/OrderContext";
import { AnalyticsPageView } from "@/lib/analytics/AnalyticsPageView";
import { IdentityProfileSync } from "@/lib/identity/IdentityProfileSync";

export const metadata: Metadata = {
  title: "Stylix — Private Jewelry Maison",
  description:
    "A private jewelry maison where personal identity is quietly translated into a meaningful jewel.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stylix.app"),
  openGraph: {
    title: "Stylix — Private Jewelry Maison",
    description:
      "A private jewelry maison where personal identity is quietly translated into a meaningful jewel.",
    siteName: "Stylix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stylix — Private Jewelry Maison",
    description:
      "A private jewelry maison where personal identity is quietly translated into a meaningful jewel.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="min-h-screen font-sans">
        <I18nProvider>
          <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <OrderProvider>
                <AnalyticsPageView />
                <IdentityProfileSync />
                <SiteHeader />
                <main className="site-main">{children}</main>
                <SiteFooter />
              </OrderProvider>
            </WishlistProvider>
          </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
