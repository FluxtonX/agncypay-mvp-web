import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ThemeEnforcer from "@/components/ThemeEnforcer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AgncyPay | Secure Brand Invoice Payments & KYB Verification",
  description: "A verified brand payment platform for invoice management, business verification, and fast payment reconciliation. Secure Adidas invoices with AgncyPay.",
  icons: {
    icon: "/Alogo.jpg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const path = window.location.pathname;
                if (path === '/') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  localStorage.removeItem('agncypay_theme');
                  localStorage.removeItem('agncypay_theme_agency');
                  localStorage.setItem('theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
        <script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" async />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeEnforcer />
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
