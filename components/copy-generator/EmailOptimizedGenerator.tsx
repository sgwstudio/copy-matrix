"use client";

import { useState } from "react";
import { VoiceMatrix } from "~/components/voice-matrix/VoiceMatrix";
// Using standard HTML elements with Tailwind CSS
import { 
  Mail, 
  Smartphone, 
  Video, 
  Camera, 
  Target,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";

const EMAIL_CHANNELS = [
  {
    id: "email-pushes",
    name: "Email & Pushes",
    icon: Mail,
    description: "Email campaigns with push notifications",
    color: "rgb(0, 0, 255)",
    specifications: {
      subjectLine: {
        recommended: "30-50 characters",
        max: "78 characters",
        absoluteMax: "150 characters"
      },
      preheader: {
        recommended: "40-90 characters",
        max: "140 characters"
      },
      bodyContent: {
        headline: "30-65 characters",
        opening: "50-100 words",
        main: "150-300 words",
        closing: "25-50 words"
      },
      cta: {
        buttonText: "2-5 words (25 characters max)",
        description: "Action-oriented verbs"
      },
      pushTitle: {
        ios: "178 characters (with body)",
        android: "65 characters",
        recommended: "30-40 characters"
      },
      pushBody: {
        ios: "178 characters total",
        android: "240 characters",
        recommended: "40-125 characters"
      }
    }
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    description: "Short-form video content",
    color: "rgb(0, 0, 255)",
    specifications: {
      caption: {
        max: "2200 characters",
        recommended: "100-300 characters"
      },
      hashtags: {
        max: "100 characters",
        recommended: "3-5 hashtags"
      },
      hook: {
        recommended: "First 3 seconds",
        max: "15 words"
      }
    }
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Camera,
    description: "Visual content and stories",
    color: "rgb(0, 0, 255)",
    specifications: {
      caption: {
        max: "2200 characters",
        recommended: "125-150 characters"
      },
      hashtags: {
        max: "30 hashtags",
        recommended: "5-10 hashtags"
      },
      stories: {
        text: "Max 2 lines",
        recommended: "1-2 words per line"
      }
    }
  }
];

interface EmailOptimizedGeneratorProps {
  useToneMatrix?: boolean;
}

export const EmailOptimizedGenerator: React.FC<EmailOptimizedGeneratorProps> = ({ 
  useToneMatrix = true 
}) => {
  const [selectedChannel, setSelectedChannel] = useState(EMAIL_CHANNELS[0].id);
  const [voiceMatrix, setVoiceMatrix] = useState({
    directness: 0,
    universality: 0,
    authority: 0,
    tension: 0,
    education: 0,
    rhythm: 0,
    expressiveCandid: 0,
  });
  const [content, setContent] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [activeTab, setActiveTab] = useState<"copy" | "preview">("copy");

  const selectedChannelData = EMAIL_CHANNELS.find(ch => ch.id === selectedChannel);

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channel: selectedChannel,
          voiceMatrix,
          mode: "email-optimized",
          specifications: selectedChannelData?.specifications
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate copy");
      }

      const data = await response.json();
      setGeneratedCopy(data);
    } catch (error) {
      console.error("Error generating copy:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getChannelIcon = (channelId: string) => {
    const channel = EMAIL_CHANNELS.find(ch => ch.id === channelId);
    return channel?.icon || Target;
  };

  const getChannelColor = (channelId: string) => {
    const channel = EMAIL_CHANNELS.find(ch => ch.id === channelId);
    return channel?.color || "bg-gray-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sneaker Release Copy Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate copy optimized for Email & Pushes, TikTok, and Instagram with detailed specifications
        </p>
      </div>

      {/* Content Input Section - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Input</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Describe what you want to create copy for
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your content idea, product description, or campaign details..."
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />
          <button
            onClick={handleGenerate}
            disabled={!content.trim() || isGenerating}
            className="w-full mt-4 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgb(0, 0, 255)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 200)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(0, 0, 255)'}
          >
            {isGenerating ? "Generating..." : "Generate Copy"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Channel Selection
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose your target platform for optimized copy generation
              </p>
              <div>
              <div className="space-y-3">
                {EMAIL_CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all ${
                        selectedChannel === channel.id
                          ? ""
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      style={selectedChannel === channel.id ? { 
                        borderColor: 'rgb(0, 0, 255)', 
                        backgroundColor: 'rgba(0, 0, 255, 0.05)' 
                      } : {}}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: channel.color }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {channel.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {channel.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          </div>

          {/* Specifications Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Channel Specifications
              </h3>
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {showSpecs ? "Hide" : "Show"} Specifications
              </button>
            </div>
          </div>

          {/* Voice Matrix */}
          {useToneMatrix && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Voice Matrix</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Define your brand voice characteristics
                </p>
                <VoiceMatrix
                  voiceMatrix={voiceMatrix}
                  onChange={setVoiceMatrix}
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* Channel Specifications */}
          {showSpecs && selectedChannelData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <selectedChannelData.icon className="h-5 w-5 mr-2" />
                  {selectedChannelData.name} Specifications
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Detailed copy requirements and character limits
                </p>
                <div>
                <div className="space-y-4">
                  {Object.entries(selectedChannelData.specifications).map(([key, spec]) => (
                    <div key={key} className="border-l-4 pl-4" style={{ borderLeftColor: 'rgb(0, 0, 255)' }}>
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div className="mt-2 space-y-1">
                        {typeof spec === 'object' ? (
                          Object.entries(spec).map(([subKey, value]) => (
                            <div key={subKey} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">
                                {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                                {value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                            {spec}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Copy Output */}
          {generatedCopy && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Copy</h3>
                
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("copy")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "copy"
                          ? "border-2"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "preview"
                          ? "border-2"
                          : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      Preview
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                {activeTab === "copy" && (
                  <div className="space-y-6">
                    {/* Email Copy Fields */}
                    {selectedChannel === "email-pushes" && generatedCopy.content && generatedCopy.content.email && (
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 dark:text-white">Email Copy</h5>
                        
                        {/* Subject Line */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subject Line
                          </label>
                          <input
                            type="text"
                            value={generatedCopy.content.email.subjectLine || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              newCopy.content.email.subjectLine = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter subject line..."
                          />
                        </div>

                        {/* Preheader Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preheader Text
                          </label>
                          <input
                            type="text"
                            value={generatedCopy.content.email.preheaderText || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              newCopy.content.email.preheaderText = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter preheader text..."
                          />
                        </div>

                        {/* Primary Headline */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Primary Headline
                          </label>
                          <input
                            type="text"
                            value={generatedCopy.content.email.body?.primaryHeadline || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              if (!newCopy.content.email.body) newCopy.content.email.body = {};
                              newCopy.content.email.body.primaryHeadline = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter primary headline..."
                          />
                        </div>

                        {/* Opening Paragraph */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Opening Paragraph
                          </label>
                          <textarea
                            value={generatedCopy.content.email.body?.openingParagraph || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              if (!newCopy.content.email.body) newCopy.content.email.body = {};
                              newCopy.content.email.body.openingParagraph = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter opening paragraph..."
                          />
                        </div>

                        {/* Main Content */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Main Content
                          </label>
                          <textarea
                            value={generatedCopy.content.email.body?.mainContent || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              if (!newCopy.content.email.body) newCopy.content.email.body = {};
                              newCopy.content.email.body.mainContent = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter main content..."
                          />
                        </div>

                        {/* Closing */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Closing Paragraph
                          </label>
                          <textarea
                            value={generatedCopy.content.email.body?.closing || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              if (!newCopy.content.email.body) newCopy.content.email.body = {};
                              newCopy.content.email.body.closing = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter closing paragraph..."
                          />
                        </div>

                        {/* Call to Action */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Call to Action Button Text
                          </label>
                          <input
                            type="text"
                            value={generatedCopy.content.email.callToAction?.buttonText || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              if (!newCopy.content.email.callToAction) newCopy.content.email.callToAction = {};
                              newCopy.content.email.callToAction.buttonText = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter CTA button text..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Push Notification Copy Fields */}
                    {selectedChannel === "email-pushes" && generatedCopy.content && generatedCopy.content.pushNotification && (
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 dark:text-white">Push Notification Copy</h5>
                        
                        {/* Push Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Push Title
                          </label>
                          <input
                            type="text"
                            value={generatedCopy.content.pushNotification.pushTitle || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              newCopy.content.pushNotification.pushTitle = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter push title..."
                          />
                        </div>

                        {/* Push Body */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Push Body
                          </label>
                          <textarea
                            value={generatedCopy.content.pushNotification.pushBody || ""}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              newCopy.content.pushNotification.pushBody = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter push body text..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Other Channels Copy Fields */}
                    {(selectedChannel === "tiktok" || selectedChannel === "instagram") && generatedCopy.content && (
                      <div className="space-y-4">
                        <h5 className="text-md font-semibold text-gray-900 dark:text-white capitalize">
                          {selectedChannel} Copy
                        </h5>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                          </label>
                          <textarea
                            value={typeof generatedCopy.content === 'string' ? generatedCopy.content : JSON.stringify(generatedCopy.content)}
                            onChange={(e) => {
                              const newCopy = { ...generatedCopy };
                              newCopy.content = e.target.value;
                              setGeneratedCopy(newCopy);
                            }}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-2 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter content..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Voice Consistency Score */}
                    {generatedCopy.voiceConsistencyScore && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(0, 0, 255, 0.05)', borderColor: 'rgba(0, 0, 255, 0.2)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: 'rgb(0, 0, 200)' }}>
                            Voice Consistency Score
                          </span>
                          <span className="text-lg font-bold" style={{ color: 'rgb(0, 0, 255)' }}>
                            {generatedCopy.voiceConsistencyScore}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {generatedCopy.suggestions && generatedCopy.suggestions.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Suggestions for Improvement
                        </h5>
                        <ul className="space-y-1">
                          {generatedCopy.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Preview Tab Content */}
                {activeTab === "preview" && (
                  <div className="space-y-6">
                    {/* Email Wireframe */}
                    {selectedChannel === "email-pushes" && generatedCopy.content && generatedCopy.content.email && (
                      <div className="space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          📧 Email Preview
                      </h4>
                      
                      {/* Email Wireframe */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 overflow-hidden">
                        {/* Email Subject */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {generatedCopy.content.email.subjectLine || "Subject Line"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {generatedCopy.content.email.preheaderText || "Preheader text appears here"}
                          </div>
                        </div>
                        
                        {/* Email Header */}
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">A</span>
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Your Brand</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hero Image */}
                        <div className="aspect-video bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <span className="text-2xl">🎨</span>
                            </div>
                            <div className="text-sm">Hero</div>
                          </div>
                        </div>
                        
                        {/* Email Body - First Module */}
                        <div className="px-4 py-6">
                          <div className="space-y-4">
                            {/* Headline */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {generatedCopy.content.email.body?.primaryHeadline || "Headline"}
                            </h1>
                            
                            {/* Opening Paragraph */}
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {generatedCopy.content.email.body?.openingParagraph || "Opening paragraph content..."}
                            </p>
                          </div>
                        </div>
                        
                        {/* First CTA */}
                        <div className="px-4 pb-4">
                          <div className="text-center">
                            <button className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold px-6 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                              {generatedCopy.content.email.callToAction?.buttonText || "Shop Now"}
                            </button>
                          </div>
                        </div>
                        
                        {/* Second Module with Image */}
                        <div className="px-4 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
                              <div className="text-center text-gray-500 dark:text-gray-400">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <span className="text-xl">🎨</span>
                                </div>
                                <div className="text-xs">Content Image</div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {generatedCopy.content.email.body?.mainContent || "Main content goes here..."}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Closing and Final CTA */}
                        <div className="px-4 py-6">
                          <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {generatedCopy.content.email.body?.closing || "Closing paragraph..."}
                            </p>
                            
                            {/* Final CTA */}
                            <div className="text-center pt-4">
                              <button className="bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold px-8 py-3 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                {generatedCopy.content.email.callToAction?.buttonText || "Shop Now"}
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Email Footer */}
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex justify-between items-center">
                            <span>© 2024 Your Brand. All rights reserved.</span>
                            <div className="flex space-x-4">
                              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Unsubscribe</a>
                              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy Policy</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Push Notification Wireframe */}
                  {selectedChannel === "email-pushes" && generatedCopy.content && generatedCopy.content.pushNotification && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        📱 Push Notification Preview
                      </h4>
                      
                      {/* Mobile Device Mockup */}
                      <div className="max-w-sm mx-auto">
                        <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                          <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                            {/* Status Bar */}
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-between items-center text-xs">
                              <span className="font-medium">9:41</span>
                              <div className="flex items-center space-x-1">
                                <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                                <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                              </div>
                            </div>
                            
                            {/* App Header */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">A</span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">Your App</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">now</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Push Notification */}
                            <div className="p-4">
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                                <div className="flex items-start space-x-3">
                                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-sm font-bold">A</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {generatedCopy.content.pushNotification.pushTitle || "Push Title"}
                                      </span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400">now</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                      {generatedCopy.content.pushNotification.pushBody || "Push notification body text..."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Home Screen Content */}
                            <div className="px-4 pb-4">
                              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  App content continues below...
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TikTok Wireframe */}
                  {selectedChannel === "tiktok" && generatedCopy.content && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        🎵 TikTok Preview
                      </h4>
                      
                      <div className="max-w-sm mx-auto">
                        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                          {/* Video Area */}
                          <div className="aspect-[9/16] bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center relative">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">▶️</span>
                              </div>
                              <div className="text-sm opacity-80">Video Content</div>
                            </div>
                            
                            {/* Caption Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 text-white">
                              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-sm leading-relaxed">
                                  {typeof generatedCopy.content === 'string' 
                                    ? generatedCopy.content 
                                    : generatedCopy.content.caption || "TikTok caption goes here..."
                                  }
                                </p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  <span className="text-pink-400 text-xs">#fyp</span>
                                  <span className="text-pink-400 text-xs">#viral</span>
                                  <span className="text-pink-400 text-xs">#trending</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 space-y-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">❤️</span>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">💬</span>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg">↗️</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instagram Wireframe */}
                  {selectedChannel === "instagram" && generatedCopy.content && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        📸 Instagram Preview
                      </h4>
                      
                      <div className="max-w-sm mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                          {/* Header */}
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">A</span>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">your_brand</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Sponsored</div>
                              </div>
                              <span className="text-gray-500 dark:text-gray-400">⋯</span>
                            </div>
                          </div>
                          
                          {/* Image Area */}
                          <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <span className="text-2xl">📸</span>
                              </div>
                              <div className="text-sm opacity-80">Image Content</div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="px-4 py-3">
                            <div className="flex items-center space-x-4 mb-3">
                              <span className="text-2xl">❤️</span>
                              <span className="text-2xl">💬</span>
                              <span className="text-2xl">↗️</span>
                              <span className="text-2xl ml-auto">🔖</span>
                            </div>
                            
                            {/* Caption */}
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-semibold text-gray-900 dark:text-white">your_brand</span>
                                <span className="text-gray-900 dark:text-white ml-2">
                                  {typeof generatedCopy.content === 'string' 
                                    ? generatedCopy.content 
                                    : generatedCopy.content.caption || "Instagram caption goes here..."
                                  }
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                View all 42 comments
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                2 hours ago
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for other content types */}
                  {selectedChannel !== "email-pushes" && selectedChannel !== "tiktok" && selectedChannel !== "instagram" && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Generated Content:</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {typeof generatedCopy.content === 'string' 
                            ? generatedCopy.content 
                            : JSON.stringify(generatedCopy.content, null, 2)
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!generatedCopy && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Ready to Generate Copy
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter your content idea and click "Generate Copy" to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
