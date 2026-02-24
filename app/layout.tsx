import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merge - Unified Integration API",
  description: "The unified API platform for your product integrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
