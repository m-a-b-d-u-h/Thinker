"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      {!isLanding && <Navbar />}
      
      <main className={`flex-1 w-full ${isLanding ? '' : 'mt-16'}`}>
        {children}
      </main>

      <footer className="section border-t border-white/5 mt-16">
        <div className="container text-center text-muted text-sm">
          © 2026 1section Lab. All rights reserved.
        </div>
      </footer>
    </div>
  );
}