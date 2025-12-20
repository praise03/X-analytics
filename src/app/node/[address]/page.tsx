// src/app/node/[address]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  Server,
  Cpu,
  MemoryStick as RamIcon,
  HardDrive,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2, TrendingUp, TrendingDown
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  
} from "recharts";
import { useTheme } from "next-themes";


interface NodeStats {
  active_streams: number;
  cpu_percent: number;
  current_index: number;
  file_size: number;
  last_updated: number;
  packets_received: number;
  packets_sent: number;
  ram_total: number;
  ram_used: number;
  total_bytes: number;
  total_pages: number;
  uptime: number;
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

interface PodCredit {
  credits: number;
  pod_id: string;
}

export default function NodeDetail({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const decodedAddress = decodeURIComponent(address); //

  const [stats, setStats] = useState<NodeStats | null>(null);
  const [podData, setPodData] = useState<PodWithStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [credits, setCredits] = useState<number | null>(null);
  const [topEarner, setTopEarner] = useState<number>(0);
  const [p95, setP95] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  const [totalPodsWithCredits, setTotalPodsWitCredits] = useState<number>(0);

  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  const colorTheme = {
    text: darkMode ? "text-zinc-300" : "text-black"
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch full pods list
      const podsRes = await fetch("/api/get-pods-with-stats");
      const podsJson = (await podsRes.json()).result;
      const allPods: PodWithStats[] = podsJson.pods || [];

      // Find matching pod using startsWith (IP only)
      const matchingPod = allPods.find((pod: PodWithStats) =>
        pod.address.startsWith(decodedAddress)
      );

      if (matchingPod) {
        setPodData(matchingPod);
      }

      //credits
      const creditsRes = await fetch("/api/pod-credits");
      if (creditsRes.ok) {
        const creditsJson = await creditsRes.json();
        const podsCredits: PodCredit[] = creditsJson.pods_credits || [];

        setTotalPodsWitCredits(podsCredits.length);

        const podCredit = podsCredits.find(pc => pc.pod_id === matchingPod?.pubkey);
        if (podCredit) {
          setCredits(podCredit.credits);
        }

        // Calculate top earner, 95th percentile, threshold
        const allCredits = podsCredits.map(pc => pc.credits).sort((a, b) => b - a);
        const top = allCredits[0] || 0;
        setTopEarner(top);

        const p95Index = Math.floor(allCredits.length * 0.05);
        const p95Value = allCredits[p95Index] || 0;
        setP95(p95Value);
        setThreshold(Math.floor(p95Value * 0.8));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      fetch(`/api/get-stats?address=${encodeURIComponent(decodedAddress)}`, {
        signal: controller.signal,
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setStats(data.result);
        })
        .catch(() => {
          // Silent fail — stats remain null
        })
        .finally(() => clearTimeout(timeoutId));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [decodedAddress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }}></div>
        </div>
      </div>
    );
  }

  if (!podData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <p className="text-xl">Node not found</p>
      </div>
    );
  }

  const cpuPercent = stats?.cpu_percent || 0;
  const ramPercent = stats ? ((stats.ram_used / stats.ram_total) * 100).toFixed(1) : "N/A";
  const storageUsedGB = (podData.storage_used / 1e9).toFixed(4);
  const storageCommittedGB = (podData.storage_committed / 1e9).toFixed(2);
  const storagePercent = (podData.storage_usage_percent * 100).toFixed(2);


  const uptimeDays = Math.floor(podData.uptime / 86400);
  const uptimeHours = Math.floor((podData.uptime % 86400) / 3600);

