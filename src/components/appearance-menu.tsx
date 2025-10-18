
"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"
import { useTheme, type ColorTheme } from "@/components/theme-provider"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"


const colorThemes: { name: ColorTheme; color: string }[] = [
    { name: "zinc", color: "#71717A" },
    { name: "red", color: "#DC2626" },
    { name: "blue", color: "#3B82F6" },
    { name: "green", color: "#22C55E" },
    { name: "rose", color: "#F43F5E" },
];

export function AppearanceMenu() {
  const { setTheme, colorTheme, setColorTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light/Dark</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
         <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                 <Palette className="mr-2 h-4 w-4" />
                <span>Color Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                {colorThemes.map((theme) => (
                    <DropdownMenuItem 
                        key={theme.name}
                        onClick={() => setColorTheme(theme.name)}
                    >
                        <div
                            className="mr-2 h-5 w-5 rounded-full border"
                            style={{ backgroundColor: theme.color }}
                        />
                        <span className="capitalize flex-1">{theme.name}</span>
                        {colorTheme === theme.name && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

