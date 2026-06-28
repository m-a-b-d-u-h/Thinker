"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="flex h-dvh flex-col">
      {!isLanding && <Navbar />}
      
       <main className="flex-1 w-full pb-14 md:pb-0 overflow-y-auto">
        {children}
      </main>

        {isLanding && (
          <footer className="border-t border-border-subtle mt-auto py-8 pb-14 md:pb-8">
            <div className="mx-auto w-full max-w-[1200px] px-6 text-center text-[0.875rem] text-muted-dark">
              1section.com
            </div>
          </footer>
        )}
    </div>
  );
}