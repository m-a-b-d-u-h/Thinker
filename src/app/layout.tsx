import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1section",
  description: "Active learning platform",
};

import MainLayout from "@/components/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
