// src/app/leaderboard/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { RefreshCw, Search, ArrowUpDown } from "lucide-react";
import { useTheme } from "next-themes";


interface PodCredit {
  credits: number;
  pod_id: string;
}

interface PodInfo {
  address: string;
  pubkey: string;
  is_public: boolean;
  version: string;
}

export default function LeaderboardPage() {
  const [creditsData, setCreditsData] = useState<PodCredit[]>([]);
  const [podInfoMap, setPodInfoMap] = useState<Record<string, PodInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const podsPerPage = 20;

  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  const colorTheme = {
    leaderboardBg: darkMode ? "bg-zinc-900/30" : "bg-zinc-300/20",
    leaderboardText: darkMode ? "text-white" : "text-black",
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch credits
      const creditsRes = await fetch("/api/pod-credits");
      if (!creditsRes.ok) throw new Error("Failed to fetch credits");
      const creditsJson = await creditsRes.json();
      const creditsList: PodCredit[] = creditsJson.pods_credits || [];

      // Fetch pods list for IP/pubkey mapping
      const podsRes = await fetch("/api/get-pods-with-stats");
      if (!podsRes.ok) throw new Error("Failed to fetch pods");
      const podsJson = (await podsRes.json()).result;
      const podsList = podsJson.pods || [];

      // Build pubkey → pod info map
      const infoMap: Record<string, PodInfo> = {};
      podsList.forEach((pod: any) => {
        infoMap[pod.pubkey] = {
          address: pod.address,
          pubkey: pod.pubkey,
          is_public: pod.is_public,
          version: pod.version,
        };
      });
      setPodInfoMap(infoMap);

      // Sort by credits
      const sorted = creditsList.sort((a, b) => 
        sortOrder === "desc" ? b.credits - a.credits : a.credits - b.credits
      );
      setCreditsData(sorted);
    } catch (err) {
      setError("Failed to load leaderboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return creditsData;

    const query = searchQuery.toLowerCase();
    return creditsData.filter(pod => 
      pod.pod_id.toLowerCase().includes(query) ||
      podInfoMap[pod.pod_id]?.address.toLowerCase().includes(query)
    );
  }, [creditsData, searchQuery, podInfoMap]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * podsPerPage;
    return filteredData.slice(start, start + podsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / podsPerPage);

  const handleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    setCreditsData(prev => [...prev].sort((a, b) => 
      newOrder === "desc" ? b.credits - a.credits : a.credits - b.credits
    ));
    setCurrentPage(1);
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center">
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colorTheme.leaderboardText} bg-transparent  relative overflow-hidden`}>
      

      <div className="relative z-10 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold font-space-grotesk bg-gradient-to-r from-zinc-400 to-zinc-700 bg-clip-text text-transparent">
              Credits Leaderboard
            </h1>
            <p className="inconsolata mt-2">Top pNodes ranked by earned credits</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 inconsolata" size={18} />
              <input
                className="w-full rounded-full bg-zinc-900/50 pl-6 pr-8 py-2.5 text-sm border border-zinc-800/50 focus:border-cyan-500/50 focus:outline-none backdrop-blur-xl"
                placeholder="Search by Pubkey/IP"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSort}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800/50 hover:bg-zinc-800/50 transition"
              >
                <ArrowUpDown size={16} />
                <span className="text-sm">{sortOrder === "desc" ? "High → Low" : "Low → High"}</span>
              </button>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-800/50 hover:bg-zinc-800/50 transition"
              >
                <RefreshCw size={16} />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboard Table – Mobile Optimized */}
        <div className={`${colorTheme.leaderboardBg} backdrop-blur-xl rounded-md border border-zinc-800/50 overflow-hidden`}>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="py-4 px-6 font-medium inconsolata">Rank</th>
                  <th className="py-4 px-6 font-medium inconsolata">IP Address</th>
                  <th className="py-4 px-6 font-medium inconsolata">Pubkey</th>
                  <th className="py-4 px-6 font-medium inconsolata text-right">Credits</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((pod, index) => {
                  const rank = (currentPage - 1) * podsPerPage + index + 1;
                  const podInfo = podInfoMap[pod.pod_id];
                  const isTop3 = rank <= 3;

                  return (
                    <tr key={pod.pod_id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30 transition">
                      <td className="py-4 px-6">
                        <span className={`font-bold ${isTop3 ? "text-orange-400" : "inconsolata"}`}>
                          #{rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-md ">
                        {podInfo ? podInfo.address.split(":")[0] : "N/A"}
                      </td>
                      <td className="py-4 px-6 font-mono text-md tracking-wider break-all">
                        {pod.pod_id}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-xl">
                        {pod.credits.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {paginatedData.map((pod, index) => {
              const rank = (currentPage - 1) * podsPerPage + index + 1;
              const podInfo = podInfoMap[pod.pod_id];
              const isTop3 = rank <= 3;

              return (
                <div key={pod.pod_id} className="p-6 border-b border-zinc-800/30 last:border-0">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`font-bold text-lg ${isTop3 ? "text-orange-400" : "inconsolata"}`}>
                      #{rank}
                    </span>
                    <span className="font-bold text-2xl">{pod.credits.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="inconsolata">IP:</span>
                      <span className="ml-2 font-mono">{podInfo ? podInfo.address.split(":")[0] : "N/A"}</span>
                    </div>
                    <div>
                      <span className="inconsolata">Pubkey:</span>
                      <p className="font-mono break-all text-xs mt-1">{pod.pod_id}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
          <div className="text-sm inconsolata order-2 sm:order-1">
            Page {currentPage} of {totalPages} ({filteredData.length} total)
          </div>
          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 disabled:opacity-50 transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 disabled:opacity-50 transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}