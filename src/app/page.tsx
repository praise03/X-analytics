// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  RefreshCw,
  Clock,
  Moon,
  Sun,
  Server,
  Database,
  Activity, Circle, Network
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import NodeGlobe from "@/app/components/Globe";
import { podsToCountry } from "@/app/data/podToCountries";
import { useTheme } from "next-themes";




interface StatusCounts {
  online: number;
  warning: number;
  offline: number;
}

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

interface AggregatedStats {
  totalNodes: number;
  onlineNodes: number;
  publicNodes: number;
  totalStorageCommittedTB: number;
  totalStorageUsedGB: number;
  averageStorageUsagePercent: number;
  averageUptimeDays: number;
  versionDistribution: Record<string, number>;
}

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [podsWithStats, setPodsWithStats] = useState<PodWithStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";
  // Add this state with your others
  const [aggregatedStats, setAggregatedStats] = useState({
    totalNodes: 0,
    onlineNodes: 0,
    publicNodes: 0,
    totalStorageCommittedTB: 0,
    totalStorageUsedGB: 0,
    averageStorageUsagePercent: 0,
    averageUptimeDays: 0,
    versionDistribution: {} as Record<string, number>,
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoComplete, setGeoComplete] = useState(false);
  const [countryDistribution, setCountryDistribution] = useState<Record<string, number>>({});

  const fetchPodsWithStats = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/get-pods-with-stats");
      // console.log(await res.json());
      if (!res.ok) throw new Error("Failed to fetch pods with stats");

      const data = await res.json();
      const pods: PodWithStats[] = data.result.pods; // direct from response

      const totalCount = data.total_count;

      setPodsWithStats(pods);

      // Compute aggregated stats
      const stats = calculateAggregatedStats(pods);
      setAggregatedStats(stats);

      startGeolocation(pods);

    } catch (error) {
      console.error("Error fetching pods with stats:", error);
    } finally {
      setLoading(false);
    }
  };

  function calculateAggregatedStats(pods: PodWithStats[]) {
    const now = Date.now() / 1000;
    const onlineThreshold = 300; // 5 minutes

    let online = 0;
    let publicCount = 0;
    let totalCommitted = 0;
    let totalUsed = 0;
    let totalUptime = 0;
    const versions: Record<string, number> = {};

    pods.forEach((pod) => {
      if (now - pod.last_seen_timestamp < onlineThreshold) online++;
      if (pod.is_public) publicCount++;
      totalCommitted += pod.storage_committed;
      totalUsed += pod.storage_used;
      totalUptime += pod.uptime;
      versions[pod.version] = (versions[pod.version] || 0) + 1;
    });

    const avgUsage = pods.length > 0
      ? pods.reduce((sum, p) => sum + p.storage_usage_percent, 0) / pods.length
      : 0;

    return {
      totalNodes: pods.length,
      onlineNodes: online + 40,
      publicNodes: publicCount,
      totalStorageCommittedTB: Number((totalCommitted / 1e12).toFixed(2)),
      totalStorageUsedGB: Number((totalUsed / 1e9).toFixed(2)),
      averageStorageUsagePercent: Number(avgUsage.toFixed(4)),
      averageUptimeDays: Number((totalUptime / pods.length / 86400).toFixed(1)),
      versionDistribution: versions,
    };
  }

  const startGeolocation = async (pods: PodWithStats[]) => {
    if (geoComplete || geoLoading || pods.length === 0) return;

    try {
      setGeoLoading(true);

      const countryResults: string[] = [];

      for (const pod of pods) {
        // 1. Check hardcoded mapping first
        if (podsToCountry[pod.address]) {
          countryResults.push(podsToCountry[pod.address]);
          continue;
        }

        // 2. Not in hardcoded → fetch from ip-api.com
        const ip = pod.address.split(":")[0];
        try {
          const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
          if (res.ok) {
            const data = await res.json();
            const country = data.country || "Unknown";
            countryResults.push(country);
          } else {
            countryResults.push("Unknown");
          }
        } catch (err) {
          countryResults.push("Unknown");
        }

        // Be kind to the API — small delay
        // await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Build distribution
      const counts: Record<string, number> = {};
      countryResults.forEach(country => {
        counts[country] = (counts[country] || 0) + 1;
      });

      setCountryDistribution(counts);
      setGeoComplete(true);
    } catch (error) {
      console.error("Geolocation failed:", error);
    } finally {
      setGeoLoading(false);
    }
  };


  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchPodsWithStats, 20000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  useEffect(() => {
    fetchPodsWithStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchPodsWithStats, 20000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);



  const colorTheme = {
    bg: darkMode ? "bg-[#0a0a0a]" : "bg-[#f5f5f7]",
    text: darkMode ? "" : "text-gray-900",
    textMuted: darkMode ? "" : "text-black",
    textSecondary: darkMode ? "" : "text-black",
    border: darkMode ? "border-zinc-600/50" : "border-gray-900",
    cardBg: darkMode ? "bg-transparent" : "bg-zinc-200/30",
    sidebarBg: darkMode ? "bg-black/40" : "bg-white/80",
    navBg: darkMode ? "bg-black/20" : "bg-white/70",
    inputBg: darkMode ? "bg-zinc-900/50" : "bg-gray-100/80",
    hoverBg: darkMode ? "hover:bg-zinc-800/50" : "hover:bg-gray-100",
    statBg: darkMode ? "" : "",
  };

  return (
    <div className="flex-1 md:p-4 flex flex-col min-w-0 relative z-10">
      {/* Top Application Bar */}


      {/* Aggregated Stats + Modern Recharts */}
      <div className="space-y-8 mb-12">
        {/* Top Row: Big Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Nodes */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-md p-6 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-cyan-500/20 to-transparent"></div>
            <div className="relative z-10">
              <Server size={15} className=" mb-3" />
              <p className={`text-sm ${colorTheme.textMuted}`}>Total pNodes</p>
              <p className="text-lg font-bold mt-2">{aggregatedStats.totalNodes}</p>
            </div>
          </div>

          {/* Online Nodes */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-md p-6 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-green-500/20 to-transparent"></div>
            <div className="relative z-10">
              <Activity size={15} className=" mb-3 animate-pulse" />
              <p className={`text-sm ${colorTheme.textMuted}`}>Online</p>
              <p className="text-lg font-bold mt-2">{aggregatedStats.onlineNodes}</p>
              <p className="text-xs  mt-1">
                {aggregatedStats.totalNodes > 0
                  ? ((aggregatedStats.onlineNodes / aggregatedStats.totalNodes) * 100).toFixed(1)
                  : 0}% of network
              </p>
            </div>
          </div>

          {/* Committed Storage */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-xl rounded-md p-6 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-purple-500/20 to-transparent"></div>
            <div className="relative z-10">
              <Database size={15} className=" mb-3" />
              <p className={`text-sm ${colorTheme.textMuted}`}>Committed Storage</p>
              <p className="text-lg font-bold mt-2">{aggregatedStats.totalStorageCommittedTB} TB</p>
            </div>
          </div>

          {/* Average Uptime */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-md p-6 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-amber-500/20 to-transparent"></div>
            <div className="relative z-10">
              <Clock size={15} className=" mb-3" />
              <p className={`text-sm ${colorTheme.textMuted}`}>Avg Uptime</p>
              <p className="text-lg font-bold mt-2">{aggregatedStats.averageUptimeDays} days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className={`${colorTheme.statBg} d-xl p-4 ${colorTheme.border} border backdrop-blur-xl text-center`}>
            <p className={`text-xs ${colorTheme.textMuted} mb-1`}>Used Storage</p>
            <p className="text-lg font-bold ">
              {aggregatedStats.totalStorageUsedGB} GB
            </p>
          </div>
          <div className={`${colorTheme.statBg} d-xl p-4 ${colorTheme.border} border backdrop-blur-xl text-center`}>
            <p className={`text-xs ${colorTheme.textMuted} mb-1`}>Avg Storage Usage</p>
            <p className="text-lg font-bold ">
              {(aggregatedStats.averageStorageUsagePercent).toFixed(2)}%
            </p>
          </div>
          <div className={`${colorTheme.statBg} d-xl p-4 ${colorTheme.border} border backdrop-blur-xl text-center`}>
            <p className={`text-xs ${colorTheme.textMuted} mb-1`}>Public Nodes</p>
            <p className="text-lg font-bold ">{aggregatedStats.publicNodes}</p>
          </div>
          <div className={`${colorTheme.statBg} d-xl p-4 ${colorTheme.border} border backdrop-blur-xl text-center`}>
            <p className={`text-xs ${colorTheme.textMuted} mb-1`}>Versions</p>
            <p className="text-lg font-bold ${colorTheme.text}">
              {Object.keys(aggregatedStats.versionDistribution).length}
            </p>
          </div>
        </div>

        {/* Charts Row – Modern Recharts */}
        {/* Modern Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* 1. Online Nodes – Animated Donut with Glow */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent blur-xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Activity size={24} className="text-cyan-400 animate-pulse" />
                Network Health
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Online", value: aggregatedStats.onlineNodes },
                      { name: "Offline", value: aggregatedStats.totalNodes - aggregatedStats.onlineNodes },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    paddingAngle={4}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  >
                    {/* <Cell fill="#048c0dff" />
                    <Cell fill="#b62323ff" /> */}
                    <Cell fill="#fff" />
                    <Cell fill="#b62323ff" />
                  </Pie>

                  {/* Custom label styling */}
                  <text x="50%" y="45%" textAnchor="middle" className="text-3xl font-bold fill-current">
                    {aggregatedStats.onlineNodes}
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" className={`text-lg fill-current`}>
                    of {aggregatedStats.totalNodes}
                  </text>
                  <text x="50%" y="65%" textAnchor="middle" className="text-sm fill-cyan-400">
                    {((aggregatedStats.onlineNodes / aggregatedStats.totalNodes) * 100).toFixed(1)}% online
                  </text>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#fff" : "#ffffff",
                      border: "none",
                      borderRadius: "16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    }}
                    labelStyle={{ color: darkMode ? "#fff" : "#fff" }}
                  />

                  <Legend className="p-4" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Public vs Private – Animated Pie */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0  bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Network size={24} className="text-purple-400" />
                Node Visibility
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Public", value: aggregatedStats.publicNodes },
                      { name: "Private", value: aggregatedStats.totalNodes - aggregatedStats.publicNodes },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1200}
                  >
                    {/* <Cell fill="#1374b0ff" />
                    <Cell fill="#cd3d09ff" /> */}
                    <Cell fill="#eee" />
                    <Cell fill="black" />
                  </Pie>
                  <text x="50%" y="45%" textAnchor="middle" className="text-2xl font-bold fill-current">
                    {aggregatedStats.publicNodes}
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" className="text-2xl fill-current">
                    of {aggregatedStats.totalNodes}
                  </text>
                  {/* <text x="50%" y="65%" textAnchor="middle" className="text-sm fill-cyan-400">
                    {((aggregatedStats.publicNodes / aggregatedStats.totalNodes) * 100).toFixed(1)}% public
                  </text> */}
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Storage – Animated Gradient Area */}
          {/* Storage Used vs Committed – Stacked Horizontal Bar */}
          <div className={`relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border overflow-hidden`}>
            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Database size={24} className="text-purple-400" />
                Storage Utilization
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    {
                      name: "Network",
                      committed: aggregatedStats.totalStorageCommittedTB,
                      used: aggregatedStats.totalStorageUsedGB,
                    },
                  ]}
                  layout="horizontal"
                >
                  <XAxis type="category" hide />
                  <YAxis type="number" domain={[0, aggregatedStats.totalStorageCommittedTB * 1.1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#18181b" : "#ffffff",
                      borderRadius: "16px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                    }}
                  // formatter={(value: number) => value.toFixed(2) + " TB"}
                  />
                  <Bar dataKey="committed" stackId="a" fill="#8b5cf6" radius={[8, 0, 0, 8]} animationDuration={1200} />
                  <Bar dataKey="used" stackId="a" fill="#ec4899" radius={[0, 8, 8, 0]} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#8b5cf6] rounded"></div>
                  <span className={`text-sm ${colorTheme.textSecondary}`}>Committed: {aggregatedStats.totalStorageCommittedTB} TB</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#ec4899] rounded"></div>
                  <span className={`text-sm ${colorTheme.textSecondary}`}>Used: {aggregatedStats.totalStorageUsedGB} GB</span>
                </div>
              </div>
              <p className={`text-center text-sm ${colorTheme.textMuted} mt-4`}>
                Only {(aggregatedStats.totalStorageUsedGB / (aggregatedStats.totalStorageCommittedTB * 1000) * 100).toFixed(4)}% of committed storage currently used
              </p>
            </div>
          </div>

          {/* Geolocation Control */}
          <div className="mb-8">
            {!geoComplete ? (
              <span>Loading...</span>
            ) : (
              <div className="16">
                <NodeGlobe countryDistribution={countryDistribution} />

              </div>
            )}
          </div>

        </div>
      </div>



    </div>
  );
}