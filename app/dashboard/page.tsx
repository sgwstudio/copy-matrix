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

        {/* Generator Component */}
        {mode === "email" && <EmailOptimizedGenerator useToneMatrix={true} />}
        {mode === "horoscope" && <HoroscopeGenerator />}
        {mode === "multi" && <MultiGenerator />}
      </div>
    </main>
  );
};

export default Dashboard;
