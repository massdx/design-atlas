import { DM_Mono, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

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
      lang="en"
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

