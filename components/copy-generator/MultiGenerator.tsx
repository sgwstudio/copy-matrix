"use client";

import React, { useState, useEffect } from "react";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { CopyOutput } from "./CopyOutput";
// Removed ChannelSelector import - using multi-channel selection instead
import { Copy, Plus, Trash2, RotateCcw, BarChart3 } from "lucide-react";
import { ComparisonView } from "./ComparisonView";

interface MultiGeneratorProps {
  brandGuidelines?: string;
  voiceSamples?: string;
  className?: string;
}

const CHANNELS = [
  { id: "email", name: "Email", icon: "📧", characterLimit: 500 },
  { id: "linkedin", name: "LinkedIn", icon: "💼", characterLimit: 3000 },
  { id: "instagram", name: "Instagram", icon: "📸", characterLimit: 2200 },
  { id: "twitter", name: "Twitter", icon: "🐦", characterLimit: 280 },
  { id: "web", name: "Web", icon: "🌐", characterLimit: 1000 },
  { id: "facebook", name: "Facebook", icon: "👥", characterLimit: 2000 },
  { id: "tiktok", name: "TikTok", icon: "🎵", characterLimit: 300 },
];

const defaultVoiceMatrix: VoiceMatrixType = {
  directness: 0,
  universality: 0,
  authority: 0,
  tension: 0,
  education: 0,
  rhythm: 0,
  expressiveCandid: 0,
};

interface GenerationConfig {
  id: string;
  name: string;
  voiceMatrix: VoiceMatrixType;
  generatedContent: string | null;
  characterCount: number;
  voiceConsistencyScore: number;
  suggestions: string[];
  isGenerating: boolean;
}

