import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stitch Story - Premium Boutique Jaipur",
  description:
    "Stitch Story - Premium Boutique Jaipur offers luxury tailoring with digital measurement vaults, bookings, lookbook customization, and atelier operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
