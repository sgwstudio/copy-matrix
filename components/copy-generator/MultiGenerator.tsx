"use client";

import React, { useState, useEffect } from "react";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { CopyOutput } from "./CopyOutput";
import { FlowSelector } from "~/components/FlowSelector";
// Removed ChannelSelector import - using multi-channel selection instead
import { Copy, Plus, Trash2, RotateCcw, BarChart3, Layers, FileText, Wand2 } from "lucide-react";
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
  sneakerCulture: 0,
  marketplaceAccuracy: 0,
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

  const selectAllChannels = () => {
    setSelectedChannels(CHANNELS);
  };

  const clearAllChannels = () => {
    setSelectedChannels([]);
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
      {/* Flow Selector */}
      <FlowSelector currentMode="multi" />
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Layers className="h-6 w-6 text-green-600" />
          Voice R&D Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate multiple versions with different voice characteristics side-by-side
        </p>
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'rgba(0, 136, 0, 0.1)', color: 'rgb(0, 136, 0)' }}>
          <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'rgb(0, 136, 0)' }}></span>
          {userApiKey ? "AI Mode - Using your Gemini API key" : "Demo Mode - Add your API key in Settings"}
        </div>
      </div>

      {/* Content Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Input
        </h3>
        <div className="space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <button
            onClick={generateAll}
            disabled={isGenerating || !prompt.trim() || selectedChannels.length === 0}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating All Versions...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate All Versions
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Channels ({selectedChannels.length} selected)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllChannels}
                  className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllChannels}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CHANNELS.map((channel) => {
                const isSelected = selectedChannels.some(c => c.id === channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? "bg-green-600 border-green-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {isSelected && (
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-lg">{channel.icon}</span>
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {channel.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.characterLimit} chars
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <VoiceMatrix
              voiceMatrix={configs[0]?.voiceMatrix || defaultVoiceMatrix}
              onChange={(newMatrix) => {
                setConfigs(prevConfigs => 
                  prevConfigs.map((config, index) => 
                    index === 0 ? { ...config, voiceMatrix: newMatrix } : config
                  )
                );
              }}
            />
          </div>

          {/* Voice Configurations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Voice Configurations
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={addNewConfig}
                  disabled={isGenerating}
                  className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add Voice
                </button>
                <button
                  onClick={resetAll}
                  disabled={isGenerating}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {configs.map((config, index) => (
                <div key={config.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {config.name}
                    </span>
                    {configs.length > 1 && (
                      <button
                        onClick={() => removeConfig(config.id)}
                        disabled={isGenerating}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Generated Results */}
        <div className="lg:col-span-2">
          {/* Comparison View Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowComparison(!showComparison)}
              disabled={isGenerating || !configs.some(c => c.generatedContent)}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showComparison ? "Hide Comparison" : "Show Comparison"}
            </button>
          </div>

          {/* Comparison View */}
          {showComparison && (
            <div className="mb-6">
              <ComparisonView 
                configs={configs} 
                channels={selectedChannels} 
              />
            </div>
          )}

          {/* Voice Configurations Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {configs.map((config) => (
              <div key={config.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Config Header */}
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => updateConfigName(config.id, e.target.value)}
                    className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
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
      </div>
    </div>
  );
};
