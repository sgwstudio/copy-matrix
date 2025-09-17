"use client";

import React, { useState } from "react";
import { Copy, Check, RefreshCw, Download } from "lucide-react";
import { cn } from "~/lib/utils";

interface Channel {
  id: string;
  name: string;
  icon: string;
  characterLimit: number;
}

interface CopyOutputProps {
  content: string | null;
  characterCount: number;
  characterLimit: number;
  voiceConsistencyScore: number;
  suggestions: string[];
  channel: Channel;
  isLoading: boolean;
  className?: string;
}

export const CopyOutput: React.FC<CopyOutputProps> = ({
  content,
  characterCount,
  characterLimit,
  voiceConsistencyScore,
  suggestions,
  channel,
  isLoading,
  className,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getCharacterCountColor = () => {
    const percentage = (characterCount / characterLimit) * 100;
    if (percentage > 90) return "text-red-500";
    if (percentage > 75) return "text-yellow-500";
    return "text-green-500";
  };

  const getVoiceScoreColor = () => {
    if (voiceConsistencyScore >= 80) return "text-green-500";
    if (voiceConsistencyScore >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Generating copy...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">{channel.icon}</div>
            <p>Generated copy will appear here</p>
            <p className="text-sm mt-1">Character limit: {characterLimit}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Generated Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{channel.icon}</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {channel.name} Copy
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
            
            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Character Count
            </span>
            <span className={cn("text-sm font-bold", getCharacterCountColor())}>
              {characterCount}/{characterLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                characterCount > characterLimit * 0.9
                  ? "bg-red-500"
                  : characterCount > characterLimit * 0.75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
              style={{ width: `${Math.min((characterCount / characterLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Voice Consistency
            </span>
            <span className={cn("text-sm font-bold", getVoiceScoreColor())}>
              {voiceConsistencyScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                voiceConsistencyScore >= 80
                  ? "bg-green-500"
                  : voiceConsistencyScore >= 60
                  ? "bg-yellow-500"
                  : "bg-red-500"
              )}
              style={{ width: `${voiceConsistencyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Suggestions for Improvement
          </h4>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-800 dark:text-blue-200">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
