import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const lexend = Lexend({
  variable: "--font-display",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SitRepO",
  description: "SitRepO: Barangay Disaster Situation Record Management and Situation Report Generation System.",
};

export const viewport: Viewport = {
  themeColor: "#285F5B",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${lexend.variable} ${sourceSans.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
