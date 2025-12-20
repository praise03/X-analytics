// src/app/pnodes/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, RefreshCw, Server, Clock } from "lucide-react";
import { useTheme } from "next-themes";


interface PodWithStats {
  address: string;
  is_public: boolean;
  last_seen_timestamp: number;
  pubkey: string;
  rpc_port: number;
  storage_committed: number;
  storage_usage_percent: number;
  storage_used: number;
  uptime: number;
  version: string;
}

export default function PNodesPage() {
  const [podsWithStats, setPodsWithStats] = useState<PodWithStats[]>([]);
  const [filteredPods, setFilteredPods] = useState<PodWithStats[]>([]);
  const [publicFilter, setPublicFilter] = useState<"all" | "public" | "private">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"storage" | "uptime" | "last_seen" | "none">("none");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";
  const nodesPerPage = 20;

  const fetchPodsWithStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setLoadingAuto(true);
      }
      const res = await fetch("/api/get-pods-with-stats", { method: "GET" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const pods: PodWithStats[] = data.result.pods || [];

      setPodsWithStats(pods);
      setFilteredPods(pods);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setLoadingAuto(false);
    }
  };

  useEffect(() => {
    fetchPodsWithStats(false);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchPodsWithStats(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPods(podsWithStats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = podsWithStats.filter((pod) => {
      return (
        pod.address.toLowerCase().includes(query)
      );
    });

    setFilteredPods(filtered);
    setCurrentPage(1);
  }, [searchQuery, podsWithStats]);

  useEffect(() => {
    let filtered = podsWithStats;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(pod =>
        pod.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pod.version.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Public/Private filter
    if (publicFilter === "public") {
      filtered = filtered.filter(pod => pod.is_public);
    } else if (publicFilter === "private") {
      filtered = filtered.filter(pod => !pod.is_public);
    }

    setFilteredPods(filtered);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [searchQuery, podsWithStats, publicFilter]);

  // Sorting
  const sortedAndPaginatedPods = useMemo(() => {
    let sorted = [...filteredPods];

    if (sortBy !== "none") {
      sorted.sort((a, b) => {
        let aVal: number = 0;
        let bVal: number = 0;

        if (sortBy === "storage") {
          aVal = a.storage_usage_percent;
          bVal = b.storage_usage_percent;
        } else if (sortBy === "uptime") {
          aVal = a.uptime;
          bVal = b.uptime;
        } else if (sortBy === "last_seen") {
          aVal = a.last_seen_timestamp;
          bVal = b.last_seen_timestamp;
        }

        return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
      });
    }

    const start = (currentPage - 1) * nodesPerPage;
    return sorted.slice(start, start + nodesPerPage);
  }, [filteredPods, sortBy, sortOrder, currentPage]);

  const getNodeStatus = (timestamp: number) => {
    const diff = Date.now() / 1000 - timestamp;
    if (diff < 60) return { label: "Online", color: "#06b6d4" };
    if (diff < 300) return { label: "Warning", color: "#f59e0b" };
    return { label: "Offline", color: "#ef4444" };
  };

  const formatLastSeen = (timestamp: number) => {
    const diff = Date.now() / 1000 - timestamp;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const colorTheme = {
    bg: darkMode ? "bg-transparent" : "bg-transparent",
    text: darkMode ? "text-zinc-500" : "text-black",
    textCard: darkMode ? "text-white" : "text-black",
    textMuted: darkMode ? "text-zinc-500" : "text-black",
    border: darkMode ? "border-zinc-800/50" : "border-zinc-800/50",
    cardBg: darkMode ? "bg-transparent" : "bg-transparent",
    bgIcon: darkMode ? "bg-gray-900/10" : "bg-zinc-200/40",
  };

  return (
    <div className="relative z-10 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className={`text-2xl font-bold font-space-grotesk bg-gradient-to-r from-white to-zinc-400 bg-clip-text ${colorTheme.textCard}`}>
            All pNodes ({podsWithStats.length})
          </h1>
          <p className="text-zinc-500 mt-2">View and monitor every node in the network</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              className={`w-full md:w-96 rounded-full ${colorTheme.textCard} bg-zinc-900/10 pl-11 pr-4 py-2.5 text-xs border border-zinc-800/50 focus:border-cyan-500/50 focus:outline-none backdrop-blur-xl`}
              placeholder="Search by IP Address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-6 py-2.5 cursor-pointer ${colorTheme.textCard} rounded-full border ${autoRefresh ? "bg-cyan-500/10 border-cyan-500/50" : "border-zinc-800/50"} transition`}
          >
            <RefreshCw size={16} className={autoRefresh ? "animate-spin text-cyan-400" : "text-zinc-400"} />
            <span className="text-xs">{autoRefresh ? "Auto On" : "Auto Off"}</span>
          </button>
        </div>
      </div>

      {/* Sorting & Pagination */}
      <div className="mb-4 space-y-6">
        {/* Sort & Filter Buttons */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-zinc-400 whitespace-nowrap">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              {(["storage", "uptime", "last_seen"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (sortBy === key) {
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                    } else {
                      setSortBy(key);
                      setSortOrder("desc");
                    }
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl cursor-pointer text-xs font-medium transition ${sortBy === key
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                    : "bg-zinc-900/80 border-zinc-800/50 text-zinc-200 hover:text-white"
                    } border`}
                >
                  {key === "storage" ? "Storage %" : key === "uptime" ? "Uptime" : "Last Seen"}
                  {sortBy === key && (sortOrder === "desc" ? " ↓" : " ↑")}
                </button>
              ))}

              <button
                onClick={() => setPublicFilter("public")}
                className={`px-4 py-2 rounded-xl cursor-pointer text-xs font-medium transition ${publicFilter === "public"
                  ? "bg-green-500/20 border-green-500/50 text-green-400"
                  : "bg-zinc-900/80 border-zinc-800/50 text-zinc-200 hover:text-white"
                  } border`}
              >
                Public
              </button>
              <button
                onClick={() => setPublicFilter("private")}
                className={`px-4 py-2 rounded-xl cursor-pointer text-xs font-medium transition ${publicFilter === "private"
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                  : "bg-zinc-900/80 border-zinc-800/50 text-zinc-200 hover:text-white"
                  } border`}
              >
                Private
              </button>
              <button
                onClick={() => {
                  setSortBy("none");
                  setCurrentPage(1);
                  setPublicFilter("all");
                }}
                className="px-4 py-2 cursor-pointer rounded-xl text-xs bg-zinc-800/40 border-zinc-900/50 text-white hover:text-white transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Pagination – Centered on mobile, right-aligned on desktop */}
        <div className="flex justify-center md:justify-end items-center gap-3">
          <span className="text-xs text-zinc-400">
            Page {currentPage} of {Math.ceil(filteredPods.length / nodesPerPage)}
          </span>
          <div className={`flex ${colorTheme.textCard} gap-2`}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/10 border border-zinc-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(filteredPods.length / nodesPerPage)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900/10 border border-zinc-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Node Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-zinc-800 border-t-cyan-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedAndPaginatedPods.map((pod) => {
            const status = getNodeStatus(pod.last_seen_timestamp);
            const uptimeDays = Math.floor(pod.uptime / 86400);
            const storagePercent = (pod.storage_used);

            return (
              <a
                key={pod.address}
                href={`/node/${encodeURIComponent(pod.address.split(':')[0])}`}
                className="group relative bg-transparent backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at top right, ${status.color}15, transparent 70%)` }}
                ></div>

                <div className={`relative z-10> `}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colorTheme.bgIcon} flex items-center justify-center group-hover:bg-cyan-500/10 transition`}>
                        <Server size={20} className="text-cyan-400" />
                      </div>
                      {/* <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: status.color }}></div> */}
                    </div>
                    <span className={`text-xs px-3 py-1.5 backdrop-blur-xl rounded-full ${colorTheme.bgIcon} ${colorTheme.text} font-mono}`}>
                      {pod.version}
                    </span>
                  </div>

                  <h3 className={`font-mono text-md font-medium mb-3 group-hover:text-cyan-400 ${colorTheme.textCard}`}>
                    {pod.address}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Clock size={12} />
                    <span>{formatLastSeen(pod.last_seen_timestamp)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Storage</span>
                        <span className="font-medium">{storagePercent}%</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                        <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${storagePercent}%` }} />
                      </div> */}
                    <div className={`flex justify-between text-xs ${colorTheme.textMuted}`}>
                      <span className="">Storage</span>
                      <span className="font-medium">
                        {formatBytes(pod.storage_used)} used of {formatBytes(pod.storage_committed)}
                      </span>
                    </div>

                    <div className={`flex justify-between text-xs ${colorTheme.textMuted}`}>
                      <span className="">Uptime</span>
                      <span className="font-medium">{uptimeDays} days</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: uptimeDays > 30 ? "100%" : `${(uptimeDays / 30) * 100}%` }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Visibility</span>
                      <span className="text-xs font-semibold" style={{ color: pod.is_public ? "green" : "brown" }}>
                        {pod.is_public ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {filteredPods.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
          <Server size={64} className="opacity-50 mb-4" />
          <p className="text-lg">No nodes found</p>
          <p className="text-xs mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}