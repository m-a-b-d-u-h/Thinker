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
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

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
          <img src="/1section.png" alt="1SECTION" className="h-7 w-auto" />
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

      <div className="flex-1 flex justify-end">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 rounded border border-white/8 text-gray-400 text-sm font-medium transition-colors hover:text-white hover:border-white/15 hover:bg-white/3">
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                {user.name?.[0] || user.email[0]}
              </div>
              <span>{user.name || user.email}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded text-gray-500 text-sm transition-colors hover:text-white cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
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
