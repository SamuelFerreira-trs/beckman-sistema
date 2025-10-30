import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JR Beckman - Sistema de Gestão",
  description: "Sistema de gerenciamento de clientes e manutenções para JR Beckman Informática",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress ResizeObserver loop errors
              const resizeObserverErr = window.ResizeObserver;
              window.ResizeObserver = class ResizeObserver extends resizeObserverErr {
                constructor(callback) {
                  super((entries, observer) => {
                    requestAnimationFrame(() => {
                      callback(entries, observer);
                    });
                  });
                }
              };
              
              // Also catch any uncaught errors
              window.addEventListener('error', (e) => {
                if (e.message && e.message.includes('ResizeObserver')) {
                  e.stopImmediatePropagation();
                  return true;
                }
              });
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
