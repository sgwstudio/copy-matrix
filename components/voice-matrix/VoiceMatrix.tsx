"use client";

import React from "react";
import { VoiceMatrixSlider } from "./VoiceMatrixSlider";
import { VoiceMatrix as VoiceMatrixType } from "~/lib/gemini-client";

interface VoiceMatrixProps {
  voiceMatrix: VoiceMatrixType;
  onChange: (voiceMatrix: VoiceMatrixType) => void;
  className?: string;
}

export const VoiceMatrix: React.FC<VoiceMatrixProps> = ({
  voiceMatrix,
  onChange,
  className,
}) => {
  const updateValue = (key: keyof VoiceMatrixType, value: number) => {
    onChange({
      ...voiceMatrix,
      [key]: value,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Voice Matrix
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Adjust the sliders to define your brand voice characteristics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Characteristics */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            Voice Characteristics
          </h4>
          
          <VoiceMatrixSlider
            label="Formal vs Casual"
            value={voiceMatrix.formalCasual}
            onChange={(value) => updateValue("formalCasual", value)}
            leftLabel="Very Casual"
            rightLabel="Very Formal"
          />
          
          <VoiceMatrixSlider
            label="Authoritative vs Approachable"
            value={voiceMatrix.authoritativeApproachable}
            onChange={(value) => updateValue("authoritativeApproachable", value)}
            leftLabel="Very Approachable"
            rightLabel="Very Authoritative"
          />
        </div>

        {/* Tone Characteristics */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
            Tone Characteristics
          </h4>
          
          <VoiceMatrixSlider
            label="Professional vs Conversational"
            value={voiceMatrix.professionalConversational}
            onChange={(value) => updateValue("professionalConversational", value)}
            leftLabel="Very Conversational"
            rightLabel="Very Professional"
          />
          
          <VoiceMatrixSlider
            label="Serious vs Playful"
            value={voiceMatrix.seriousPlayful}
            onChange={(value) => updateValue("seriousPlayful", value)}
            leftLabel="Very Playful"
            rightLabel="Very Serious"
          />
        </div>
      </div>

      {/* Additional Characteristics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Additional Characteristics
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VoiceMatrixSlider
            label="Confidence Level"
            value={voiceMatrix.confidence}
            onChange={(value) => updateValue("confidence", value)}
            leftLabel="Modest"
            rightLabel="Confident"
          />
          
          <VoiceMatrixSlider
            label="Enthusiasm Level"
            value={voiceMatrix.enthusiasm}
            onChange={(value) => updateValue("enthusiasm", value)}
            leftLabel="Reserved"
            rightLabel="Enthusiastic"
          />
          
          <VoiceMatrixSlider
            label="Empathy Level"
            value={voiceMatrix.empathy}
            onChange={(value) => updateValue("empathy", value)}
            leftLabel="Direct"
            rightLabel="Empathetic"
          />
        </div>
      </div>

      {/* Voice Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
          Voice Summary
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {generateVoiceSummary(voiceMatrix)}
        </p>
      </div>
    </div>
  );
};

function generateVoiceSummary(voiceMatrix: VoiceMatrixType): string {
  const characteristics = [];
  
  // Formality
  if (voiceMatrix.formalCasual > 0.5) {
    characteristics.push("very formal");
  } else if (voiceMatrix.formalCasual > 0) {
    characteristics.push("somewhat formal");
  } else if (voiceMatrix.formalCasual < -0.5) {
    characteristics.push("very casual");
  } else if (voiceMatrix.formalCasual < 0) {
    characteristics.push("somewhat casual");
  }
  
  // Authority
  if (voiceMatrix.authoritativeApproachable > 0.5) {
    characteristics.push("authoritative");
  } else if (voiceMatrix.authoritativeApproachable < -0.5) {
    characteristics.push("approachable");
  }
  
  // Professionalism
  if (voiceMatrix.professionalConversational > 0.5) {
    characteristics.push("professional");
  } else if (voiceMatrix.professionalConversational < -0.5) {
    characteristics.push("conversational");
  }
  
  // Tone
  if (voiceMatrix.seriousPlayful > 0.5) {
    characteristics.push("serious");
  } else if (voiceMatrix.seriousPlayful < -0.5) {
    characteristics.push("playful");
  }
  
  // Confidence
  if (voiceMatrix.confidence > 0.5) {
    characteristics.push("confident");
  } else if (voiceMatrix.confidence < -0.5) {
    characteristics.push("modest");
  }
  
  // Enthusiasm
  if (voiceMatrix.enthusiasm > 0.5) {
    characteristics.push("enthusiastic");
  } else if (voiceMatrix.enthusiasm < -0.5) {
    characteristics.push("reserved");
  }
  
  // Empathy
  if (voiceMatrix.empathy > 0.5) {
    characteristics.push("empathetic");
  } else if (voiceMatrix.empathy < -0.5) {
    characteristics.push("direct");
  }
  
  if (characteristics.length === 0) {
    return "Neutral voice with balanced characteristics.";
  }
  
  return `Your brand voice is ${characteristics.join(", ")}.`;
}
