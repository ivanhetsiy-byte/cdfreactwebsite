import type { Metadata, Viewport } from "next";

import { helvetica, montserrat } from "./fonts";
import { SiteShell } from "@/components/layout/site-shell";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { BagProvider } from "@/context/BagContext";
import { ThemeProvider } from "@/providers/theme-provider";
import {
  SITE_URL,
  SOCIAL_URL_LIST,
  STUDIO_CITY,
  STUDIO_EMAIL,
  STUDIO_PHONE_DISPLAY,
  STUDIO_POSTAL,
  STUDIO_REGION,
  STUDIO_STREET,
} from "@/lib/site-links";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";

const siteUrl = SITE_URL;
const siteDescription =
  "Dance studio offering competitive and recreational programs in ballet, jazz, gymnastics, and acrobatics.";

export const metadata: Metadata = {
  title: {
    default: "Childrens Dance Factory",
    template: "%s | Childrens Dance Factory",
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Childrens Dance Factory",
    title: "Childrens Dance Factory",
    description: siteDescription,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DanceSchool",
    name: "Childrens Dance Factory",
    url: siteUrl,
    description: siteDescription,
    email: STUDIO_EMAIL,
    telephone: STUDIO_PHONE_DISPLAY,
    address: {
      "@type": "PostalAddress",
      streetAddress: STUDIO_STREET,
      addressLocality: STUDIO_CITY,
      addressRegion: STUDIO_REGION,
      postalCode: STUDIO_POSTAL,
      addressCountry: "US",
    },
    sameAs: [...SOCIAL_URL_LIST],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${helvetica.variable} ${montserrat.variable} no-scrollbar`}
    >
      <body className="min-h-screen no-scrollbar">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="cdf-theme"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <BagProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
              >
                Skip to main content
              </a>
              <ScrollProvider>
                <SiteShell>{children}</SiteShell>
              </ScrollProvider>
            </BagProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
