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
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <div className="container mx-auto px-4 py-8 flex-1">

            {/* Generator Component */}
            {mode === "email" && <EmailOptimizedGenerator useToneMatrix={true} />}
            {mode === "horoscope" && <HoroscopeGenerator />}
            {mode === "multi" && <MultiGenerator />}
          </div>
          
          {/* Footer */}
          <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
            <div>© 2025 GG Copy Matrix. All rights reserved.</div>
            <div className="mt-2 text-sm">Built with Next.js, TypeScript, and Tailwind CSS.</div>
            <div className="mt-1 text-sm">Code by SGW</div>
          </footer>
        </main>
  );
};

export default Dashboard;
