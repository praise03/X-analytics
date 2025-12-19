'use client';

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800/50 hover:bg-zinc-800/50 transition"
    >
      {theme === "dark" ? (
        <>
          <Sun size={16} className="text-amber-400" />
          <span className="text-sm">Light</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-indigo-400" />
          <span className="text-sm">Dark</span>
        </>
      )}
    </button>
  );
}