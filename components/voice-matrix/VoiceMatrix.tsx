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
          Voice & Tone Matrix
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Define your brand voice and tone for email optimization
        </p>
      </div>

      {/* Voice Principles */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Voice Principles
        </h4>
        
        <div className="space-y-4">
          <VoiceMatrixSlider
            label="Directness"
            value={voiceMatrix.formalCasual}
            onChange={(value) => updateValue("formalCasual", value)}
            leftLabel="Subtle"
            rightLabel="Very Direct"
          />
          
          <VoiceMatrixSlider
            label="Universality"
            value={voiceMatrix.authoritativeApproachable}
            onChange={(value) => updateValue("authoritativeApproachable", value)}
            leftLabel="Specific"
            rightLabel="Universal"
          />
          
          <VoiceMatrixSlider
            label="Authority"
            value={voiceMatrix.professionalConversational}
            onChange={(value) => updateValue("professionalConversational", value)}
            leftLabel="Approachable"
            rightLabel="Authoritative"
          />
        </div>
      </div>

      {/* Tone Spectrum */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Tone Spectrum
        </h4>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adjust the tone along the spectrum from expressive to candid
          </p>
        </div>
        
        <VoiceMatrixSlider
          label="Tone Position"
          value={voiceMatrix.seriousPlayful}
          onChange={(value) => updateValue("seriousPlayful", value)}
          leftLabel="Expressive"
          rightLabel="Candid"
        />
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
  
  // Directness
  if (voiceMatrix.formalCasual > 0.5) {
    characteristics.push("very direct");
  } else if (voiceMatrix.formalCasual > 0) {
    characteristics.push("direct");
  } else if (voiceMatrix.formalCasual < -0.5) {
    characteristics.push("subtle");
  } else {
    characteristics.push("balanced directness");
  }
  
  // Universality
  if (voiceMatrix.authoritativeApproachable > 0.5) {
    characteristics.push("universal");
  } else if (voiceMatrix.authoritativeApproachable < -0.5) {
    characteristics.push("specific");
  } else {
    characteristics.push("balanced universality");
  }
  
  // Authority
  if (voiceMatrix.professionalConversational > 0.5) {
    characteristics.push("authoritative");
  } else if (voiceMatrix.professionalConversational < -0.5) {
    characteristics.push("approachable");
  } else {
    characteristics.push("balanced authority");
  }
  
  // Tone Position
  if (voiceMatrix.seriousPlayful > 0.3) {
    characteristics.push("candid");
  } else if (voiceMatrix.seriousPlayful < -0.3) {
    characteristics.push("expressive");
  } else {
    characteristics.push("balanced tone");
  }
  
  return `Your brand voice is ${characteristics.join(", ")}.`;
}
