"use client";

import "./layout.css";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  LogIn,
  Sparkles,
  Lock,
  Mountain,
  Mail,
  Star,
  Dna,
} from "lucide-react";

const Home: React.FC = () => {
  const { data: session, status } = useSession();


  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: 'rgb(0, 0, 255)' }}></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
                  <div className="mb-8">
                    <div className="flex justify-center items-center">
                      <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium" style={{ 
                        backgroundColor: 'rgba(156, 163, 175, 0.15)',
                        color: '#6B7280'
                      }}>
                        Marcom Annual Summit 2025
                      </div>
                    </div>
                  </div>
            
            <div className="flex justify-center">
              {session ? (
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                    Welcome back, {(session.user?.name || session.user?.email || '').split(' ')[0]}.
                  </div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
                    What do you want to work on today?
                  </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                           <Link
                             href="/dashboard?mode=email"
                             className="flex items-center justify-center px-6 py-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
                             style={{ backgroundColor: '#0000FF' }}
                           >
                             <Mail className="h-4 w-4 mr-2" />
                             Sneaker Release
                           </Link>
        <Link
          href="/dashboard?mode=multi"
          className="flex items-center justify-center px-6 py-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: '#0000FF' }}
        >
          <Dna className="h-4 w-4 mr-2" />
          Voice Test Lab
        </Link>
                           <Link
                             href="/dashboard?mode=horoscope"
                             className="flex items-center justify-center px-6 py-4 text-white font-semibold rounded-lg transition-colors hover:opacity-90"
                             style={{ backgroundColor: '#8800FF' }}
                           >
                             <Star className="h-4 w-4 mr-2" />
                             Horoscope
                           </Link>
                         </div>
                </div>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
                >
                  → Sign In to Get Started
                </Link>
              )}
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
        <div>© 2025 GG Copy Matrix. All rights reserved.</div>
        <div className="mt-2 text-sm">Built with Next.js, TypeScript, and Tailwind CSS.</div>
            <div className="mt-1 text-sm">Code by SGW</div>
      </footer>
    </main>
  );
};

export default Home;
