"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CopyGenerator } from "~/components/copy-generator/CopyGenerator";
import { MultiGenerator } from "~/components/copy-generator/MultiGenerator";
import { MultiChannelGenerator } from "~/components/copy-generator/MultiChannelGenerator";
import { EmailOptimizedGenerator } from "~/components/copy-generator/EmailOptimizedGenerator";
import { HoroscopeGenerator } from "~/components/copy-generator/HoroscopeGenerator";
import { Copy, Layers, Globe, Mail, Star } from "lucide-react";

const Dashboard: React.FC = () => {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"single" | "multi" | "channels" | "email" | "horoscope">("single");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam && ["single", "multi", "channels", "email", "horoscope"].includes(modeParam)) {
      setMode(modeParam as "single" | "multi" | "channels" | "email" | "horoscope");
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Mode Toggle */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setMode("single")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "single"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "single" ? { backgroundColor: 'rgb(25, 118, 210)' } : {}}
              >
                <Copy className="h-4 w-4 mr-2" />
                Single Generation
              </button>
              <button
                onClick={() => setMode("multi")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "multi"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "multi" ? { backgroundColor: 'rgb(25, 118, 210)' } : {}}
              >
                <Layers className="h-4 w-4 mr-2" />
                Multi-Voice Generation
              </button>
              <button
                onClick={() => setMode("channels")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "channels"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "channels" ? { backgroundColor: 'rgb(25, 118, 210)' } : {}}
              >
                <Globe className="h-4 w-4 mr-2" />
                Multi-Channel Generation
              </button>
                    <button
                      onClick={() => setMode("email")}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        mode === "email"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      style={mode === "email" ? { backgroundColor: 'rgb(25, 118, 210)' } : {}}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email-Optimized
                    </button>
                    <button
                      onClick={() => setMode("horoscope")}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        mode === "horoscope"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      style={mode === "horoscope" ? { backgroundColor: 'rgb(25, 118, 210)' } : {}}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Horoscope
                    </button>
            </div>
          </div>
        </div>

        {/* Generator Component */}
        {mode === "single" && <CopyGenerator useToneMatrix={true} />}
        {mode === "multi" && <MultiGenerator />}
        {mode === "channels" && <MultiChannelGenerator />}
        {mode === "email" && <EmailOptimizedGenerator useToneMatrix={true} />}
        {mode === "horoscope" && <HoroscopeGenerator useToneMatrix={true} />}
      </div>
    </main>
  );
};

export default Dashboard;
