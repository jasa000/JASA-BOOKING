
"use client"

import { useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as React from "react"

export type Theme = "light" | "dark" | "system";
export type ColorTheme = "zinc" | "red" | "royal-blue" | "light-blue" | "royal-green";


type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  defaultTheme: Theme;
  setDefaultTheme: (theme: Theme) => void;
  settingsLoading: boolean;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "zinc",
  setColorTheme: () => null,
  defaultTheme: "system",
  setDefaultTheme: () => null,
  settingsLoading: true,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)


type AppSettings = {
    colorTheme?: ColorTheme;
    defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme: fallbackTheme = "system",
  defaultColorTheme = "red",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(fallbackTheme)

  const firestore = useFirestore();
  
  const settingsDocRef = React.useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'app-config');
  }, [firestore]);

  const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
  
  const colorTheme = React.useMemo(() => appSettings?.colorTheme || defaultColorTheme, [appSettings, defaultColorTheme]);
  const defaultTheme = React.useMemo(() => appSettings?.defaultTheme || fallbackTheme, [appSettings, fallbackTheme]);

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    // If there's a theme in local storage, use it. Otherwise, use the default from the database.
    if (storedTheme) {
        setTheme(storedTheme)
    } else if (!settingsLoading) {
        setTheme(defaultTheme);
    }
  }, [storageKey, defaultTheme, settingsLoading]);
  

  React.useEffect(() => {
    if (settingsLoading) return;

    const root = window.document.documentElement
    
    root.classList.remove("light", "dark");
    
    let effectiveTheme = theme;
    if (theme === "system") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    root.classList.add(effectiveTheme);

    const themes: ColorTheme[] = ["zinc", "red", "royal-blue", "light-blue", "royal-green"];
    const body = window.document.body;
    const previewTheme = body.dataset.previewTheme as ColorTheme | undefined;

    themes.forEach(t => body.classList.remove(`theme-${t}`));
    
    if (effectiveTheme === 'light') {
        const themeToApply = previewTheme || colorTheme;
        if (themeToApply !== "zinc") {
            body.classList.add(`theme-${themeToApply}`);
        }
    }
  }, [theme, colorTheme, settingsLoading])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
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
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
