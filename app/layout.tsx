import "./globals.css";

import React from "react";

import { Navigation } from "~/components/Navigation";
import { Providers } from "~/components/providers";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import * as fonts from "~/lib/fonts";
import { cn } from "~/lib/utils";

export const metadata = {
  title: "GG Copy Matrix - AI Copywriting Platform",
  description: "Generate channel-optimized copy while maintaining consistent brand voice through intelligent matrix-based tone management",
};

const RootLayout: React.FCC = ({ children }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(Object.values(fonts).map((font) => font.variable))}
    >
      <body className="min-h-dvh scroll-smooth font-sans antialiased">
        <Providers>
          <Navigation />
          {children}
        </Providers>

        <TailwindIndicator />
      </body>
    </html>
  );
};

export default RootLayout;
