"use client";

import Link from "next/link";
import { Settings, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";


export const Navigation: React.FC = () => {
  const { data: session, status } = useSession();
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

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
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                {session && hasValidApiKey ? "Real AI Mode" : "Demo Mode"}
              </div>
              <div 
                className="w-2 h-2 rounded-full ml-2" 
                style={{ 
                  backgroundColor: session && hasValidApiKey ? '#22c55e' : '#FF00FF' 
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                
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
