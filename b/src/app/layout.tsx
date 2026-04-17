import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultLocale, isLocale, LOCALE_COOKIE, isRTL, type Locale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Playfair_Display({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "OpenUGI — Uncensored General Intelligence Leaderboard",
    template: "%s · OpenUGI",
  },
  description:
    "Leaderboard of AI models ranked by Uncensored General Intelligence (UGI) and Willingness-to-answer (W/10) scores. Data from HuggingFace, refreshed hourly.",
  metadataBase: new URL("https://openugi.com"),
  openGraph: {
    title: "OpenUGI Leaderboard",
    description: "Track Uncensored General Intelligence (UGI) scores for 1000+ AI models.",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/images/logo.webp" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const messages = loadMessages(locale);

  return (
    <html lang={locale} dir={isRTL(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages as never}>
          <ThemeProvider>
            <TooltipProvider delayDuration={150}>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
