
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
  previewColorTheme: ColorTheme | null;
  setPreviewColorTheme: (theme: ColorTheme | null) => void;
}

const initialThemeState: CustomThemeContextType = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "zinc",
  setColorTheme: () => null,
  defaultTheme: "system",
  setDefaultTheme: () => null,
  settingsLoading: true,
  previewColorTheme: null,
  setPreviewColorTheme: () => null,
}

const CustomThemeContext = React.createContext<CustomThemeContextType>(initialThemeState);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const firestore = useFirestore();
    const { theme, setTheme: setNextTheme } = useNextTheme();

    const settingsDocRef = React.useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'app-config');
    }, [firestore]);

    const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
    
    const [previewColorTheme, setPreviewColorTheme] = React.useState<ColorTheme | null>(null);
    
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
        localStorage.setItem("theme", newTheme);
    }, [setNextTheme]);


    React.useEffect(() => {
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme && !settingsLoading && defaultTheme) {
        setNextTheme(defaultTheme);
      } else if (storedTheme) {
        setNextTheme(storedTheme as Theme);
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
        previewColorTheme,
        setPreviewColorTheme,
    };

    return (
        <CustomThemeContext.Provider value={value}>
            {children}
        </CustomThemeContext.Provider>
    );
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

// Re-export NextThemesProvider to wrap it in layout
export { NextThemesProvider };
