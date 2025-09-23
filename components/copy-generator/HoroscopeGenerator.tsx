"use client";

import { useState } from "react";
import { FlowSelector } from "~/components/FlowSelector";
import {
  Sparkles,
  Star,
  Target,
  Info,
  Wand2,
  Calendar,
  FileText,
} from "lucide-react";

const ZODIAC_SIGNS = [
  { id: "aries", name: "Aries", symbol: "♈", element: "Fire" },
  { id: "taurus", name: "Taurus", symbol: "♉", element: "Earth" },
  { id: "gemini", name: "Gemini", symbol: "♊", element: "Air" },
  { id: "cancer", name: "Cancer", symbol: "♋", element: "Water" },
  { id: "leo", name: "Leo", symbol: "♌", element: "Fire" },
  { id: "virgo", name: "Virgo", symbol: "♍", element: "Earth" },
  { id: "libra", name: "Libra", symbol: "♎", element: "Air" },
  { id: "scorpio", name: "Scorpio", symbol: "♏", element: "Water" },
  { id: "sagittarius", name: "Sagittarius", symbol: "♐", element: "Fire" },
  { id: "capricorn", name: "Capricorn", symbol: "♑", element: "Earth" },
  { id: "aquarius", name: "Aquarius", symbol: "♒", element: "Air" },
  { id: "pisces", name: "Pisces", symbol: "♓", element: "Water" },
];

const HOROSCOPE_THEMES = [
  { id: 0, name: "Beginnings", description: "freedom, originality", icon: "🌱" },
  { id: 1, name: "Rules", description: "origins, techniques", icon: "📜" },
  { id: 2, name: "Aesthetics", description: "comforts, sumptuousness", icon: "🎨" },
  { id: 3, name: "Intuition", description: "depth, feeling", icon: "🔮" },
  { id: 4, name: "Creativity", description: "expression, doing", icon: "✨" },
  { id: 5, name: "Experimentation", description: "technology, creation", icon: "🧪" },
  { id: 6, name: "Adventure", description: "newness, adventure", icon: "🗺️" },
  { id: 7, name: "Athleticism", description: "mastery, winning", icon: "🏆" },
];

