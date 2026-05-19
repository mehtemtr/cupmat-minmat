import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { DynamicMeta } from "@/components/DynamicMeta";
import { ClerkProvider } from "@clerk/nextjs";
import { defaultLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/types";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GamificationManager } from "@/components/GamificationManager";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldcup2026.example.com";

async function getInitialLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" || value === "tr" ? value : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const dict = await getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    manifest: "/manifest.json",
    themeColor: "#04080e",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "MahTEM",
    },
    keywords: [
      "2026 World Championship",
      "World Championship",
      "USA",
      "Canada",
      "Mexico",
      "football",
      "soccer",
    ],
    authors: [{ name: "Statmatik" }],
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      alternateLocale: locale === "tr" ? ["en_US"] : ["tr_TR"],
      url: siteUrl,
      siteName: "StatMatik — 2026 World Championship & Math Playground",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: dict.meta.ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: "I7hQyzR4Viaqgrq3wltVNw7jbb06W46X6LmbYlOM7do",
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        en: siteUrl,
        tr: siteUrl,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getInitialLocale();

  return (
    <ClerkProvider>
      <html lang={locale} className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
        >
          <Providers initialLocale={locale}>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-GMHYYVM3BK"} />
            <DynamicMeta />
            <Header />
            <GamificationManager />
            <main>{children}</main>
            <Footer />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
