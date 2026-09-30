"use client";

import React, { useState } from "react";
import { HotspotSummary, Language } from "@/types";
import { categoryLabels } from "@/lib/translations";
import { Droplet, Truck, Zap, HeartPulse, GraduationCap, Building2, Flame, MapPin } from "lucide-react";

interface InteractiveMapProps {
  hotspots: HotspotSummary[];
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: HotspotSummary) => void;
  currentLang: Language;
}

// Geographic bounds for Maharashtra projection
const MIN_LNG = 72.4;
const MAX_LNG = 80.8;
const MIN_LAT = 15.6;
const MAX_LAT = 22.2;
const MAP_WIDTH = 900;
const MAP_HEIGHT = 650;

function project(lat: number, lng: number): [number, number] {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * MAP_WIDTH;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP_HEIGHT;
  return [Math.max(30, Math.min(MAP_WIDTH - 30, x)), Math.max(30, Math.min(MAP_HEIGHT - 30, y))];
}

const DISTRICT_CENTERS: Record<string, [number, number]> = {
  "Beed": [18.9891, 75.7601],
  "Latur": [18.4088, 76.5604],
  "Ratnagiri": [16.9902, 73.3120],
  "Chandrapur": [19.9615, 79.2961],
  "Pune": [18.5204, 73.8567],
  "Nashik": [19.9975, 73.7898],
  "Solapur": [17.6599, 75.9064],
  "Nagpur": [21.1458, 79.0882]
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  currentLang,
}) => {
  const [hoveredHotspot, setHoveredHotspot] = useState<HotspotSummary | null>(null);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "WATER_AND_SANITATION":
        return <Droplet className="h-3 w-3 text-cyan-300" />;
      case "ROADS_AND_TRANSPORT":
        return <Truck className="h-3 w-3 text-amber-300" />;
      case "ELECTRICITY_AND_ENERGY":
        return <Zap className="h-3 w-3 text-yellow-300" />;
      case "HEALTHCARE":
        return <HeartPulse className="h-3 w-3 text-rose-300" />;
      case "EDUCATION":
        return <GraduationCap className="h-3 w-3 text-indigo-300" />;
      default:
        return <Building2 className="h-3 w-3 text-emerald-300" />;
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 shadow-2xl">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-slate-900/90 p-2.5 border border-slate-800 backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <MapPin className="h-3.5 w-3.5 text-orange-500" />
          <span>Maharashtra Civic Demand Hotspots</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 border-l border-slate-700 pl-3">
          <span className="flex items-center gap-1 text-[11px] text-red-400">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Critical (&ge;70)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            High (50-69)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Moderate (&lt;50)
          </span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-auto select-none"
        style={{ minHeight: "420px", maxHeight: "580px" }}
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          {/* Radial glow for critical pins */}
          <radialGradient id="criticalGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background Grid */}
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

        {/* Stylized Maharashtra Boundary Silhouette */}
        <path
          d="M 120 180 C 180 120, 320 80, 480 90 C 580 95, 750 140, 840 220 C 870 290, 860 400, 780 480 C 720 530, 580 580, 440 590 C 320 600, 220 560, 160 520 C 130 460, 110 380, 100 300 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.6"
        />

        {/* District Baseline Nodes and Names */}
        {Object.entries(DISTRICT_CENTERS).map(([distName, [lat, lng]]) => {
          const [cx, cy] = project(lat, lng);
          return (
            <g key={distName} className="opacity-70">
              <circle cx={cx} cy={cy} r="3" fill="#64748b" />
              <text
                x={cx}
                y={cy + 15}
                textAnchor="middle"
                className="fill-slate-400 font-sans text-[11px] font-semibold tracking-wider"
              >
                {distName}
              </text>
            </g>
          );
        })}

        {/* Hotspots with Concentric Pulsing Radar Rings */}
        {hotspots.map((h) => {
          const [cx, cy] = project(h.center_lat, h.center_lng);
          const isSelected = selectedHotspotId === h.id;
          const isCritical = h.final_priority_score >= 70.0;
          const isHigh = h.final_priority_score >= 50.0 && h.final_priority_score < 70.0;

          const ringColor = isCritical ? "#ef4444" : isHigh ? "#f59e0b" : "#10b981";
          const badgeBg = isCritical ? "fill-red-950" : isHigh ? "fill-amber-950" : "fill-emerald-950";
          const strokeColor = isCritical ? "stroke-red-500" : isHigh ? "stroke-amber-500" : "stroke-emerald-500";

          return (
            <g
              key={h.id}
              onClick={() => onSelectHotspot(h)}
              onMouseEnter={() => setHoveredHotspot(h)}
              onMouseLeave={() => setHoveredHotspot(null)}
              className="cursor-pointer transition-transform hover:scale-110"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* Outer Pulsing Wave for High/Critical Priority */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 36 : 28}
                fill="none"
                stroke={ringColor}
                strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={isSelected ? 0.8 : 0.3}
                className={isCritical ? "animate-ping" : ""}
                style={{ animationDuration: "3s" }}
              />

              {/* Inner Soft Gradient Glow */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 26 : 20}
                fill={ringColor}
                fillOpacity={isSelected ? 0.25 : 0.12}
              />

              {/* Central Marker Badge */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 16 : 13}
                className={`${badgeBg} ${strokeColor}`}
                strokeWidth={isSelected ? "3" : "2"}
              />

              {/* Score / Counter Text */}
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                className="fill-white font-mono text-[10px] font-bold"
              >
                {Math.round(h.final_priority_score)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Floating Tooltip */}
      {hoveredHotspot && (
        <div
          className="pointer-events-none absolute bottom-4 right-4 z-20 max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold text-white">
              {hoveredHotspot.taluka_or_ward ? `${hoveredHotspot.taluka_or_ward}, ` : ""}
              {hoveredHotspot.district}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              hoveredHotspot.final_priority_score >= 70
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
            }`}>
              Score: {hoveredHotspot.final_priority_score}/100
            </span>
          </div>
          <p className="text-xs font-medium text-slate-300 line-clamp-2">
            {hoveredHotspot.detected_headline}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>{categoryLabels[hoveredHotspot.category]?.[currentLang] || hoveredHotspot.category}</span>
            <span className="font-semibold text-orange-400">{hoveredHotspot.complaint_count} Complaints</span>
          </div>
        </div>
      )}
    </div>
  );
};
