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

  // Calculate color based on slider position along magenta to blue gradient
  const getSliderColor = (sliderValue: number) => {
    // Normalize value from -1 to 1 to 0 to 1
    const normalizedValue = (sliderValue + 1) / 2;
    
    // Interpolate between magenta (#FF00FF) and blue (#0000FF)
    const r = Math.round(255 * (1 - normalizedValue)); // 255 at left (magenta), 0 at right (blue)
    const g = 0; // Always 0 for both magenta and blue
    const b = 255; // Always 255 for both magenta and blue
    
    return `rgb(${r}, ${g}, ${b})`;
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
        {/* Gradient Background */}
        <div 
          className="w-full h-2 rounded-lg absolute top-0"
          style={{ 
            background: 'linear-gradient(90deg, #FF00FF, #0000FF)'
          }}
        />
        
        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10 slider"
          style={{
            background: 'transparent',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        
        {/* Dynamic colored dot */}
        <div
          className="absolute top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-lg transform -translate-y-1 transition-all duration-75"
          style={{
            left: `calc(${((value + 1) / 2) * 100}% - 8px)`,
            backgroundColor: getSliderColor(value)
          }}
        />
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
};
