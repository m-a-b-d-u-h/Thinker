"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  Library,
  Highlighter,
  BookOpen,
  Target,
  User,
  Crown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import UserPopup from "@/components/UserPopup";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { name: "Explore", href: "/models", icon: Compass },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Favorites", href: "/favorites", icon: Library },
    { name: "Highlight", href: "/highlight", icon: Highlighter },
    { name: "Reflection", href: "/reflection", icon: BookOpen },
    { name: "Actions", href: "/actions", icon: Target },
  ];

  return (
    <nav className="w-full h-16 bg-[#020202] border-b border-white/3 fixed inset-x-0 z-50 flex items-center justify-between px-8 backdrop-blur">
      <div className="flex-1">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <img src="/1section.png" alt="1SECTION" className="h-6 w-auto" />
          <span className="text-[1rem] font-bold text-white tracking-[-0.02em]">1section</span>
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
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive ? 'text-white bg-white/5' : 'text-gray-400 hover:text-white'}`}>
                <Icon size={15} />
                <span>{link.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex-1 flex justify-end items-center gap-3">
        {user && user.subscriptionStatus && user.subscriptionStatus !== "FREE" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[0.6875rem] font-bold text-[#fbbf24]">
            <Crown size={12} />
            Pro
          </div>
        )}
        {user ? (
          <UserPopup />
        ) : (
          <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/8 text-gray-400 text-sm font-medium transition-colors hover:text-white hover:border-white/15 hover:bg-white/3">
            <User size={16} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
