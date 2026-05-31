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
  ChevronLeft,
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
    { name: "Highlights", href: "/highlights", icon: Highlighter },
    { name: "Reflections", href: "/reflections", icon: BookOpen },
    { name: "Actions", href: "/actions", icon: Target },
  ];

  const pathSegments = pathname.split("/").filter(Boolean);
  const isModelPage = pathname.startsWith("/models/") && pathSegments.length >= 2;
  const isModelDetailPage = isModelPage && pathSegments.length === 2;
  const slug = pathSegments.length >= 2 ? pathSegments[1] : "";

  const modelTabs = [
    { name: "Learning", path: `/models/${slug}` },
    { name: "Path", path: `/models/${slug}/path` },
    { name: "Reflection", path: `/models/${slug}/reflection` },
    { name: "Action", path: `/models/${slug}/action` },
    { name: "Quiz", path: `/models/${slug}/quiz` },
  ];

  return (
    <>
      <nav className="w-full bg-bg border-b border-border-subtle sticky top-0 z-50 backdrop-blur">
        <div className="h-16 flex items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <img src="/1section.svg" alt="1SECTION" className="h-8 w-auto" />
            {user && user.subscriptionStatus && user.subscriptionStatus !== "FREE" && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-premium/10 border border-premium/20 text-[0.625rem] font-bold text-premium">
                Pro
              </div>
            )}
          </Link>

          <div className="hidden md:flex gap-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link key={link.name} href={link.href} className="no-underline">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${isActive ? 'text-fg bg-bg-elevated' : 'text-muted hover:text-fg'}`}>
                    <Icon size={15} />
                    <span>{link.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <UserPopup />
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-3 py-1.5 rounded border border-border text-muted text-sm font-medium transition-colors hover:text-fg hover:border-border-light hover:bg-bg-elevated">
                <User size={16} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>
        </div>

        {isModelPage && (
          <div className="border-t border-border-subtle">
            <div className="mx-auto max-w-[1100px] px-3 md:px-4">
              <div className="flex items-center justify-between gap-0.5 md:gap-1 overflow-x-auto scrollbar-thin py-1.5 md:py-2">
                <Link href="/models" className="shrink-0 flex items-center gap-1 text-muted-dark no-underline text-[0.875rem] hover:text-fg transition-colors">
                  <ChevronLeft size={14} className="md:size-4" />
                  <span className="hidden sm:inline text-[0.75rem] md:text-[0.8125rem]">Back to Library</span>
                  <span className="sm:hidden text-[0.75rem]">Back</span>
                </Link>
                <div className="flex items-center gap-0.5 md:gap-1">
                {modelTabs.map((tab) => {
                  const isActive = pathname === tab.path;
                  return (
                    <Link
                      key={tab.path}
                      href={tab.path}
                      className={`shrink-0 px-2 md:px-3 py-1 md:py-1.5 no-underline text-[0.7rem] md:text-[0.8125rem] rounded-lg transition-all ${
                        isActive ? 'text-fg bg-bg-elevated' : 'text-muted-dark hover:text-fg hover:bg-bg-elevated'
                      }`}
                    >
                      {tab.name}
                    </Link>
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {!isModelDetailPage && (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-bg border-t border-border-subtle md:hidden">
        <div className="flex items-center justify-around h-14">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.name} href={link.href} className="no-underline flex-1 flex justify-center">
                <div className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-fg' : 'text-muted-dark'}`}>
                  <Icon size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      )}
    </>
  );
}