export const MultiGenerator: React.FC<MultiGeneratorProps> = ({
  brandGuidelines,
  voiceSamples,
  className,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<typeof CHANNELS[0][]>([
    CHANNELS[0], // Start with Email selected
  ]);
  const [configs, setConfigs] = useState<GenerationConfig[]>([
    {
      id: "1",
      name: "Professional",
      voiceMatrix: { ...defaultVoiceMatrix, directness: 0.8, authority: 0.7, expressiveCandid: 0.3 },
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: false,
    },
    {
      id: "2", 
      name: "Casual",
      voiceMatrix: { ...defaultVoiceMatrix, directness: -0.3, authority: -0.2, expressiveCandid: -0.4 },
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: false,
    },
  ]);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);

  const toggleChannel = (channel: typeof CHANNELS[0]) => {
    setSelectedChannels(prev => {
      const isSelected = prev.some(c => c.id === channel.id);
      if (isSelected) {
        return prev.filter(c => c.id !== channel.id);
      } else {
        return [...prev, channel];
      }
    });
  };

  useEffect(() => {
    // Check if user has an API key stored in database
    const checkUserApiKey = async () => {
      try {
        const response = await fetch("/api/user/api-key");
        if (response.ok) {
          const data = await response.json();
          setUserApiKey(data.apiKey || "");
        }
      } catch (error) {
        console.error("Failed to fetch user API key:", error);
      }
    };

    checkUserApiKey();
  }, []);

  const addNewConfig = () => {
    const newId = (configs.length + 1).toString();
    const newConfig: GenerationConfig = {
      id: newId,
      name: `Voice ${newId}`,
      voiceMatrix: { ...defaultVoiceMatrix },
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: false,
    };
    setConfigs([...configs, newConfig]);
  };

  const removeConfig = (id: string) => {
    if (configs.length > 1) {
      setConfigs(configs.filter(config => config.id !== id));
    }
  };

  const updateConfigName = (id: string, name: string) => {
    setConfigs(prevConfigs => prevConfigs.map(config => 
      config.id === id ? { ...config, name } : config
    ));
  };

  const updateConfigVoiceMatrix = (id: string, voiceMatrix: VoiceMatrixType) => {
    setConfigs(prevConfigs => prevConfigs.map(config => 
      config.id === id ? { ...config, voiceMatrix } : config
    ));
  };

  const generateAll = async () => {
    if (!prompt.trim() || selectedChannels.length === 0) return;

    // Set all configs to generating state
    setConfigs(prevConfigs => prevConfigs.map(config => ({ ...config, isGenerating: true })));

    // Generate for each config and each selected channel
    const promises = configs.flatMap(config => 
      selectedChannels.map(async (channel) => {
        try {
          const response = await fetch("/api/generate-copy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt,
              channel: channel.name.toLowerCase(),
              voiceMatrix: config.voiceMatrix,
              brandGuidelines,
              voiceSamples,
              characterLimit: channel.characterLimit,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate copy");
          }

          const data = await response.json();
          return { 
            configId: config.id, 
            channelId: channel.id,
            channelName: channel.name,
            data 
          };
        } catch (error) {
          console.error(`Failed to generate copy for ${config.name} on ${channel.name}:`, error);
          return { 
            configId: config.id,
            channelId: channel.id,
            channelName: channel.name,
            data: { 
              content: `Error: ${error instanceof Error ? error.message : String(error)}`,
              characterCount: 0,
              voiceConsistencyScore: 0,
              suggestions: []
            }
          };
        }
      })
    );

    const results = await Promise.all(promises);

    // Group results by config and create combined content
    const resultsByConfig = results.reduce((acc, result) => {
      if (!acc[result.configId]) {
        acc[result.configId] = [];
      }
      acc[result.configId].push(result);
      return acc;
    }, {} as Record<string, typeof results>);

    // Update configs with combined results
    setConfigs(prevConfigs => prevConfigs.map(config => {
      const configResults = resultsByConfig[config.id] || [];
      if (configResults.length > 0) {
        // Combine all channel results for this config
        const combinedContent = configResults.map(r => 
          `## ${r.channelName}\n${r.data.content}`
        ).join('\n\n');
        
        const totalCharacterCount = configResults.reduce((sum, r) => sum + r.data.characterCount, 0);
        const avgVoiceScore = configResults.reduce((sum, r) => sum + r.data.voiceConsistencyScore, 0) / configResults.length;
        const allSuggestions = configResults.flatMap(r => r.data.suggestions);

        console.log(`🎯 Updating config ${config.id} with combined results:`, configResults);
        return {
          ...config,
          generatedContent: combinedContent,
          characterCount: totalCharacterCount,
          voiceConsistencyScore: avgVoiceScore,
          suggestions: allSuggestions,
          isGenerating: false,
        };
      }
      return { ...config, isGenerating: false };
    }));
  };

  const resetAll = () => {
    setPrompt("");
    setConfigs(prevConfigs => prevConfigs.map(config => ({
      ...config,
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
    })));
  };

  const isGenerating = configs.some(config => config.isGenerating);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Multi-Voice Copy Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate multiple versions with different voice characteristics side-by-side
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'rgba(0, 0, 255, 0.1)', color: 'rgb(0, 0, 200)' }}>
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'rgb(0, 0, 255)' }}></span>
          {userApiKey ? "AI Mode - Using your Gemini API key" : "Demo Mode - Add your API key in Settings"}
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Channels
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {CHANNELS.map((channel) => {
              const isSelected = selectedChannels.some(c => c.id === channel.id);
              return (
                <button
                  key={channel.id}
                  onClick={() => toggleChannel(channel)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                  }`}
                  disabled={isGenerating}
                >
                  <span className="text-2xl mb-1">{channel.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {channel.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {channel.characterLimit} chars
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What would you like to write about?
          </label>
          <textarea
            id="prompt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            style={{ '--tw-ring-color': 'rgb(0, 0, 255)', '--tw-border-color': 'rgb(0, 0, 255)' } as React.CSSProperties}
            rows={4}
            placeholder="Describe your content idea, target audience, key message, or any specific requirements..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateAll}
            disabled={isGenerating || !prompt.trim() || selectedChannels.length === 0}
            className="flex-1 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: 'rgb(0, 0, 255)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : `Generate for ${selectedChannels.length} Channel${selectedChannels.length !== 1 ? 's' : ''}`}
          </button>
          <button
            onClick={addNewConfig}
            disabled={isGenerating}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Voice
          </button>
          <button
            onClick={() => setShowComparison(!showComparison)}
            disabled={isGenerating || !configs.some(c => c.generatedContent)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showComparison ? "Hide Comparison" : "Show Comparison"}
          </button>
          <button
            onClick={resetAll}
            disabled={isGenerating}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Comparison View */}
      {showComparison && (
        <ComparisonView 
          configs={configs} 
          channels={selectedChannels} 
        />
      )}

      {/* Voice Configurations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {configs.map((config) => (
          <div key={config.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            {/* Config Header */}
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfigName(config.id, e.target.value)}
                className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                disabled={isGenerating}
              />
              {configs.length > 1 && (
                <button
                  onClick={() => removeConfig(config.id)}
                  disabled={isGenerating}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Voice Matrix */}
            <VoiceMatrix 
              voiceMatrix={config.voiceMatrix} 
              onChange={(voiceMatrix) => updateConfigVoiceMatrix(config.id, voiceMatrix)}
            />

            {/* Output */}
            <CopyOutput
              content={config.generatedContent}
              characterCount={config.characterCount}
              characterLimit={selectedChannels.reduce((sum, ch) => sum + ch.characterLimit, 0)}
              voiceConsistencyScore={config.voiceConsistencyScore}
              suggestions={config.suggestions}
              channel={selectedChannels[0] || CHANNELS[0]}
              isLoading={config.isGenerating}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
