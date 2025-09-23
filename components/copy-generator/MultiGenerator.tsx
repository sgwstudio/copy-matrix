"use client";

import React, { useState, useEffect } from "react";
import { BrandVoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { CopyOutput } from "./CopyOutput";
import { FlowSelector } from "~/components/FlowSelector";
// Removed ChannelSelector import - using multi-channel selection instead
import { Copy, Plus, Trash2, RotateCcw, BarChart3, Dna, FileText, Wand2 } from "lucide-react";
import { ComparisonView } from "./ComparisonView";

interface MultiGeneratorProps {
  brandGuidelines?: string;
  voiceSamples?: string;
  className?: string;
}

const CHANNELS = [
  { 
    id: "tiktok", 
    name: "TikTok Caption", 
    icon: "🎵", 
    characterLimit: 300,
    description: "Short, punchy social media caption",
    wordCount: "15-30 words",
    structure: "2-3 short sentences",
    testFocus: "How voice handles viral/casual energy and brevity"
  },
  { 
    id: "instagram", 
    name: "Instagram Caption", 
    icon: "📸", 
    characterLimit: 2200,
    description: "Medium-length storytelling social post",
    wordCount: "80-150 words",
    structure: "1-2 paragraphs",
    testFocus: "How voice balances personal connection with brand authority"
  },
  { 
    id: "twitter", 
    name: "X/Twitter Post", 
    icon: "🐦", 
    characterLimit: 280,
    description: "Concise social media post with conversation potential",
    wordCount: "20-50 words",
    structure: "Single tweet format",
    testFocus: "How voice creates intrigue and drives conversation"
  },
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
  channelContent: Record<string, {
    content: string;
    characterCount: number;
    voiceConsistencyScore: number;
    suggestions: string[];
  }>;
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
      channelContent: {},
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
      channelContent: {},
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
      channelContent: {},
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

    // Check if server is running by making a simple health check
    try {
      const healthCheck = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "test", channel: "email" })
      });
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert("Development server is not running. Please start the server with 'npm run dev' and try again.");
        return;
      }
    }

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
            let errorMessage = "Failed to generate copy";
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
              // If response is not JSON, get text content
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError);
            const responseText = await response.text();
            console.error("Response text:", responseText);
            throw new Error("Invalid response format from server");
          }
          return { 
            configId: config.id, 
            channelId: channel.id,
            channelName: channel.name,
            data 
          };
        } catch (error) {
          console.error(`Failed to generate copy for ${config.name} on ${channel.name}:`, error);
          
          let errorMessage = "Unknown error occurred";
          if (error instanceof TypeError && error.message === "Failed to fetch") {
            errorMessage = "Server is not running. Please start the development server.";
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          return { 
            configId: config.id,
            channelId: channel.id,
            channelName: channel.name,
            data: { 
              content: `Error: ${errorMessage}`,
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

    // Update configs with separate channel content
    setConfigs(prevConfigs => prevConfigs.map(config => {
      const configResults = resultsByConfig[config.id] || [];
      if (configResults.length > 0) {
        // Store separate content for each channel
        const channelContent: Record<string, {
          content: string;
          characterCount: number;
          voiceConsistencyScore: number;
          suggestions: string[];
        }> = {};
        
        configResults.forEach(result => {
          channelContent[result.channelId] = {
            content: result.data.content,
            characterCount: result.data.characterCount,
            voiceConsistencyScore: result.data.voiceConsistencyScore,
            suggestions: result.data.suggestions,
          };
        });
        
        // Calculate overall stats for the config
        const totalCharacterCount = configResults.reduce((sum, r) => sum + r.data.characterCount, 0);
        const avgVoiceScore = configResults.reduce((sum, r) => sum + r.data.voiceConsistencyScore, 0) / configResults.length;
        const allSuggestions = configResults.flatMap(r => r.data.suggestions);

        console.log(`🎯 Updating config ${config.id} with separate channel results:`, channelContent);
        return {
          ...config,
          generatedContent: configResults.map(r => `${r.channelName}: ${r.data.content}`).join('\n\n'), // Keep combined for backward compatibility
          characterCount: totalCharacterCount,
          voiceConsistencyScore: avgVoiceScore,
          suggestions: allSuggestions,
          channelContent,
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
      channelContent: {},
    })));
  };

  const isGenerating = configs.some(config => config.isGenerating);

  return (
    <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Flow Selector */}
      <FlowSelector currentMode="multi" />
      
      {/* Header */}
      <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <Dna className="h-6 w-6 text-blue-600" />
            Voice Test Lab
          </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate multiple versions with different voice characteristics side-by-side
        </p>
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
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <button
            onClick={generateAll}
            disabled={isGenerating || !prompt.trim() || selectedChannels.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Channel Selection - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Dna className="h-5 w-5" />
              Social Media Channels ({selectedChannels.length} selected)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select channels to test your voice across different social media formats
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={selectAllChannels}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CHANNELS.map((channel) => {
            const isSelected = selectedChannels.some(c => c.id === channel.id);
            return (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? ""
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
                style={isSelected ? { 
                  borderColor: 'rgb(0, 0, 255)', 
                  backgroundColor: 'rgba(0, 0, 255, 0.05)' 
                } : {}}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{channel.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {channel.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {channel.description}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Words:</span> {channel.wordCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Structure:</span> {channel.structure}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Focus:</span> {channel.testFocus}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Configurations - Full Width */}
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

      {/* Generated Results - Full Width */}
      <div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

                {/* Channel Outputs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated Content by Channel:
                  </h4>
                  {selectedChannels.map((channel) => {
                    const channelData = config.channelContent[channel.id];
                    return (
                      <div key={channel.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{channel.icon}</span>
                          <div>
                            <h5 className="font-medium text-sm text-gray-900 dark:text-white">
                              {channel.name}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {channel.wordCount} • {channel.structure}
                            </p>
                          </div>
                        </div>
                        
                        <CopyOutput
                          content={channelData?.content || null}
                          characterCount={channelData?.characterCount || 0}
                          characterLimit={channel.characterLimit}
                          voiceConsistencyScore={channelData?.voiceConsistencyScore || 0}
                          suggestions={channelData?.suggestions || []}
                          channel={channel}
                          isLoading={config.isGenerating}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
};
