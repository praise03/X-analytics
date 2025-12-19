// src/components/Sidebar.tsx
'use client';

import { 
  X, 
  Server, 
  LayoutDashboard, 
  Monitor, 
  Activity, 
  Database, 
  Settings,
  Sun,
  Moon,
  Trophy
} from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";


interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  const colorTheme = {
    sidebarBg: darkMode ? "bg-black" : "bg-white",
    textSecondary: darkMode ? "text-zinc-400" : "text-black",
    hoverBg: darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-100",
    border: darkMode ? "border-gray-700" : "border-gray-200",
    textMuted: darkMode ? "text-zinc-500" : "text-gray-500",
  };
  const pathname = usePathname();

  return (
    <aside className={`fixed md:static inset-y-0 left-0 z-50 w-[260px] ${colorTheme.sidebarBg} backdrop-blur-xl ${colorTheme.border} border-r border-r-1 transform transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={`flex items-center gap-3 py-6 px-6 ${darkMode ? "" : "bg-teal-800"}`}>
          <div className=" h-9 d-xlflex items-center justify-center">
            <img src="/logo_edited.avif" alt="" />
          </div>
          {/* <span className="font-bold text-xl font-space-grotesk">Xandeum</span> */}
          <div className="flex-1"></div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={22} className={colorTheme.textSecondary} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 ">
          <Link
              href="//"
              className={`w-full flex items-center gap-3 py-4 px-4 d-xl transition ${
                pathname === "/"
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-black border border-cyan-500/20 font-medium"
                  : `${colorTheme.hoverBg} ${colorTheme.textSecondary} `
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/pnodes"
              className={`w-full flex items-center gap-3 py-4 px-4 mt-2 ${colorTheme.textSecondary} d-xl transition ${
                pathname === "/pnodes"
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 font-medium"
                  : `${colorTheme.hoverBg}`
              }`}
            >
              <Monitor size={18} />
              <span>All Nodes</span>
            </Link>
            <Link
              href="/about"
              className={`w-full flex items-center gap-3 py-4 px-4 mt-2  d-xl transition ${
                pathname === "/about"
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-black border border-cyan-500/20 font-medium"
                  : `${colorTheme.hoverBg} ${colorTheme.textSecondary} `
              }`}
            >
              <Activity size={18} />
              <span>Guide</span>
            </Link>
          <Link
              href="/leaderboard"
              className={`w-full flex items-center gap-3 py-4 px-4 mt-2  d-xl transition ${
                pathname === "/leaderboard"
                  ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10  border border-cyan-500/20 font-medium"
                  : `${colorTheme.hoverBg} ${colorTheme.textSecondary} `
              }`}
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </Link>
        </div>

        {/* Dark Mode Toggle at bottom */}
        <div className="px-4 py-4">
          <button
            onClick={() => setTheme(darkMode ? "light" : "dark")}
            className={`w-full cursor-pointer flex gap-3 py-4 px-4 d-xl ${colorTheme.hoverBg} ${colorTheme.textSecondary} hover:text-current transition`}
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-500" />}
            <span className="text-sm font-medium">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}