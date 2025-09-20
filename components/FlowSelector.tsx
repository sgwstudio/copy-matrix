"use client";

import Link from "next/link";
import { Mail, Star, Layers } from "lucide-react";

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
    id: "horoscope", 
    name: "Horoscope", 
    icon: Star, 
    href: "/dashboard?mode=horoscope",
    color: "#8800FF"
  },
  { 
    id: "multi", 
    name: "Voice R&D", 
    icon: Layers, 
    href: "/dashboard?mode=multi",
    color: "#008800"
  },
];

export const FlowSelector: React.FC<FlowSelectorProps> = ({ currentMode, className = "" }) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
          {flows.map((flow) => {
            const Icon = flow.icon;
            const isActive = currentMode === flow.id;
            
            return (
              <Link
                key={flow.id}
                href={flow.href}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
