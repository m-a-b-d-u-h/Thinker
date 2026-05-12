import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1section",
  description: "A thinking library of mental models, audio lessons, and knowledge graphs.",
  icons: {
    icon: "/1section.png",
    apple: "/1section.png",
    shortcut: "/1section.png",
  },
};

import MainLayout from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/1section.png" type="image/png" />
      </head>
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
