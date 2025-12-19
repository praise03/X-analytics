// src/lib/mockData.ts
export const mockPodsResponse = {
  jsonrpc: "2.0",
  result: {
    pods: [
      { address: "192.168.1.100:9001", version: "1.0.0", last_seen_timestamp: 1743856200 },
      { address: "10.0.0.5:9001",      version: "1.0.1", last_seen_timestamp: 1743855900 },
      { address: "172.16.0.42:9001",  version: "1.0.1", last_seen_timestamp: 1743855600 },
    ],
    total_count: 3,
  },
};

export const mockStatsResponse = {
  jsonrpc: "2.0",
  result: {
    metadata: { total_bytes: 1048576000, total_pages: 1000, last_updated: 1743856200 },
    stats: {
      cpu_percent: 15.5,
      ram_used: 536870912,
      ram_total: 8589934592,
      uptime: 86400,
      packets_received: 1250,
      packets_sent: 980,
      active_streams: 5,
    },
    file_size: 1048576000,
  },
};