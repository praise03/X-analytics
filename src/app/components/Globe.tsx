// src/components/CountryMap.tsx
'use client';

import { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface CountryMapProps {
  countryDistribution: Record<string, number>;
}

// Add proper type for geography object
interface GeoProperties {
  name: string;
}

interface GeoGeometry {
  type: string;
  coordinates: any[][][]; // Simplified – real type is complex
}

interface GeoFeature {
  type: "Feature";
  properties: GeoProperties;
  geometry: GeoGeometry;
  rsmKey: string;
}

export default function CountryMap({ countryDistribution }: CountryMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  const maxCount = Math.max(...Object.values(countryDistribution), 1);

  const topCountries = Object.entries(countryDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Map */}
      <div className="lg:col-span-3 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 border border-zinc-800/50 overflow-hidden">
        <h3 className="text-xl font-bold mb-6">Geographical Distribution</h3>
        <div className="relative">
          <ComposableMap projection="geoMercator" className="w-full">
            <ZoomableGroup zoom={1}>
              <Geographies geography={geoUrl}>
                {({ geographies }: { geographies: GeoFeature[] }) =>
                  geographies.map((geo: GeoFeature) => {
                    const countryName = geo.properties.name;
                    const count = countryDistribution[countryName] || 0;
                    const fill = count > 0 
                      ? `rgba(251, 146, 60, ${count / maxCount})`  // orange gradient
                      : "#27272a";

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => {
                          if (count > 0) {
                            setTooltipContent(`${countryName}: ${count} node${count > 1 ? "s" : ""}`);
                          }
                        }}
                        onMouseLeave={() => {
                          setTooltipContent("");
                        }}
                        style={{
                          default: {
                            fill,
                            stroke: "#18181b",
                            strokeWidth: 0.5,
                            outline: "none",
                            transition: "all 0.3s",
                          },
                          hover: {
                            fill: count > 0 ? "#f97316" : "#374151",
                            stroke: "#06b6d4",
                            strokeWidth: 1,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            fill: "#f97316",
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltipContent && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-zinc-700 text-sm whitespace-nowrap z-10">
              {tooltipContent}
            </div>
          )}
        </div>
      </div>

      {/* Top 5 */}
      <div>
        <h3 className="text-xl font-bold mb-6">Top 5 Locations</h3>
        <div className="space-y-4">
          {topCountries.map(([country, count], i) => (
            <div key={country} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-400">{i + 1}</span>
                <span>{country}</span>
              </div>
              <span className="font-bold text-xl">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}