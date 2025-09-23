"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Key, Save, Check, X, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Allow access to settings even without authentication for demo purposes
    // if (status === "unauthenticated") {
    //   router.push("/");
    // }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserApiKey();
    }
  }, [session]);

  const fetchUserApiKey = async () => {
    try {
      const response = await fetch("/api/user/api-key");
      if (response.ok) {
        const data = await response.json() as { apiKey: string | null };
        setApiKey(data.apiKey || "");
      }
    } catch (error) {
      console.error("Failed to fetch API key:", error);
    }
  };

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
      return result.valid;
    } catch (error) {
      setIsValid(false);
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) {
      setMessage("Please enter an API key");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      // Test the API key first
      const isValidKey = await testApiKey(apiKey);
      
      if (!isValidKey) {
        setMessage("Invalid API key. Please check and try again.");
        setIsSaving(false);
        return;
      }

      // Save the API key
      const response = await fetch("/api/user/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setMessage("API key saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save API key. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderBottomColor: 'rgb(0, 0, 255)' }}></div>
      </div>
    );
  }

  // Allow access to settings even without authentication for demo purposes
  // if (status === "unauthenticated") {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Key className="h-6 w-6" style={{ color: 'rgb(0, 0, 255)' }} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                API Settings
              </h1>
            </div>
            
            <div className="space-y-6">
              {!session && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Demo Mode - Authentication Not Configured
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    To enable full authentication and user-specific API keys, you need to set up Google OAuth credentials. 
                    For now, you can test the platform in demo mode.
                  </p>
                </div>
              )}
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Gemini API Key
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Add your personal Gemini API key to enable AI-powered copy generation. 
                  Each team member uses their own key, so there are no shared costs.
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
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
                      disabled={!apiKey || isTesting || isSaving}
                      className="flex items-center space-x-2 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : isTesting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save API Key</span>
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

                  {message && (
                    <div className={`p-3 rounded-md text-sm ${
                      message.includes("successfully") 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="p-4 rounded-md" style={{ backgroundColor: 'rgba(0, 0, 255, 0.05)' }}>
                    <h3 className="font-semibold mb-2" style={{ color: 'rgb(0, 0, 255)' }}>
                      How to get your API key:
                    </h3>
                    <ol className="text-sm space-y-1 list-decimal list-inside" style={{ color: 'rgb(0, 0, 200)' }}>
                      <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Get API key" in the left sidebar</li>
                      <li>Create a new API key or use an existing one</li>
                      <li>Copy the key and paste it above</li>
                    </ol>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Your API key is stored securely in our database</p>
                    <p>• Free tier: 15 requests/minute, 1M tokens/day</p>
                    <p>• No billing required for basic usage</p>
                    <p>• Each team member uses their own key</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
        <div>© 2025 GG Copy Matrix. All rights reserved.</div>
        <div className="mt-2 text-sm">Built with Next.js, TypeScript, and Tailwind CSS.</div>
        <div className="mt-1 text-sm">Code by SGW</div>
      </footer>
    </div>
  );
}
