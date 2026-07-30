import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../styles.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Cafe Milano — Premium POS & Billing System",
  description:
    "Modern point-of-sale and billing software for Cafe Milano. Manage tables, orders, and receipts with elegance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
