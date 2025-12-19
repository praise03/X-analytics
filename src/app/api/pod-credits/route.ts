// src/app/api/pod-credits/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://podcredits.xandeum.network/api/pods-credits');

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch pod credits:", error);
    return NextResponse.json(
      { error: "Unable to fetch credits data" },
      { status: 502 }
    );
  }
}