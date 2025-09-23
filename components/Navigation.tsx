"use client";

import Link from "next/link";
import { Settings, User, ChevronDown, Mail, Star, Dna, LogOut } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

const modes = [
  { id: "email", name: "Sneaker Release", icon: Mail, href: "/dashboard?mode=email" },
  { id: "multi", name: "Voice Test Lab", icon: Dna, href: "/dashboard?mode=multi" },
  { id: "horoscope", name: "Horoscope", icon: Star, href: "/dashboard?mode=horoscope" },
];

export const Navigation: React.FC = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
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

  const getFirstName = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ')[0];
    }
    if (email) {
      return email.split('@')[0];
    }
    return 'User';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              GG Copy Matrix
            </Link>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" style={{ 
              backgroundColor: session && hasValidApiKey ? 'rgba(52, 120, 52, 0.15)' : 'rgba(255, 0, 255, 0.15)',
              color: session && hasValidApiKey ? '#347834' : '#FF00FF'
            }}>
              {session && hasValidApiKey ? "Real AI Mode" : "Demo Mode"}
              <div 
                className="w-2 h-2 rounded-full ml-2" 
                style={{ 
                  backgroundColor: session && hasValidApiKey ? '#347834' : '#FF00FF' 
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
                    <span>Modes</span>
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
              </>
            ) : null}
            
            {session ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {getFirstName(session.user?.name, session.user?.email)}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          signOut();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
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
