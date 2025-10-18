
"use client"

import { useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as React from "react"

export type Theme = "light" | "dark" | "system";
export type ColorTheme = "zinc" | "red" | "blue" | "green" | "rose";

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  colorTheme: "zinc",
  setColorTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)


type AppSettings = {
    colorTheme?: ColorTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultColorTheme = "red",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  const firestore = useFirestore();

  const settingsDocRef = React.useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'app-config');
  }, [firestore]);

  const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
  
  const colorTheme = React.useMemo(() => appSettings?.colorTheme || defaultColorTheme, [appSettings, defaultColorTheme]);


  React.useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, [storageKey]);
  

  React.useEffect(() => {
    if (settingsLoading) return;

    const root = window.document.documentElement
    
    root.classList.remove("light", "dark");
    
    let effectiveTheme = theme;
    if (theme === "system") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    root.classList.add(effectiveTheme);


    // remove previous color theme classes
    const themes: ColorTheme[] = ["zinc", "red", "blue", "green", "rose"];
    const body = window.document.body;
    const previewTheme = body.dataset.previewTheme as ColorTheme | undefined;

    themes.forEach(t => root.classList.remove(`theme-${t}`));

    // Only apply color theme if in light mode
    if (effectiveTheme === 'light') {
        const themeToApply = previewTheme || colorTheme;
        if (themeToApply !== "zinc") {
            root.classList.add(`theme-${themeToApply}`);
        }
    }
  }, [theme, colorTheme, settingsLoading])

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
    colorTheme,
    setColorTheme: (newColorTheme: ColorTheme) => {
        if (settingsDocRef) {
            setDoc(settingsDocRef, { colorTheme: newColorTheme }, { merge: true });
        }
    },
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
