"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isModulePage = pathname.startsWith("/models/");

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg)" }}>
      {!isLanding && <Navbar />}
      
       <main className={`flex-1 w-full pb-14 md:pb-0 ${isLanding ? '' : 'mt-16'}`}>
        {children}
      </main>

       <footer className="border-t py-8 pb-14 md:pb-8" style={{ borderColor: "var(--border-subtle)" }}>
         <div className="mx-auto w-full max-w-[1200px] px-6 text-center text-sm" style={{ color: "var(--muted-dark)" }}>
           © {new Date().getFullYear()} 1SECTION Lab. All rights reserved.
         </div>
       </footer>
    </div>
  );
}