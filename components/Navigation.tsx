"use client";

import Link from "next/link";
import { Settings, User, ChevronDown, Copy, Layers, Globe, Mail, Star } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

const modes = [
  { id: "single", name: "Single Channel", icon: Copy, href: "/dashboard?mode=single" },
  { id: "multi", name: "Multi Channel", icon: Layers, href: "/dashboard?mode=multi" },
  { id: "channels", name: "All Channels", icon: Globe, href: "/dashboard?mode=channels" },
    { id: "email", name: "Sneaker Release", icon: Mail, href: "/dashboard?mode=email" },
  { id: "horoscope", name: "Horoscope", icon: Star, href: "/dashboard?mode=horoscope" },
];

export const Navigation: React.FC = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check for valid API key when user is signed in
  useEffect(() => {
    const checkApiKey = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/api-key');
          const data = await response.json();
          setHasValidApiKey(!!data.apiKey);
        } catch (error) {
          console.error('Error checking API key:', error);
          setHasValidApiKey(false);
        }
      } else {
        setHasValidApiKey(false);
      }
    };

    checkApiKey();
  }, [session]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              GG Copy Matrix
            </Link>
            <div className="flex items-baseline space-x-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {session && hasValidApiKey ? "Real AI Mode" : "Demo Mode"}
              </div>
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  backgroundColor: session && hasValidApiKey ? '#22c55e' : 'rgb(0, 0, 255)' 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                {/* Generator Modes Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    <span>Generator</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        {modes.map((mode) => (
                          <Link
                            key={mode.id}
                            href={mode.href}
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <mode.icon className="h-4 w-4" />
                            <span>{mode.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Link
                  href="/settings"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </>
            ) : null}
            
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-3 py-2 rounded-md text-white transition-colors"
                style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
