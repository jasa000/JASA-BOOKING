
import Link from "next/link"
import { Home, PlusSquare } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

export function SiteHeader() {
  const { theme } = useTheme();
  return (
    <header className={cn(
        "sticky top-0 z-40 w-full border-b",
        theme === 'dark' 
            ? "dark:bg-black dark:text-white" 
            : "bg-primary text-primary-foreground animate-shine"
    )}>
      <div className="container px-4 md:px-6">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex h-16 items-center justify-between">

            {/* Left Section */}
            <div className="flex items-center justify-start">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-gray-700">
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Button>
              </Link>
              <ThemeToggle />
            </div>

            {/* Center Section (Title) */}
            <div className="flex-1 flex justify-center px-4">
                <div className="hidden md:block">
                  <MainNav />
                </div>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center justify-end">
                <UserNav />
                <Link href="/events/create">
                    <Button variant="ghost" size="icon" className="hover:bg-primary/90 dark:hover:bg-gray-700">
                        <PlusSquare className="h-5 w-5" />
                        <span className="sr-only">Create Event</span>
                    </Button>
                </Link>
            </div>

            {/* Centered Title for Mobile */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
              <MainNav />
            </div>
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </header>
  )
}
