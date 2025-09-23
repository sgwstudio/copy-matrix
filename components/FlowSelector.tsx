"use client";

import Link from "next/link";
import { Mail, Star, Dna } from "lucide-react";

interface FlowSelectorProps {
  currentMode: "email" | "horoscope" | "multi";
  className?: string;
}

const flows = [
  { 
    id: "email", 
    name: "Sneaker Release", 
    icon: Mail, 
    href: "/dashboard?mode=email",
    color: "#0000FF"
  },
  { 
    id: "multi", 
    name: "Voice Test Lab", 
    icon: Dna, 
    href: "/dashboard?mode=multi",
    color: "#0000FF"
  },
  { 
    id: "horoscope", 
    name: "Horoscope", 
    icon: Star, 
    href: "/dashboard?mode=horoscope",
    color: "#8800FF"
  },
];

export const FlowSelector: React.FC<FlowSelectorProps> = ({ currentMode, className = "" }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {flows.map((flow) => {
            const Icon = flow.icon;
            const isActive = currentMode === flow.id;
            
            return (
              <Link
                key={flow.id}
                href={flow.href}
                className={`flex items-center justify-center px-6 py-4 font-semibold rounded-lg transition-colors ${
                  isActive 
                    ? "text-white hover:opacity-90" 
                    : "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                style={isActive ? { backgroundColor: flow.color } : {}}
              >
                <Icon className="h-4 w-4 mr-2" />
                {flow.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
