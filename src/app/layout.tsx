import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Noto_Serif_SC, Noto_Sans_SC } from "next/font/google";
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

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const serifCn = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-cn",
  display: "swap",
});

const sansCn = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-cn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stylix — AI-Powered Jewelry Styling",
  description:
    "Luxury jewelry styling platform: AI stylist, virtual try-on, and intelligent matching for every occasion.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stylix.app"),
  openGraph: {
    title: "Stylix — AI-Powered Jewelry Styling",
    description:
      "Luxury jewelry styling platform: AI stylist, virtual try-on, and intelligent matching for every occasion.",
    siteName: "Stylix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stylix — AI-Powered Jewelry Styling",
    description:
      "Luxury jewelry styling platform: AI stylist, virtual try-on, and intelligent matching for every occasion.",
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
    <html lang="zh" className={`${serif.variable} ${sans.variable} ${serifCn.variable} ${sansCn.variable}`}>
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
