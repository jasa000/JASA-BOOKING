
"use client"

import { MainNav } from "./main-nav"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"
import { UserNav } from "./user-nav"
import { Button } from "./ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export function SiteHeader() {
  const { theme } = useTheme();
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b",
        theme === 'light' 
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            : "dark:bg-black"
    )}>
      <div className="relative flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center">
            {/* Left side content can go here if needed in the future */}
        </div>
        
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <MainNav />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <Link href="/events/create">
              <Button variant="ghost" className="hidden md:flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Post
              </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  )
}
