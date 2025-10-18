
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useCallback } from "react";

export type Theme = "light" | "dark" | "system";

type CustomThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const CustomThemeContext = React.createContext<CustomThemeContextType | null>(null);

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme: setNextTheme } = useNextTheme();
    const defaultTheme = "light";

    const setTheme = useCallback((newTheme: Theme) => {
        setNextTheme(newTheme);
        try {
            localStorage.setItem("theme", newTheme);
        } catch (e) {
            // localStorage is not available
        }
    }, [setNextTheme]);

    // Effect to set the initial theme based on localStorage or hardcoded default
    React.useEffect(() => {
      let storedTheme = null;
      try {
        storedTheme = localStorage.getItem("theme");
      } catch (e) {
        // localStorage is not available
      }
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setNextTheme(storedTheme as Theme);
      } else {
        setNextTheme(defaultTheme);
      }
    }, [defaultTheme, setNextTheme]);


    const value = {
        theme: (theme as Theme) || defaultTheme,
        setTheme,
    };

    return (
        <CustomThemeContext.Provider value={value}>
            {children}
        </CustomThemeContext.Provider>
    );
}


export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);

  if (context === undefined || context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
