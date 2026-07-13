import type { Metadata } from "next";
import { Geist,  Cinzel, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});


// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});


export const metadata: Metadata = {
  title: "Hamilton Liquor Store | Baltimore, MD",
  description:
    "Shop wine, spirits, beer, and mixers at Hamilton Liquor Store on Harford Rd in Baltimore, MD. Weekly specials, staff picks, and easy in-store pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(cinzel.variable, "font-mono", jetbrainsMono.variable)}
    >

      <body>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
