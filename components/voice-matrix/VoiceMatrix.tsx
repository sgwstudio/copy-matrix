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

      {/* Core Voice */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Core Voice
        </h4>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Define your brand's fundamental voice characteristics
          </p>
        </div>
        
        <div className="space-y-4">
          <VoiceMatrixSlider
            label="Directness"
            value={voiceMatrix.directness}
            onChange={(value) => updateValue("directness", value)}
            leftLabel="Nuanced"
            rightLabel="Straightforward"
          />
          
          <VoiceMatrixSlider
            label="Universality"
            value={voiceMatrix.universality}
            onChange={(value) => updateValue("universality", value)}
            leftLabel="Niche"
            rightLabel="Globally Accessible"
          />
          
          <VoiceMatrixSlider
            label="Authority"
            value={voiceMatrix.authority}
            onChange={(value) => updateValue("authority", value)}
            leftLabel="Humble"
            rightLabel="Confident"
          />
        </div>
      </div>

      {/* Tone Characteristics */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Tone Characteristics
        </h4>
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Fine-tune how your voice is expressed
          </p>
        </div>
        
        <div className="space-y-4">
          <VoiceMatrixSlider
            label="Tension"
            value={voiceMatrix.tension}
            onChange={(value) => updateValue("tension", value)}
            leftLabel="Everyday Language"
            rightLabel="Elevated/Juxtaposed"
          />
          
          <VoiceMatrixSlider
            label="Education"
            value={voiceMatrix.education}
            onChange={(value) => updateValue("education", value)}
            leftLabel="Minimal Context"
            rightLabel="Deep Insight"
          />
          
          <VoiceMatrixSlider
            label="Rhythm"
            value={voiceMatrix.rhythm}
            onChange={(value) => updateValue("rhythm", value)}
            leftLabel="Standard Flow"
            rightLabel="Staccato/Varied"
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
            Position your tone along the expressive to candid spectrum
          </p>
        </div>
        
        <VoiceMatrixSlider
          label="Expressive ↔ Candid"
          value={voiceMatrix.expressiveCandid}
          onChange={(value) => updateValue("expressiveCandid", value)}
          leftLabel="Expressive (Editorial)"
          rightLabel="Candid (Technical)"
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
  
  // Core Voice
  if (voiceMatrix.directness > 0.5) {
    characteristics.push("very direct");
  } else if (voiceMatrix.directness > 0) {
    characteristics.push("direct");
  } else if (voiceMatrix.directness < -0.5) {
    characteristics.push("nuanced");
  } else {
    characteristics.push("balanced directness");
  }
  
  if (voiceMatrix.universality > 0.5) {
    characteristics.push("globally accessible");
  } else if (voiceMatrix.universality < -0.5) {
    characteristics.push("niche-focused");
  } else {
    characteristics.push("balanced universality");
  }
  
  if (voiceMatrix.authority > 0.5) {
    characteristics.push("confident");
  } else if (voiceMatrix.authority < -0.5) {
    characteristics.push("humble");
  } else {
    characteristics.push("balanced authority");
  }
  
  // Tone Characteristics
  if (voiceMatrix.tension > 0.5) {
    characteristics.push("elevated language");
  } else if (voiceMatrix.tension < -0.5) {
    characteristics.push("everyday language");
  }
  
  if (voiceMatrix.education > 0.5) {
    characteristics.push("highly educational");
  } else if (voiceMatrix.education < -0.5) {
    characteristics.push("minimal context");
  }
  
  if (voiceMatrix.rhythm > 0.5) {
    characteristics.push("varied rhythm");
  } else if (voiceMatrix.rhythm < -0.5) {
    characteristics.push("standard flow");
  }
  
  // Tone Spectrum
  if (voiceMatrix.expressiveCandid > 0.6) {
    characteristics.push("candid");
  } else if (voiceMatrix.expressiveCandid > 0.2) {
    characteristics.push("balanced-candid");
  } else if (voiceMatrix.expressiveCandid < -0.6) {
    characteristics.push("expressive");
  } else if (voiceMatrix.expressiveCandid < -0.2) {
    characteristics.push("balanced-expressive");
  } else {
    characteristics.push("centered");
  }
  
  return `Your brand voice is ${characteristics.join(", ")}.`;
}
