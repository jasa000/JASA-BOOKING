
"use client"

import { useDoc, useFirestore } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark" | "system";
export type ColorTheme = "zinc" | "red" | "royal-blue" | "light-blue" | "royal-green";


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

const CustomThemeContext = React.createContext<ThemeProviderState>(initialState)


type AppSettings = {
    colorTheme?: ColorTheme;
    defaultTheme?: Theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  
  return (
    <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        <InnerThemeProvider>{children}</InnerThemeProvider>
    </NextThemesProvider>
  )
}

function InnerThemeProvider({ children }: { children: React.ReactNode }) {
    const firestore = useFirestore();
    const { theme, setTheme } = useNextTheme();

    const settingsDocRef = React.useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'settings', 'app-config');
    }, [firestore]);

    const { data: appSettings, loading: settingsLoading } = useDoc<AppSettings>(settingsDocRef);
    
    const colorTheme = React.useMemo(() => appSettings?.colorTheme || "zinc", [appSettings]);
    const defaultTheme = React.useMemo(() => appSettings?.defaultTheme || "system", [appSettings]);

    React.useEffect(() => {
        // Set initial theme based on default from DB if no user preference is stored
        const storedTheme = localStorage.getItem("theme");
        if (!storedTheme && !settingsLoading) {
            setTheme(defaultTheme);
        }
    }, [defaultTheme, settingsLoading, setTheme]);

    const value = {
        theme: (theme as Theme) || 'system',
        setTheme: (newTheme: Theme) => {
            setTheme(newTheme);
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
        <CustomThemeContext.Provider value={value}>
            {children}
        </CustomThemeContext.Provider>
    );
}


export const useTheme = () => {
  const context = React.useContext(CustomThemeContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
