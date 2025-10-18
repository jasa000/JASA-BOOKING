
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useCallback } from "react";

export type Theme = "light" | "dark" | "system";
export type ColorTheme = "zinc" | "red" | "royal-blue" | "light-blue" | "royal-green";

type AppSettings = {
    colorTheme?: ColorTheme;
    defaultTheme?: Theme;
}

type CustomThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  defaultTheme: Theme;
  setDefaultTheme: (theme: Theme) => void;
  settingsLoading: boolean;
}

const initialThemeState: CustomThemeContextType = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "zinc",
  setColorTheme: () => null,
  defaultTheme: "system",
  setDefaultTheme: () => null,
  settingsLoading: true,
}

const CustomThemeContext = React.createContext<CustomThemeContextType>(initialThemeState);

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const firestore = useFirestore();
    const { theme, setTheme: setNextTheme } = useNextTheme();

    const settingsDocRef = React.useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'app-config');
    }, [firestore]);

    const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
    
    const colorTheme = appSettings?.colorTheme || "zinc";
    const defaultTheme = appSettings?.defaultTheme || "system";

    const setColorTheme = useCallback((newColorTheme: ColorTheme) => {
      if (settingsDocRef) {
          setDoc(settingsDocRef, { colorTheme: newColorTheme }, { merge: true });
      }
    }, [settingsDocRef]);

    const setDefaultTheme = useCallback((newDefaultTheme: Theme) => {
        if (settingsDocRef) {
            setDoc(settingsDocRef, { defaultTheme: newDefaultTheme }, { merge: true });
        }
    }, [settingsDocRef]);
    
    const setTheme = useCallback((newTheme: Theme) => {
        setNextTheme(newTheme);
        try {
            localStorage.setItem("theme", newTheme);
        } catch (e) {
            // localStorage is not available
        }
    }, [setNextTheme]);


    // Effect to set the initial theme based on localStorage or Firestore default
    React.useEffect(() => {
      let storedTheme = null;
      try {
        storedTheme = localStorage.getItem("theme");
      } catch (e) {
        // localStorage is not available
      }
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setNextTheme(storedTheme as Theme);
      } else if (!settingsLoading) {
        setNextTheme(defaultTheme);
      }
    }, [defaultTheme, settingsLoading, setNextTheme]);


    const value = {
        theme: (theme as Theme) || 'system',
        setTheme,
        colorTheme,
        setColorTheme,
        defaultTheme,
        setDefaultTheme,
        settingsLoading,
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
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
