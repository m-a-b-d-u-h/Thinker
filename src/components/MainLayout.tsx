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

       <footer className="border-t border-white/5 mt-auto py-8">
         <div className="mx-auto w-full max-w-[1200px] px-6 text-center text-[0.875rem] text-[#444]">
           © 2026 1SECTION Lab. All rights reserved.
         </div>
       </footer>
    </div>
  );
}