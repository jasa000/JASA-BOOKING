
"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system";
export type ColorTheme = "zinc" | "blue" | "green" | "rose";

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ColorTheme
  storageKey?: string
  colorStorageKey?: string
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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "zinc",
  storageKey = "ui-theme",
  colorStorageKey = "ui-color-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(
    () => (typeof window !== 'undefined' ? (localStorage.getItem(storageKey) as Theme) || defaultTheme : defaultTheme)
  )
  const [colorTheme, setColorTheme] = React.useState<ColorTheme>(
    () => (typeof window !== 'undefined' ? (localStorage.getItem(colorStorageKey) as ColorTheme) || defaultColorTheme : defaultColorTheme)
  )

  React.useEffect(() => {
    const root = window.document.documentElement
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
    } else {
        root.classList.add(theme)
    }

    // remove previous color theme classes
    const themes: ColorTheme[] = ["zinc", "blue", "green", "rose"];
    themes.forEach(t => root.classList.remove(`theme-${t}`));

    if (colorTheme !== "zinc") {
      root.classList.add(`theme-${colorTheme}`);
    }

  }, [theme, colorTheme])

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
      if (typeof window !== 'undefined') {
        localStorage.setItem(colorStorageKey, newColorTheme)
      }
      setColorTheme(newColorTheme)
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

    