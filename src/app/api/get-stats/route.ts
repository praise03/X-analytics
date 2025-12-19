// // src/app/api/get-stats/route.ts
// import { NextResponse } from 'next/server';

// const mockStats = {
//   active_streams: 2,
//   cpu_percent: 0.9756097793579102,
//   current_index: 0,
//   file_size: 1073741824,
//   last_updated: 0,
//   packets_received: 365068,
//   packets_sent: 444749,
//   ram_total: 4111622144,
//   ram_used: 1519992832,
//   total_bytes: 0,
//   total_pages: 0,
//   uptime: 14282,
// };

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const address = searchParams.get('address');

//   if (!address) {
//     return NextResponse.json(
//       { error: "Missing 'address' query parameter" },
//       { status: 400 }
//     );
//   }

//   // Optional: simulate small delay like real network
//   // await new Promise(resolve => setTimeout(resolve, 200));

//   return NextResponse.json(mockStats);
// }

// src/app/api/get-stats/route.ts
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

interface StatsResponse {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address'); // e.g. "173.212.207.32"


  if (!address) {
    return NextResponse.json(
      { error: "Missing 'address' query parameter" },
      { status: 400 }
    );
  }

  // Reconstruct full RPC address with port 6001
  const rpcUrl = `http://${address}:6000/rpc`;

  const payload = {
    jsonrpc: "2.0",
    method: "get-stats",
    id: 1,
  };

  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`RPC error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // console.error(`Failed to reach ${rpcUrl}:`, error);
    return NextResponse.json(
      { error: "Unable to connect to node (timeout or network issue)" },
      { status: 502 }
    );
  }
}