  const formatStorage = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${value} ${sizes[i]}`;
};

  const getHealthStatus = () => {
    if (cpuPercent > 90 || (stats && Number(ramPercent) > 90)) {
      return { label: "Critical", color: "#ef4444", icon: AlertTriangle };
    }
    if (cpuPercent > 70 || (stats && Number(ramPercent) > 70)) {
      return { label: "Warning", color: "#f59e0b", icon: AlertTriangle };
    }
    return { label: "Healthy", color: "#06b6d4", icon: CheckCircle2 };
  };

  const healthStatus = getHealthStatus();
  const StatusIcon = healthStatus.icon;

  const insights = [];
  if (cpuPercent < 30) insights.push("Very low CPU usage");
  if (cpuPercent > 70) insights.push("High CPU load");
  if (stats && Number(ramPercent) > 80) insights.push("High memory usage");
  if (stats && stats.active_streams > 50) insights.push("High network activity");
  if (uptimeDays > 30) insights.push("Excellent uptime");
  if (podData.storage_usage_percent > 0.01) insights.push("Active storage growth");

  const formatLastSeen = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / 1e9;
    return gb < 1 ? `${(bytes / 1e6).toFixed(2)} MB` : `${gb.toFixed(2)} GB`;
  };


  return (
    <div className={`relative z-10 p-6 md:p-6 space-y-6 ${colorTheme.text}`}>
      {/* Node Header */}
      <div className=" backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-zinc-800/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl border border-cyan-500/20">
              <Server size={36} className="" />
            </div>
            <div>
              <h1 className="text-xl md:text-xl font-bold font-space-grotesk mb-3 font-mono break-all">
                {podData.address}  {/* ← Full address with port */}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5  rounded-lg border border-zinc-800/50 backdrop-blur-xl">
                  <StatusIcon size={16} style={{ color: healthStatus.color }} />
                  <span style={{ color: healthStatus.color }} className="font-semibold text-sm">
                    {healthStatus.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm colorTheme">
                  <Clock size={14} />
                  <span>Last Seen: {formatLastSeen(podData.last_seen_timestamp)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm colorTheme">
                  <span>Version: {podData.version}</span>
                </div>

                <div className={`flex items-center gap-2 text-sm`}>
                  <span style={{ color: podData.is_public ? "#06b6d4" : "#f50b1bff" }} className="font-semibold">
                    {podData.is_public ? "Public" : "Private"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!stats && (
            <div className="flex flex-wrap gap-2">
              <span  className="px-3 py-1.5 flex text-sm rounded-full border border-zinc-800/50 font-medium backdrop-blur-xl">
                  <AlertTriangle height={19} /> This pod doesn't make its stats public
                </span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU */}
        <div className="group  backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-cyan-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Cpu size={24} className="" />
              </div>
              <span className="text-sm font-medium colorTheme">CPU</span>
            </div>
            <span className="text-xl font-bold font-space-grotesk">
              {cpuPercent.toFixed(1)}<span className="text-lg colorTheme">%</span>
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all duration-500" style={{
              width: `${cpuPercent}%`,
              backgroundColor: cpuPercent > 80 ? "#ef4444" : cpuPercent > 60 ? "#f59e0b" : "#06b6d4"
            }}></div>
          </div>
        </div>

        {/* RAM */}
        <div className="group  backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <RamIcon size={24} className="" />
              </div>
              <span className="text-sm font-medium colorTheme">RAM</span>
            </div>
            <span className="text-xl font-bold font-space-grotesk">
              {ramPercent}<span className="text-lg colorTheme">%</span>
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2.5">
            <div className="h-2.5 rounded-full transition-all duration-500" style={{
              width: `${ramPercent}%`,
              backgroundColor: Number(ramPercent) > 80 ? "#ef4444" : Number(ramPercent) > 60 ? "#f59e0b" : ""
            }}></div>
          </div>
          <p className="text-sm colorTheme mt-3">
            {stats ? `${(stats.ram_used / 1e9).toFixed(1)} GB / ${(stats.ram_total / 1e9).toFixed(0)} GB` : "N/A"}
          </p>
        </div>

        {/* Storage */}
        <div className="group  backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-pink-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <HardDrive size={24} className="" />
              </div>
              <span className="text-sm font-medium colorTheme">Storage</span>
            </div>
            <span className="text-xl font-bold font-space-grotesk">
              {formatStorage(podData.storage_used)}
            </span>
          </div>
          <p className="text-sm colorTheme mt-3">
            Committed: {storageCommittedGB} GB ({storagePercent}% used)
          </p>
        </div>

        {/* Uptime */}
        <div className="group  backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock size={24} className="" />
              </div>
              <span className="text-sm font-medium colorTheme">Uptime</span>
            </div>
            <span className="text-xl font-bold font-space-grotesk">
              {uptimeDays}<span className="text-lg colorTheme">d</span>
            </span>
          </div>
          <p className="text-sm colorTheme mt-3">
            {uptimeDays} days, {uptimeHours} hours
          </p>
        </div>
      </div>

      {/* Network Activity */}
      <div className=" backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
        <h2 className="text-xl font-bold font-space-grotesk mb-6 flex items-center gap-3">
          <Activity size={24} className="" />
          Network Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-6  rounded-xl border border-zinc-800/50 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingDown size={18} className="" />
              <span className="text-sm colorTheme font-medium">Received</span>
            </div>
            <p className="text-xl font-bold font-space-grotesk ">
              {stats ? stats.packets_received.toLocaleString() : "N/A"}
            </p>
            <p className="text-sm colorTheme mt-2">packets</p>
          </div>
          <div className="text-center p-6  rounded-xl border border-zinc-800/50 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp size={18} className="" />
              <span className="text-sm colorTheme font-medium">Sent</span>
            </div>
            <p className="text-xl font-bold font-space-grotesk ">
              {stats ? stats.packets_sent.toLocaleString() : "N/A"}
            </p>
            <p className="text-sm colorTheme mt-2">packets</p>
          </div>
          <div className="text-center p-6  rounded-xl border border-zinc-800/50 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Activity size={18} className="" />
              <span className="text-sm colorTheme font-medium">Active Streams</span>
            </div>
            <p className="text-xl font-bold font-space-grotesk ">
              {stats ? stats.active_streams : "N/A"}
            </p>
            <p className="text-sm colorTheme mt-2">connections</p>
          </div>
        </div>
      </div>

      {/* Pubkey & Additional Info */}
      {/* <div className=" backdrop-blur-xl w-1/2 rounded-2xl p-6 border border-zinc-800/50">
        <h2 className="text-md font-bold font-space-grotesk ">
          <span className="text-zinc-500">Public Key:</span> <span className="text-md lg:text-md tracking-wider font-bold font-space-grotesk mb-3 font-mono break-all">{podData.pubkey}</span>
        </h2>
      </div> */}
      <div className="w-full max-w-full lg:w-2/6 backdrop-blur-xl rounded-2xl p-3 border border-zinc-800/50">
      <h2 className="text-md font-bold font-space-grotesk">
        <span className="text-zinc-500">Public Key:</span>
        <span className="block mt-2 text-sm lg:text-md tracking-wider font-bold font-space-grotesk font-mono break-all">
          {podData.pubkey}
        </span>
      </h2>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className=" backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
            <h3 className="text-lg font-bold font-space-grotesk mb-6">
              Storage Usage
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  {
                    name: "Network",
                    committed: storageCommittedGB,
                    used: storageUsedGB,
                  },
                ]}
                layout="horizontal"
              >
                <XAxis type="category" hide />
                <YAxis type="number" domain={[0, Number(storageCommittedGB) * 1.1]} />
                <Tooltip />
                <Bar dataKey="committed" stackId="a" fill="#8b5cf6" radius={[8, 0, 0, 8]} animationDuration={1200} />
                <Bar dataKey="used" stackId="a" fill="#ec4899" radius={[0, 8, 8, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50">
          <h2 className="text-xl font-bold font-space-grotesk mb-6">
            Credits & Ranking
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="colorTheme">Your Credits</span>
              <span className="font-bold text-2xl">{credits !== null ? credits.toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="colorTheme">Top Earner</span>
              <span className="font-bold">{topEarner.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="colorTheme">95th Percentile</span>
              <span className="font-bold">{p95.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="colorTheme">Threshold (80% of P95)</span>
              <span className="font-bold">{threshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="colorTheme">Eligible for DevNet</span>
              <span className="font-bold text-cyan-400">
                TBD
              </span>
            </div>
            <div className="flex justify-between">
              <span className="colorTheme">Total Pods</span>
              <span className="font-bold">{totalPodsWithCredits}</span>
            </div>
          </div>
        </div>
        </div>

    </div>

  );
}