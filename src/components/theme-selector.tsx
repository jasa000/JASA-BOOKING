
"use client";

import { useTheme, type ColorTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme();

  const themes: { name: ColorTheme; color: string }[] = [
    { name: "zinc", color: "#71717A" },
    { name: "red", color: "#DC2626" },
    { name: "blue", color: "#3B82F6" },
    { name: "green", color: "#22C55E" },
    { name: "rose", color: "#F43F5E" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {themes.map((theme) => (
        <div key={theme.name}>
          <button
            onClick={() => setColorTheme(theme.name)}
            className={cn(
              "flex w-full items-center justify-center rounded-md border-2 p-1",
              colorTheme === theme.name ? "border-primary" : "border-transparent"
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
                  {theme.name}
                </span>
                {colorTheme === theme.name && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
