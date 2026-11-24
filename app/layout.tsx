import type { Metadata } from "next"
import { Geist_Mono, Nunito_Sans, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import Navbar from "@/components/ui/navbar"

export const metadata: Metadata = {
  metadataBase: new URL("https://alke.dev"),
  title: {
    default: "Alke — Personal Portfolio & Blog",
    template: "%s | Alke",
  },
  description: "Personal portfolio, blog, and life updates.",
}

const spaceGroteskHeading = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading" })
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={cn("antialiased", fontMono.variable, "font-sans", nunitoSans.variable, spaceGroteskHeading.variable)}
    >
      <body className="overflow-x-clip">
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