export const HoroscopeGenerator: React.FC = () => {
  const [selectedSigns, setSelectedSigns] = useState<string[]>([ZODIAC_SIGNS[0].id]);
  const [content, setContent] = useState("");
  const [generatedHoroscopes, setGeneratedHoroscopes] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert("Please provide a horoscope prompt or theme.");
      return;
    }

    if (selectedSigns.length === 0) {
      alert("Please select at least one zodiac sign.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
          channel: "horoscope",
          mode: "horoscope",
          zodiacSigns: selectedSigns,
        }),
      });

      let result;
      try {
        result = await response.json();
        console.log("API Response:", result);
        console.log("Response status:", response.status);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        const responseText = await response.text();
        console.error("Response text:", responseText);
        alert("Invalid response format from server");
        return;
      }
      
      if (!response.ok) {
        console.error("API Error:", result);
        alert(`Failed to generate horoscopes: ${result?.error || 'Unknown error'}`);
        return;
      }
      
      // Check if the response has content
      if (!result || (!result.content && !result.error)) {
        console.error("Empty or invalid response:", result);
        alert("Failed to generate horoscopes: Empty response from server");
        return;
      }
      
      // Check if there's an error in the response
      if (result.error) {
        console.error("Response contains error:", result.error);
        alert(`Failed to generate horoscopes: ${result.error}`);
        return;
      }
      
      setGeneratedHoroscopes(result);
    } catch (error) {
      console.error("Error generating horoscopes:", error);
      alert("Failed to generate horoscopes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedZodiacSigns = selectedSigns.map(signId => ZODIAC_SIGNS.find(s => s.id === signId)).filter(Boolean);

  const toggleSignSelection = (signId: string) => {
    setSelectedSigns(prev => {
      if (prev.includes(signId)) {
        return prev.filter(id => id !== signId);
      } else {
        return [...prev, signId];
      }
    });
  };

  const selectAllSigns = () => {
    setSelectedSigns(ZODIAC_SIGNS.map(sign => sign.id));
  };

  const clearAllSigns = () => {
    setSelectedSigns([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Flow Selector */}
      <FlowSelector currentMode="horoscope" />
      
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-purple-600" />
          Horoscope Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Generate 8 themed horoscope versions for each zodiac sign
        </p>
      </div>

      {/* Content Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Input
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horoscope Prompt
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your horoscope prompt or theme here. Include tone and voice instructions directly in your prompt..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Include tone, voice, and style instructions directly in your prompt for better control over the generated horoscopes.
            </p>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !content.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Zodiac Sign Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Zodiac Signs ({selectedSigns.length} selected)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllSigns}
                  className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAllSigns}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ZODIAC_SIGNS.map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => toggleSignSelection(sign.id)}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedSigns.includes(sign.id)
                      ? ""
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  style={selectedSigns.includes(sign.id) ? { 
                    borderColor: 'rgb(136, 0, 255)', 
                    backgroundColor: 'rgba(136, 0, 255, 0.05)' 
                  } : {}}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{sign.symbol}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {sign.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {sign.element}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>


          {/* Theme Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Horoscope Themes
            </h3>
            <div className="space-y-3">
              {HOROSCOPE_THEMES.map((theme) => (
                <div key={theme.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="text-lg">{theme.icon}</span>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      Day {theme.id}: {theme.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {theme.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Generated Horoscopes */}
        <div className="lg:col-span-2">
          {console.log("Generated horoscopes state:", generatedHoroscopes)}
          {generatedHoroscopes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generated Horoscopes for {selectedZodiacSigns.map(sign => `${sign?.name} ${sign?.symbol}`).join(', ')}
                </h3>
                
                <div className="space-y-6">
                  {generatedHoroscopes.content ? (
                    // Handle object with zodiac sign keys (current format)
                    typeof generatedHoroscopes.content === 'object' && !Array.isArray(generatedHoroscopes.content) ? (
                      Object.entries(generatedHoroscopes.content).map(([signName, horoscopes]: [string, any]) => (
                        <div key={signName} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                            <span className="text-2xl">{ZODIAC_SIGNS.find(s => s.name === signName)?.symbol}</span>
                            {signName}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(horoscopes) && horoscopes.map((horoscope: any, index: number) => (
                              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{HOROSCOPE_THEMES[index]?.icon}</span>
                                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                    Day {index}: {HOROSCOPE_THEMES[index]?.name}
                                  </h5>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                                  {typeof horoscope === 'string' ? horoscope : horoscope.text || JSON.stringify(horoscope)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Handle array format (fallback)
                      Array.isArray(generatedHoroscopes.content) ? (
                        generatedHoroscopes.content.map((horoscope: any, index: number) => (
                          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-2xl">{HOROSCOPE_THEMES[index]?.icon}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  Day {index}: {HOROSCOPE_THEMES[index]?.name}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {HOROSCOPE_THEMES[index]?.description}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                {typeof horoscope === 'string' ? horoscope : horoscope.text || JSON.stringify(horoscope)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">
                            Unexpected data format received.
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No horoscopes generated yet. Click "Generate 8 Horoscope Versions" to create them.
                      </p>
                    </div>
                  )}
                </div>

                {/* Voice Consistency Score and Suggestions */}
                {generatedHoroscopes.voiceConsistencyScore && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Voice Consistency Score
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${generatedHoroscopes.voiceConsistencyScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          {generatedHoroscopes.voiceConsistencyScore}%
                        </span>
                      </div>
                    </div>

                    {generatedHoroscopes.suggestions && generatedHoroscopes.suggestions.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                          Suggestions
                        </h4>
                        <ul className="space-y-1">
                          {generatedHoroscopes.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                              • {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
