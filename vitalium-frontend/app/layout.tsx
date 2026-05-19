import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import { Providers } from "@/providers"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Vitalium - Plataforma de Comunicação em Saúde",
  description: "Conectando médicos e pacientes para um cuidado contínuo da saúde",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={dmSans.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
