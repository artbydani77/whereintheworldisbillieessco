import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where In The World Is Billie Essco?",
  description: "Find him to unlock an unreleased listening experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grain-overlay" style={{ background: '#0f0500', overflow: 'hidden', width: '100vw', height: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
