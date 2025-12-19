"use client";

import { useState, useEffect } from "react";
import {
    Globe,
    Database,
    Zap,
    BarChart2,
    Cpu,
    Server,
    Clock,
    Activity,
    RefreshCw, TrendingUp, FileQuestionMark
} from "lucide-react";
import { useTheme } from "next-themes";


export default function AboutPage() {
    const [loading, setLoading] = useState(true);
    const { theme, setTheme } = useTheme();
    const darkMode = theme === "dark";


    useEffect(() => {
        // const savedTheme = localStorage.getItem("colorTheme");
        // if (savedTheme) {
        //     setDarkMode(savedTheme === "dark");
        // }
        setLoading(false);
    }, []);

    const colorTheme = {
        bg: darkMode ? "bg-transparent" : "bg-transparent",
        text: darkMode ? "text-white" : "text-black",
        textMuted: darkMode ? "text-zinc-500" : "text-black",
        border: darkMode ? "border-zinc-800/50" : "border-zinc-800/50",
        cardBg: darkMode ? "bg-transparent" : "bg-transparent",
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-transparent">Loading...</div>;
    }

    return (

        <div className={`relative z-10 p-6 md:p-8 space-y-8 ${colorTheme.bg} ${colorTheme.text}`}>
            <h1 className="text-3xl font-bold font-space-grotesk mb-8 bg-gradient-to-r from-white to-zinc-400 bg-clip-text ">
                About Xandeum
            </h1>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"> */}
            {/* What is Xandeum */}
            <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-6 ${colorTheme.border} border hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1`}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at top right, #06b6d415, transparent 70%)` }}></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl -800/50 flex items-center justify-center group-hover: transition">
                            <FileQuestionMark size={20} className="text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold font-space-grotesk">What is Xandeum?</h2>
                    </div>
                    <p className={`${colorTheme.textMuted} text-lg tracking-wide mb-4`}>
                        Xandeum is a scalable storage layer for Solana, solving the blockchain storage trilemma. It provides exabytes of storage with random access and smart contract native integration, enabling data-intensive applications on Solana.
                    </p>
                    <p className={`${colorTheme.textMuted} text-lg tracking-wide`}>
                        Xandeum adds a "drive" to Solana's world computer, completing its CPU and RAM. It conquers the blockchain storage trilemma with a patent-pending storage layer. pNodes provide proof-of-stake storage, enabling massive capacity for applications like DeFi and healthcare.
                    </p>
                </div>
            </div>



            {/* </div> */}

            {/* How to Setup Your Personal pNode – Step-by-Step Cards */}
            <div className="mt-[100px]">
                <h2 className="text-3xl font-bold font-space-grotesk mb-12 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                    How to Setup Your Personal pNode
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">

                    {/* Step 1 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `radial-gradient(circle at top right, #06b6d415, transparent 70%)` }}
                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full  flex items-center justify-center text-cyan-400 font-bold text-xl">
                                    1
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">Choose a VPS Provider</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Select a reliable VPS (Contabo recommended). Minimum specs: 4 cores, 4GB RAM, 80GB SSD, 1Gbps network.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"

                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                                    2
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">Set Up Ubuntu 24.04</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Install Ubuntu 24.04 LTS. Generate ed25519 SSH keys, disable password login for security.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `radial-gradient(circle at top right, #06b6d415, transparent 70%)` }}
                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xl">
                                    3
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">Run Installer Script</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Execute the official Xandeum installer to clone repos and configure systemd services.
                            </p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"

                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xl">
                                    4
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">Start Services</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Run `systemctl start xandminer xandminerd`. Monitor logs with `journalctl -u xandminer -f`.
                            </p>
                        </div>
                    </div>

                    {/* Step 5 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `radial-gradient(circle at top right, #10b98115, transparent 70%)` }}
                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full 20 flex items-center justify-center text-green-400 font-bold text-xl">
                                    5
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">Access Web GUI</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Set up SSH tunnel: `ssh -L 3000:localhost:3000 user@your-vps-ip`. Access http://localhost:3000.
                            </p>
                        </div>
                    </div>

                    {/* Step 6 */}
                    <div className={`group relative ${colorTheme.cardBg} backdrop-blur-xl rounded-2xl p-8 ${colorTheme.border} border hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10`}>
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"

                        ></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full  flex items-center justify-center text-cyan-400 font-bold text-xl">
                                    6
                                </div>
                                <h3 className="text-xl font-bold font-space-grotesk">You're Live!</h3>
                            </div>
                            <p className={colorTheme.textMuted} style={{ fontSize: "larger" }}>
                                Your pNode is now contributing to the Xandeum network. Monitor performance and earn credits.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-12 flex text-lg text-center">
                <p className="p-4 text-sm">
                    *For detailed instructions and troubleshooting, visit the official guide:
                </p>
                <a
                    href="https://docs.xandeum.network/xandeum-pnode-setup-guide"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border px-2 py-4"
                >
                    Official pNode Setup Guide ↗
                </a>
            </div>
        </div>
    );
}