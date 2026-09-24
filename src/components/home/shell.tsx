"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/home/sidebar";
import { TopBar } from "@/components/home/topbar";
import { HomeFooter } from "@/components/home/footer";
import { BottomNavigation } from "@/components/bottom-nav";
import { Toaster } from "@/components/toaster";

export function HomeShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#060814] text-white antialiased">
      {/* Subtle atmospheric ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-amber-500/[0.03] blur-[140px]" />
      </div>

      <div className="relative z-10 min-h-screen lg:pl-[228px]">
        <Sidebar />
        <MobileSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-h-screen flex-col">
          <TopBar onMenu={() => setMenuOpen(true)} />
          <main className="flex-1 pb-20 md:pb-16">{children}</main>
          <HomeFooter />
        </div>
      </div>

      <BottomNavigation />
      <Toaster />
    </div>
  );
}