"use client";

import React from "react";
import { Category, Language } from "@/types";
import { translations, categoryLabels } from "@/lib/translations";
import { Filter, RefreshCw, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  currentLang: Language;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedDistrict: string;
  onDistrictChange: (dist: string) => void;
  minScore: number;
  onMinScoreChange: (score: number) => void;
  onRecalculate: () => void;
  isRecalculating: boolean;
}

const DISTRICT_LIST = [
  "Beed",
  "Latur",
  "Ratnagiri",
  "Chandrapur",
  "Pune",
  "Nashik",
  "Solapur",
  "Nagpur"
];

const CATEGORIES: Category[] = [
  "WATER_AND_SANITATION",
  "ROADS_AND_TRANSPORT",
  "ELECTRICITY_AND_ENERGY",
  "HEALTHCARE",
  "EDUCATION",
  "CIVIC_AMENITIES"
];

export const FilterBar: React.FC<FilterBarProps> = ({
  currentLang,
  selectedCategory,
  onCategoryChange,
  selectedDistrict,
  onDistrictChange,
  minScore,
  onMinScoreChange,
  onRecalculate,
  isRecalculating,
}) => {
  const t = translations[currentLang];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* District & Min Score Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Filter className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.filterDistrict}:</span>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="">{t.allDistricts}</option>
            {DISTRICT_LIST.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>

          {/* Min Score Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-1 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">{t.filterScore}:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="h-1.5 w-20 cursor-pointer accent-orange-500"
            />
            <span className="font-mono font-bold text-amber-400 w-8 text-right">
              &ge;{minScore}
            </span>
          </div>
        </div>

        {/* Recalculate Button */}
        <div>
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 px-3.5 py-1.5 text-xs font-bold text-slate-200 border border-slate-600/50 shadow transition-all hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isRecalculating ? "animate-spin" : ""}`} />
            <span>{isRecalculating ? t.recalculating : t.recalculate}</span>
          </button>
        </div>
      </div>

      {/* Sector Category Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-800/70">
        <button
          onClick={() => onCategoryChange("")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            selectedCategory === ""
              ? "bg-amber-500 text-slate-950 font-bold"
              : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {t.allSectors}
        </button>

        {CATEGORIES.map((cat) => {
          const label = categoryLabels[cat]?.[currentLang] || cat;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
