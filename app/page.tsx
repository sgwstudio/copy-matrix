"use client";

import "./layout.css";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import {
  CheckCircle,
  LogIn,
} from "lucide-react";
import { AnimatedText } from "~/components/AnimatedText";

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
    <main className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ background: 'linear-gradient(135deg, rgb(227, 242, 253) 0%, rgb(235, 235, 235) 100%)' }}>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <AnimatedText 
              text="WIP Demo for the 2025 Marcom Annual Summit"
              className="text-5xl md:text-7xl font-bold text-purple-600 dark:text-purple-400 mb-4"
            />
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg bg-gray-50 dark:bg-gray-800 mb-6">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              Access-Only Platform
            </div>
          </div>
          
          <div className="flex justify-center">
            {session ? (
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome back, {session.user?.name || session.user?.email}!
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(0, 0, 255)', '&:hover': { backgroundColor: 'rgb(0, 0, 200)' } }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
                >
                  Go to Generator
                </Link>
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg transition-colors"
                style={{ backgroundColor: 'rgb(0, 0, 255)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
              >
                <LogIn className="mr-2 h-5 w-5" />
                Sign In to Get Started
              </Link>
            )}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 GG Copy Matrix. Built with Next.js, TypeScript, and Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
