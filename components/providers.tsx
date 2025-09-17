"use client";

import * as React from "react";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import type { ThemeProviderProps } from "next-themes";

export const Providers: React.FCC<{
  theme?: ThemeProviderProps;
}> = ({ theme, children }) => {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...theme}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
};
