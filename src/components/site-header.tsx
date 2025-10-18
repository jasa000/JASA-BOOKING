
"use client"

import { MainNav } from "./main-nav"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { theme } = useTheme();
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b",
        theme === 'light' 
            ? "bg-primary text-primary-foreground"
            : "dark:bg-black"
    )}>
      <div className="relative flex h-16 items-center justify-center px-4 md:px-6">
        <MainNav />
      </div>
    </header>
  )
}
