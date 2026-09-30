"use client";

import React, { useState } from "react";
import { HotspotSummary, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
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
  const t = translations[currentLang];
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
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-white/95 p-2.5 border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
          <MapPin className="h-3.5 w-3.5 text-indigo-600" />
          <span>Maharashtra Civic Demand Hotspots</span>
        </div>
        <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-2.5">
          <span className="flex items-center gap-1 text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-medium">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Critical (&ge;70)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            High (50-69)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
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
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeOpacity="0.8" />
          </pattern>
        </defs>

        {/* Background Grid */}
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

        {/* Stylized Maharashtra Boundary Silhouette */}
        <path
          d="M 120 180 C 180 120, 320 80, 480 90 C 580 95, 750 140, 840 220 C 870 290, 860 400, 780 480 C 720 530, 580 580, 440 590 C 320 600, 220 560, 160 520 C 130 460, 110 380, 100 300 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* District Baseline Nodes and Names */}
        {Object.entries(DISTRICT_CENTERS).map(([distName, [lat, lng]]) => {
          const [cx, cy] = project(lat, lng);
          return (
            <g key={distName} className="opacity-90">
              <circle cx={cx} cy={cy} r="3.5" fill="#94a3b8" />
              <text
                x={cx}
                y={cy + 15}
                textAnchor="middle"
                className="fill-slate-600 font-sans text-[11px] font-semibold tracking-wider"
              >
                {distName}
              </text>
            </g>
          );
        })}

        {/* Hotspots with Concentric Radar Rings */}
        {hotspots.map((h) => {
          const [cx, cy] = project(h.center_lat, h.center_lng);
          const isSelected = selectedHotspotId === h.id;
          const isCritical = h.final_priority_score >= 70.0;
          const isHigh = h.final_priority_score >= 50.0 && h.final_priority_score < 70.0;

          const ringColor = isCritical ? "#dc2626" : isHigh ? "#d97706" : "#059669";
          const badgeBg = isCritical ? "fill-red-600" : isHigh ? "fill-amber-600" : "fill-emerald-600";
          const strokeColor = isCritical ? "stroke-red-700" : isHigh ? "stroke-amber-700" : "stroke-emerald-700";

          return (
            <g
              key={h.id}
              onClick={() => onSelectHotspot(h)}
              onMouseEnter={() => setHoveredHotspot(h)}
              onMouseLeave={() => setHoveredHotspot(null)}
              className="cursor-pointer transition-transform hover:scale-108"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {/* Outer Radar Wave */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 34 : 26}
                fill="none"
                stroke={ringColor}
                strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={isSelected ? 0.8 : 0.3}
              />

              {/* Inner Soft Gradient Ring */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 24 : 18}
                fill={ringColor}
                fillOpacity={isSelected ? 0.2 : 0.1}
              />

              {/* Central Marker Badge */}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 15 : 12}
                className={`${badgeBg} ${strokeColor}`}
                strokeWidth={isSelected ? "2.5" : "1.5"}
              />

              {/* Score Text */}
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
          className="pointer-events-none absolute bottom-4 right-4 z-20 max-w-sm rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-900">
              {hoveredHotspot.taluka_or_ward ? `${hoveredHotspot.taluka_or_ward}, ` : ""}
              {hoveredHotspot.district}
            </span>
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${
              hoveredHotspot.final_priority_score >= 70
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              Score: {hoveredHotspot.final_priority_score}/100
            </span>
          </div>
          <p className="text-xs font-medium text-slate-700 line-clamp-2">
            {hoveredHotspot.detected_headline}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>{categoryLabels[hoveredHotspot.category]?.[currentLang] || hoveredHotspot.category}</span>
            <span className="font-semibold text-indigo-700">{hoveredHotspot.complaint_count} Complaints</span>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
            {t.calcByEngine}
          </div>
        </div>
      )}
    </div>
  );
};
