
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types";
import { useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

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


export function ThemeProvider({ children, ...props }: NextThemesProviderProps) {
    const firestore = useFirestore();

    const settingsDocRef = React.useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'app-config');
    }, [firestore]);

    const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
    
    const colorTheme = appSettings?.colorTheme || "zinc";
    const defaultTheme = appSettings?.defaultTheme || "system";

    const value = {
        theme: 'system', // placeholder, will be replaced by useNextTheme
        setTheme: () => {}, // placeholder
        colorTheme,
        setColorTheme: (newColorTheme: ColorTheme) => {
            if (settingsDocRef) {
                setDoc(settingsDocRef, { colorTheme: newColorTheme }, { merge: true });
            }
        },
        defaultTheme,
        setDefaultTheme: (newDefaultTheme: Theme) => {
            if (settingsDocRef) {
                setDoc(settingsDocRef, { defaultTheme: newDefaultTheme }, { merge: true });
            }
        },
        settingsLoading,
    }

    return (
        <NextThemesProvider {...props}>
            <CustomThemeContext.Provider value={value}>
                {children}
            </CustomThemeContext.Provider>
        </NextThemesProvider>
    );
}

export const useTheme = () => {
  const context = React.useContext(CustomThemeContext);
  const { theme, setTheme } = useNextTheme();

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (!storedTheme && !context.settingsLoading) {
      setTheme(context.defaultTheme);
    }
  }, [context.defaultTheme, context.settingsLoading, setTheme]);

  return {
    ...context,
    theme: (theme as Theme) || 'system',
    setTheme: setTheme,
  };
};
