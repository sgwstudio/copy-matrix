"use client";

import React from "react";
import { cn } from "~/lib/utils";

interface VoiceMatrixSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  className?: string;
}

export const VoiceMatrixSlider: React.FC<VoiceMatrixSliderProps> = ({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {value.toFixed(1)}
        </span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
        />
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};
