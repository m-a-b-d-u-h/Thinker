"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Compass,
  LayoutDashboard,
  Library,
  Highlighter,
  BookOpen,
  User,
  Flame
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: "Explore", href: "/models", icon: Compass },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Collection", href: "/collection", icon: Library },
    { name: "Highlight", href: "/highlight", icon: Highlighter },
    { name: "Reflection", href: "/reflection", icon: BookOpen },
  ];

  return (
    <nav className="w-full h-16 bg-[#020202] border-b border-white/3 fixed inset-x-0 z-50 flex items-center justify-between px-8 backdrop-blur">
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-white no-underline">
          <Flame size={18} className="text-ff5f00" />
          <span>1SECTION</span>
        </Link>
      </div>

      <div className="flex gap-0.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className="no-underline"
            >
              <div className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'}`}>
                <span>{link.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex justify-end">
        <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/8 text-gray-400 text-sm font-medium transition-colors hover:text-white hover:border-white/15 hover:bg-white/3">
          <User size={16} />
          <span>Login</span>
        </Link>
      </div>
    </nav>
  );
}