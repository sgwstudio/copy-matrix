"use client";

import React from "react";
import { Copy, BarChart3, TrendingUp, Users, Target } from "lucide-react";

interface ComparisonViewProps {
  configs: Array<{
    id: string;
    name: string;
    generatedContent: string | null;
    characterCount: number;
    voiceConsistencyScore: number;
    suggestions: string[];
    voiceMatrix: {
      formalCasual: number;
      authoritativeApproachable: number;
      professionalConversational: number;
      seriousPlayful: number;
      confidence: number;
      enthusiasm: number;
      empathy: number;
    };
  }>;
  channels: Array<{ name: string; icon: string; characterLimit: number }>;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ configs, channels }) => {
  const validConfigs = configs.filter(config => config.generatedContent);

  if (validConfigs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Generate content to see comparison</p>
        </div>
      </div>
    );
  }

  const getVoiceCharacteristics = (voiceMatrix: any) => {
    const characteristics = [];
    
    if (voiceMatrix.formalCasual > 0.5) characteristics.push("Very Formal");
    else if (voiceMatrix.formalCasual < -0.5) characteristics.push("Very Casual");
    else characteristics.push("Neutral Formality");

    if (voiceMatrix.authoritativeApproachable > 0.5) characteristics.push("Authoritative");
    else if (voiceMatrix.authoritativeApproachable < -0.5) characteristics.push("Approachable");
    else characteristics.push("Balanced Authority");

    if (voiceMatrix.seriousPlayful > 0.5) characteristics.push("Serious");
    else if (voiceMatrix.seriousPlayful < -0.5) characteristics.push("Playful");
    else characteristics.push("Balanced Tone");

    return characteristics.join(" • ");
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 80) return "text-blue-600 dark:text-blue-400";
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-100 dark:bg-green-900/20";
    if (score >= 80) return "bg-blue-100 dark:bg-blue-900/20";
    if (score >= 70) return "bg-yellow-100 dark:bg-yellow-900/20";
    return "bg-red-100 dark:bg-red-900/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Voice Comparison Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Compare different voice approaches for {channels.length > 1 ? `${channels.length} channels` : channels[0]?.name} content
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {validConfigs.map((config, index) => (
          <div key={config.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            {/* Config Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {config.name}
              </h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBg(config.voiceConsistencyScore)} ${getScoreColor(config.voiceConsistencyScore)}`}>
                {config.voiceConsistencyScore}/100
              </div>
            </div>

            {/* Voice Characteristics */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Voice Profile:</p>
              <p>{getVoiceCharacteristics(config.voiceMatrix)}</p>
            </div>

            {/* Generated Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Copy:</p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {config.characterCount}/{channels.reduce((sum, ch) => sum + ch.characterLimit, 0)} chars
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 text-sm">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {config.generatedContent}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Consistency</span>
                <span className={`font-medium ${getScoreColor(config.voiceConsistencyScore)}`}>
                  {config.voiceConsistencyScore}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">Length</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {config.characterCount}
                </span>
              </div>
            </div>

            {/* Suggestions */}
            {config.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestions:</p>
                <ul className="space-y-1">
                  {config.suggestions.slice(0, 2).map((suggestion, idx) => (
                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {validConfigs.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Best Consistency
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Math.max(...validConfigs.map(c => c.voiceConsistencyScore))}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {validConfigs.find(c => c.voiceConsistencyScore === Math.max(...validConfigs.map(c => c.voiceConsistencyScore)))?.name}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Average Length
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(validConfigs.reduce((sum, c) => sum + c.characterCount, 0) / validConfigs.length)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">characters</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Versions
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {validConfigs.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">generated</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
