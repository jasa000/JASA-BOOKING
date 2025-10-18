
"use client"

import { MainNav } from "./main-nav"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"
import { UserNav } from "./user-nav"

export function SiteHeader() {
  const { theme } = useTheme();
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b",
        theme === 'light' 
            ? "bg-primary text-primary-foreground"
            : "dark:bg-black"
    )}>
      <div className="relative flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
            {/* Left side content can go here if needed in the future */}
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <MainNav />
        </div>

        <div className="flex items-center justify-end">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
