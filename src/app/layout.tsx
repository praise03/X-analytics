import type { Metadata } from "next";
import "./globals.css";
import AppLayout from "@/app/components/AppLayout";
import { Providers } from "@/app/components/ThemeProvider";
import { Inter } from "next/font/google";
import { Inconsolata } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
});




export const metadata: Metadata = {
  title: "X-Analytics",
  description: "Dashboard for Xandeum Network built by @Light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={` ${inconsolata.variable} antialiased`}
      >
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
