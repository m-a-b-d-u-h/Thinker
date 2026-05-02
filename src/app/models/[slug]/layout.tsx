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
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/models" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', textDecoration: 'none', fontSize: '0.875rem', transition: 'all 0.2s' }}>
              <ChevronLeft size={18} />
              <span>Back to Library</span>
            </Link>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    style={{
                      padding: '0.5rem 1rem',
                      color: isActive ? '#fff' : '#666',
                      textDecoration: 'none',
                      fontSize: '0.8125rem',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
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