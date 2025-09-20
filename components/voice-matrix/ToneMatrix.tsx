"use client";

import React, { useState, useRef, useEffect } from "react";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";

interface ToneMatrixProps {
  voiceMatrix: VoiceMatrixType;
  onChange: (voiceMatrix: VoiceMatrixType) => void;
  className?: string;
}

export const ToneMatrix: React.FC<ToneMatrixProps> = ({
  voiceMatrix,
  onChange,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Convert 7-dimensional voice matrix to 2D tone matrix
  const convertToToneMatrix = (vm: VoiceMatrixType) => {
    // X-axis: Provocative (-1) to Educational (+1)
    // Combine: seriousPlayful (serious = provocative), professionalConversational (conversational = provocative), confidence (high = provocative)
    const provocativeScore = (
      (vm.seriousPlayful * -0.4) + // Serious = more provocative
      (vm.professionalConversational * -0.3) + // Conversational = more provocative  
      (vm.confidence * 0.3) // High confidence = more provocative
    );
    
    // Y-axis: Playful (-1) to Serious (+1)
    // Combine: seriousPlayful, formalCasual, enthusiasm
    const seriousScore = (
      (vm.seriousPlayful * 0.5) + // Serious = more serious
      (vm.formalCasual * 0.3) + // Formal = more serious
      (vm.enthusiasm * -0.2) // Enthusiastic = less serious (more playful)
    );

    return {
      x: Math.max(-1, Math.min(1, provocativeScore)), // Provocative to Educational
      y: Math.max(-1, Math.min(1, seriousScore)) // Playful to Serious
    };
  };

  // Convert 2D tone matrix back to 7-dimensional voice matrix
  const convertFromToneMatrix = (x: number, y: number): VoiceMatrixType => {
    // X-axis: Provocative to Educational
    // Y-axis: Playful to Serious
    
    // Map back to original dimensions
    const seriousPlayful = (y * 0.6) + (x * -0.4); // Y-axis primary, X-axis secondary
    const professionalConversational = (x * -0.5) + (y * 0.3); // X-axis primary
    const formalCasual = y * 0.4; // Y-axis primary
    const confidence = (x * 0.3) + (y * 0.2); // Both axes contribute
    const enthusiasm = (y * -0.4) + (x * 0.2); // Y-axis primary (playful = enthusiastic)
    const authoritativeApproachable = (y * 0.3) + (x * 0.2); // Both axes contribute
    const empathy = (x * 0.1) + (y * -0.1); // Minimal impact

    return {
      formalCasual: Math.max(-1, Math.min(1, formalCasual)),
      authoritativeApproachable: Math.max(-1, Math.min(1, authoritativeApproachable)),
      professionalConversational: Math.max(-1, Math.min(1, professionalConversational)),
      seriousPlayful: Math.max(-1, Math.min(1, seriousPlayful)),
      confidence: Math.max(-1, Math.min(1, confidence)),
      enthusiasm: Math.max(-1, Math.min(1, enthusiasm)),
      empathy: Math.max(-1, Math.min(1, empathy)),
    };
  };

  const tonePosition = convertToToneMatrix(voiceMatrix);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      updatePosition(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Center the position on Enter/Space
      const newVoiceMatrix = convertFromToneMatrix(0, 0);
      onChange(newVoiceMatrix);
    }
  };

  const updatePosition = (e: React.MouseEvent | MouseEvent) => {
    if (!matrixRef.current) return;

    const rect = matrixRef.current.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1)); // -1 to 1, clamped
    const y = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height) * 2 - 1)); // -1 to 1, clamped

    const newVoiceMatrix = convertFromToneMatrix(x, y);
    onChange(newVoiceMatrix);
  };

  // Add global mouse event listeners for smooth dragging
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && matrixRef.current) {
        e.preventDefault();
        updatePosition(e);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, onChange]);

  // Get dynamic cursor color based on position - gradient from magenta to RGB blue
  const getCursorColor = (x: number, y: number) => {
    // X-axis: Provocative (left, -1) to Educational (right, 1) - Magenta to Blue spectrum
    // Y-axis: Playful (top, -1) to Serious (bottom, 1) - Affects intensity
    
    // Normalize to 0-1 range
    const normalizedX = (x + 1) / 2; // 0 to 1
    const normalizedY = (y + 1) / 2; // 0 to 1
    
    // Calculate RGB values for magenta to blue gradient
    // Magenta: rgb(255, 0, 255) at x=0, Blue: rgb(0, 0, 255) at x=1
    const r = Math.round(255 * (1 - normalizedX)); // 255 at left (magenta), 0 at right (blue)
    const g = 0; // Always 0 for pure magenta to blue
    const b = 255; // Always 255 for both magenta and blue
    
    // Adjust intensity based on Y position (playful to serious)
    const intensity = 0.7 + (normalizedY * 0.3); // 0.7 to 1.0
    
    return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`;
  };

  // Get the quadrant and description
  const getQuadrantInfo = (x: number, y: number) => {
    const isProvocative = x < 0;
    const isPlayful = y < 0;
    
    if (isProvocative && isPlayful) {
      return {
        quadrant: "Provocative + Playful",
        color: "from-red-500 to-orange-500",
        description: "Bold, attention-grabbing, challenges the status quo with energy"
      };
    } else if (!isProvocative && isPlayful) {
      return {
        quadrant: "Educational + Playful", 
        color: "from-yellow-400 to-amber-500",
        description: "Informative, engaging, makes learning fun and accessible"
      };
    } else if (isProvocative && !isPlayful) {
      return {
        quadrant: "Provocative + Serious",
        color: "from-blue-500 to-indigo-600", 
        description: "Authoritative, challenging, confident professional stance"
      };
    } else {
      return {
        quadrant: "Educational + Serious",
        color: "from-green-500 to-emerald-600",
        description: "Professional, trustworthy, informative and reliable"
      };
    }
  };

  const quadrantInfo = getQuadrantInfo(tonePosition.x, tonePosition.y);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Tone Matrix
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Position your brand tone on the matrix
        </p>
      </div>

      {/* 2x2 Matrix */}
      <div className="relative">
        {/* Axis Labels - Outside the matrix */}
        <div className="absolute -top-12 left-0 right-0 flex justify-between">
          <div className="text-sm font-bold text-red-600 dark:text-red-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border-2 border-red-200 dark:border-red-800">
            Provocative
          </div>
          <div className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border-2 border-blue-200 dark:border-blue-800">
            Educational
          </div>
        </div>
        
        <div className="absolute -left-16 top-0 bottom-0 flex flex-col justify-between">
          <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border-2 border-yellow-200 dark:border-yellow-800 transform -rotate-90 origin-center">
            Playful
          </div>
          <div className="text-sm font-bold text-green-600 dark:text-green-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border-2 border-green-200 dark:border-green-800 transform -rotate-90 origin-center">
            Serious
          </div>
        </div>

        <div
          ref={matrixRef}
          className={`relative w-[500px] h-[500px] mx-auto border-4 rounded-2xl cursor-crosshair focus:outline-none focus:ring-4 focus:ring-offset-4 shadow-2xl transition-all duration-200 ${
            isDragging 
              ? 'border-gray-400 dark:border-gray-500 shadow-gray-200 dark:shadow-gray-900/50' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          style={{
            background: 'linear-gradient(to right, rgb(255, 0, 255) 0%, rgb(0, 0, 255) 100%)',
            opacity: 0.1
          }}
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="slider"
          aria-label="Tone matrix - position your brand tone"
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={tonePosition.x}
        >
          {/* Grid lines with better visibility */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 dark:bg-gray-500"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 dark:bg-gray-500"></div>
          </div>

          {/* Center point indicator */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* Quadrant background hints - magenta to blue gradient */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-1/2 opacity-20" style={{ backgroundColor: 'rgb(255, 0, 255)' }}></div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20" style={{ backgroundColor: 'rgb(128, 0, 255)' }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 opacity-20" style={{ backgroundColor: 'rgb(255, 0, 128)' }}></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 opacity-20" style={{ backgroundColor: 'rgb(0, 0, 255)' }}></div>
          </div>

          {/* Quadrant labels */}
          <div className="absolute top-4 left-4 text-xs font-semibold text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
            Provocative + Playful
          </div>
          <div className="absolute top-4 right-4 text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
            Educational + Playful
          </div>
          <div className="absolute bottom-4 left-4 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
            Provocative + Serious
          </div>
          <div className="absolute bottom-4 right-4 text-xs font-semibold text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full shadow-sm">
            Educational + Serious
          </div>

          {/* Position indicator - gray arrow */}
          <div
            className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 cursor-grab active:cursor-grabbing hover:scale-110"
            style={{
              left: `${((tonePosition.x + 1) / 2) * 100}%`,
              top: `${((tonePosition.y + 1) / 2) * 100}%`,
            }}
          >
            {/* Gray arrow pointing down */}
            <div 
              className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent border-t-gray-600 dark:border-t-gray-400 mx-auto"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            ></div>
            {/* Small circle at the arrow base */}
            <div 
              className="w-3 h-3 bg-gray-600 dark:bg-gray-400 rounded-full mx-auto -mt-1"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }}
            ></div>
          </div>

          {/* Click anywhere indicator */}
          {!isDragging && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-600">
                Click anywhere to position your tone
              </div>
            </div>
          )}

          {/* Position coordinates */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-lg font-mono">
              X: {tonePosition.x.toFixed(2)} | Y: {tonePosition.y.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Quadrant Info */}
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${quadrantInfo.color}`}>
            {quadrantInfo.quadrant}
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {quadrantInfo.description}
          </p>
        </div>
      </div>

      {/* Voice Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Voice Characteristics
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div>Formality: {voiceMatrix.formalCasual > 0 ? 'Formal' : 'Casual'}</div>
          <div>Authority: {voiceMatrix.authoritativeApproachable > 0 ? 'Authoritative' : 'Approachable'}</div>
          <div>Style: {voiceMatrix.professionalConversational > 0 ? 'Professional' : 'Conversational'}</div>
          <div>Tone: {voiceMatrix.seriousPlayful > 0 ? 'Serious' : 'Playful'}</div>
          <div>Confidence: {voiceMatrix.confidence > 0 ? 'High' : 'Modest'}</div>
          <div>Energy: {voiceMatrix.enthusiasm > 0 ? 'Enthusiastic' : 'Reserved'}</div>
          <div>Empathy: {voiceMatrix.empathy > 0 ? 'High' : 'Direct'}</div>
        </div>
      </div>
    </div>
  );
};
