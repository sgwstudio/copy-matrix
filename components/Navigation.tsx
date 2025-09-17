"use client";

import Link from "next/link";
import { Copy, Home, Settings, LogIn, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

export const Navigation: React.FC = () => {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Copy className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Copy Matrix
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4" />
                  <span>Generator</span>
                </Link>
                
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Demo Mode
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
