
"use client"

import Link from "next/link"
import { Home, PlusSquare } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "./theme-provider"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { theme } = useTheme();
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b",
        theme === 'light' 
            ? "bg-primary text-primary-foreground animate-shine [--shine-color-1:theme(colors.blue.300)] [--shine-color-2:theme(colors.blue.100)]"
            : "dark:bg-black"
    )}>
      <div className="container px-4 md:px-6">
        <div className="relative flex h-16 items-center justify-between">
          
          <div className="flex items-center">
            <Link href="/" className="hidden md:block">
              <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-gray-700">
                <Home className="h-5 w-5" />
                <span className="sr-only">Home</span>
              </Button>
            </Link>
            <ThemeToggle />
          </div>

          {/* Centered Title for Mobile */}
          <div className="flex flex-1 justify-center md:hidden">
            <MainNav />
          </div>
          
          {/* Absolutely Centered Title for Desktop */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <MainNav />
          </div>
          
          <div className="flex items-center">
              <Link href="/events/create">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-gray-700">
                      <PlusSquare className="h-5 w-5" />
                      <span className="sr-only">Create Event</span>
                  </Button>
              </Link>
              <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}
