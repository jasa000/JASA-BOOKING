
"use client";

import { ColorTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemeSelectorProps {
  selectedTheme: ColorTheme;
  onSelectTheme: (theme: ColorTheme) => void;
}

export function ThemeSelector({ selectedTheme, onSelectTheme }: ThemeSelectorProps) {

  const themes: { name: ColorTheme; label: string; color: string }[] = [
    { name: "zinc", label: "Zinc", color: "#71717A" },
    { name: "red", label: "Red", color: "#DC2626" },
    { name: "royal-blue", label: "Royal Blue", color: "#3B82F6" },
    { name: "light-blue", label: "Light Blue", color: "#60A5FA" },
    { name: "royal-green", label: "Royal Green", color: "#16A34A" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {themes.map((theme) => (
        <div key={theme.name}>
          <button
            onClick={() => onSelectTheme(theme.name)}
            className={cn(
              "flex w-full items-center justify-center rounded-md border-2 p-1",
              selectedTheme === theme.name ? "border-primary" : "border-transparent"
            )}
            style={{ backgroundColor: theme.name === 'zinc' ? 'hsl(var(--muted))' : ''}}
          >
            <div className="flex w-full items-center justify-center space-x-2 rounded-md p-2">
              <div
                className="h-8 w-8 rounded-full border"
                style={{ backgroundColor: theme.color }}
              />
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium capitalize">
                  {theme.label}
                </span>
                {selectedTheme === theme.name && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
