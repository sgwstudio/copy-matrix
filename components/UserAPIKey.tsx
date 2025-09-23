"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";

interface UserAPIKeyProps {
  onApiKeyChange: (apiKey: string) => void;
  currentApiKey?: string;
}

export const UserAPIKey: React.FC<UserAPIKeyProps> = ({
  onApiKeyChange,
  currentApiKey,
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testApiKey = async (key: string) => {
    if (!key) return;
    
    setIsTesting(true);
    try {
      const response = await fetch("/api/test-gemini-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });
      
      const result = await response.json() as { valid: boolean };
      setIsValid(result.valid);
      
      if (result.valid) {
        onApiKeyChange(key);
      }
    } catch (error) {
      setIsValid(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    setIsValid(null);
  };

  const handleSave = () => {
    testApiKey(apiKey);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Key className="h-5 w-5" style={{ color: 'rgb(0, 0, 255)' }} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Gemini API Key
        </h3>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Add your personal Gemini API key to enable AI-powered copy generation. 
        Get your free key from{" "}
        <a 
          href="https://aistudio.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'rgb(0, 0, 255)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(0, 0, 200)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(0, 0, 255)'}
        >
          Google AI Studio
        </a>
      </p>

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="Enter your Gemini API key..."
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            style={{ '--tw-ring-color': 'rgb(0, 0, 255)', '--tw-border-color': 'rgb(0, 0, 255)' } as React.CSSProperties}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSave}
            disabled={!apiKey || isTesting}
            className="flex items-center space-x-2 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgb(0, 0, 255)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save & Test</span>
              </>
            )}
          </button>

          {isValid === true && (
            <div className="flex items-center space-x-1 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">API key is valid!</span>
            </div>
          )}

          {isValid === false && (
            <div className="flex items-center space-x-1 text-red-600">
              <X className="h-4 w-4" />
              <span className="text-sm">Invalid API key</span>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>• Your API key is stored locally in your browser</p>
          <p>• Free tier: 15 requests/minute, 1M tokens/day</p>
          <p>• No billing required for basic usage</p>
        </div>
      </div>
    </div>
  );
};
