import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs'
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: "Glimpse",
  description: "Find Your Voice. Fund Your Vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${ibmPlexSans.variable} font-sans antialiased`}>
          <div id="root">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
