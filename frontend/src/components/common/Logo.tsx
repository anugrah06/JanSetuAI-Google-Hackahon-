"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  onClick
}) => {
  // Height definitions for clean scaling while preserving natural aspect ratio
  const sizeClasses = {
    sm: "h-10 sm:h-11 w-auto max-w-[180px] object-contain shrink-0",
    md: "h-14 sm:h-16 w-auto max-w-[240px] object-contain shrink-0",
    lg: "h-20 sm:h-24 w-auto max-w-[320px] object-contain shrink-0",
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <img
        src="/jansetu-ai-logo.png"
        alt="JanSetu AI — Raise Voice Make Impact"
        className={`${sizeClasses[size]} transition-transform duration-200 hover:scale-[1.02]`}
        loading="eager"
      />
    </div>
  );
};
