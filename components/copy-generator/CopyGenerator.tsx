"use client";

import React, { useState, useEffect } from "react";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";
import { VoiceMatrix } from "../voice-matrix/VoiceMatrix";
import { ToneMatrix } from "../voice-matrix/ToneMatrix";
import { CopyOutput } from "./CopyOutput";
import { ChannelSelector } from "./ChannelSelector";
import { UserAPIKey } from "../UserAPIKey";

interface CopyGeneratorProps {
  brandGuidelines?: string;
  voiceSamples?: string;
  className?: string;
  useToneMatrix?: boolean; // New prop to control which matrix to use
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

export const CopyGenerator: React.FC<CopyGeneratorProps> = ({
  brandGuidelines,
  voiceSamples,
  className,
  useToneMatrix = false,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [voiceMatrix, setVoiceMatrix] = useState<VoiceMatrixType>(defaultVoiceMatrix);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [voiceConsistencyScore, setVoiceConsistencyScore] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userApiKey, setUserApiKey] = useState<string>("");
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          channel: selectedChannel.id,
          voiceMatrix,
          brandGuidelines,
          voiceSamples,
          characterLimit: selectedChannel.characterLimit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate copy");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
      setCharacterCount(data.characterCount);
      setVoiceConsistencyScore(data.voiceConsistencyScore);
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error generating copy:", error);
      // Handle error - you might want to show a toast or error message
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedContent(null);
    setCharacterCount(0);
    setVoiceConsistencyScore(0);
    setSuggestions([]);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Copy Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate channel-optimized copy while maintaining your brand voice
        </p>
            <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              AI Mode - Powered by Google Gemini
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              ✨ Using your personal Gemini API key for unlimited AI generation
            </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              What would you like to write about?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your content idea, target audience, key message, or any specific requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={4}
            />
          </div>

          {/* Voice Matrix */}
          {useToneMatrix ? (
            <ToneMatrix
              voiceMatrix={voiceMatrix}
              onChange={setVoiceMatrix}
            />
          ) : (
            <VoiceMatrix
              voiceMatrix={voiceMatrix}
              onChange={setVoiceMatrix}
            />
          )}

          {/* Generate Button */}
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Copy"}
            </button>
            
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <CopyOutput
            content={generatedContent}
            characterCount={characterCount}
            characterLimit={selectedChannel.characterLimit}
            voiceConsistencyScore={voiceConsistencyScore}
            suggestions={suggestions}
            channel={selectedChannel}
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
};
