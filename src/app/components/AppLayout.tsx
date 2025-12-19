// src/app/page.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Menu,
  Search,
  RefreshCw,
  Clock,
  Moon,
  Sun,
  Server,
  Database,
  Activity, Circle
} from "lucide-react";
import Sidebar from "@/app/components/Sidebar";
import { useTheme } from "next-themes";


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [darkMode, setDarkMode] = useState(true);
  const [xandPrice, setXandPrice] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";
  // Save colorTheme to localStorage when it changes
  // const toggleTheme = () => {
  //   const newMode = !darkMode;
  //   setDarkMode(newMode);
  //   localStorage.setItem("colorTheme", newMode ? "dark" : "light");
  // };

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=xandeum&vs_currencies=usd");
        const data = await res.json();
        if (data.xandeum?.usd) {
          setXandPrice(data.xandeum.usd.toFixed(6));
        }
      } catch (error) {
        console.error("Failed to fetch XAND price");
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 6000000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const colorTheme = {
    bg: darkMode ? "bg-black" : "bg-white",
    textMuted: darkMode ? "text-zinc-500" : "text-gray-500",
    textSecondary: darkMode ? "text-zinc-400" : "text-gray-600",
    border: darkMode ? "border-zinc-800/50" : "border-gray-200",
    cardBg: darkMode ? "bg-zinc-900/30" : "bg-white/60",
    sidebarBg: darkMode ? "bg-black/40" : "bg-white/80",
    navBg: darkMode ? "bg-black/20" : "bg-white/70",
    inputBg: darkMode ? "bg-zinc-900/50" : "bg-gray-100/80",
    hoverBg: darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-100",
    statBg: darkMode ? "bg-zinc-900/50" : "bg-gray-50/80",
  };

  return (
    <div className="relative min-h-screen">
      {/* Diagonal Split Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(150deg, ${
              darkMode ? "#0f172a" : "#e8c594"
            } 0%, ${
              darkMode ? "#0f172a" : "#ffffff"
            } 50%, ${
              darkMode ? "#1e3a8a" : "#3b82f6"
            } 50%, ${
              darkMode ? "#1e3a8a" : "#0a103a"
            } 100%)`,
          }}
        /> */}
        {/* <div
  className="absolute inset-0"
  style={{
    background: `linear-gradient(
      135deg,
      #0a0f2c 0%,
      #1c2b4a 18%,
      #3f6f6b 38%,
      #7b5a54 55%,
      #c98b4a 72%,
      #e3b062 85%,
    )`,
  }}
/> */}
      </div>

      <div
        className={`flex min-h-screen  font-geist ${colorTheme.bg} relative overflow-hidden transition-colors duration-300`}>

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div
            className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl ${darkMode ? "bg-cyan-500/10" : "bg-cyan-400/20"} animate-pulse`}
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl ${darkMode ? "bg-purple-500/10" : "bg-purple-400/20"} animate-pulse`}
            style={{ animationDuration: "6s", animationDelay: "1s" }}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl ${darkMode ? "bg-pink-500/5" : "bg-pink-400/15"} animate-pulse`}
            style={{ animationDuration: "10s", animationDelay: "2s" }}
          ></div>

          <div
            className={`absolute inset-0 ${darkMode ? "opacity-[0.015]" : "opacity-[0.03]"}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          // darkMode={darkMode}
          // toggleTheme={toggleTheme}
        />

        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* Top bar with only mobile menu button and title */}
          <div className="h-16 px-6 md:hidden flex items-center justify-between ${colorTheme.border} ${colorTheme.navBg} backdrop-blur-xl">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
              <Menu size={24} className={colorTheme.textSecondary} />
            </button>

          </div>



          {/* Main content */}
          <main className="flex-1 p-8 pt-0 overflow-auto">
            {children}
          </main>
        </div>

        <footer style={{ justifySelf: "anchor-center" }} className="fixed p-6 inset-x-0 bottom-0 h-16 bg-black/90 backdrop-blur-xl border border-zinc-100/50 z-50 flex">
          <div className="w-full max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6 ">
              <div className="flex items-center gap-2">
                <span>1 XAND →</span>
                <span className="text-green-400 font-medium">{xandPrice} USDT</span>
              </div>
              <a
                href="https://www.coingecko.com/en/coins/xandeum"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-400 font-medium rounded-lg transition shadow-lg shadow-orange-500/20"
              >
                Buy XAND
              </a>
            </div>

            <div className="flex items-center gap-6 text-zinc-500">
              <span>© 2025 Xandeum Analytics</span>
              <a href="https://docs.xandeum.network" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Docs
              </a>
              <a href="https://discord.gg/xandeum" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                Discord
              </a>
              <span>Powered by Xandeum</span>
            </div>
          </div>
        </footer>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}