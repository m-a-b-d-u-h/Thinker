"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function ModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const pathname = usePathname();
  const { slug } = React.use(params);

  const tabs = [
    { name: "Learning", path: `/models/${slug}` },
    { name: "Path", path: `/models/${slug}/path` },
    { name: "Reflection", path: `/models/${slug}/reflection` },
    { name: "Action", path: `/models/${slug}/action` },
    { name: "Quiz", path: `/models/${slug}/quiz` },
  ];

  return (
    <div>
      <div className="border-b border-white/[0.05]">
        <div className="mx-auto max-w-[1100px] px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/models" className="flex items-center gap-2 text-[#666] no-underline text-[0.875rem] hover:text-white transition-colors">
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Back to Library</span>
            </Link>
            <div className="flex gap-1 overflow-x-auto scrollbar-thin -mb-px pb-px">
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`shrink-0 px-3 md:px-4 py-2 no-underline text-[0.8125rem] rounded-lg transition-all ${
                      isActive ? 'text-white bg-white/[0.05]' : 'text-[#666] hover:text-white'
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
      {children}
    </div>
  );
}