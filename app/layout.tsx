import type { Metadata } from "next";
import { Geist, Fraunces, DM_Sans, JetBrains_Mono, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
const tiroDevanagari = Tiro_Devanagari_Hindi({ subsets: ["devanagari"], weight: "400", style: ["normal", "italic"], variable: "--font-tiro-devanagari", display: "swap" });

export const metadata: Metadata = {
  title: "NutriLog — Eat Well, Live Better.",
  description: "Track calories, macros and micronutrients. Built for Indian kitchens.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${geist.variable} ${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${tiroDevanagari.variable} h-full bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
