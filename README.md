# Xandeum Analytics Dashboard README

## Overview
This is a Next.js-based dashboard for monitoring Xandeum pNodes. It fetches real-time data on pods running on Xandeum's network and displaying them in a clean, responsive UI. The app proxies RPC calls for CORS safety and handles failures gracefully.

**Dependencies**: Next.js , Tailwind CSS for styling, Recharts for visualizations, Lucide for icons, react-simple-maps for geo viz.

## Xandeum Analytics Dashboard – Pages Overview

### Dashboard (`/`)
---

**Purpose**: High-level overview of network health, key aggregated metrics, geographical distribution, and visual charts.

**APIs Called**:
- `/api/get-pods-with-stats` (proxied RPC call to `get-pods-with-stats`)
- `/api/pod-credits` (proxied to `https://podcredits.xandeum.network/api/pods-credits`)
- `ip-api.com` (batch geolocation of IPs → countries; results cached in hardcoded map)

**Data Representations**:
- Large metric cards: Total pNodes, Online %, Committed Storage, Average Uptime
- Donut charts: Network Health (online/offline), Node Visibility (public/private)
- Stacked horizontal bar: Storage Used vs Committed
- Geographical map: Country distribution with color intensity + Top 5 Locations list


### All Nodes (`/pnodes`)
---

**Purpose**: Complete paginated list of all pNodes with filtering and sorting capabilities.

**APIs Called**:
- `/api/get-pods-with-stats` (proxied RPC for full node list + basic stats)

**Data Representations**:
- Responsive card grid (20 nodes per page)
- Each card shows: IP, version, last seen, storage usage %, uptime, visibility (public/private)
- Search by IP, version, uptime, storage %, last seen
- Filter: Public / Private / All
- Sorting: Storage %, Uptime, Last Seen
- Pagination (Prev / Next)


### Node Detail (`/node/[address]`)
---

**Purpose**: In-depth view of a single node (accessed via IP, e.g., `/node/173.212.207.32`)

**APIs Called**:
- `/api/get-pods-with-stats` (for basic node info: pubkey, version, storage, uptime, visibility)
- `/api/get-stats` (proxied per-node RPC on port 6000 for detailed runtime stats; gracefully handles private/offline nodes)
- `/api/pod-credits` (for credits and network-wide ranking)

**Data Representations**:
- Header: Full address, pubkey, version, last seen (from timestamp), visibility, uptime
- Metric cards: CPU %, RAM %, Storage (used/committed/%), Uptime
- Network activity section: Packets received/sent, active streams
- Credits & Ranking section: Your credits, top earner, 95th percentile, 80% threshold, DevNet eligibility, total pods


### Guide / About (`/about`)
---

**Purpose**: Static informational page about Xandeum and step-by-step pNode setup guide.

**APIs Called**: None (purely static content)

**Data Representations**:
- Card grid layout covering: What is Xandeum, Key Features...
- Sequential step-by-step cards with connecting arrows for pNode setup guide
- Link to official documentation on running a Node


### Leaderboard (`/leaderboard`)
---

**Purpose**: Global ranking of pNodes by earned credits.

**APIs Called**:
- `/api/pod-credits` (credits per pubkey)
- `/api/get-pods-with-stats` (IP and version mapping via pubkey)

**Data Representations**:
- Responsive table: Rank, IP Address, Pubkey, Credits
- Search by pubkey or IP
- Sortable (high → low / low → high)
- Pagination (20 entries per page)



## How to run X-analytics

First, run the development server:

```bash
npm install
->
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
