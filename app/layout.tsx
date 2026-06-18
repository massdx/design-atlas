import { Analytics } from "@vercel/analytics/next";
import { DM_Mono, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://design-atlas.app";
const siteName = "Design Atlas";
const siteDescription =
  "Design Atlas réunit les  ressources, outils et inspirations sélectionnés par des designers, pour des designers et créateurs du web.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Design Atlas — Ressources utiles pour les créateurs du web",
    template: "%s — Design Atlas",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "design",
    "ressources design",
    "outils design",
    "inspiration design",
    "ressources designers",
    "créateurs web",
    "web design",
    "UI design",
    "UX design",
    "outils web",
    "design tools",
    "design resources",
    "curation design",
    "Design Atlas",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "design",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName,
    title: "Design Atlas — Ressources utiles pour les créateurs du web",
    description: siteDescription,
    images: [
      {
        url: "/open-graph.jpg",
        width: 1200,
        height: 630,
        alt: "Design Atlas — Ressources utiles pour les créateurs du web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Atlas — Ressources utiles pour les créateurs du web",
    description: siteDescription,
    creator: "@designatlas",
    images: ["/open-graph.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

const fontDmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable,
        fontSerif.variable,
        fontDmMono.variable,
      )}
    >
      <body suppressHydrationWarning className="min-h-screen  bg-[#E8E8E3] text-[#080807]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              inLanguage: "fr-FR",
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

