"use client";

import "./layout.css";

import * as React from "react";
import Link from "next/link";

import {
  Copy,
  Sparkles,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Users,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Voice Matrix System",
    description: "Sophisticated sliders to define your brand voice characteristics with real-time feedback",
  },
  {
    icon: Globe,
    title: "Multi-Channel Optimization",
    description: "Generate copy optimized for Email, LinkedIn, Instagram, Twitter, Web, and more",
  },
  {
    icon: BarChart3,
    title: "Consistency Scoring",
    description: "Real-time voice consistency analysis to maintain brand alignment across all content",
  },
  {
    icon: Zap,
    title: "AI-Powered Generation",
    description: "Leverage Google Gemini Flash 2.5 for intelligent, context-aware copy generation",
  },
];

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Copy className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
              Copy Matrix
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            AI-powered copywriting platform that maintains brand voice consistency
            across multiple marketing channels
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Generating Copy
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <button className="inline-flex items-center px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Everything you need to create consistent, high-quality copy across all channels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Simple steps to generate perfect copy every time
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Define Your Voice
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Use the Voice Matrix sliders to define your brand characteristics
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Select Channel
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose your target platform and enter your content idea
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Generate & Refine
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get AI-generated copy with consistency scoring and suggestions
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Copywriting?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of marketers creating consistent, high-quality copy
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Copy Matrix. Built with Next.js, TypeScript, and Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  );
};

export default Home;
