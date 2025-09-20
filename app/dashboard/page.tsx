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
  const [mode, setMode] = useState<"email" | "horoscope" | "multi">("email");

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam && ["email", "horoscope", "multi"].includes(modeParam)) {
      setMode(modeParam as "email" | "horoscope" | "multi");
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
                onClick={() => setMode("email")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "email"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "email" ? { backgroundColor: '#0000FF' } : {}}
              >
                <Mail className="h-4 w-4 mr-2" />
                Sneaker Release
              </button>
              <button
                onClick={() => setMode("horoscope")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "horoscope"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "horoscope" ? { backgroundColor: '#8800FF' } : {}}
              >
                <Star className="h-4 w-4 mr-2" />
                Horoscope
              </button>
              <button
                onClick={() => setMode("multi")}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "multi"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={mode === "multi" ? { backgroundColor: '#008800' } : {}}
              >
                <Layers className="h-4 w-4 mr-2" />
                Voice R&D
              </button>
            </div>
          </div>
        </div>

        {/* Generator Component */}
        {mode === "email" && <EmailOptimizedGenerator useToneMatrix={true} />}
        {mode === "horoscope" && <HoroscopeGenerator useToneMatrix={true} />}
        {mode === "multi" && <MultiGenerator />}
      </div>
    </main>
  );
};

export default Dashboard;
