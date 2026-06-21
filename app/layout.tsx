import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Where In The World Is Billie Essco?",
  description: "Find him to unlock an unreleased listening experience.",
};

// Prevent mobile browser chrome resizing from shifting layout & invalidating rects
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="grain-overlay"
        style={{
          background: "#0f0500",
          overflow: "hidden",
          width: "100dvw",
          height: "100dvh",
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </body>
    </html>
  );
}
