"use client";

import React, { useState, useEffect } from "react";
import { BrandVoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { CopyOutput } from "./CopyOutput";
import { Copy, Plus, Trash2, RotateCcw, Globe } from "lucide-react";

interface MultiChannelGeneratorProps {
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

interface ChannelGeneration {
  channel: typeof CHANNELS[0];
  generatedContent: string | null;
  characterCount: number;
  voiceConsistencyScore: number;
  suggestions: string[];
  isGenerating: boolean;
}

export const MultiChannelGenerator: React.FC<MultiChannelGeneratorProps> = ({
  brandGuidelines,
  voiceSamples,
  className,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<typeof CHANNELS[0][]>([
    CHANNELS[0], // Start with Email selected
  ]);
  const [voiceMatrix, setVoiceMatrix] = useState<VoiceMatrixType>(defaultVoiceMatrix);
  const [generations, setGenerations] = useState<ChannelGeneration[]>([]);
  const [userApiKey, setUserApiKey] = useState<string>("");

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

  const generateForAllChannels = async () => {
    if (!prompt.trim() || selectedChannels.length === 0) return;

    // Initialize generations for selected channels
    const initialGenerations: ChannelGeneration[] = selectedChannels.map(channel => ({
      channel,
      generatedContent: null,
      characterCount: 0,
      voiceConsistencyScore: 0,
      suggestions: [],
      isGenerating: true,
    }));
    setGenerations(initialGenerations);

    // Generate for each selected channel
    const promises = selectedChannels.map(async (channel) => {
      try {
        const response = await fetch("/api/generate-copy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            channel: channel.name.toLowerCase(),
            voiceMatrix,
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
        return { channelId: channel.id, data };
      } catch (error) {
        console.error(`Failed to generate copy for ${channel.name}:`, error);
        return { 
          channelId: channel.id, 
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

    // Update generations with results
    setGenerations(prevGenerations => 
      prevGenerations.map(gen => {
        const result = results.find(r => r.channelId === gen.channel.id);
        if (result) {
          return {
            ...gen,
            generatedContent: result.data.content,
            characterCount: result.data.characterCount,
            voiceConsistencyScore: result.data.voiceConsistencyScore,
            suggestions: result.data.suggestions,
            isGenerating: false,
          };
        }
        return { ...gen, isGenerating: false };
      })
    );
  };

  const resetAll = () => {
    setPrompt("");
    setGenerations([]);
  };

  const isGenerating = generations.some(gen => gen.isGenerating);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Multi-Channel Copy Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate copy for multiple channels with the same voice characteristics
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

        {/* Voice Matrix */}
        <VoiceMatrix voiceMatrix={voiceMatrix} onChange={setVoiceMatrix} />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateForAllChannels}
            disabled={isGenerating || !prompt.trim() || selectedChannels.length === 0}
            className="flex-1 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: 'rgb(0, 0, 255)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
          >
            <Globe className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate for All Channels"}
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

      {/* Generated Content Grid */}
      {generations.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generated Content
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {generations.map((gen) => (
              <div key={gen.channel.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
                {/* Channel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{gen.channel.icon}</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {gen.channel.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {gen.channel.characterLimit} chars
                  </span>
                </div>

                {/* Output */}
                <CopyOutput
                  content={gen.generatedContent}
                  characterCount={gen.characterCount}
                  characterLimit={gen.channel.characterLimit}
                  voiceConsistencyScore={gen.voiceConsistencyScore}
                  suggestions={gen.suggestions}
                  channel={gen.channel}
                  isLoading={gen.isGenerating}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

