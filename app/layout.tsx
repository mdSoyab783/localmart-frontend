import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalMart - Your Local Shops Online",
  description: "Order from local shops in your area",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}