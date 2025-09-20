"use client";

import React from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = "" }) => {
  return (
    <div className={className}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className={`animated-letter ${char === " " ? "inline-block w-2" : ""}`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
};
