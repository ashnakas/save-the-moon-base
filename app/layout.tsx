import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Save the Moon Base",
  description: "Repair power, communications, and life support in an interactive lunar engineering mission.",
  icons: {
    icon: "/save-the-moon-base/favicon.svg",
    shortcut: "/save-the-moon-base/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
