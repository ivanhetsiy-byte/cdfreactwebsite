import type { Metadata, Viewport } from "next";

import { helvetica, helveticaCompressed, montserrat } from "./fonts";
import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { FirstVisitLoader } from "@/components/loading/FirstVisitLoader";
import { ScrollProvider } from "@/components/providers/ScrollProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/providers/theme-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "CDF Website",
    template: "%s | CDF Website",
  },
  description: "CDF Website",
  metadataBase: new URL("https://example.com"),
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${helvetica.variable} ${helveticaCompressed.variable} ${montserrat.variable} no-scrollbar`}
    >
      <body className="min-h-screen no-scrollbar">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="cdf-theme"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              Skip to main content
            </a>
            <ScrollProvider>
              <FirstVisitLoader />
              <div className="relative w-full min-h-screen bg-white text-black dark:bg-black dark:text-white">
                <Navbar />
                {children}
                <Footer />
              </div>
              <BackToTop />
            </ScrollProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
