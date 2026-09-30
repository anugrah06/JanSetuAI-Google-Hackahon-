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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* District & Min Score Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="h-3.5 w-3.5 text-indigo-600" />
            <span>{t.filterDistrict}:</span>
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 cursor-pointer"
          >
            <option value="">{t.allDistricts}</option>
            {DISTRICT_LIST.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>

          {/* Min Score Slider */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">{t.filterScore}:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="h-1.5 w-20 cursor-pointer accent-indigo-600"
            />
            <span className="font-mono font-bold text-indigo-700 w-8 text-right">
              &ge;{minScore}
            </span>
          </div>
        </div>

        {/* Recalculate Button */}
        <div>
          <button
            onClick={onRecalculate}
            disabled={isRecalculating}
            className="flex items-center gap-2 rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isRecalculating ? "animate-spin" : ""}`} />
            <span>{isRecalculating ? t.recalculating : t.recalculate}</span>
          </button>
        </div>
      </div>

      {/* Sector Category Pills */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-200">
        <button
          onClick={() => onCategoryChange("")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            selectedCategory === ""
              ? "bg-indigo-600 text-white font-bold shadow-xs"
              : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
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
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white font-bold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
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
