"use client";

import React, { useState, useEffect } from "react";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { CopyOutput } from "./CopyOutput";
import { ChannelSelector } from "./ChannelSelector";
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
  formalCasual: 0,
  authoritativeApproachable: 0,
  professionalConversational: 0,
  seriousPlayful: 0,
  confidence: 0,
  enthusiasm: 0,
  empathy: 0,
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
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [configs, setConfigs] = useState<GenerationConfig[]>([
    {
      id: "1",
      name: "Professional",
      voiceMatrix: { ...defaultVoiceMatrix, formalCasual: 0.8, professionalConversational: 0.7 },
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: false,
    },
    {
      id: "2", 
      name: "Casual",
      voiceMatrix: { ...defaultVoiceMatrix, formalCasual: -0.8, seriousPlayful: 0.6 },
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: false,
    },
  ]);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);

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
    if (!prompt.trim()) return;

    // Set all configs to generating state
    setConfigs(prevConfigs => prevConfigs.map(config => ({ ...config, isGenerating: true })));

    // Generate for each config
    const promises = configs.map(async (config) => {
      try {
        const response = await fetch("/api/generate-copy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            channel: selectedChannel.name.toLowerCase(),
            voiceMatrix: config.voiceMatrix,
            brandGuidelines,
            voiceSamples,
            characterLimit: selectedChannel.characterLimit,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to generate copy");
        }

        const data = await response.json();
        return { id: config.id, data };
      } catch (error) {
        console.error(`Failed to generate copy for ${config.name}:`, error);
        return { 
          id: config.id, 
          data: { 
            content: `Error: ${error instanceof Error ? error.message : String(error)}`,
            characterCount: 0,
            voiceConsistencyScore: 0,
            suggestions: []
          }
        };
      }
    });

    const results = await Promise.all(promises);

    // Update configs with results using functional update
    setConfigs(prevConfigs => prevConfigs.map(config => {
      const result = results.find(r => r.id === config.id);
      if (result) {
        console.log(`🎯 Updating config ${config.id} with result:`, result.data);
        return {
          ...config,
          generatedContent: result.data.content,
          characterCount: result.data.characterCount,
          voiceConsistencyScore: result.data.voiceConsistencyScore,
          suggestions: result.data.suggestions,
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
        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          {userApiKey ? "AI Mode - Using your Gemini API key" : "Demo Mode - Add your API key in Settings"}
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-6">
        {/* Channel Selection */}
        <ChannelSelector
          channels={CHANNELS}
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
        />

        {/* Prompt Input */}
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            What would you like to write about?
          </label>
          <textarea
            id="prompt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            disabled={isGenerating || !prompt.trim()}
            className="flex-1 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: 'rgb(25, 118, 210)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(21, 101, 192)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(25, 118, 210)'}
          >
            <Copy className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating All..." : "Generate All Versions"}
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
          channel={selectedChannel} 
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
              characterLimit={selectedChannel.characterLimit}
              voiceConsistencyScore={config.voiceConsistencyScore}
              suggestions={config.suggestions}
              channel={selectedChannel}
              isLoading={config.isGenerating}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
